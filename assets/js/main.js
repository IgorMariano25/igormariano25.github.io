/**
 * Main Application Module
 * Professional Portfolio - Igor Mariano
 *
 * Features:
 * - i18n (Internationalization) - PT/EN/ES support
 * - Theme switching (light/dark mode)
 * - Smooth scroll & animations (ScrollReveal)
 * - Mobile navigation with toggle
 * - Active section detection on scroll
 * - Sticky header behavior
 * - Back to top button
 * - Typed.js text animation
 *
 * Legacy Compatibility:
 * This file combines modern ES6 architecture with legacy script.js functionality:
 * ✅ Menu toggle with .bx-x icon change
 * ✅ Active section detection (150px offset)
 * ✅ Sticky header at 100px scroll
 * ✅ Auto-close menu on scroll
 * ✅ ScrollReveal animations (legacy selectors supported)
 * ✅ Typed.js with .multiple-text fallback
 *
 * @author Igor Mariano
 * @version 3.0.0 - Unified ES6 + Legacy Support
 */

import I18nManager from "./i18n.js";

/* ===================================
   CONFIGURATION
   =================================== */

const CONFIG = {
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
};

/* ===================================
   APPLICATION CLASS
   =================================== */

class PortfolioApp {
  constructor() {
    this.i18n = new I18nManager();
    this.currentTheme = this.getStoredTheme();
    this.mobileMenuOpen = false;

    this.init();
  }

  /**
   * Initialize all application modules
   */
  async init() {
    console.log("🚀 Initializing Portfolio Application...");

    // Load translations
    await this.i18n.loadLocale(this.i18n.currentLocale);
    this.i18n.translatePage();

    // Initialize components
    console.log("Initializing theme...");
    this.initTheme();

    console.log("Initializing navigation...");
    this.initNavigation();

    console.log("Initializing scroll effects...");
    this.initScrollEffects();

    console.log("Initializing animations...");
    this.initAnimations();

    console.log("Initializing language selector...");
    this.initLanguageSelector();

    console.log("Initializing back to top...");
    this.initBackToTop();

    // Update UI based on current language
    this.updateLanguageButtons();

    console.log("✅ Portfolio Application Initialized Successfully");
  }

  /* ===================================
     THEME MANAGEMENT
     =================================== */

  /**
   * Get stored theme from localStorage
   */
  getStoredTheme() {
    const stored = localStorage.getItem("theme");
    if (stored) return stored;

    // Detect system preference
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  /**
   * Initialize theme system
   */
  initTheme() {
    this.applyTheme(this.currentTheme);

    const themeToggle = document.getElementById("theme-toggle");
    if (themeToggle) {
      themeToggle.addEventListener("click", () => this.toggleTheme());
    }

    // Listen for system theme changes
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", (e) => {
        if (!localStorage.getItem("theme")) {
          this.applyTheme(e.matches ? "dark" : "light");
        }
      });
  }

  /**
   * Apply theme to document
   */
  applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    this.currentTheme = theme;

    // Update icon
    const icon = document.querySelector("#theme-toggle i");
    if (icon) {
      icon.className = theme === "dark" ? "bx bx-sun" : "bx bx-moon";
    }
  }

  /**
   * Toggle between light and dark theme
   */
  toggleTheme() {
    const newTheme = this.currentTheme === "light" ? "dark" : "light";
    this.applyTheme(newTheme);
    localStorage.setItem("theme", newTheme);

    // Dispatch custom event
    window.dispatchEvent(
      new CustomEvent("themeChanged", {
        detail: { theme: newTheme },
      })
    );
  }

  /* ===================================
     NAVIGATION
     =================================== */

  /**
   * Initialize navigation functionality
   * Combines modern ES6 approach with legacy script.js functionality
   */
  initNavigation() {
    // Mobile menu toggle (modern + legacy compatible)
    const menuToggle = document.getElementById("menu-toggle");
    const nav = document.querySelector(".nav");

    if (menuToggle && nav) {
      // Toggle menu on click
      menuToggle.addEventListener("click", () => {
        this.mobileMenuOpen = !this.mobileMenuOpen;

        // Toggle classes (supports both .active and .nav patterns)
        nav.classList.toggle("active");
        menuToggle.classList.toggle("bx-x"); // Legacy support
        menuToggle.setAttribute("aria-expanded", this.mobileMenuOpen);

        // Update icon
        const icon = menuToggle.querySelector("i");
        if (icon) {
          icon.className = this.mobileMenuOpen ? "bx bx-x" : "bx bx-menu";
        }
      });
    }

    // Close mobile menu when clicking nav links
    const navLinks = document.querySelectorAll(".nav__link, header nav a");
    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        if (this.mobileMenuOpen && nav && menuToggle) {
          nav.classList.remove("active");
          this.mobileMenuOpen = false;
          menuToggle.classList.remove("bx-x"); // Legacy support
          menuToggle.setAttribute("aria-expanded", "false");

          const icon = menuToggle.querySelector("i");
          if (icon) {
            icon.className = "bx bx-menu";
          }
        }
      });
    });

    // Active section detection
    this.initActiveSection();
  }

  /**
   * Detect active section on scroll
   * ES6 version of legacy script.js window.onscroll functionality
   */
  initActiveSection() {
    const sections = document.querySelectorAll("section[id]");
    const navLinks = document.querySelectorAll(".nav__link, header nav a");

    console.log(`Monitoring ${sections.length} sections`);

    // Function to update active link (based on legacy script.js logic)
    const updateActiveLink = () => {
      let current = "home"; // Default to home
      const scrollY = window.pageYOffset || window.scrollY;

      sections.forEach((section) => {
        const sectionTop = section.offsetTop - 150; // Same offset as legacy
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute("id");

        if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
          current = sectionId;
        }
      });

      // Update all nav links (supports both .nav__link--active and .active)
      navLinks.forEach((link) => {
        link.classList.remove("nav__link--active", "active");
        const href = link.getAttribute("href");

        if (href === `#${current}`) {
          link.classList.add("nav__link--active", "active");
        }
      });
    };

    // Throttle function for better performance
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

    // Run on scroll (replaces legacy window.onscroll)
    window.addEventListener("scroll", throttledUpdate);

    // Run on load
    updateActiveLink();
  }

  /* ===================================
     SCROLL EFFECTS
     =================================== */

  /**
   * Initialize scroll-based effects
   * Includes sticky header functionality from legacy script.js
   */
  initScrollEffects() {
    let lastScroll = 0;
    const header = document.querySelector(".header, header");
    const menuToggle = document.getElementById("menu-toggle");
    const nav = document.querySelector(".nav, .navbar");

    if (!header) {
      console.warn("Header not found");
      return;
    }

    window.addEventListener("scroll", () => {
      const currentScroll = window.pageYOffset || window.scrollY;

      // Add shadow to header on scroll (modern approach)
      if (currentScroll > 50) {
        header.style.boxShadow = "var(--shadow-md)";
      } else {
        header.style.boxShadow = "var(--header-shadow, none)";
      }

      // Sticky header class toggle (legacy script.js compatibility)
      // Toggles at 100px like the original
      if (currentScroll > 100) {
        header.classList.add("sticky");
      } else {
        header.classList.remove("sticky");
      }

      // Close mobile menu on scroll (legacy script.js behavior)
      if (this.mobileMenuOpen && menuToggle && nav) {
        nav.classList.remove("active");
        this.mobileMenuOpen = false;
        menuToggle.classList.remove("bx-x");
        menuToggle.setAttribute("aria-expanded", "false");

        const icon = menuToggle.querySelector("i");
        if (icon) {
          icon.className = "bx bx-menu";
        }
      }

      lastScroll = currentScroll;
    });

    // Smooth scroll for anchor links - MUST be after DOM is loaded
    this.initSmoothScroll();
  }

  /**
   * Initialize smooth scrolling for all anchor links
   */
  initSmoothScroll() {
    // Get all links that start with #
    const anchors = document.querySelectorAll('a[href^="#"]');

    console.log(`Found ${anchors.length} anchor links`);

    anchors.forEach((anchor) => {
      anchor.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();

        const href = this.getAttribute("href");
        console.log("Clicked anchor:", href);

        // Handle empty hash or #home (scroll to top)
        if (href === "#" || href === "#home") {
          window.scrollTo({
            top: 0,
            behavior: "smooth",
          });
          return;
        }

        const target = document.querySelector(href);

        if (target) {
          const headerHeight = 80;
          const offsetTop = target.offsetTop - headerHeight;

          console.log("Scrolling to:", href, "offset:", offsetTop);

          window.scrollTo({
            top: offsetTop,
            behavior: "smooth",
          });
        } else {
          console.warn("Target not found:", href);
        }
      });
    });
  }

  /* ===================================
     ANIMATIONS
     =================================== */

  /**
   * Initialize scroll reveal animations
   * ES6 version with legacy script.js selectors support
   */
  initAnimations() {
    if (typeof ScrollReveal === "undefined") {
      console.warn("ScrollReveal not loaded");
      return;
    }

    // Initialize ScrollReveal with config
    const sr = ScrollReveal(CONFIG.scrollReveal);

    // Modern selectors (new portfolio)
    sr.reveal(".hero__text", { origin: "left" });
    sr.reveal(".hero__image", { origin: "right", delay: 400 });
    sr.reveal(".about__image", { origin: "left" });
    sr.reveal(".about__text", { origin: "right" });
    sr.reveal(".timeline-item", { origin: "bottom", interval: 200 });
    sr.reveal(".geolocation-highlight", { origin: "top" });
    sr.reveal(".skill-card", { origin: "bottom", interval: 100 });
    sr.reveal(".portfolio-card", { origin: "bottom", interval: 150 });

    // Legacy selectors support (from script.js)
    // These will work if old HTML structure is present
    sr.reveal(".home-content, .heading", {
      origin: "top",
      distance: "80px",
      duration: 2000,
    });
    sr.reveal(".home-img, .services-container, .portfolio-box, .contact form", {
      origin: "bottom",
      distance: "80px",
      duration: 2000,
    });
    sr.reveal(".home-content h1, .about-img", {
      origin: "left",
      distance: "80px",
      duration: 2000,
    });
    sr.reveal(".home-content p, .about-content", {
      origin: "right",
      distance: "80px",
      duration: 2000,
    });

    // Initialize Typed.js if available
    this.initTypedAnimation();
  }

  /**
   * Initialize Typed.js animation
   * Supports both modern and legacy selectors
   */
  initTypedAnimation() {
    if (typeof Typed === "undefined") {
      console.warn("Typed.js not loaded");
      return;
    }

    // Check for modern selector first
    let typedElement = document.querySelector(".typed-text");

    // Fallback to legacy selector (from script.js)
    if (!typedElement) {
      typedElement = document.querySelector(".multiple-text");
    }

    if (typedElement) {
      console.log("Initializing Typed.js animation");

      // Use modern config with fallback to legacy strings
      const strings =
        CONFIG.typed.strings.length > 0
          ? CONFIG.typed.strings
          : [
              "Análise e Desenvolvimento de Sistemas",
              "Web Development",
              "UX/UI",
            ];

      new Typed(typedElement, {
        strings: strings,
        typeSpeed: CONFIG.typed.typeSpeed || 60,
        backSpeed: CONFIG.typed.backSpeed || 80,
        backDelay: CONFIG.typed.backDelay || 100,
        loop: true,
      });
    } else {
      console.log("Typed element not found (.typed-text or .multiple-text)");
    }
  }

  /* ===================================
     LANGUAGE SELECTOR
     =================================== */

  /**
   * Initialize language selector buttons
   */
  initLanguageSelector() {
    const languageButtons = document.querySelectorAll(".language-btn");

    languageButtons.forEach((btn) => {
      btn.addEventListener("click", async () => {
        const lang = btn.getAttribute("data-lang");

        // Change locale
        await this.i18n.changeLocale(lang);

        // Update button states
        this.updateLanguageButtons();

        // Show feedback (optional)
        this.showNotification(`Language changed to ${lang.toUpperCase()}`);
      });
    });

    // Listen to locale change events
    window.addEventListener("localeChanged", (e) => {
      console.log("Locale changed to:", e.detail.locale);
    });
  }

  /**
   * Update active state of language buttons
   */
  updateLanguageButtons() {
    const currentLang = this.i18n.getCurrentLocale();
    const buttons = document.querySelectorAll(".language-btn");

    buttons.forEach((btn) => {
      const lang = btn.getAttribute("data-lang");
      if (lang === currentLang) {
        btn.classList.add("language-btn--active");
      } else {
        btn.classList.remove("language-btn--active");
      }
    });
  }

  /* ===================================
     BACK TO TOP
     =================================== */

  /**
   * Initialize back to top button
   */
  initBackToTop() {
    const backToTop = document.getElementById("back-to-top");

    if (!backToTop) {
      console.warn("Back to top button not found");
      return;
    }

    console.log("Back to top button initialized");

    // Show/hide based on scroll position
    window.addEventListener("scroll", () => {
      if (window.pageYOffset > 500) {
        backToTop.style.opacity = "1";
        backToTop.style.visibility = "visible";
        backToTop.style.pointerEvents = "auto";
      } else {
        backToTop.style.opacity = "0";
        backToTop.style.visibility = "hidden";
        backToTop.style.pointerEvents = "none";
      }
    });

    // Scroll to top on click
    backToTop.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log("Back to top clicked");

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    });
  }

  /* ===================================
     UTILITIES
     =================================== */

  /**
   * Show notification message (optional enhancement)
   */
  showNotification(message, type = "info", duration = 3000) {
    // This could be expanded to show toast notifications
    console.log(`[${type.toUpperCase()}] ${message}`);

    // Simple implementation - could be enhanced with a toast library
    // For now, just log to console
  }
}

/* ===================================
   INITIALIZE APPLICATION
   =================================== */

// Wait for DOM to be ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    new PortfolioApp();
  });
} else {
  new PortfolioApp();
}

// Handle page visibility changes (performance optimization)
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    console.log("Page hidden - pausing animations");
  } else {
    console.log("Page visible - resuming animations");
  }
});

// Export for potential use in other modules
export default PortfolioApp;
