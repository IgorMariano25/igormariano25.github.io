/**
 * Standalone Version - Works without HTTP Server
 * All modules bundled in one file, no ES6 imports
 *
 * This file contains all the code from the modular version,
 * compiled into a single file for use without a web server.
 *
 * @author Igor Mariano
 * @version 3.0.0
 */

/* ===================================
   MODULE: I18N MANAGER
   Responsibility: Language detection, translation loading, page translation
   =================================== */

class I18nManager {
  constructor(options = {}) {
    this.translations = {};
    this.fallbackLocale = options.fallbackLocale || "en";
    this.supportedLocales = options.supportedLocales || ["pt", "en", "es"];
    this.localesPath = options.localesPath || "./locales";
    this.currentLocale = this.fallbackLocale; // Será atualizado após detecção

    // Mapeamento de países para idiomas
    this.countryToLocale = {
      // Português
      BR: "pt", // Brasil
      PT: "pt", // Portugal
      AO: "pt", // Angola
      MZ: "pt", // Moçambique

      // Espanhol (LATAM e Espanha)
      AR: "es", // Argentina
      BO: "es", // Bolívia
      CL: "es", // Chile
      CO: "es", // Colômbia
      CR: "es", // Costa Rica
      CU: "es", // Cuba
      DO: "es", // República Dominicana
      EC: "es", // Equador
      SV: "es", // El Salvador
      GT: "es", // Guatemala
      HN: "es", // Honduras
      MX: "es", // México
      NI: "es", // Nicarágua
      PA: "es", // Panamá
      PY: "es", // Paraguai
      PE: "es", // Peru
      PR: "es", // Porto Rico
      ES: "es", // Espanha
      UY: "es", // Uruguai
      VE: "es", // Venezuela
    };
  }

  /**
   * Detecta o idioma baseado na localização geográfica do usuário
   * Prioridade: localStorage > Geolocalização por IP > Idioma do navegador > Fallback
   */
  detectLocale() {
    // 1. Primeiro verifica se o usuário já escolheu um idioma
    const savedLocale = localStorage.getItem("preferredLocale");
    if (savedLocale && this.supportedLocales.includes(savedLocale)) {
      return savedLocale;
    }

    // 2. Fallback direto para inglês (idioma padrão)
    return this.fallbackLocale; // "en"
  }

  /**
   * Tenta obter geolocalização usando múltiplas APIs de fallback
   */
  async fetchGeolocation() {
    // Lista de APIs de geolocalização (em ordem de preferência)
    const geoApis = [
      {
        url: "https://ipwho.is/",
        getCountry: (data) => data.country_code,
      },
      {
        url: "https://ipapi.co/json/",
        getCountry: (data) => data.country_code,
      },
      {
        url: "https://api.country.is/",
        getCountry: (data) => data.country,
      },
    ];

    for (const api of geoApis) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

        const response = await fetch(api.url, {
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) continue;

        const data = await response.json();
        const countryCode = api.getCountry(data);

        if (countryCode) {
          return countryCode;
        }
      } catch (error) {
        // Tentar próxima API
        continue;
      }
    }

    return null;
  }

  async detectLocaleByGeolocation() {
    // Se o usuário já escolheu um idioma, respeitar a escolha
    const savedLocale = localStorage.getItem("preferredLocale");
    if (savedLocale && this.supportedLocales.includes(savedLocale)) {
      return savedLocale;
    }

    try {
      const countryCode = await this.fetchGeolocation();

      if (countryCode && this.countryToLocale[countryCode]) {
        return this.countryToLocale[countryCode];
      }

      return this.detectLocale();
    } catch (error) {
      return this.detectLocale();
    }
  }

  async loadLocale(locale) {
    try {
      // Cache buster para garantir que o arquivo mais recente seja carregado
      const cacheBuster = `?v=${Date.now()}`;
      const response = await fetch(
        `${this.localesPath}/${locale}.json${cacheBuster}`
      );

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

      if (locale !== this.fallbackLocale) {
        return this.loadLocale(this.fallbackLocale);
      }
      return false;
    }
  }

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

    if (typeof value === "string" && Object.keys(params).length > 0) {
      return value.replace(/\{(\w+)\}/g, (match, paramKey) => {
        return params[paramKey] !== undefined ? params[paramKey] : match;
      });
    }

    return value;
  }

  translatePage() {
    const elements = document.querySelectorAll("[data-i18n]");

    elements.forEach((element) => {
      const key = element.getAttribute("data-i18n");
      const translation = this.t(key);

      if (element.tagName === "INPUT" || element.tagName === "TEXTAREA") {
        element.placeholder = translation;
      } else {
        // Se tem data-i18n-split, divide o texto e aplica gradient na última palavra
        if (element.hasAttribute("data-i18n-split")) {
          const words = translation.trim().split(" ");
          if (words.length > 1) {
            const lastWord = words.pop();
            const firstPart = words.join(" ");
            element.innerHTML = `<span>${firstPart}</span> <span class="gradient-text">${lastWord}</span>`;
          } else {
            element.textContent = translation;
          }
        } else {
          element.textContent = translation;
        }
      }
    });

    document.querySelectorAll("[data-i18n-aria]").forEach((element) => {
      const key = element.getAttribute("data-i18n-aria");
      element.setAttribute("aria-label", this.t(key));
    });

    document.querySelectorAll("[data-i18n-title]").forEach((element) => {
      const key = element.getAttribute("data-i18n-title");
      element.setAttribute("title", this.t(key));
    });
  }

  async changeLocale(locale) {
    if (!this.supportedLocales.includes(locale)) {
      console.error(`Unsupported locale: ${locale}`);
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

  getCurrentLocale() {
    return this.currentLocale;
  }

  getSupportedLocales() {
    return this.supportedLocales;
  }
}

/* ===================================
   MODULE: THEME MANAGER
   Responsibility: Dark/Light mode switching and persistence
   =================================== */

class ThemeManager {
  constructor(options = {}) {
    this.storageKey = options.storageKey || "theme";
    this.toggleSelector = options.toggleSelector || "#theme-toggle";
    this.iconSelector = options.iconSelector || "#theme-toggle i";
    this.darkIcon = options.darkIcon || "bx bx-sun";
    this.lightIcon = options.lightIcon || "bx bx-moon";

    this.currentTheme = this.getStoredTheme();
  }

  getStoredTheme() {
    const stored = localStorage.getItem(this.storageKey);
    if (stored) return stored;

    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  init() {
    this.applyTheme(this.currentTheme);

    const themeToggle = document.querySelector(this.toggleSelector);
    if (themeToggle) {
      themeToggle.addEventListener("click", () => this.toggle());
    }

    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", (e) => {
        if (!localStorage.getItem(this.storageKey)) {
          this.applyTheme(e.matches ? "dark" : "light");
        }
      });

    return this;
  }

  applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    this.currentTheme = theme;

    const icon = document.querySelector(this.iconSelector);
    if (icon) {
      icon.className = theme === "dark" ? this.darkIcon : this.lightIcon;
    }
  }

  toggle() {
    const newTheme = this.currentTheme === "light" ? "dark" : "light";
    this.applyTheme(newTheme);
    localStorage.setItem(this.storageKey, newTheme);

    window.dispatchEvent(
      new CustomEvent("themeChanged", {
        detail: { theme: newTheme },
      })
    );

    return newTheme;
  }

  getCurrentTheme() {
    return this.currentTheme;
  }

  isDark() {
    return this.currentTheme === "dark";
  }
}

/* ===================================
   MODULE: NAVIGATION MANAGER
   Responsibility: Mobile menu, active section detection, smooth scroll
   =================================== */

class NavigationManager {
  constructor(options = {}) {
    this.menuToggleSelector = options.menuToggleSelector || "#menu-toggle";
    this.navSelector = options.navSelector || ".nav";
    this.navLinkSelector =
      options.navLinkSelector || ".nav__link, header nav a";
    this.sectionSelector = options.sectionSelector || "section[id]";
    this.activeClass = options.activeClass || "nav__link--active";
    this.legacyActiveClass = options.legacyActiveClass || "active";
    this.scrollOffset = options.scrollOffset || 150;
    this.headerHeight = options.headerHeight || 80;

    this.mobileMenuOpen = false;
    this.menuToggle = null;
    this.nav = null;
  }

  init() {
    this.menuToggle = document.querySelector(this.menuToggleSelector);
    this.nav = document.querySelector(this.navSelector);

    this.initMobileMenu();
    this.initActiveSection();
    this.initSmoothScroll();

    return this;
  }

  initMobileMenu() {
    if (!this.menuToggle || !this.nav) {
      return;
    }

    this.menuToggle.addEventListener("click", () => {
      this.toggleMobileMenu();
    });

    const navLinks = document.querySelectorAll(this.navLinkSelector);
    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        if (this.mobileMenuOpen) {
          this.closeMobileMenu();
        }
      });
    });
  }

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;

    this.nav.classList.toggle("active");
    this.menuToggle.classList.toggle("bx-x");
    this.menuToggle.setAttribute("aria-expanded", this.mobileMenuOpen);

    const icon = this.menuToggle.querySelector("i");
    if (icon) {
      icon.className = this.mobileMenuOpen ? "bx bx-x" : "bx bx-menu";
    }
  }

  closeMobileMenu() {
    if (!this.mobileMenuOpen) return;

    this.mobileMenuOpen = false;
    this.nav.classList.remove("active");
    this.menuToggle.classList.remove("bx-x");
    this.menuToggle.setAttribute("aria-expanded", "false");

    const icon = this.menuToggle.querySelector("i");
    if (icon) {
      icon.className = "bx bx-menu";
    }
  }

  isMenuOpen() {
    return this.mobileMenuOpen;
  }

  initActiveSection() {
    const sections = document.querySelectorAll(this.sectionSelector);
    const navLinks = document.querySelectorAll(this.navLinkSelector);

    if (sections.length === 0) {
      return;
    }

    const updateActiveLink = () => {
      let current = "home";
      const scrollY = window.pageYOffset || window.scrollY;

      sections.forEach((section) => {
        const sectionTop = section.offsetTop - this.scrollOffset;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute("id");

        if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
          current = sectionId;
        }
      });

      navLinks.forEach((link) => {
        link.classList.remove(this.activeClass, this.legacyActiveClass);
        const href = link.getAttribute("href");

        if (href === `#${current}`) {
          link.classList.add(this.activeClass, this.legacyActiveClass);
        }
      });
    };

    let ticking = false;
    const throttledUpdate = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateActiveLink();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", throttledUpdate);
    updateActiveLink();
  }

  initSmoothScroll() {
    const anchors = document.querySelectorAll('a[href^="#"]');

    anchors.forEach((anchor) => {
      anchor.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();

        const href = anchor.getAttribute("href");

        if (href === "#" || href === "#home") {
          window.scrollTo({ top: 0, behavior: "smooth" });
          return;
        }

        const target = document.querySelector(href);
        if (target) {
          const offsetTop = target.offsetTop - this.headerHeight;
          window.scrollTo({ top: offsetTop, behavior: "smooth" });
        }
      });
    });
  }

  scrollToSection(sectionId) {
    const target = document.querySelector(`#${sectionId}`);
    if (target) {
      const offsetTop = target.offsetTop - this.headerHeight;
      window.scrollTo({ top: offsetTop, behavior: "smooth" });
    }
  }
}

/* ===================================
   MODULE: SCROLL EFFECTS MANAGER
   Responsibility: Header shadow, sticky header, back-to-top button
   =================================== */

class ScrollEffectsManager {
  constructor(options = {}) {
    this.headerSelector = options.headerSelector || ".header, header";
    this.backToTopSelector = options.backToTopSelector || "#back-to-top";
    this.stickyThreshold = options.stickyThreshold || 100;
    this.shadowThreshold = options.shadowThreshold || 50;
    this.backToTopThreshold = options.backToTopThreshold || 500;

    this.header = null;
    this.backToTop = null;
    this.onScrollCallback = null;
  }

  init() {
    this.header = document.querySelector(this.headerSelector);
    this.backToTop = document.querySelector(this.backToTopSelector);

    this.initScrollHandler();
    this.initBackToTop();

    return this;
  }

  initScrollHandler() {
    window.addEventListener("scroll", () => {
      const currentScroll = window.pageYOffset || window.scrollY;

      if (this.header) {
        if (currentScroll > this.shadowThreshold) {
          this.header.style.boxShadow = "var(--shadow-md)";
        } else {
          this.header.style.boxShadow = "var(--header-shadow, none)";
        }

        if (currentScroll > this.stickyThreshold) {
          this.header.classList.add("sticky");
        } else {
          this.header.classList.remove("sticky");
        }
      }

      if (this.backToTop) {
        if (currentScroll > this.backToTopThreshold) {
          this.showBackToTop();
        } else {
          this.hideBackToTop();
        }
      }

      if (this.onScrollCallback) {
        this.onScrollCallback(currentScroll);
      }
    });
  }

  initBackToTop() {
    if (!this.backToTop) {
      return;
    }

    this.hideBackToTop();

    this.backToTop.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.scrollToTop();
    });
  }

  showBackToTop() {
    if (!this.backToTop) return;
    this.backToTop.style.opacity = "1";
    this.backToTop.style.visibility = "visible";
    this.backToTop.style.pointerEvents = "auto";
  }

  hideBackToTop() {
    if (!this.backToTop) return;
    this.backToTop.style.opacity = "0";
    this.backToTop.style.visibility = "hidden";
    this.backToTop.style.pointerEvents = "none";
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  onScroll(callback) {
    this.onScrollCallback = callback;
    return this;
  }

  getScrollPosition() {
    return window.pageYOffset || window.scrollY;
  }

  isScrolled() {
    return this.getScrollPosition() > this.stickyThreshold;
  }
}

/* ===================================
   MODULE: ANIMATIONS MANAGER
   Responsibility: ScrollReveal animations and Typed.js text effects
   =================================== */

class AnimationsManager {
  constructor(options = {}) {
    this.scrollRevealConfig = options.scrollReveal || {
      distance: "60px",
      duration: 1500,
      delay: 200,
      easing: "ease-in-out",
      reset: false,
    };

    this.typedConfig = options.typed || {
      strings: [
        "Análise e Desenvolvimento de Sistemas",
        "Geolocalização & Logística",
        "Full-Stack Development",
      ],
      typeSpeed: 50,
      backSpeed: 30,
      backDelay: 1500,
      loop: true,
    };

    this.typedSelectors = options.typedSelectors || [
      ".typed-text",
      ".multiple-text",
    ];

    this.scrollRevealInstance = null;
    this.typedInstance = null;
  }

  init() {
    this.initScrollReveal();
    this.initTyped();

    return this;
  }

  initScrollReveal() {
    if (typeof ScrollReveal === "undefined") {
      return;
    }

    this.scrollRevealInstance = ScrollReveal(this.scrollRevealConfig);
    const sr = this.scrollRevealInstance;

    // Modern portfolio selectors
    sr.reveal(".hero__text", { origin: "left" });
    sr.reveal(".hero__image", { origin: "right", delay: 400 });
    sr.reveal(".about__image", { origin: "left" });
    sr.reveal(".about__text", { origin: "right" });
    sr.reveal(".timeline-item", { origin: "bottom", interval: 200 });
    sr.reveal(".geolocation-highlight", { origin: "top" });
    sr.reveal(".skill-card", { origin: "bottom", interval: 100 });
    sr.reveal(".portfolio-card", { origin: "bottom", interval: 150 });

    // Legacy selectors (backward compatibility)
    const legacyConfig = { distance: "80px", duration: 2000 };
    sr.reveal(".home-content, .heading", { ...legacyConfig, origin: "top" });
    sr.reveal(".home-img, .services-container, .portfolio-box, .contact form", {
      ...legacyConfig,
      origin: "bottom",
    });
    sr.reveal(".home-content h1, .about-img", {
      ...legacyConfig,
      origin: "left",
    });
    sr.reveal(".home-content p, .about-content", {
      ...legacyConfig,
      origin: "right",
    });
  }

  initTyped() {
    if (typeof Typed === "undefined") {
      return;
    }

    let typedElement = null;
    for (const selector of this.typedSelectors) {
      typedElement = document.querySelector(selector);
      if (typedElement) break;
    }

    if (!typedElement) {
      return;
    }

    this.typedInstance = new Typed(typedElement, {
      strings: this.typedConfig.strings,
      typeSpeed: this.typedConfig.typeSpeed,
      backSpeed: this.typedConfig.backSpeed,
      backDelay: this.typedConfig.backDelay,
      loop: this.typedConfig.loop,
    });
  }

  destroyTyped() {
    if (this.typedInstance) {
      this.typedInstance.destroy();
      this.typedInstance = null;
    }
  }

  reveal(selector, options = {}) {
    if (!this.scrollRevealInstance) {
      return;
    }
    this.scrollRevealInstance.reveal(selector, options);
  }

  updateTypedStrings(strings) {
    if (!this.typedInstance) return;

    this.destroyTyped();
    this.typedConfig.strings = strings;
    this.initTyped();
  }

  pauseTyped() {
    if (this.typedInstance) {
      this.typedInstance.stop();
    }
  }

  resumeTyped() {
    if (this.typedInstance) {
      this.typedInstance.start();
    }
  }
}

/* ===================================
   MODULE: LANGUAGE SELECTOR MANAGER
   Responsibility: Language button UI and interaction with i18n
   =================================== */

class LanguageSelectorManager {
  constructor(i18nManager, options = {}) {
    this.i18n = i18nManager;
    this.buttonSelector = options.buttonSelector || ".language-btn";
    this.activeClass = options.activeClass || "language-btn--active";
  }

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

    this.updateButtons();

    window.addEventListener("localeChanged", () => {
      this.updateButtons();
    });

    return this;
  }

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

  getCurrentLanguage() {
    return this.i18n.getCurrentLocale();
  }

  async setLanguage(lang) {
    await this.i18n.changeLocale(lang);
    this.updateButtons();
  }
}

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
   APPLICATION CLASS (ORCHESTRATOR)
   =================================== */

class PortfolioApp {
  constructor() {
    this.i18n = new I18nManager(CONFIG.i18n);
    this.theme = new ThemeManager(CONFIG.theme);
    this.navigation = new NavigationManager(CONFIG.navigation);
    this.scrollEffects = new ScrollEffectsManager(CONFIG.scrollEffects);
    this.animations = new AnimationsManager(CONFIG.animations);
    this.languageSelector = null;

    this.init();
  }

  async init() {
    try {
      // 1. Detectar idioma por geolocalização (ou usar preferência salva)
      const detectedLocale = await this.i18n.detectLocaleByGeolocation();

      // 2. Carregar traduções
      await this.i18n.loadLocale(detectedLocale);
      this.i18n.translatePage();

      // 3. Initialize language selector
      this.languageSelector = new LanguageSelectorManager(this.i18n);
      this.languageSelector.init();

      // 4. Initialize other modules
      this.theme.init();
      this.navigation.init();
      this.scrollEffects.init();
      this.animations.init();

      // 5. Close mobile menu on scroll
      this.scrollEffects.onScroll(() => {
        if (this.navigation.isMenuOpen()) {
          this.navigation.closeMobileMenu();
        }
      });

      // 6. Setup event listeners
      this.setupEventListeners();
    } catch (error) {
      console.error("Error initializing application:", error);
    }
  }

  setupEventListeners() {
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        this.animations.pauseTyped();
      } else {
        this.animations.resumeTyped();
      }
    });
  }

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
