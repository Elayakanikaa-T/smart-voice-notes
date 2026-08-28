import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      "app_title": "Smart Voice Notes",
      "dashboard": "Dashboard",
      "subjects": "Subjects",
      "progress": "Progress",
      "reminders": "Reminders",
      "profile": "Profile",
      "logout": "Log Out",
      "welcome": "Welcome back",
      "ai_guide": "AI Guide",
      "recommendations": "Recommendations",
      "select_language": "Select Language",
      "notes": "Notes",
      "flashcards": "Flashcards",
      "quizzes": "Quizzes",
      "record_audio": "Record Audio",
      // Add more as needed
    }
  },
  es: {
    translation: {
      "app_title": "Notas de Voz Inteligentes",
      "dashboard": "Panel",
      "subjects": "Materias",
      "progress": "Progreso",
      "reminders": "Recordatorios",
      "profile": "Perfil",
      "logout": "Cerrar sesión",
      "welcome": "Bienvenido de nuevo",
      "ai_guide": "Guía IA",
      "recommendations": "Recomendaciones",
      "select_language": "Seleccionar idioma",
      "notes": "Notas",
      "flashcards": "Tarjetas",
      "quizzes": "Cuestionarios",
      "record_audio": "Grabar Audio",
    }
  }
};

const savedLanguage = localStorage.getItem('preferred_language') || 'en';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false 
    }
  });

export default i18n;
