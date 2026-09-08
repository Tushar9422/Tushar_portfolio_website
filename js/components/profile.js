import { appendChildren, createElement, createLink } from '../utils/helpers.js';

export function renderProfile(profile) {
    setText('profileName', profile.name);
    setText('profileHeadline', profile.headline);
    setText('profileSummary', profile.summary);

    const image = document.getElementById('profileImage');
    if (image) {
        image.src = profile.image;
        image.alt = profile.name;
    }

    renderHeroActions(profile);
    renderHeroLinks(profile);
    renderProfileMeta(profile);
    renderAbout(profile);
    renderContact(profile);
    renderFooter(profile);
}

function renderHeroActions(profile) {
    const target = document.getElementById('heroActions');
    if (!target) return;

    target.replaceChildren(
        createLink('View Projects', '#projects', 'button button--primary'),
        createLink(profile.resume ? 'Resume' : 'Contact', profile.resume || '#contact', 'button button--secondary')
    );
}

function renderHeroLinks(profile) {
    const target = document.getElementById('heroLinks');
    if (!target) return;

    target.replaceChildren(
        createLink('GitHub', profile.github, 'text-link', { ariaLabel: 'Open Tushar Sharma GitHub profile' }),
        createLink('LinkedIn', profile.linkedin, 'text-link', { ariaLabel: 'Open Tushar Sharma LinkedIn profile' }),
        createLink('Email', `mailto:${profile.email}`, 'text-link', { ariaLabel: 'Email Tushar Sharma' })
    );
}

function renderProfileMeta(profile) {
    const target = document.getElementById('profileMeta');
    if (!target) return;

    const focus = createElement('div', { className: 'tag-list' });
    profile.focusAreas.forEach((item) => focus.appendChild(createElement('span', { className: 'tag', text: item })));

    target.replaceChildren(
        createElement('p', { className: 'profile-panel__title', text: profile.shortTitle }),
        focus
    );
}

function renderAbout(profile) {
    const target = document.getElementById('aboutContent');
    if (!target) return;

    target.replaceChildren(...profile.about.map((paragraph) => createElement('p', { text: paragraph })));
}

function renderContact(profile) {
    const target = document.getElementById('contactLinks');
    if (!target) return;

    target.replaceChildren();
    appendChildren(target, [
        createLink(profile.email, `mailto:${profile.email}`, 'contact-link'),
        createLink('GitHub / Tushar9422', profile.github, 'contact-link'),
        createLink('LinkedIn / tushar-squared', profile.linkedin, 'contact-link'),
        profile.resume ? createLink('Download Resume', profile.resume, 'contact-link') : null
    ]);
}

function renderFooter(profile) {
    setText('year', new Date().getFullYear());

    const target = document.getElementById('footerLinks');
    if (!target) return;

    appendChildren(target, [
        createLink('GitHub', profile.github, 'footer-link'),
        createLink('LinkedIn', profile.linkedin, 'footer-link'),
        createLink('Email', `mailto:${profile.email}`, 'footer-link')
    ]);
}

function setText(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value;
    }
}
