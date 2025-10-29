//
document.addEventListener('keydown', (e) => {
  const wrap = document.querySelector('.skull-wrap');
  if (!wrap) return;
  if (e.key === 'Enter' && document.activeElement === wrap) {
    const cta = wrap.querySelector('.cta');
    cta?.focus();
  }
});

