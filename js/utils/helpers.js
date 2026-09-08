const ALLOWED_PROTOCOLS = new Set(['http:', 'https:', 'mailto:']);

export function createElement(tag, options = {}) {
    const element = document.createElement(tag);

    if (options.className) {
        element.className = options.className;
    }

    if (options.text !== undefined) {
        element.textContent = options.text;
    }

    if (options.attrs) {
        Object.entries(options.attrs).forEach(([name, value]) => {
            if (value !== null && value !== undefined) {
                element.setAttribute(name, String(value));
            }
        });
    }

    return element;
}

export function appendChildren(parent, children) {
    children.filter(Boolean).forEach((child) => parent.appendChild(child));
    return parent;
}

export function safeUrl(value) {
    if (!value) return null;

    try {
        const url = new URL(value, window.location.origin);
        return ALLOWED_PROTOCOLS.has(url.protocol) ? url.href : null;
    } catch {
        return null;
    }
}

export function createLink(label, href, className, options = {}) {
    if (!href) return null;

    const isHashLink = href.startsWith('#');
    const url = isHashLink ? href : safeUrl(href);
    if (!url) return null;

    const link = createElement('a', {
        className,
        text: label,
        attrs: {
            href: url,
            'aria-label': options.ariaLabel || label
        }
    });

    if (!isHashLink && url.startsWith('http') && new URL(url).origin !== window.location.origin) {
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
    }

    return link;
}
