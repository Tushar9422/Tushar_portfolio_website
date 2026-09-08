export function initNavigation() {
    const toggle = document.querySelector('.nav__toggle');
    const menu = document.getElementById('navMenu');
    const links = menu ? menu.querySelectorAll('a[href^="#"]') : [];

    if (!toggle || !menu) return;

    const setOpen = (isOpen) => {
        toggle.setAttribute('aria-expanded', String(isOpen));
        toggle.classList.toggle('is-open', isOpen);
        menu.classList.toggle('is-open', isOpen);
        document.body.classList.toggle('nav-open', isOpen);
    };

    toggle.addEventListener('click', () => {
        setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });

    links.forEach((link) => {
        link.addEventListener('click', () => setOpen(false));
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            setOpen(false);
        }
    });

    document.addEventListener('click', (event) => {
        if (!menu.classList.contains('is-open')) return;
        if (event.target.closest('.nav')) return;
        setOpen(false);
    });
}
