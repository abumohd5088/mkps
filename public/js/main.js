const menuBtn = document.getElementById('menuBtn');
const navMenu = document.getElementById('navMenu');
const darkModeBtn = document.getElementById('darkModeBtn');

if (localStorage.getItem('theme') === 'dark') {
  document.body.classList.add('dark');
}

menuBtn?.addEventListener('click', () => navMenu.classList.toggle('open'));
darkModeBtn?.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
});
