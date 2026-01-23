// assets/running.js
// Renders running page from window.RUNNING_DATA (see assets/running-data.js)

(function () {
  function $(id) {
    return document.getElementById(id);
  }

  function safeText(x) {
    return (x ?? "").toString();
  }

  function fmtDate(iso) {
    if (!iso) return "";
    const d = new Date(iso + "T00:00:00");
    const m = d.getMonth() + 1;
    const day = d.getDate();
    const yy = String(d.getFullYear()).slice(-2);
    return `${m}.${day}.${yy}`;
  }

  function timeToSeconds(t) {
    if (!t) return null;
    const p = t.split(":").map(Number);
    if (p.some(Number.isNaN)) return null;
    if (p.length === 2) return p[0] * 60 + p[1];
    if (p.length === 3) return p[0] * 3600 + p[1] * 60 + p[2];
    return null;
  }

  function uniq(arr) {
    return [...new Set(arr)].sort((a, b) => a.localeCompare(b));
  }

  function renderTable(container, columns, rows) {
    container.innerHTML = `
      <table>
        <thead>
          <tr>${columns.map(c => `<th>${c.label}</th>`).join("")}</tr>
        </thead>
        <tbody>
          ${rows.map(r => `
            <tr>
              ${columns.map(c => {
                const val = c.render ? c.render(r) : safeText(r[c.key]);
                return `<td>${val}</td>`;
              }).join("")}
            </tr>
          `).join("")}
        </tbody>
      </table>
    `;
  }

  /* =======================
     UPCOMING
     ======================= */

  function renderUpcoming(data) {
    const el = $("upcomingSection");
    if (!el) return;

    const rows = (data.upcoming || []).map(u => ({
      distance: u.distance,
      race: u.race,
      location: u.location || "",
      date: u.date,
      url: u.url || ""
    }));

    renderTable(el, [
      { key: "distance", label: "Distance" },
      {
        key: "race",
        label: "Race",
        render: r =>
          r.url
            ? `<a href="${r.url}" target="_blank" rel="noopener">${safeText(r.race)}</a>`
            : safeText(r.race)
      },
      { key: "location", label: "Location" },
      { key: "date", label: "Date", render: r => fmtDate(r.date) }
    ], rows);
  }

  /* =======================
     DEFERRED
     ======================= */

  function renderDeferred(data) {
    const el = $("deferredSection");
    if (!el) return;

    const rows = (data.deferred || []).map(d => ({
      distance: d.distance,
      race: d.race,
      location: d.location || "",
      date: d.date,
      notes: d.notes || "",
      url: d.url || ""
    }));

    renderTable(el, [
      { key: "distance", label: "Distance" },
      {
        key: "race",
        label: "Race",
        render: r =>
          r.url
            ? `<a href="${r.url}" target="_blank" rel="noopener">${safeText(r.race)}</a>`
            : safeText(r.race)
      },
      { key: "location", label: "Location" },
      {
        key: "date",
        label: "Date",
        render: r => `${fmtDate(r.date)}${r.notes ? ` (${safeText(r.notes)})` : ""}`
      }
    ], rows);
  }

  /* =======================
     PERSONAL BESTS
     ======================= */

  function renderPBs(data) {
    const el = $("pbsSection");
    if (!el) return;

    const rows = (data.personalBests || []).map(p => ({
      distance: p.distance,
      time: p.time,
      race: p.race,
      location: p.location || "",
      date: p.date,
      url: p.url || ""
    }));

    renderTable(el, [
      { key: "distance", label: "Distance" },
      {
        key: "time",
        label: "Time",
        render: r =>
          r.url
            ? `<a href="${r.url}" target="_blank" rel="noopener">${safeText(r.time)}</a>`
            : safeText(r.time)
      },
      { key: "race", label: "Race" },
      { key: "location", label: "Location" },
      { key: "date", label: "Date", render: r => fmtDate(r.date) }
    ], rows);
  }

  /* =======================
     RESULTS
     ======================= */

  function renderResultsGrouped(results) {
    const container = $("resultsTable");
    if (!container) return;

    const byYear = {};
    results.forEach(r => {
      byYear[r.year] ||= [];
      byYear[r.year].push(r);
    });

    const years = Object.keys(byYear).sort((a, b) => b - a);
    let html = "";

    years.forEach(y => {
      html += `<h3 style="margin:1.2rem 0 0.2rem;">${y}</h3>`;
      html += `
        <table>
          <thead>
            <tr>
              <th>Distance</th>
              <th>Time</th>
              <th>Race</th>
              <th>Location</th>
              <th>Date</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            ${byYear[y].map(r => `
              <tr>
                <td>${safeText(r.distance)}</td>
                <td>${r.url
                  ? `<a href="${r.url}" target="_blank" rel="noopener">${safeText(r.time)}</a>`
                  : safeText(r.time)
                }</td>
                <td>${safeText(r.race)}</td>
                <td>${safeText(r.location || "")}</td>
                <td>${fmtDate(r.date)}</td>
                <td>${safeText(r.notes)}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      `;
    });

    container.innerHTML = html || `<p class="muted">No matches.</p>`;
  }

  function buildDistanceDropdown(results) {
    const sel = $("distanceFilter");
    if (!sel) return;
    uniq(results.map(r => r.distance)).forEach(d => {
      const opt = document.createElement("option");
      opt.value = d;
      opt.textContent = d;
      sel.appendChild(opt);
    });
  }

  function applyFiltersAndSort(all) {
    const q = ($("search")?.value || "").toLowerCase();
    const dist = $("distanceFilter")?.value || "";
    const sort = $("sortBy")?.value || "date-desc";

    let filtered = [...all];

    if (dist) filtered = filtered.filter(r => r.distance === dist);
    if (q) {
      filtered = filtered.filter(r =>
        `${r.distance} ${r.time} ${r.race} ${r.location} ${r.notes} ${r.date}`
          .toLowerCase()
          .includes(q)
      );
    }

    filtered.sort((a, b) => {
      if (sort === "date-asc") return a.date.localeCompare(b.date);
      if (sort === "date-desc") return b.date.localeCompare(a.date);
      const ta = timeToSeconds(a.time);
      const tb = timeToSeconds(b.time);
      return sort === "time-asc" ? ta - tb : tb - ta;
    });

    renderResultsGrouped(filtered);
  }

  function renderWishlist(data) {
  const majorsEl = $("majorsStatus");
  if (majorsEl) {
    const majors = (data.wishlist?.majors || []).map((m) => {
      const completed = !!m.completed;
      const year = m.year ? ` ${m.year}` : "";

      const nameHtml = m.url
        ? `<a href="${m.url}" target="_blank" rel="noopener">${safeText(m.name)}</a>`
        : safeText(m.name);

      return `
        <span class="pill ${completed ? "ok" : "no"}">
          <span class="dot"></span>
          ${nameHtml} ${completed ? "✅" : "❌"}${year}
        </span>
      `;
    });

    majorsEl.innerHTML = majors.join("") || `<p class="muted">No majors listed.</p>`;
  }

  const otherEl = $("wishlistOther");
  if (otherEl) {
    const items = data.wishlist?.other || [];

    otherEl.innerHTML =
      items
        .map((it) => {
          // support both formats:
          // 1) "Big Sur International Marathon"
          // 2) { name: "...", url: "..." }
          if (typeof it === "string") return `<li>${safeText(it)}</li>`;

          const name = safeText(it.name);
          const url = safeText(it.url);
          const html = url
            ? `<a href="${url}" target="_blank" rel="noopener">${name}</a>`
            : name;

          return `<li>${html}</li>`;
        })
        .join("") || `<li class="muted">No wishlist races listed.</li>`;
  }
}

  
  function init() {
    const data = window.RUNNING_DATA;
    if (!data) return console.error("RUNNING_DATA missing");

    renderUpcoming(data);
    renderDeferred(data);
    renderPBs(data);

    const results = data.raceResults || [];
    buildDistanceDropdown(results);
    applyFiltersAndSort(results);

    $("search")?.addEventListener("input", () => applyFiltersAndSort(results));
    $("distanceFilter")?.addEventListener("change", () => applyFiltersAndSort(results));
    $("sortBy")?.addEventListener("change", () => applyFiltersAndSort(results));
  }

  document.addEventListener("DOMContentLoaded", init);
})();
