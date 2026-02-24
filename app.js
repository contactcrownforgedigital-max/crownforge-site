const $ = (q, root = document) => root.querySelector(q);
const $$ = (q, root = document) => Array.from(root.querySelectorAll(q));

const sticky = $('[data-sticky]');
const onScroll = () => sticky?.classList.toggle('is-scrolled', window.scrollY > 8);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// mobile nav
const toggle = $('[data-nav-toggle]');
const links = $('[data-nav-links]');
toggle?.addEventListener('click', () => links?.classList.toggle('is-open'));
$$('.nav__link').forEach(a => a.addEventListener('click', () => links?.classList.remove('is-open')));

// reveal
const reveals = $$('.reveal');
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('is-in'); });
}, { threshold: 0.15 });
reveals.forEach(el => io.observe(el));

// year
const y = $('#year');
if (y) y.textContent = new Date().getFullYear();