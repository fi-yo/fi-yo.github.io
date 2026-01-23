(function () {
  const data = window.RUNNING_DATA;
  if (!data) return;

  const $ = (id) => document.getElementById(id);

  function link(text, url) {
    return url
      ? `<a href="${url}" target="_blank" rel="noopener">${text}</a>`
      : text;
  }

  function fmtDate(d) {
    if (!d) return "";
    const x = new Date(d + "T00:00:00");
    return `${x.getMonth() + 1}.${x.getDate()}.${String(x.getFullYear()).slice(-2)}`;
  }

  function renderUpcoming() {
    const el = $("upcomingSection");
    if (!el) return;

    el.innerHTML = `
      <table>
        <tr><th>Distance</th><th>Race</th><th>Location</th><th>Date</th></tr>
        ${data.upcoming.map(r => `
          <tr>
            <td>${r.distance}</td>
            <td>${link(r.race, r.url)}</td>
            <td>${r.location || ""}</td>
            <td>${fmtDate(r.date)}</td>
          </tr>
        `).join("")}
      </table>
    `;
  }

  function renderWishlist() {
    $("majorsStatus").innerHTML = data.wishlist.majors.map(m =>
      `<span class="pill ${m.completed ? "ok" : "no"}">
        ${link(m.name, m.url)} ${m.completed ? "✅" : "❌"}${m.year ? " " + m.year : ""}
      </span>`
    ).join("");

    $("wishlistOther").innerHTML = data.wishlist.other.map(o =>
      `<li>${link(o.name, o.url)}</li>`
    ).join("");
  }

  function renderResults() {
    const el = $("resultsTable");
    if (!el) return;

    el.innerHTML = data.raceResults.map(r => `
      <div class="result">
        <strong>${r.year}</strong> · ${r.distance} ·
        ${link(r.time, r.url)} · ${r.race}
        ${r.location ? `(${r.location})` : ""}
      </div>
    `).join("");
  }

  renderUpcoming();
  renderWishlist();
  renderResults();
})();
