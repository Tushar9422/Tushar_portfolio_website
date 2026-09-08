import { appendChildren, createElement } from '../utils/helpers.js';

export function renderExperience(experiences) {
    const target = document.getElementById('experienceList');
    if (!target) return;

    target.replaceChildren(...experiences.map((item) => {
        const article = createElement('article', { className: 'timeline-item reveal' });
        const highlights = createElement('ul');
        item.highlights.forEach((highlight) => highlights.appendChild(createElement('li', { text: highlight })));

        const tags = createElement('div', { className: 'tag-list' });
        item.technologies.forEach((technology) => tags.appendChild(createElement('span', { className: 'tag', text: technology })));

        return appendChildren(article, [
            createElement('p', { className: 'timeline-item__date', text: item.duration }),
            createElement('h3', { text: item.role }),
            createElement('p', { className: 'timeline-item__org', text: item.organization }),
            createElement('p', { text: item.summary }),
            highlights,
            tags
        ]);
    }));
}
