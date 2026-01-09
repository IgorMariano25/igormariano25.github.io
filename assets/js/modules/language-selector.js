/**
 * Language Selector Module
 * Responsible for: Language button UI and interaction with i18n
 *
 * @author Igor Mariano
 * @version 1.0.0
 */

class LanguageSelectorManager {
  constructor(i18nManager, options = {}) {
    this.i18n = i18nManager;
    this.buttonSelector = options.buttonSelector || ".language-btn";
    this.activeClass = options.activeClass || "language-btn--active";
  }

  /**
   * Initialize language selector
   */
  init() {
    const buttons = document.querySelectorAll(this.buttonSelector);

    if (buttons.length === 0) {
      return this;
    }

    buttons.forEach((btn) => {
      btn.addEventListener("click", async () => {
        const lang = btn.getAttribute("data-lang");

        await this.i18n.changeLocale(lang);
        this.updateButtons();
      });
    });

    // Initial button state
    this.updateButtons();

    // Listen to locale changes from other sources
    window.addEventListener("localeChanged", () => {
      this.updateButtons();
    });

    return this;
  }

  /**
   * Update active state of language buttons
   */
  updateButtons() {
    const currentLang = this.i18n.getCurrentLocale();
    const buttons = document.querySelectorAll(this.buttonSelector);

    buttons.forEach((btn) => {
      const lang = btn.getAttribute("data-lang");
      if (lang === currentLang) {
        btn.classList.add(this.activeClass);
      } else {
        btn.classList.remove(this.activeClass);
      }
    });
  }

  /**
   * Get current language
   */
  getCurrentLanguage() {
    return this.i18n.getCurrentLocale();
  }

  /**
   * Change language programmatically
   * @param {string} lang - Language code
   */
  async setLanguage(lang) {
    await this.i18n.changeLocale(lang);
    this.updateButtons();
  }
}

export default LanguageSelectorManager;
