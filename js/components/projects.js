import { appendChildren, createElement, createLink } from '../utils/helpers.js';

export function initProjects(projects) {
    const grid = document.getElementById('projectsGrid');
    if (!grid) return;

    grid.replaceChildren(...projects.map(createProjectCard));
}

function createProjectCard(project) {
    const card = createElement('article', { className: 'project-card reveal' });

    const media = createElement('div', { className: 'project-card__media' });
    const image = createElement('img', {
        attrs: {
            src: project.image,
            alt: project.imageAlt || project.title,
            width: 720,
            height: 420,
            loading: 'lazy'
        }
    });
    media.appendChild(image);

    const body = createElement('div', { className: 'project-card__body' });
    const meta = createElement('div', { className: 'project-card__meta' });
    meta.appendChild(createElement('span', { className: 'pill', text: project.category }));
    if (project.featured) {
        meta.appendChild(createElement('span', { className: 'pill pill--accent', text: 'Featured' }));
    }
    if (project.status) {
        meta.appendChild(createElement('span', { className: 'pill', text: project.status }));
    }

    const tags = createElement('div', { className: 'tag-list' });
    project.technologies.forEach((technology) => tags.appendChild(createElement('span', { className: 'tag', text: technology })));

    const links = createElement('div', { className: 'project-card__links' });
    appendChildren(links, [
        createLink('Code', project.github, 'button button--secondary'),
        createLink('Live Demo', project.demo, 'button button--primary')
    ]);

    appendChildren(body, [
        meta,
        createElement('h3', { text: project.title }),
        createElement('p', { text: project.description }),
        tags,
        links
    ]);

    return appendChildren(card, [media, body]);
}
