import { ChameleonMatchCentre } from './chameleon-match-centre.js';

export * from './types.js';
export * from './utils.js';
export { BUILTIN_LOCALES, DEFAULT_LOCALE, I18nManager } from './i18n.js';
export type { MatchCentreLocale } from './i18n.js';
export { ChameleonMatchCentre };

if (typeof window !== 'undefined' && 'customElements' in window) {
  if (!customElements.get('chameleon-match-centre')) {
    customElements.define('chameleon-match-centre', ChameleonMatchCentre);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'chameleon-match-centre': ChameleonMatchCentre;
  }
}

