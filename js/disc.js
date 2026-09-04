async function loadDisc() {

  try {

    /*
     * Work out which disc this page represents.
     *
     * For example:
     * md-001.html → MD-001
     * md-002.html → MD-002
     */

    const filename = window.location.pathname
      .split("/")
      .pop()
      .replace(".html", "")
      .toUpperCase();

    const discId = filename;


    /*
     * Load the archive database.
     */

    const response = await fetch("../data/discs.json");

    if (!response.ok) {
      throw new Error("Unable to load archive data.");
    }

    const data = await response.json();


    /*
     * Find the physical disc.
     */

    const disc = data.discs.find(
      item => item.id.toUpperCase() === discId
    );

    if (!disc) {
      throw new Error(`Disc ${discId} was not found.`);
    }


    /*
     * Basic disc information.
     */

    document.title =
      `RetroMiniDisc — ${disc.id}`;

    document.getElementById("disc-eyebrow").textContent =
      `DISC ARCHIVE / ${disc.id}`;

    document.getElementById("disc-id").textContent =
      disc.id;

    document.getElementById("disc-media").textContent =
      `${disc.brand} ${disc.capacity.toUpperCase()} MD`;

    document.getElementById("disc-mode").innerHTML =
      `${disc.recording_mode.toUpperCase()}<small>≈${disc.recording_time.toUpperCase()}</small>`;

    document.getElementById("disc-bitrate").textContent =
      disc.bitrate.toUpperCase();

    document.getElementById("disc-groups").textContent =
      String(disc.groups.length).padStart(2, "0");


    /*
     * Calculate the total actual runtime of everything
     * recorded on the physical disc.
     */

    const totalMinutes = disc.groups.reduce(
      (total, group) => {

        const match = String(group.runtime).match(/\d+/);

        return total + (
          match ? parseInt(match[0]) : 0
        );

      },
      0
    );


    document.getElementById("disc-used").textContent =
      `≈${totalMinutes} MIN`;


    /*
     * Hero text.
     */

    document.getElementById("disc-title").textContent =
      disc.id;

    document.getElementById("disc-description").textContent =
      `${disc.groups.length} ${disc.groups.length === 1 ? "group" : "groups"} recorded on this physical MiniDisc.`;


    /*
     * Build the Groups.
     */

    const groupsContainer =
      document.getElementById("groups");


    groupsContainer.innerHTML =
      disc.groups.map((group, index) => {

        const groupNumber =
          String(index + 1).padStart(2, "0");

        const groupType =
          group.type
            ? group.type.toUpperCase()
            : "GROUP";


        /*
         * Build the track list.
         */

        const tracks =
          group.tracks || [];


        const trackList =
          tracks.length > 0
            ? `
              <section class="tracklist">

                <div class="section-heading">

                  <span>
                    TRACK LIST
                  </span>

                  <span>
                    ${tracks.length}
                    ${tracks.length === 1 ? "TRACK" : "TRACKS"}
                  </span>

                </div>

                <ol>

                  ${tracks.map(track => `
                    <li>
                      ${track}
                    </li>
                  `).join("")}

                </ol>

              </section>
            `
            : "";


        /*
         * Build the Group header.
         */

        return `

          <section class="content-card">

            <div class="section-heading">

              <span>
                GROUP / ${groupNumber}
              </span>

              <span>
                ${groupType}
              </span>

            </div>


            <div class="content-heading">

              <div class="group-type">
                ${groupType}
              </div>

              <h2>
                ${group.artist}
              </h2>


              <div class="album-heading">

                <div class="album-title">
                  ${group.title}
                </div>

                ${
                  group.release_year
                    ? `
                      <div class="release-year">
                        ${group.release_year}
                      </div>
                    `
                    : ""
                }

              </div>

            </div>

          </section>


          ${trackList}

        `;

      }).join("");


    /*
     * Footer.
     */

    document.getElementById("disc-footer").textContent =
      `RETROMINIDISC · ${disc.id}`;


  } catch (error) {

    console.error(error);

    document.getElementById("disc-eyebrow").textContent =
      "ARCHIVE ERROR";

    document.getElementById("disc-title").textContent =
      "Disc unavailable";

    document.getElementById("disc-description").textContent =
      "The requested disc could not be found in the archive.";

    document.getElementById("groups").innerHTML = "";

  }

}


loadDisc();
