async function loadArchive() {
  const response = await fetch("data/discs.json");
  const data = await response.json();

  const archive = document.getElementById("archive");
  const stats = document.getElementById("archive-stats");

  archive.innerHTML = data.discs.map(disc => {

    const groups = disc.groups || [];

    let summary = "";

    if (groups.length === 1) {
      summary = `
        <div class="eyebrow">${groups[0].artist}</div>

        <h2>
          <a href="${disc.page}">${groups[0].title}</a>
        </h2>
      `;
    } else if (groups.length > 1) {
      summary = `
        <div class="eyebrow">${groups.length} GROUPS</div>

        <h2>
          <a href="${disc.page}">
            ${groups[0].artist} — ${groups[0].title}
          </a>
        </h2>

        <p>+ ${groups.length - 1} MORE GROUP${groups.length - 1 === 1 ? "" : "S"}</p>
      `;
    } else {
      summary = `
        <div class="eyebrow">NO GROUPS</div>

        <h2>
          <a href="${disc.page}">
            ${disc.id}
          </a>
        </h2>
      `;
    }

    return `
      <article class="disc-card">

        <div class="disc-number">
          ${disc.id}
        </div>

        <div class="disc-info">

          ${summary}

          <p>
            ${disc.brand} ${disc.capacity}
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
    `;

  }).join("");


  const totalGroups = data.discs.reduce(
    (total, disc) =>
      total + (disc.groups || []).length,
    0
  );


  const totalTracks = data.discs.reduce(
    (total, disc) =>
      total +
      (disc.groups || []).reduce(
        (groupTotal, group) =>
          groupTotal + (group.tracks || []).length,
        0
      ),
    0
  );


  const totalMinutes = data.discs.reduce(
    (total, disc) =>
      total +
      (disc.groups || []).reduce(
        (groupTotal, group) => {
          const match = String(group.runtime).match(/\d+/);

          return groupTotal + (
            match ? parseInt(match[0]) : 0
          );
        },
        0
      ),
    0
  );


  stats.innerHTML = `
    <span>${data.discs.length} DISC${data.discs.length === 1 ? "" : "S"}</span>
    <span>${totalGroups} GROUP${totalGroups === 1 ? "" : "S"}</span>
    <span>${totalTracks} TRACK${totalTracks === 1 ? "" : "S"}</span>
    <span>≈${totalMinutes} MINUTES</span>
  `;
}


loadArchive();
