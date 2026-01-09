/**
 * Internationalization (i18n) Module
 * Responsible for: Language detection, translation loading, and page translation
 *
 * @author Igor Mariano
 * @version 2.0.0
 */

class I18nManager {
  constructor(options = {}) {
    this.translations = {};
    this.fallbackLocale = options.fallbackLocale || "en";
    this.supportedLocales = options.supportedLocales || ["pt", "en", "es"];
    this.localesPath = options.localesPath || "./locales";
    this.currentLocale = this.detectLocale();
  }

  /**
   * Detect user's preferred language
   * Priority: localStorage > browser language > fallback
   */
  detectLocale() {
    // Check localStorage first
    const savedLocale = localStorage.getItem("preferredLocale");
    if (savedLocale && this.supportedLocales.includes(savedLocale)) {
      return savedLocale;
    }

    // Check browser language
    const browserLang = navigator.language || navigator.userLanguage;
    const lang = browserLang ? browserLang.split("-")[0] : this.fallbackLocale;

    return this.supportedLocales.includes(lang) ? lang : this.fallbackLocale;
  }

  /**
   * Load translation file for specified locale
   * @param {string} locale - Language code (pt, en, es)
   */
  async loadLocale(locale) {
    try {
      const response = await fetch(`${this.localesPath}/${locale}.json`);

      if (!response.ok) {
        throw new Error(`Failed to load locale: ${locale}`);
      }

      this.translations = await response.json();
      this.currentLocale = locale;
      localStorage.setItem("preferredLocale", locale);
      document.documentElement.lang = locale;

      return true;
    } catch (error) {
      console.error("Error loading locale:", error);

      // Fallback to default locale
      if (locale !== this.fallbackLocale) {
        return this.loadLocale(this.fallbackLocale);
      }
      return false;
    }
  }

  /**
   * Get translated string using dot notation
   * @param {string} key - Translation key (e.g., 'nav.home')
   * @param {object} params - Optional parameters for interpolation
   */
  t(key, params = {}) {
    const keys = key.split(".");
    let value = this.translations;

    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = value[k];
      } else {
        return key;
      }
    }

    // Handle string interpolation
    if (typeof value === "string" && Object.keys(params).length > 0) {
      return value.replace(/\{(\w+)\}/g, (match, paramKey) => {
        return params[paramKey] !== undefined ? params[paramKey] : match;
      });
    }

    return value;
  }

  /**
   * Translate all elements with data-i18n attributes
   */
  translatePage() {
    const elements = document.querySelectorAll("[data-i18n]");

    elements.forEach((element) => {
      const key = element.getAttribute("data-i18n");
      const translation = this.t(key);

      if (element.tagName === "INPUT" || element.tagName === "TEXTAREA") {
        element.placeholder = translation;
      } else {
        element.textContent = translation;
      }
    });

    // Translate aria-labels
    document.querySelectorAll("[data-i18n-aria]").forEach((element) => {
      const key = element.getAttribute("data-i18n-aria");
      element.setAttribute("aria-label", this.t(key));
    });

    // Translate titles
    document.querySelectorAll("[data-i18n-title]").forEach((element) => {
      const key = element.getAttribute("data-i18n-title");
      element.setAttribute("title", this.t(key));
    });
  }

  /**
   * Change locale and reload translations
   * @param {string} locale - New locale code
   */
  async changeLocale(locale) {
    if (!this.supportedLocales.includes(locale)) {
      return false;
    }

    const success = await this.loadLocale(locale);

    if (success) {
      this.translatePage();
      window.dispatchEvent(
        new CustomEvent("localeChanged", {
          detail: { locale: this.currentLocale },
        })
      );
    }

    return success;
  }

  /**
   * Get current active locale
   */
  getCurrentLocale() {
    return this.currentLocale;
  }

  /**
   * Get list of supported locales
   */
  getSupportedLocales() {
    return this.supportedLocales;
  }
}

export default I18nManager;
