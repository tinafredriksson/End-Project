console.log("✅ books.js loaded");

(async () => {
  const url = "https://openlibrary.org/search.json?q=dragon&fields=title,author_name,first_publish_year,cover_i,cover_edition_key,key&limit=12";
  const res = await fetch(url);
  console.log("HTTP", res.status);
  const data = await res.json();
  const docs = Array.isArray(data.docs) ? data.docs : [];
  console.log("docs:", docs.length);

  const resultsEl = document.getElementById("results");
  resultsEl.innerHTML = docs.map(d => `
    <article class="card">
      <img src="${d.cover_i
    ? `https://covers.openlibrary.org/b/id/${d.cover_i}-M.jpg`
    : (d.cover_edition_key
      ? `https://covers.openlibrary.org/b/olid/${d.cover_edition_key}-M.jpg`
      : "https://placehold.co/300x440?text=No+Cover")}" alt="">
      <div class="body">
        <div class="title">${d.title || "Okänd titel"}</div>
        <div class="meta">${(d.author_name?.[0] || "Okänd författare")} • ${d.first_publish_year || "—"}</div>
      </div>
    </article>
  `).join("");
})();



