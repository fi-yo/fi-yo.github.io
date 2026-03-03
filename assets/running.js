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
    // Display as M.D.YY (e.g., 2025-11-29 -> 11.29.25)
    if (!iso) return "";
    const d = new Date(iso + "T00:00:00");
    const m = d.getMonth() + 1;
    const day = d.getDate();
    const yy = String(d.getFullYear()).slice(-2);
    return `${m}.${day}.${yy}`;
  }

  function timeToSeconds(t) {
    // mm:ss or h:mm:ss
    if (!t) return null;
    const parts = t.split(":").map(Number);
    if (parts.some((p) => Number.isNaN(p))) return null;
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    return null;
  }

  function uniq(arr) {
    return [...new Set(arr)].sort((a, b) => a.localeCompare(b));
  }

  function renderTable(containerEl, columns, rows) {
    const thead = `
      <thead>
        <tr>${columns.map((c) => `<th>${c.label}</th>`).join("")}</tr>
      </thead>
    `;
    const tbody = `
      <tbody>
        ${rows
          .map(
            (r) => `
          <tr>
            ${columns
              .map((c) => {
                const val = c.render ? c.render(r) : safeText(r[c.key]);
                return `<td>${val}</td>`;
              })
              .join("")}
          </tr>`
          )
          .join("")}
      </tbody>
    `;
    containerEl.innerHTML = `<table>${thead}${tbody}</table>`;
  }

  function renderUpcoming(data) {
    const el = $("upcomingSection");
    if (!el) return;

    const rows = (data.upcoming || []).map((u) => ({
      distance: u.distance,
      race: u.race,
      location: u.location || "",
      date: u.date,
      url: u.url || "",
      notes: u.notes || "",
    }));

    renderTable(
      el,
      [
        { key: "distance", label: "Distance" },
        {
          key: "race",
          label: "Race",
          render: (r) =>
            r.url
              ? `<a href="${r.url}" target="_blank" rel="noopener">${safeText(r.race)}</a>`
              : safeText(r.race),
        },
        { key: "location", label: "Location" },
        { key: "date", label: "Date", render: (r) => fmtDate(r.date) },
      ],
      rows
    );
  }

  function renderDeferred(data) {
    const el = $("deferredSection");
    if (!el) return;

    const rows = (data.deferred || []).map((d) => ({
      distance: d.distance,
      race: d.race,
      location: d.location || "",
      date: d.date,
      notes: d.notes || "",
      url: d.url || "",
    }));

    renderTable(
      el,
      [
        { key: "distance", label: "Distance" },
        {
          key: "race",
          label: "Race",
          render: (r) =>
            r.url
              ? `<a href="${r.url}" target="_blank" rel="noopener">${safeText(r.race)}</a>`
              : safeText(r.race),
        },
        { key: "location", label: "Location" },
        {
          key: "date",
          label: "Date",
          render: (r) => `${fmtDate(r.date)}${r.notes ? ` (${safeText(r.notes)})` : ""}`,
        },
      ],
      rows
    );
  }

  function renderPBs(data) {
    const el = $("pbsSection");
    if (!el) return;

    const rows = (data.personalBests || []).map((p) => ({
      distance: p.distance,
      time: p.time,
      race: p.race,
      location: p.location || "",
      date: p.date,
      url: p.url || "",
    }));

    renderTable(
      el,
      [
        { key: "distance", label: "Distance" },
        {
          key: "time",
          label: "Time",
          render: (r) =>
            r.url
              ? `<a href="${r.url}" target="_blank" rel="noopener">${safeText(r.time)}</a>`
              : safeText(r.time),
        },
        { key: "race", label: "Race" },
        { key: "location", label: "Location" },
        { key: "date", label: "Date", render: (r) => fmtDate(r.date) },
      ],
      rows
    );
  }

  function buildDistanceDropdown(raceResults) {
    const sel = $("distanceFilter");
    if (!sel) return;
    const distances = uniq((raceResults || []).map((r) => r.distance));
    for (const d of distances) {
      const opt = document.createElement("option");
      opt.value = d;
      opt.textContent = d;
      sel.appendChild(opt);
    }
  }

  function renderResultsGrouped(results) {
    const container = $("resultsTable");
    if (!container) return;

    // group by year
    const byYear = new Map();
    for (const r of results) {
      const y = r.year;
      if (!byYear.has(y)) byYear.set(y, []);
      byYear.get(y).push(r);
    }

    const years = [...byYear.keys()].sort((a, b) => b - a);
    let html = "";

    for (const y of years) {
      html += `<h3 style="margin:1.2rem 0 0.2rem;">${y}</h3>`;
      const rows = byYear.get(y);

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
            ${rows
              .map((r) => {
                const timeCell =
                  r.url && safeText(r.url).trim()
                    ? `<a href="${r.url}" target="_blank" rel="noopener">${safeText(r.time)}</a>`
                    : safeText(r.time);
                return `
                  <tr>
                    <td>${safeText(r.distance)}</td>
                    <td>${timeCell}</td>
                    <td>${safeText(r.race)}</td>
                    <td>${safeText(r.location || "")}</td>
                    <td>${fmtDate(r.date)}</td>
                    <td>${safeText(r.notes || "")}</td>
                  </tr>
                `;
              })
              .join("")}
          </tbody>
        </table>
      `;
    }

    container.innerHTML = html || `<p class="muted">No matches.</p>`;
  }

  function applyFiltersAndSort(allResults) {
    const q = ($("search")?.value || "").trim().toLowerCase();
    const dist = $("distanceFilter")?.value || "";
    const sortBy = $("sortBy")?.value || "date-desc";

    let filtered = (allResults || []).slice();

    if (dist) filtered = filtered.filter((r) => r.distance === dist);

    if (q) {
      filtered = filtered.filter((r) => {
        const hay = `${r.distance} ${r.time} ${r.race} ${r.location || ""} ${r.year} ${r.notes || ""} ${r.date}`.toLowerCase();
        return hay.includes(q);
      });
    }

    filtered.sort((a, b) => {
      if (sortBy === "date-asc") return a.date.localeCompare(b.date);
      if (sortBy === "date-desc") return b.date.localeCompare(a.date);

      const ta = timeToSeconds(a.time);
      const tb = timeToSeconds(b.time);
      if (ta == null && tb == null) return 0;
      if (ta == null) return 1;
      if (tb == null) return -1;

      if (sortBy === "time-asc") return ta - tb;
      if (sortBy === "time-desc") return tb - ta;
      return 0;
    });

    renderResultsGrouped(filtered);
  }

  function renderWishlist(data) {
    // Majors status pills (linkable)
    const majorsEl = $("majorsStatus");
    if (majorsEl) {
      const majors = (data.wishlist?.majors || []).map((m) => {
        const completed = !!m.completed;
        const year = m.year ? ` ${m.year}` : "";

        const nameHtml =
          m.url && safeText(m.url).trim()
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

    // Other wishlist list (linkable)
    const otherEl = $("wishlistOther");
    if (otherEl) {
      const items = data.wishlist?.other || [];
      otherEl.innerHTML =
        items
          .map((it) => {
            // support both old string format and new object format
            if (typeof it === "string") return `<li>${safeText(it)}</li>`;
            const name = safeText(it.name);
            const url = safeText(it.url);
            const html =
              url && url.trim()
                ? `<a href="${url}" target="_blank" rel="noopener">${name}</a>`
                : name;
            return `<li>${html}</li>`;
          })
          .join("") || `<li class="muted">No wishlist races listed.</li>`;
    }
  }

  function renderSummary(data) {
    const statsEl = $("stats");
    if (!statsEl) return;

    const pb5k = data.personalBests?.find((p) => p.distance === "5K")?.time || "—";
    const pb5m = data.personalBests?.find((p) => p.distance === "5M")?.time || "—";
    const pbHalf = data.personalBests?.find((p) => p.distance === "13.1M")?.time || "—";
    const pbMar = data.personalBests?.find((p) => p.distance === "26.2M")?.time || "—";

    const halfMarathonsCompleted = (data.raceResults || []).filter((r) => r.distance === "13.1M").length;
    const marathonsCompleted = (data.raceResults || []).filter((r) => r.distance === "26.2M").length;

    // Countries heuristic: if location has "Germany" => Germany; else if "UK" or "England" => UK; else USA.
    const countries = new Set();
    for (const r of data.raceResults || []) {
      const loc = (r.location || "").toLowerCase();
      if (loc.includes("germany")) countries.add("Germany");
      else if (loc.includes("uk") || loc.includes("england")) countries.add("UK");
      else if (loc.trim()) countries.add("USA");
    }

    const majorDone = (data.wishlist?.majors || []).filter((m) => m.completed).length;
    const majorTotal = (data.wishlist?.majors || []).length || 0;

    const stats = [
      { label: "Marathon PR", value: pbMar },
      { label: "Half PR", value: pbHalf },
      { label: "5M PR", value: pb5m },
      { label: "5K PR", value: pb5k },
      { label: "Half marathons completed", value: String(halfMarathonsCompleted) },
      { label: "Marathons completed", value: String(marathonsCompleted) },
      { label: "World Majors", value: majorTotal ? `${majorDone} / ${majorTotal}` : "—" },
      { label: "Countries raced", value: String(countries.size) },
    ];

    statsEl.innerHTML = stats
      .map(
        (s) => `
      <div class="stat">
        <div class="label">${safeText(s.label)}</div>
        <div class="value">${safeText(s.value)}</div>
      </div>`
      )
      .join("");
  }

  function init() {
    const data = window.RUNNING_DATA;
    if (!data) {
      console.error("RUNNING_DATA not found. Check that /assets/running-data.js is loading.");
      return;
    }

    renderUpcoming(data);
    renderDeferred(data);
    renderPBs(data);
    renderWishlist(data);
    renderSummary(data);

    const allResults = data.raceResults || [];

    buildDistanceDropdown(allResults);
    applyFiltersAndSort(allResults);

    $("search")?.addEventListener("input", () => applyFiltersAndSort(allResults));
    $("distanceFilter")?.addEventListener("change", () => applyFiltersAndSort(allResults));
    $("sortBy")?.addEventListener("change", () => applyFiltersAndSort(allResults));
  }

  document.addEventListener("DOMContentLoaded", init);
})();
