/**
 * Main Application Module
 * Professional Portfolio - Igor Mariano
 *
 * This is the main orchestrator that imports and coordinates all modules.
 * Requires ES6 module support (HTTP server required)
 *
 * @author Igor Mariano
 * @version 3.0.0
 */

// Import modules
import I18nManager from "./modules/i18n.js";
import ThemeManager from "./modules/theme.js";
import NavigationManager from "./modules/navigation.js";
import ScrollEffectsManager from "./modules/scroll-effects.js";
import AnimationsManager from "./modules/animations.js";
import LanguageSelectorManager from "./modules/language-selector.js";

/* ===================================
   CONFIGURATION
   =================================== */

const CONFIG = {
  i18n: {
    fallbackLocale: "en",
    supportedLocales: ["pt", "en", "es"],
    localesPath: "./locales",
  },
  theme: {
    storageKey: "theme",
    toggleSelector: "#theme-toggle",
  },
  navigation: {
    menuToggleSelector: "#menu-toggle",
    navSelector: ".nav",
    scrollOffset: 150,
    headerHeight: 80,
  },
  scrollEffects: {
    headerSelector: ".header, header",
    backToTopSelector: "#back-to-top",
    stickyThreshold: 100,
  },
  animations: {
    scrollReveal: {
      distance: "60px",
      duration: 1500,
      delay: 200,
      easing: "ease-in-out",
      reset: false,
    },
    typed: {
      strings: [
        "Análise e Desenvolvimento de Sistemas",
        "Geolocalização & Logística",
        "Full-Stack Development",
      ],
      typeSpeed: 50,
      backSpeed: 30,
      backDelay: 1500,
      loop: true,
    },
  },
};

/* ===================================
   APPLICATION CLASS
   =================================== */

class PortfolioApp {
  constructor() {
    // Initialize managers
    this.i18n = new I18nManager(CONFIG.i18n);
    this.theme = new ThemeManager(CONFIG.theme);
    this.navigation = new NavigationManager(CONFIG.navigation);
    this.scrollEffects = new ScrollEffectsManager(CONFIG.scrollEffects);
    this.animations = new AnimationsManager(CONFIG.animations);
    this.languageSelector = null; // Will be initialized after i18n loads

    this.init();
  }

  /**
   * Initialize all application modules
   */
  async init() {
    try {
      const detectedLocale = await this.i18n.detectLocaleByGeolocation();

      await this.i18n.loadLocale(detectedLocale);
      this.i18n.translatePage();

      this.languageSelector = new LanguageSelectorManager(this.i18n);
      this.languageSelector.init();

      this.theme.init();
      this.navigation.init();
      this.scrollEffects.init();
      this.animations.init();

      this.scrollEffects.onScroll(() => {
        if (this.navigation.isMenuOpen()) {
          this.navigation.closeMobileMenu();
        }
      });

      this.setupEventListeners();
    } catch (error) {
      console.error("Error initializing application:", error);
    }
  }

  /**
   * Setup global event listeners
   */
  setupEventListeners() {
    // Handle page visibility changes (pause animations when hidden)
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        this.animations.pauseTyped();
      } else {
        this.animations.resumeTyped();
      }
    });
  }

  /**
   * Get application modules
   */
  getModules() {
    return {
      i18n: this.i18n,
      theme: this.theme,
      navigation: this.navigation,
      scrollEffects: this.scrollEffects,
      animations: this.animations,
      languageSelector: this.languageSelector,
    };
  }
}

/* ===================================
   INITIALIZE APPLICATION
   =================================== */

let app;

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    app = new PortfolioApp();
  });
} else {
  app = new PortfolioApp();
}

// Export for potential use in other modules
export { app, CONFIG };
export default PortfolioApp;
