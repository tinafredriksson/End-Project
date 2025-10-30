// startmeddelande /robust fetch
console.log("✅ books.js loaded");
//Hämtar element från HTML//
const els = {
  q: document.getElementById("q"),
  btn: document.getElementById("searchBtn"),
  results: document.getElementById("results"),
  status: document.getElementById("status"),
  age: document.getElementById("ageFilter"),      // optional
  genre: document.getElementById("genreFilter"),  // optional
};
// lagrar det senaste sökresultatet//
let lastDocs = [];

// Funktion för att skapa bokomslag//
function coverUrl(d) {
  if (d.cover_i) return `https://covers.openlibrary.org/b/id/${d.cover_i}-M.jpg`;
  if (d.cover_edition_key) return `https://covers.openlibrary.org/b/olid/${d.cover_edition_key}-M.jpg`;
  return "https://placehold.co/300x440?text=No+Cover";
}

// Åldersfilter-funktion//
function fitsAge(d, ageVal) {
  if (!ageVal || ageVal === "all") return true;
  const subj = (d.subject || []).map(s => String(s).toLowerCase());
  const isChild = subj.some(s => s.includes("juvenile") || s.includes("children"));
  const isYA = subj.some(s => s.includes("young adult") || s.includes("ya"));
  if (ageVal === "children") return isChild;
  if (ageVal === "ya") return isYA;
  if (ageVal === "adult") return !isChild && !isYA;
  return true;
}
// Använder åldersfiltret//
function applyFilters(docs) {
  const ageVal = els.age?.value || "all";
  return docs.filter(d => fitsAge(d, ageVal));
}

// skapar sökfrågan som skickas till API//
function buildQuery(qInput) {
  const base = (qInput && qInput.trim()) ? qInput.trim() : "the"; // bred & säker default
  const parts = [base];
  const g = els.genre?.value;
  if (g && g !== "all") parts.push(`subject:"${g}"`);
  return parts.join(" ");
}
// Visar resultat i HTML//
function render(docs) {
  els.results.innerHTML = (docs || []).map(d => `
    <article class="card">
      <img src="${coverUrl(d)}" alt="">
      <div class="body">
        <div class="title">${d.title || "Okänd titel"}</div>
        <div class="meta">${(d.author_name?.[0] || "Okänd författare")} • ${d.first_publish_year || "—"}</div>
      </div>
    </article>
  `).join("") || `<p style="text-align:center;opacity:.7">Inga resultat.</p>`;
}

// Hämtar böcker från APIT openlibrary//
async function searchBooks(qInput) {
  const q = buildQuery(qInput);
  const url = `https://openlibrary.org/search.json` +
    `?q=${encodeURIComponent(q)}` +
    `&fields=title,author_name,first_publish_year,cover_i,cover_edition_key,subject` +
    `&limit=24`;

  els.status && (els.status.textContent = "Laddar…");
  els.results.innerHTML = "";

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const ct = res.headers.get("content-type") || "";
    if (!ct.includes("application/json")) throw new Error("Non-JSON response");
    const data = await res.json();
    lastDocs = Array.isArray(data.docs) ? data.docs : [];
    render(applyFilters(lastDocs));
  } catch (err) {
    console.error(err);
    els.results.innerHTML = `<p style="text-align:center;color:#f87171">Fel vid hämtning.</p>`;
  } finally {
    els.status && (els.status.textContent = "");
  }
}

// kopplar knappar och fält//
els.btn?.addEventListener("click", () => searchBooks(els.q?.value));
els.q?.addEventListener("keydown", e => { if (e.key === "Enter") searchBooks(els.q.value); });
els.age?.addEventListener("change", () => render(applyFilters(lastDocs)));
els.genre?.addEventListener("change", () => searchBooks(els.q?.value));

// första sökningen som visas direkt på sidan,denna kan ändras till annan specifikation ex: hospital//
searchBooks("Dragon");




