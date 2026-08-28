import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth.middleware.js';
import { getLLMProvider } from '../../services/ai/index.js';

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
  { code: 'zh', name: 'Chinese (Simplified)', nativeName: '简体中文', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷' },
];

export class LanguagesController {
  getLanguages(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
    res.status(200).json({
      success: true,
      data: {
        languages: SUPPORTED_LANGUAGES,
        default: 'en',
      },
    });
  }

  async translateContent(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { text, targetLanguage, sourceLanguage = 'en' } = req.body;

      if (!text || !targetLanguage) {
        res.status(400).json({ success: false, error: 'Both text and targetLanguage are required.' });
        return;
      }

      if (targetLanguage === sourceLanguage) {
        res.status(200).json({
          success: true,
          data: {
            translatedText: text,
            sourceLanguage,
            targetLanguage,
          },
        });
        return;
      }

      const llm = getLLMProvider();
      let translatedText = '';

      if (typeof (llm as any).translateContent === 'function') {
        translatedText = await (llm as any).translateContent(text, targetLanguage, sourceLanguage);
      } else {
        // Mock fallback translation dictionary or note prefix
        const langObj = SUPPORTED_LANGUAGES.find(l => l.code === targetLanguage);
        translatedText = `[Translated to ${langObj?.name || targetLanguage}]: ${text}`;
      }

      res.status(200).json({
        success: true,
        data: {
          originalText: text,
          translatedText,
          sourceLanguage,
          targetLanguage,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Translation failed.' });
    }
  }
}

export const languagesController = new LanguagesController();
