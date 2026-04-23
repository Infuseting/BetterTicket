import en from './locales/en.json';
import fr from './locales/fr.json';

const translations: any = { en, fr };

export function t(key: string, locale: string = 'en', vars: Record<string, string> = {}) {
  const lang = locale.startsWith('fr') ? 'fr' : 'en';
  let text = translations[lang][key] || translations['en'][key] || key;
  
  for (const [vKey, vValue] of Object.entries(vars)) {
    text = text.replace(`{${vKey}}`, vValue);
  }
  return text;
}
