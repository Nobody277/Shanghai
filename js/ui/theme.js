import * as dom from './domElements.js';

let isThemeAnimating = false;

export function toggleTheme() {
    if (isThemeAnimating || !dom.themeToggle) return;

    isThemeAnimating = true;
    dom.themeToggle.classList.add("rolling");

    const isDark = dom.htmlElement.classList.contains("dark");
    if (isDark) {
        dom.htmlElement.classList.remove("dark");
        dom.htmlElement.classList.add("light");
        localStorage.setItem("theme", "light");
    } else {
        dom.htmlElement.classList.remove("light");
        dom.htmlElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
    }

    const visibleIcon = dom.themeToggle.querySelector(
        isDark ? ".sun-icon" : ".moon-icon"
    );
    if (visibleIcon) {
        visibleIcon.style.animation = "none";
        setTimeout(() => {
            visibleIcon.style.animation = "";
        }, 0);
    }

    setTimeout(() => {
        dom.themeToggle.classList.remove("rolling");
        isThemeAnimating = false;
    }, 500);
}