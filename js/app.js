// ============================
// Kaffebaren ☕ – Hot & Cold
// ============================

const API = {
  hot:  'https://api.sampleapis.com/coffee/hot',
  cold: 'https://api.sampleapis.com/coffee/cold',
};

const PLACEHOLDER = 'https://placehold.co/800x500?text=Coffee';

// ------- DOM -------
const hotBtn      = document.getElementById('hotBtn');
const coldBtn     = document.getElementById('coldBtn');
const searchEl    = document.getElementById('search');
const sortEl      = document.getElementById('sort');
const listEl      = document.getElementById('coffee-list');
const statusEl    = document.getElementById('status');
const cartItemsEl = document.getElementById('cart-items');
const cartEmptyEl = document.getElementById('cart-empty');
const cartTotalEl = document.getElementById('cart-total');
const checkoutBtn = document.getElementById('checkoutBtn');
const checkoutMsg = document.getElementById('checkout-msg');

// ------- State -------
let CURRENT_KIND = 'hot';
let ALL_ITEMS = [];
let VIEW = [];
let CART = loadCart();

// ============================
// Hjälpfunktioner
// ============================

function esc(s) {
  return String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function formatSEK(n) {
  return `${Number(n).toFixed(0)} kr`;
}

function getPrice(item) {
  const key = (item.id ?? 0) + String(item.title ?? '').length;
  return 25 + (key % 45); // 25–69 kr
}

function isValidHttpUrl(u) {
  try {
    const url = new URL(u);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

function getImage(raw) {
  let url =
    raw.image ?? raw.imageUrl ?? raw.imageURL ??
    raw.img ?? raw.boxArt ?? raw.boxArtUrl ?? raw.boxArtURL ??
    raw.cover ?? raw.coverUrl ?? raw.coverURL ??
    raw.thumbnail ?? raw.thumb ?? raw.poster ?? '';

  if (url && typeof url === 'object') {
    url = url.url || url.src || (Array.isArray(url) ? url[0] : '') || '';
  }

  url = String(url || '').trim();
  if (url.startsWith('//')) url = 'https:' + url;
  if (url.startsWith('http://')) url = 'https://' + url.slice(7);
  if (url) url = encodeURI(url);
  if (!url || !isValidHttpUrl(url)) return PLACEHOLDER;
  return url;
}

function setLoading(isLoading) {
  if (isLoading) {
    statusEl.hidden = false;
    statusEl.textContent = 'Laddar…';
    listEl.setAttribute('aria-busy', 'true');
  } else {
    statusEl.hidden = true;
    listEl.setAttribute('aria-busy', 'false');
  }
}

// ============================
// Hämtning & normalisering
// ============================

async function fetchCoffee(kind) {
  setLoading(true);
  try {
    // Hämta både hot & cold
    const [hotRes, coldRes] = await Promise.all([
      fetch(API.hot, { mode: 'cors' }),
      fetch(API.cold, { mode: 'cors' })
    ]);

    if (!hotRes.ok || !coldRes.ok) throw new Error('API-fel');

    const [hotData, coldData] = await Promise.all([
      hotRes.json(),
      coldRes.json()
    ]);

    // Slå ihop båda dataset
    const combined = [
      ...(Array.isArray(hotData) ? hotData : []),
      ...(Array.isArray(coldData) ? coldData : [])
    ];

    // Normalisera + kategorisering
    ALL_ITEMS = combined.map(d => {
      const title = d.title ?? 'Okänt kaffe';
      const lower = title.toLowerCase();

      // Grundkategori
      let finalKind = d.kind ?? (d.id < 50 ? 'hot' : 'cold');

      // ☕ Tvinga till "hot"
      if (
        lower.includes('espresso') ||
        lower.includes('americano') ||
        lower.includes('macchiato') ||
        lower.includes('ristretto')
      ) {
        finalKind = 'hot';
      }
      // ❄️ Tvinga till "cold"
      else if (
        lower.includes('frapino') ||
        lower.includes('lemonad') ||
        lower.includes('apelsin')
      ) {
        finalKind = 'cold';
      }

      return {
        id: d.id ?? `${finalKind}-${lower.replace(/\s+/g, '-')}`,
        title,
        description: d.description ?? '',
        ingredients: Array.isArray(d.ingredients) ? d.ingredients : [],
        image: getImage(d),
        price: getPrice(d),
        kind: finalKind,
      };
    });

    // Filtrera enligt aktiv kategori
    VIEW = ALL_ITEMS.filter(item => item.kind === kind);

    applyFiltersAndSort();
    renderList();
  } catch (err) {
    console.error('API-fel:', err);
    listEl.innerHTML = `<p style="color:#a10;">Kunde inte hämta drycker just nu.</p>`;
  } finally {
    setLoading(false);
  }
}

// ============================
// Filter + sortering
// ============================

function applyFiltersAndSort() {
  const term = searchEl.value.trim().toLowerCase();

  VIEW = VIEW.filter(item => {
    const hay = (item.title + ' ' + item.description + ' ' + item.ingredients.join(' ')).toLowerCase();
    return hay.includes(term);
  });

  const mode = sortEl.value;
  if (mode === 'title-asc') VIEW.sort((a, b) => a.title.localeCompare(b.title));
  else if (mode === 'title-desc') VIEW.sort((a, b) => b.title.localeCompare(a.title));
  else if (mode === 'price-asc') VIEW.sort((a, b) => a.price - b.price);
  else if (mode === 'price-desc') VIEW.sort((a, b) => b.price - a.price);
}

// ============================
// Rendering
// ============================

function renderList() {
  if (!VIEW.length) {
    listEl.innerHTML = `<p>Inga drycker matchar din sökning.</p>`;
    return;
  }

  listEl.innerHTML = VIEW.map(item => {
    let title = item.title;
    let description = item.description;
    let ingredients = item.ingredients?.length ? esc(item.ingredients.join(', ')) : '–';
    let image = item.image;
    let badge = item.kind === 'hot' ? '🔥 Hot' : '❄️ Cold';
    let soldOut = false;

    // Identifiera trasiga poster
    const looksBroken =
      !title ||
      title.toLowerCase() === 'title' ||
      (description && description.toLowerCase() === 'desc') ||
      image === PLACEHOLDER;

    if (looksBroken) {
      soldOut = true;
      title = 'Frapino Vegan Strawberry';
      description = '';
      ingredients = 'Vegan Frappino with coconut drink with strawberry and vanilla flavor. Topped with soy whip.';
      image = 'https://placehold.co/800x500?text=SOLD+OUT';
      badge = '🚫 Sold Out';
    }

    return `
      <article class="card" data-id="${esc(item.id)}" style="${soldOut ? 'opacity:0.7;pointer-events:none;' : ''}">
        <div class="media" style="position:relative">
          <img
            src="${image}"
            alt="${esc(title)}"
            loading="lazy"
            decoding="async"
            referrerpolicy="no-referrer"
          />
          <span class="badge" style="position:absolute;left:10px;top:10px;background:${soldOut ? '#a00' : '#0009'};color:#fff;padding:4px 8px;border-radius:999px;font-size:.85rem;">
            ${badge}
          </span>
        </div>
        <div class="card-body">
          <h3>${esc(title)}</h3>
          <p class="muted">${esc(description)}</p>
          <p><strong>Ingredienser:</strong> ${ingredients}</p>
          <p><strong>Pris:</strong> ${soldOut ? '—' : formatSEK(item.price)}</p>
          <div class="actions">
            ${soldOut
      ? '<button type="button" disabled style="background:#ccc;">Slut i lager</button>'
      : '<button class="addBtn" type="button">Lägg i kundvagn</button>'}
          </div>
        </div>
      </article>
    `;
  }).join('');

  // koppla "Lägg i kundvagn"
  listEl.querySelectorAll('.addBtn').forEach(btn => {
    btn.addEventListener('click', e => {
      const card = e.target.closest('.card');
      const id = card?.getAttribute('data-id');
      const item = VIEW.find(x => String(x.id) === String(id));
      if (item) addToCart(item);
    });
  });
}

// ============================
// Kundvagn
// ============================

function renderCart() {
  const entries = Object.values(CART);

  if (!entries.length) {
    cartItemsEl.innerHTML = '';
    cartEmptyEl.style.display = 'block';
    cartTotalEl.textContent = formatSEK(0);
    return;
  }

  cartEmptyEl.style.display = 'none';
  cartItemsEl.innerHTML = entries.map(({ item, qty, price }) => `
    <div class="row" data-id="${esc(item.id)}">
      <div class="info">
        <strong>${esc(item.title)}</strong>
        <div class="muted">${item.kind === 'hot' ? '🔥 Hot' : '❄️ Cold'} • ${formatSEK(price)}</div>
      </div>
      <div class="qty">
        <button class="dec" type="button" aria-label="Minska antal">−</button>
        <span>${qty}</span>
        <button class="inc" type="button" aria-label="Öka antal">+</button>
      </div>
      <div class="sum"><strong>${formatSEK(price * qty)}</strong></div>
      <button class="rm" type="button" aria-label="Ta bort">🗑️</button>
    </div>
  `).join('');

  cartItemsEl.querySelectorAll('.row').forEach(row => {
    const id = row.getAttribute('data-id');
    row.querySelector('.dec').addEventListener('click', () => updateQty(id, -1));
    row.querySelector('.inc').addEventListener('click', () => updateQty(id, +1));
    row.querySelector('.rm').addEventListener('click', () => removeFromCart(id));
  });

  const total = entries.reduce((sum, x) => sum + x.price * x.qty, 0);
  cartTotalEl.textContent = formatSEK(total);
}

function addToCart(item) {
  const id = String(item.id);
  if (!CART[id]) CART[id] = { item, qty: 1, price: item.price };
  else CART[id].qty += 1;
  saveCart();
  renderCart();
}

function updateQty(id, delta) {
  if (!CART[id]) return;
  CART[id].qty += delta;
  if (CART[id].qty <= 0) delete CART[id];
  saveCart();
  renderCart();
}

function removeFromCart(id) {
  delete CART[id];
  saveCart();
  renderCart();
}

function saveCart() {
  try { localStorage.setItem('coffeeCart', JSON.stringify(CART)); } catch {}
}
function loadCart() {
  try {
    const raw = localStorage.getItem('coffeeCart');
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

// ============================
// Event listeners
// ============================

hotBtn.addEventListener('click', () => {
  if (CURRENT_KIND === 'hot') return;
  CURRENT_KIND = 'hot';
  hotBtn.setAttribute('aria-pressed','true');
  coldBtn.setAttribute('aria-pressed','false');
  searchEl.value = '';
  fetchCoffee('hot');
});

coldBtn.addEventListener('click', () => {
  if (CURRENT_KIND === 'cold') return;
  CURRENT_KIND = 'cold';
  hotBtn.setAttribute('aria-pressed','false');
  coldBtn.setAttribute('aria-pressed','true');
  searchEl.value = '';
  fetchCoffee('cold');
});

searchEl.addEventListener('input', () => {
  applyFiltersAndSort();
  renderList();
});

sortEl.addEventListener('change', () => {
  applyFiltersAndSort();
  renderList();
});

checkoutBtn.addEventListener('click', () => {
  const entries = Object.values(CART);
  if (!entries.length) {
    checkoutMsg.hidden = false;
    checkoutMsg.textContent = 'Kundvagnen är tom.';
    setTimeout(() => (checkoutMsg.hidden = true), 2000);
    return;
  }
  CART = {};
  saveCart();
  renderCart();
  checkoutMsg.hidden = false;
  checkoutMsg.textContent = 'Tack för din beställning! ✨';
  setTimeout(() => (checkoutMsg.hidden = true), 3000);
});

// ============================
// Init
// ============================

(function init() {
  hotBtn?.setAttribute('aria-pressed','true');
  coldBtn?.setAttribute('aria-pressed','false');
  renderCart();
  fetchCoffee(CURRENT_KIND);
})();
