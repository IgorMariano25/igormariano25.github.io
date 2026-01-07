/**
 * Internationalization (i18n) Manager
 * Lightweight, dependency-free internationalization system
 * Following industry standards (RFC 5646, BCP 47)
 *
 * @author Igor Mariano
 * @license MIT
 */

class I18nManager {
  constructor() {
    this.currentLocale = this.detectLocale();
    this.translations = {};
    this.fallbackLocale = "en";
    this.supportedLocales = ["pt", "en", "es"];
  }

  /**
   * Detects user's preferred language based on browser settings
   * Falls back to English if unsupported
   */
  detectLocale() {
    const browserLang = navigator.language || navigator.userLanguage;
    const lang = browserLang.split("-")[0]; // Get base language (pt-BR -> pt)

    // Check localStorage for saved preference
    const savedLocale = localStorage.getItem("preferredLocale");
    if (savedLocale && this.supportedLocales.includes(savedLocale)) {
      return savedLocale;
    }

    return this.supportedLocales.includes(lang) ? lang : "en";
  }

  /**
   * Load translation file for specified locale
   * @param {string} locale - Language code (pt, en, es)
   */
  async loadLocale(locale) {
    try {
      const response = await fetch(`./locales/${locale}.json`);
      if (!response.ok) throw new Error(`Failed to load locale: ${locale}`);

      this.translations = await response.json();
      this.currentLocale = locale;
      localStorage.setItem("preferredLocale", locale);

      // Update HTML lang attribute for accessibility
      document.documentElement.lang = locale;

      return true;
    } catch (error) {
      console.error("Error loading locale:", error);

      // Fallback to English if current locale fails
      if (locale !== this.fallbackLocale) {
        return this.loadLocale(this.fallbackLocale);
      }
      return false;
    }
  }

  /**
   * Get translated string using dot notation path
   * @param {string} key - Translation key (e.g., 'nav.home')
   * @param {object} params - Optional parameters for string interpolation
   */
  t(key, params = {}) {
    const keys = key.split(".");
    let value = this.translations;

    // Navigate through nested object
    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = value[k];
      } else {
        console.warn(`Translation key not found: ${key}`);
        return key; // Return key as fallback
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
   * Translate all elements with data-i18n attribute
   */
  translatePage() {
    const elements = document.querySelectorAll("[data-i18n]");

    elements.forEach((element) => {
      const key = element.getAttribute("data-i18n");
      const translation = this.t(key);

      // Handle different element types
      if (element.tagName === "INPUT" || element.tagName === "TEXTAREA") {
        element.placeholder = translation;
      } else {
        element.textContent = translation;
      }
    });

    // Translate aria-labels for accessibility
    const ariaElements = document.querySelectorAll("[data-i18n-aria]");
    ariaElements.forEach((element) => {
      const key = element.getAttribute("data-i18n-aria");
      element.setAttribute("aria-label", this.t(key));
    });

    // Translate titles
    const titleElements = document.querySelectorAll("[data-i18n-title]");
    titleElements.forEach((element) => {
      const key = element.getAttribute("data-i18n-title");
      element.setAttribute("title", this.t(key));
    });
  }

  /**
   * Change current locale and reload translations
   * @param {string} locale - New locale code
   */
  async changeLocale(locale) {
    if (!this.supportedLocales.includes(locale)) {
      console.error(`Unsupported locale: ${locale}`);
      return false;
    }

    const success = await this.loadLocale(locale);
    if (success) {
      this.translatePage();

      // Dispatch custom event for other components
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

// Export for use in other modules
export default I18nManager;
