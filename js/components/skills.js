import { createElement } from '../utils/helpers.js';

export function renderSkills(skillGroups) {
    const grid = document.getElementById('skillsGrid');
    if (!grid) return;

    grid.replaceChildren(...skillGroups.map((group) => {
        const card = createElement('article', { className: 'skill-card reveal' });
        const list = createElement('div', { className: 'tag-list' });
        group.skills.forEach((skill) => list.appendChild(createElement('span', { className: 'tag', text: skill })));
        card.append(createElement('h3', { text: group.name }), list);
        return card;
    }));
}
