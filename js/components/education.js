import { appendChildren, createElement } from '../utils/helpers.js';

export function renderEducation(items) {
    const target = document.getElementById('educationGrid');
    if (!target) return;

    target.replaceChildren(...items.map((item) => appendChildren(createElement('article', { className: 'info-card reveal' }), [
        createElement('p', { className: 'eyebrow', text: item.meta }),
        createElement('h3', { text: item.title }),
        createElement('p', { text: item.description })
    ])));
}
