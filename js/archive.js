async function loadArchive() {
  const response = await fetch("data/discs.json");
  const data = await response.json();

  const archive = document.getElementById("archive");
  const stats = document.getElementById("archive-stats");

  archive.innerHTML = data.discs.map(disc => `
    <article class="disc-card">
      <div class="disc-number">${disc.id}</div>

      <div class="disc-info">
        <div class="eyebrow">${disc.artist}</div>

        <h2>
          <a href="${disc.page}">${disc.album}</a>
        </h2>

        <p>
          ${disc.media}
          <span>•</span>
          ${disc.recording_mode}
          <span>•</span>
          ${disc.bitrate}
        </p>
      </div>

      <a class="button" href="${disc.page}">
        OPEN DISC
      </a>
    </article>
  `).join("");

  const totalTracks = data.discs.reduce(
    (total, disc) => total + disc.tracks,
    0
  );

  const totalMinutes = data.discs.reduce(
    (total, disc) => total + parseInt(disc.runtime),
    0
  );

  stats.innerHTML = `
    <span>${data.discs.length} DISC${data.discs.length === 1 ? "" : "S"}</span>
    <span>${totalTracks} TRACKS</span>
    <span>≈${totalMinutes} MINUTES</span>
  `;
}

loadArchive();
