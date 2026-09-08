export function initThemeToggle() {
    const toggle = document.querySelector('[data-theme-toggle]');
    if (!toggle) return;

    const applyLabel = () => {
        const theme = document.documentElement.dataset.theme;
        toggle.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`);
    };

    toggle.addEventListener('click', () => {
        const nextTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
        document.documentElement.dataset.theme = nextTheme;
        localStorage.setItem('theme', nextTheme);
        applyLabel();
    });

    applyLabel();
}
