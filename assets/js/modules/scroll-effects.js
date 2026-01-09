/**
 * Scroll Effects Module
 * Responsible for: Header shadow, sticky header, back-to-top button
 *
 * @author Igor Mariano
 * @version 1.0.0
 */

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

  /**
   * Initialize scroll effects
   */
  init() {
    this.header = document.querySelector(this.headerSelector);
    this.backToTop = document.querySelector(this.backToTopSelector);

    if (!this.header) {
      console.warn("Header element not found");
    }

    this.initScrollHandler();
    this.initBackToTop();

    console.log("✅ Scroll effects initialized");
    return this;
  }

  /**
   * Initialize main scroll handler
   */
  initScrollHandler() {
    window.addEventListener("scroll", () => {
      const currentScroll = window.pageYOffset || window.scrollY;

      // Header shadow effect
      if (this.header) {
        if (currentScroll > this.shadowThreshold) {
          this.header.style.boxShadow = "var(--shadow-md)";
        } else {
          this.header.style.boxShadow = "var(--header-shadow, none)";
        }

        // Sticky header class
        if (currentScroll > this.stickyThreshold) {
          this.header.classList.add("sticky");
        } else {
          this.header.classList.remove("sticky");
        }
      }

      // Back to top visibility
      if (this.backToTop) {
        if (currentScroll > this.backToTopThreshold) {
          this.showBackToTop();
        } else {
          this.hideBackToTop();
        }
      }

      // Execute custom callback if set
      if (this.onScrollCallback) {
        this.onScrollCallback(currentScroll);
      }
    });
  }

  /**
   * Initialize back to top button
   */
  initBackToTop() {
    if (!this.backToTop) {
      console.warn("Back to top button not found");
      return;
    }

    // Initial state: hidden
    this.hideBackToTop();

    this.backToTop.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.scrollToTop();
    });

    console.log("✅ Back to top button initialized");
  }

  /**
   * Show back to top button
   */
  showBackToTop() {
    if (!this.backToTop) return;
    this.backToTop.style.opacity = "1";
    this.backToTop.style.visibility = "visible";
    this.backToTop.style.pointerEvents = "auto";
  }

  /**
   * Hide back to top button
   */
  hideBackToTop() {
    if (!this.backToTop) return;
    this.backToTop.style.opacity = "0";
    this.backToTop.style.visibility = "hidden";
    this.backToTop.style.pointerEvents = "none";
  }

  /**
   * Scroll to top of page
   */
  scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
    console.log("Scrolling to top");
  }

  /**
   * Set custom scroll callback
   * @param {Function} callback - Function to call on scroll
   */
  onScroll(callback) {
    this.onScrollCallback = callback;
    return this;
  }

  /**
   * Get current scroll position
   */
  getScrollPosition() {
    return window.pageYOffset || window.scrollY;
  }

  /**
   * Check if page is scrolled past threshold
   */
  isScrolled() {
    return this.getScrollPosition() > this.stickyThreshold;
  }
}

export default ScrollEffectsManager;
