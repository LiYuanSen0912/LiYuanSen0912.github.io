const button = document.querySelector('.theme-button');
if (localStorage.getItem('theme') === 'dark') document.documentElement.classList.add('dark');
button?.addEventListener('click', () => {
  document.documentElement.classList.toggle('dark');
  localStorage.setItem('theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
});
