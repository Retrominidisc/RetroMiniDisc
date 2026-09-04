async function loadArchive() {
  const response = await fetch("data/discs.json");
  const data = await response.json();

  const archive = document.getElementById("archive");
  const stats = document.getElementById("archive-stats");

  archive.innerHTML = data.discs.map(disc => {

    const contents = disc.contents || [];

    let summary = "";

    if (contents.length === 1) {
      summary = `
        <div class="eyebrow">${contents[0].artist}</div>

        <h2>
          <a href="${disc.page}">${contents[0].title}</a>
        </h2>
      `;
    } else {
      summary = `
        <div class="eyebrow">${contents.length} CONTENTS</div>

        <h2>
          <a href="${disc.page}">
            ${contents[0].artist} — ${contents[0].title}
          </a>
        </h2>

        <p>+ ${contents.length - 1} MORE</p>
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

  const totalTracks = data.discs.reduce(
    (total, disc) =>
      total +
      (disc.contents || []).reduce(
        (contentTotal, content) =>
          contentTotal + (content.tracks || []).length,
        0
      ),
    0
  );

  const totalMinutes = data.discs.reduce(
    (total, disc) =>
      total +
      (disc.contents || []).reduce(
        (contentTotal, content) => {
          const match = String(content.runtime).match(/\d+/);
          return contentTotal + (match ? parseInt(match[0]) : 0);
        },
        0
      ),
    0
  );

  const totalContents = data.discs.reduce(
    (total, disc) =>
      total + (disc.contents || []).length,
    0
  );

  stats.innerHTML = `
    <span>${data.discs.length} DISC${data.discs.length === 1 ? "" : "S"}</span>
    <span>${totalContents} CONTENT${totalContents === 1 ? "" : "S"}</span>
    <span>${totalTracks} TRACKS</span>
    <span>≈${totalMinutes} MINUTES</span>
  `;
}

loadArchive();
