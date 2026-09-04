async function loadArchive() {

  const archive = document.getElementById("archive");
  const stats = document.getElementById("archive-stats");

  try {

    /*
     * Load the archive database.
     */

    const response = await fetch("data/discs.json");

    if (!response.ok) {
      throw new Error(
        `Could not load discs.json (${response.status} ${response.statusText})`
      );
    }

    const data = await response.json();


    /*
     * Check that the archive has the expected structure.
     */

    if (!data.discs || !Array.isArray(data.discs)) {
      throw new Error("discs.json does not contain a valid 'discs' array.");
    }


    /*
     * Build the disc cards.
     */

    archive.innerHTML = data.discs.map(disc => {

      const groups = Array.isArray(disc.groups)
        ? disc.groups
        : [];

      let summary = "";


      /*
       * One Group.
       */

      if (groups.length === 1) {

        const group = groups[0];

        const artist = group.artist || "";
        const title = group.title || "Untitled";

        summary = `
          <div class="eyebrow">
            ${artist}
          </div>

          <h2>
            <a href="${disc.page}">
              ${title}
            </a>
          </h2>
        `;

      }


      /*
       * Multiple Groups.
       */

      else if (groups.length > 1) {

        const firstGroup = groups[0];

        const artist = firstGroup.artist || "";
        const title = firstGroup.title || "Untitled";

        summary = `
          <div class="eyebrow">
            ${groups.length} GROUPS
          </div>

          <h2>
            <a href="${disc.page}">
              ${artist ? artist + " — " : ""}${title}
            </a>
          </h2>

          <p>
            + ${groups.length - 1}
            MORE GROUP${groups.length - 1 === 1 ? "" : "S"}
          </p>
        `;

      }


      /*
       * Empty disc.
       */

      else {

        summary = `
          <div class="eyebrow">
            NO GROUPS
          </div>

          <h2>
            <a href="${disc.page}">
              ${disc.id}
            </a>
          </h2>
        `;

      }


      /*
       * Physical disc information.
       */

      const brand = disc.brand
        ? `${disc.brand} `
        : "";

      const capacity = disc.capacity || "";

      const mode = disc.recording_mode || "";

      const bitrate = disc.bitrate || "";


      return `
        <article class="disc-card">

          <div class="disc-number">
            ${disc.id}
          </div>

          <div class="disc-info">

            ${summary}

            <p>
              ${brand}${capacity}
              <span>•</span>
              ${mode}
              <span>•</span>
              ${bitrate}
            </p>

          </div>

          <a class="button" href="${disc.page}">
            OPEN DISC
          </a>

        </article>
      `;

    }).join("");


    /*
     * Calculate archive statistics.
     */

    const totalGroups = data.discs.reduce(
      (total, disc) =>
        total +
        (
          Array.isArray(disc.groups)
            ? disc.groups.length
            : 0
        ),
      0
    );


    const totalTracks = data.discs.reduce(
      (total, disc) =>
        total +
        (
          Array.isArray(disc.groups)
            ? disc.groups.reduce(
                (groupTotal, group) =>
                  groupTotal +
                  (
                    Array.isArray(group.tracks)
                      ? group.tracks.length
                      : 0
                  ),
                0
              )
            : 0
        ),
      0
    );


    /*
     * Runtime is optional.
     *
     * We don't require it to be present in the JSON.
     */

    const totalMinutes = data.discs.reduce(
      (total, disc) =>
        total +
        (
          Array.isArray(disc.groups)
            ? disc.groups.reduce(
                (groupTotal, group) => {

                  if (!group.runtime) {
                    return groupTotal;
                  }

                  const match =
                    String(group.runtime).match(/\d+/);

                  return groupTotal +
                    (match ? parseInt(match[0], 10) : 0);

                },
                0
              )
            : 0
        ),
      0
    );


    /*
     * Update statistics.
     */

    let statsHTML = `
      <span>
        ${data.discs.length}
        DISC${data.discs.length === 1 ? "" : "S"}
      </span>

      <span>
        ${totalGroups}
        GROUP${totalGroups === 1 ? "" : "S"}
      </span>

      <span>
        ${totalTracks}
        TRACK${totalTracks === 1 ? "" : "S"}
      </span>
    `;


    if (totalMinutes > 0) {

      statsHTML += `
        <span>
          ≈${totalMinutes} MINUTES
        </span>
      `;

    }


    stats.innerHTML = statsHTML;


  } catch (error) {

    /*
     * Display a useful error instead of leaving
     * "LOADING ARCHIVE..." on screen forever.
     */

    console.error("RetroMiniDisc archive error:", error);


    archive.innerHTML = `
      <div class="archive-error">

        <strong>
          ARCHIVE COULD NOT BE LOADED
        </strong>

        <p>
          ${error.message}
        </p>

      </div>
    `;


    stats.innerHTML = `
      <span>
        ARCHIVE ERROR
      </span>
    `;

  }

}


loadArchive();
