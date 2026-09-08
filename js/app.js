import { profile } from './data/profile.js';
import { projects } from './data/projects.js';
import { skillGroups } from './data/skills.js';
import { experiences } from './data/experience.js';
import { education } from './data/education.js';
import { initNavigation } from './components/navigation.js';
import { renderProfile } from './components/profile.js';
import { initProjects } from './components/projects.js';
import { renderSkills } from './components/skills.js';
import { renderExperience } from './components/experience.js';
import { renderEducation } from './components/education.js';
import { initThemeToggle } from './utils/theme.js';

document.addEventListener('DOMContentLoaded', () => {
    renderProfile(profile);
    renderExperience(experiences);
    renderSkills(skillGroups);
    initProjects(projects);
    renderEducation(education);
    initNavigation();
    initThemeToggle();
    initSmoothScroll();
    initReveal();
});

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
        link.addEventListener('click', (event) => {
            const target = document.querySelector(link.getAttribute('href'));
            if (!target) return;

            event.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });
}

function initReveal() {
    const elements = document.querySelectorAll('.reveal');
    if (!elements.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        elements.forEach((element) => element.classList.add('is-visible'));
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.12,
        rootMargin: '0px 0px -48px 0px'
    });

    elements.forEach((element) => observer.observe(element));
}
