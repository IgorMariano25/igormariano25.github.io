/**
 * Navigation Module
 * Responsible for: Mobile menu toggle, active section detection, smooth scroll
 *
 * @author Igor Mariano
 * @version 1.0.0
 */

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

  /**
   * Initialize navigation
   */
  init() {
    this.menuToggle = document.querySelector(this.menuToggleSelector);
    this.nav = document.querySelector(this.navSelector);

    this.initMobileMenu();
    this.initActiveSection();
    this.initSmoothScroll();

    return this;
  }

  /**
   * Initialize mobile menu toggle
   */
  initMobileMenu() {
    if (!this.menuToggle || !this.nav) {
      return;
    }

    this.menuToggle.addEventListener("click", () => {
      this.toggleMobileMenu();
    });

    // Close menu when clicking nav links
    const navLinks = document.querySelectorAll(this.navLinkSelector);
    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        if (this.mobileMenuOpen) {
          this.closeMobileMenu();
        }
      });
    });
  }

  /**
   * Toggle mobile menu state
   */
  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;

    this.nav.classList.toggle("active");
    this.menuToggle.classList.toggle("bx-x");
    this.menuToggle.setAttribute("aria-expanded", this.mobileMenuOpen);

    // Update icon
    const icon = this.menuToggle.querySelector("i");
    if (icon) {
      icon.className = this.mobileMenuOpen ? "bx bx-x" : "bx bx-menu";
    }
  }

  /**
   * Close mobile menu
   */
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

  /**
   * Check if mobile menu is open
   */
  isMenuOpen() {
    return this.mobileMenuOpen;
  }

  /**
   * Initialize active section detection on scroll
   */
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

      // Update nav links
      navLinks.forEach((link) => {
        link.classList.remove(this.activeClass, this.legacyActiveClass);
        const href = link.getAttribute("href");

        if (href === `#${current}`) {
          link.classList.add(this.activeClass, this.legacyActiveClass);
        }
      });
    };

    // Throttled scroll handler
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
    updateActiveLink(); // Initial call
  }

  /**
   * Initialize smooth scrolling for anchor links
   */
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

  /**
   * Scroll to a specific section
   * @param {string} sectionId - Section ID to scroll to
   */
  scrollToSection(sectionId) {
    const target = document.querySelector(`#${sectionId}`);
    if (target) {
      const offsetTop = target.offsetTop - this.headerHeight;
      window.scrollTo({ top: offsetTop, behavior: "smooth" });
    }
  }
}

export default NavigationManager;
