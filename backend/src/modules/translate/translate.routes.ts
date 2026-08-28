import { Router } from 'express';
import OpenAI from 'openai';
import { config } from '../../config/env.js';
import { logger } from '../../utils/logger.js';

const router = Router();
const openaiClient = config.ai.openaiApiKey ? new OpenAI({ apiKey: config.ai.openaiApiKey }) : null;

router.post('/', async (req, res) => {
  try {
    const { text, sourceLanguage = 'auto' } = req.body;
    if (!text) {
      return res.status(400).json({ success: false, error: 'Text is required' });
    }

    if (!openaiClient || config.ai.llmProvider === 'mock') {
      // Mock translation
      return res.json({
        success: true,
        data: {
          originalText: text,
          translatedText: `[Translated from ${sourceLanguage}]: ${text}`,
        },
      });
    }

    const completion = await openaiClient.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a real-time translator. Translate the following text from ${sourceLanguage} to English. Respond ONLY with the translated text, no quotes or extra formatting.`
        },
        { role: 'user', content: text }
      ],
      temperature: 0.2,
    });

    const translatedText = completion.choices[0]?.message?.content?.trim() || text;

    res.json({
      success: true,
      data: {
        originalText: text,
        translatedText,
      }
    });

  } catch (error: any) {
    logger.error(`[Translate] Error: ${error.message}`);
    res.status(500).json({ success: false, error: 'Translation failed' });
  }
});

export default router;
