/**
 * Standalone Version - Works without HTTP Server
 * All code in one file, no ES6 modules
 */

/* ===================================
   I18N MANAGER (Inline)
   =================================== */

class I18nManager {
  constructor() {
    this.translations = {};
    this.fallbackLocale = 'en';
    this.supportedLocales = ['pt', 'en', 'es'];
    this.currentLocale = this.detectLocale();
  }

  detectLocale() {
    const browserLang = navigator.language || navigator.userLanguage;
    const lang = browserLang ? browserLang.split('-')[0] : 'en';
    
    const savedLocale = localStorage.getItem('preferredLocale');
    if (savedLocale && this.supportedLocales.includes(savedLocale)) {
      return savedLocale;
    }
    
    return this.supportedLocales.includes(lang) ? lang : 'en';
  }

  async loadLocale(locale) {
    try {
      console.log(`📥 Loading locale: ${locale}`);
      const response = await fetch(`./locales/${locale}.json`);
      if (!response.ok) throw new Error(`Failed to load locale: ${locale}`);
      
      this.translations = await response.json();
      this.currentLocale = locale;
      localStorage.setItem('preferredLocale', locale);
      document.documentElement.lang = locale;
      
      console.log(`✅ Locale ${locale} loaded successfully`);
      console.log('Sample translation:', this.translations.nav);
      
      return true;
    } catch (error) {
      console.error('❌ Error loading locale:', error);
      if (locale !== this.fallbackLocale) {
        console.log(`Falling back to ${this.fallbackLocale}`);
        return this.loadLocale(this.fallbackLocale);
      }
      return false;
    }
  }

  t(key, params = {}) {
    const keys = key.split('.');
    let value = this.translations;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        console.warn(`Translation key not found: ${key}`);
        return key;
      }
    }

    if (typeof value === 'string' && Object.keys(params).length > 0) {
      return value.replace(/\{(\w+)\}/g, (match, paramKey) => {
        return params[paramKey] !== undefined ? params[paramKey] : match;
      });
    }

    return value;
  }

  translatePage() {
    const elements = document.querySelectorAll('[data-i18n]');
    
    console.log(`🔄 Translating ${elements.length} elements...`);
    
    elements.forEach(element => {
      const key = element.getAttribute('data-i18n');
      const translation = this.t(key);
      
      if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
        element.placeholder = translation;
      } else {
        element.textContent = translation;
      }
    });

    const ariaElements = document.querySelectorAll('[data-i18n-aria]');
    ariaElements.forEach(element => {
      const key = element.getAttribute('data-i18n-aria');
      element.setAttribute('aria-label', this.t(key));
    });

    const titleElements = document.querySelectorAll('[data-i18n-title]');
    titleElements.forEach(element => {
      const key = element.getAttribute('data-i18n-title');
      element.setAttribute('title', this.t(key));
    });
    
    console.log('✅ Translation complete');
  }
  }

  async changeLocale(locale) {
    if (!this.supportedLocales.includes(locale)) {
      console.error(`Unsupported locale: ${locale}`);
      return false;
    }

    console.log(`🌍 Changing locale to: ${locale}`);
    const success = await this.loadLocale(locale);
    if (success) {
      this.translatePage();
      console.log(`✅ Page translated to ${locale}`);
      
      window.dispatchEvent(new CustomEvent('localeChanged', {
        detail: { locale: this.currentLocale }
      }));
    }
    
    return success;
  }

  getCurrentLocale() {
    return this.currentLocale;
  }
}

/* ===================================
   PORTFOLIO APP (Inline)
   =================================== */

const CONFIG = {
  scrollReveal: {
    distance: '60px',
    duration: 1500,
    delay: 200,
    easing: 'ease-in-out',
    reset: false
  },
  typed: {
    strings: [
      'Análise e Desenvolvimento de Sistemas',
      'Geolocalização & Logística',
      'Full-Stack Development'
    ],
    typeSpeed: 50,
    backSpeed: 30,
    backDelay: 1500,
    loop: true
  }
};

class PortfolioApp {
  constructor() {
    this.i18n = new I18nManager();
    this.currentTheme = this.getStoredTheme();
    this.mobileMenuOpen = false;
    
    this.init();
  }

  async init() {
    console.log('🚀 Initializing Portfolio Application...');
    
    await this.i18n.loadLocale(this.i18n.currentLocale);
    this.i18n.translatePage();

    console.log('Initializing theme...');
    this.initTheme();
    
    console.log('Initializing navigation...');
    this.initNavigation();
    
    console.log('Initializing scroll effects...');
    this.initScrollEffects();
    
    console.log('Initializing animations...');
    this.initAnimations();
    
    console.log('Initializing language selector...');
    this.initLanguageSelector();
    
    console.log('Initializing back to top...');
    this.initBackToTop();

    this.updateLanguageButtons();

    console.log('✅ Portfolio Application Initialized Successfully');
  }

  getStoredTheme() {
    const stored = localStorage.getItem('theme');
    if (stored) return stored;

    return window.matchMedia('(prefers-color-scheme: dark)').matches 
      ? 'dark' 
      : 'light';
  }

  initTheme() {
    this.applyTheme(this.currentTheme);

    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => this.toggleTheme());
      console.log('✅ Theme toggle button attached');
    } else {
      console.warn('❌ Theme toggle button not found');
    }

    window.matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
          this.applyTheme(e.matches ? 'dark' : 'light');
        }
      });
  }

  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    this.currentTheme = theme;

    const icon = document.querySelector('#theme-toggle i');
    if (icon) {
      icon.className = theme === 'dark' ? 'bx bx-sun' : 'bx bx-moon';
    }
    
    console.log(`Theme applied: ${theme}`);
  }

  toggleTheme() {
    const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.applyTheme(newTheme);
    localStorage.setItem('theme', newTheme);

    window.dispatchEvent(new CustomEvent('themeChanged', {
      detail: { theme: newTheme }
    }));
    
    console.log(`Theme toggled to: ${newTheme}`);
  }

  initNavigation() {
    const menuToggle = document.getElementById('menu-toggle');
    const nav = document.querySelector('.nav');

    if (menuToggle && nav) {
      menuToggle.addEventListener('click', () => {
        this.mobileMenuOpen = !this.mobileMenuOpen;
        
        nav.classList.toggle('active');
        menuToggle.classList.toggle('bx-x');
        menuToggle.setAttribute('aria-expanded', this.mobileMenuOpen);
        
        const icon = menuToggle.querySelector('i');
        if (icon) {
          icon.className = this.mobileMenuOpen ? 'bx bx-x' : 'bx bx-menu';
        }
      });
    }

    const navLinks = document.querySelectorAll('.nav__link, header nav a');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (this.mobileMenuOpen && nav && menuToggle) {
          nav.classList.remove('active');
          this.mobileMenuOpen = false;
          menuToggle.classList.remove('bx-x');
          menuToggle.setAttribute('aria-expanded', 'false');
          
          const icon = menuToggle.querySelector('i');
          if (icon) {
            icon.className = 'bx bx-menu';
          }
        }
      });
    });

    this.initActiveSection();
  }

  initActiveSection() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav__link, header nav a');

    const updateActiveLink = () => {
      let current = 'home';
      const scrollY = window.pageYOffset || window.scrollY;

      sections.forEach(section => {
        const sectionTop = section.offsetTop - 150;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');
        
        if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
          current = sectionId;
        }
      });

      navLinks.forEach(link => {
        link.classList.remove('nav__link--active', 'active');
        const href = link.getAttribute('href');
        
        if (href === `#${current}`) {
          link.classList.add('nav__link--active', 'active');
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

    window.addEventListener('scroll', throttledUpdate);
    updateActiveLink();
  }

  initScrollEffects() {
    const header = document.querySelector('.header, header');
    const menuToggle = document.getElementById('menu-toggle');
    const nav = document.querySelector('.nav, .navbar');

    if (!header) {
      console.warn('Header not found');
      return;
    }

    window.addEventListener('scroll', () => {
      const currentScroll = window.pageYOffset || window.scrollY;

      if (currentScroll > 50) {
        header.style.boxShadow = 'var(--shadow-md)';
      } else {
        header.style.boxShadow = 'var(--header-shadow, none)';
      }

      if (currentScroll > 100) {
        header.classList.add('sticky');
      } else {
        header.classList.remove('sticky');
      }

      if (this.mobileMenuOpen && menuToggle && nav) {
        nav.classList.remove('active');
        this.mobileMenuOpen = false;
        menuToggle.classList.remove('bx-x');
        menuToggle.setAttribute('aria-expanded', 'false');
        
        const icon = menuToggle.querySelector('i');
        if (icon) {
          icon.className = 'bx bx-menu';
        }
      }
    });

    this.initSmoothScroll();
  }

  initSmoothScroll() {
    const anchors = document.querySelectorAll('a[href^="#"]');
    
    console.log(`Found ${anchors.length} anchor links`);

    anchors.forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        
        const href = this.getAttribute('href');
        
        if (href === '#' || href === '#home') {
          window.scrollTo({
            top: 0,
            behavior: 'smooth'
          });
          return;
        }

        const target = document.querySelector(href);
        
        if (target) {
          const headerHeight = 80;
          const offsetTop = target.offsetTop - headerHeight;
          
          window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
          });
        }
      });
    });
  }

  initAnimations() {
    if (typeof ScrollReveal === 'undefined') {
      console.warn('ScrollReveal not loaded');
      return;
    }

    const sr = ScrollReveal(CONFIG.scrollReveal);

    sr.reveal('.hero__text', { origin: 'left' });
    sr.reveal('.hero__image', { origin: 'right', delay: 400 });
    sr.reveal('.about__image', { origin: 'left' });
    sr.reveal('.about__text', { origin: 'right' });
    sr.reveal('.timeline-item', { origin: 'bottom', interval: 200 });
    sr.reveal('.geolocation-highlight', { origin: 'top' });
    sr.reveal('.skill-card', { origin: 'bottom', interval: 100 });
    sr.reveal('.portfolio-card', { origin: 'bottom', interval: 150 });

    this.initTypedAnimation();
  }

  initTypedAnimation() {
    if (typeof Typed === 'undefined') {
      console.warn('Typed.js not loaded');
      return;
    }

    let typedElement = document.querySelector('.typed-text');
    
    if (!typedElement) {
      typedElement = document.querySelector('.multiple-text');
    }

    if (typedElement) {
      console.log('Initializing Typed.js animation');
      
      new Typed(typedElement, {
        strings: CONFIG.typed.strings,
        typeSpeed: CONFIG.typed.typeSpeed || 60,
        backSpeed: CONFIG.typed.backSpeed || 80,
        backDelay: CONFIG.typed.backDelay || 100,
        loop: true
      });
    }
  }

  initLanguageSelector() {
    const languageButtons = document.querySelectorAll('.language-btn');

    console.log(`Found ${languageButtons.length} language buttons`);

    languageButtons.forEach(btn => {
      btn.addEventListener('click', async () => {
        const lang = btn.getAttribute('data-lang');
        console.log(`Language button clicked: ${lang}`);
        
        await this.i18n.changeLocale(lang);
        this.updateLanguageButtons();
      });
    });

    if (languageButtons.length > 0) {
      console.log('✅ Language buttons attached');
    } else {
      console.warn('❌ No language buttons found');
    }
  }

  updateLanguageButtons() {
    const currentLang = this.i18n.getCurrentLocale();
    const buttons = document.querySelectorAll('.language-btn');

    buttons.forEach(btn => {
      const lang = btn.getAttribute('data-lang');
      if (lang === currentLang) {
        btn.classList.add('language-btn--active');
      } else {
        btn.classList.remove('language-btn--active');
      }
    });
  }

  initBackToTop() {
    const backToTop = document.getElementById('back-to-top');

    if (!backToTop) {
      console.warn('Back to top button not found');
      return;
    }

    console.log('Back to top button initialized');

    window.addEventListener('scroll', () => {
      if (window.pageYOffset > 500) {
        backToTop.style.opacity = '1';
        backToTop.style.visibility = 'visible';
        backToTop.style.pointerEvents = 'auto';
      } else {
        backToTop.style.opacity = '0';
        backToTop.style.visibility = 'hidden';
        backToTop.style.pointerEvents = 'none';
      }
    });

    backToTop.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
}

/* ===================================
   INITIALIZE
   =================================== */

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new PortfolioApp();
  });
} else {
  new PortfolioApp();
}
