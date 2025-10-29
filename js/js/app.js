// Placeholder: you can add small Easter eggs later if you want.
// For a11y: move focus to “Find Books” when skull area receives Enter.
document.addEventListener('keydown', (e) => {
  const wrap = document.querySelector('.skull-wrap');
  if (!wrap) return;
  if (e.key === 'Enter' && document.activeElement === wrap) {
    const cta = wrap.querySelector('.cta');
    cta?.focus();
  }
});
fetch(https://openlibrary.org/search.json)
