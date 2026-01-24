// assets/nav.js
document.addEventListener("DOMContentLoaded", () => {
  const nav = `
    <nav class="nav">
      <a class="brand" href="/">Fiona Young</a>
      <div class="navlinks">
        <a href="/mission/">Mission</a>
        <a href="/math/">Math</a>
        <a href="/running/">Running</a>
        <a href="/misc/">Miscellaneous</a>
      </div>
    </nav>
  `;

  const slot = document.getElementById("nav-slot");
  if (slot) slot.innerHTML = nav;
});
