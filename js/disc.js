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


    /*
     * Media information.
     *
     * Brand is optional because some older records
     * may not have it entered yet.
     */

    const brand = disc.brand
      ? `${disc.brand} `
      : "";

    const capacity = disc.capacity || "";

    document.getElementById("disc-media").textContent =
      `${brand}${capacity} MD`.trim();


    /*
     * Recording mode and available recording time.
     */

    const recordingMode =
      disc.recording_mode || "";

    const recordingTime =
      disc.recording_time || "";

    document.getElementById("disc-mode").innerHTML =
      `${recordingMode.toUpperCase()}${
        recordingTime
          ? `<small>≈${recordingTime.toUpperCase()}</small>`
          : ""
      }`;


    /*
     * Bitrate.
     */

    document.getElementById("disc-bitrate").textContent =
      disc.bitrate
        ? disc.bitrate.toUpperCase()
        : "—";


    /*
     * Number of Groups.
     */

    const groups =
      Array.isArray(disc.groups)
        ? disc.groups
        : [];

    document.getElementById("disc-groups").textContent =
      String(groups.length).padStart(2, "0");


    /*
     * Hero text.
     */

    document.getElementById("disc-title").textContent =
      disc.id;

    document.getElementById("disc-description").textContent =
      `${groups.length} ${
        groups.length === 1 ? "group" : "groups"
      } recorded on this physical MiniDisc.`;


    /*
     * Build the Groups.
     */

    const groupsContainer =
      document.getElementById("groups");


    groupsContainer.innerHTML =
      groups.map((group, index) => {

        const groupNumber =
          String(index + 1).padStart(2, "0");


        const groupType =
          group.type
            ? group.type.toUpperCase()
            : "GROUP";


        const artist =
          group.artist || "";


        const title =
          group.title || "Untitled";


        /*
         * Build the track list.
         */

        const tracks =
          Array.isArray(group.tracks)
            ? group.tracks
            : [];


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
                    ${tracks.length === 1
                      ? "TRACK"
                      : "TRACKS"}
                  </span>

                </div>


                <ol>

                  ${tracks.map(track => {

                    /*
                     * Tracks are stored as objects:
                     *
                     * number
                     * title
                     * artist
                     * album
                     */

                    const trackTitle =
                      typeof track === "string"
                        ? track
                        : track.title || "Untitled";


                    const trackArtist =
                      typeof track === "object"
                        ? track.artist
                        : null;


                    const trackAlbum =
                      typeof track === "object"
                        ? track.album
                        : null;


                    let trackMeta = "";


                    if (trackArtist && trackAlbum) {

                      trackMeta =
                        `${trackArtist} · ${trackAlbum}`;

                    } else if (trackArtist) {

                      trackMeta =
                        trackArtist;

                    } else if (trackAlbum) {

                      trackMeta =
                        trackAlbum;

                    }


                    return `

                      <li>

                        <div class="track-title">
                          ${trackTitle}
                        </div>

                        ${
                          trackMeta
                            ? `
                              <div class="track-meta">
                                ${trackMeta}
                              </div>
                            `
                            : ""
                        }

                      </li>

                    `;

                  }).join("")}

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


              ${
                artist
                  ? `
                    <h2>
                      ${artist}
                    </h2>
                  `
                  : ""
              }


              <div class="album-heading">

                <div class="album-title">
                  ${title}
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

    console.error("RetroMiniDisc disc error:", error);

    document.getElementById("disc-eyebrow").textContent =
      "ARCHIVE ERROR";

    document.getElementById("disc-title").textContent =
      "Disc unavailable";

    document.getElementById("disc-description").textContent =
      error.message;

    document.getElementById("groups").innerHTML =
      "";

  }

}


loadDisc();
