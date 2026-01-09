/**
 * Theme Management Module
 * Responsible for: Dark/Light mode switching and persistence
 *
 * @author Igor Mariano
 * @version 1.0.0
 */

class ThemeManager {
  constructor(options = {}) {
    this.storageKey = options.storageKey || "theme";
    this.toggleSelector = options.toggleSelector || "#theme-toggle";
    this.iconSelector = options.iconSelector || "#theme-toggle i";
    this.darkIcon = options.darkIcon || "bx bx-sun";
    this.lightIcon = options.lightIcon || "bx bx-moon";

    this.currentTheme = this.getStoredTheme();
  }

  /**
   * Get stored theme from localStorage or detect system preference
   */
  getStoredTheme() {
    const stored = localStorage.getItem(this.storageKey);
    if (stored) return stored;

    // Detect system preference
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  /**
   * Initialize theme system
   */
  init() {
    // Apply initial theme
    this.applyTheme(this.currentTheme);

    // Attach toggle button event
    const themeToggle = document.querySelector(this.toggleSelector);
    if (themeToggle) {
      themeToggle.addEventListener("click", () => this.toggle());
      console.log("✅ Theme toggle button attached");
    } else {
      console.warn("❌ Theme toggle button not found");
    }

    // Listen for system theme changes
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", (e) => {
        // Only auto-switch if user hasn't set a preference
        if (!localStorage.getItem(this.storageKey)) {
          this.applyTheme(e.matches ? "dark" : "light");
        }
      });

    return this;
  }

  /**
   * Apply theme to document
   * @param {string} theme - 'light' or 'dark'
   */
  applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    this.currentTheme = theme;

    // Update icon
    const icon = document.querySelector(this.iconSelector);
    if (icon) {
      icon.className = theme === "dark" ? this.darkIcon : this.lightIcon;
    }

    console.log(`Theme applied: ${theme}`);
  }

  /**
   * Toggle between light and dark theme
   */
  toggle() {
    const newTheme = this.currentTheme === "light" ? "dark" : "light";
    this.applyTheme(newTheme);
    localStorage.setItem(this.storageKey, newTheme);

    // Dispatch custom event
    window.dispatchEvent(
      new CustomEvent("themeChanged", {
        detail: { theme: newTheme },
      })
    );

    console.log(`Theme toggled to: ${newTheme}`);
    return newTheme;
  }

  /**
   * Get current theme
   */
  getCurrentTheme() {
    return this.currentTheme;
  }

  /**
   * Check if current theme is dark
   */
  isDark() {
    return this.currentTheme === "dark";
  }
}

export default ThemeManager;
