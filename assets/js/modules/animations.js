/**
 * Animations Module
 * Responsible for: ScrollReveal animations and Typed.js text effects
 *
 * @author Igor Mariano
 * @version 1.0.0
 */

class AnimationsManager {
  constructor(options = {}) {
    // ScrollReveal configuration
    this.scrollRevealConfig = options.scrollReveal || {
      distance: "60px",
      duration: 1500,
      delay: 200,
      easing: "ease-in-out",
      reset: false,
    };

    // Typed.js configuration
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

    // Selectors for Typed.js
    this.typedSelectors = options.typedSelectors || [
      ".typed-text",
      ".multiple-text",
    ];

    this.scrollRevealInstance = null;
    this.typedInstance = null;
  }

  /**
   * Initialize all animations
   */
  init() {
    this.initScrollReveal();
    this.initTyped();

    return this;
  }

  /**
   * Initialize ScrollReveal animations
   */
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

    // Legacy selectors (for backward compatibility with old index.html)
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

  /**
   * Initialize Typed.js text animation
   */
  initTyped() {
    if (typeof Typed === "undefined") {
      return;
    }

    // Find typed element (try multiple selectors)
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

  /**
   * Destroy Typed.js instance
   */
  destroyTyped() {
    if (this.typedInstance) {
      this.typedInstance.destroy();
      this.typedInstance = null;
    }
  }

  /**
   * Reveal a specific element
   * @param {string} selector - CSS selector
   * @param {object} options - ScrollReveal options
   */
  reveal(selector, options = {}) {
    if (!this.scrollRevealInstance) {
      return;
    }
    this.scrollRevealInstance.reveal(selector, options);
  }

  /**
   * Update Typed.js strings
   * @param {string[]} strings - New strings to type
   */
  updateTypedStrings(strings) {
    if (!this.typedInstance) return;

    this.destroyTyped();
    this.typedConfig.strings = strings;
    this.initTyped();
  }

  /**
   * Pause Typed.js animation
   */
  pauseTyped() {
    if (this.typedInstance) {
      this.typedInstance.stop();
    }
  }

  /**
   * Resume Typed.js animation
   */
  resumeTyped() {
    if (this.typedInstance) {
      this.typedInstance.start();
    }
  }
}

export default AnimationsManager;
