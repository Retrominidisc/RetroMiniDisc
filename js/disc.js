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


    /*
     * Look up an album's original release year
     * from MusicBrainz when it has not been entered
     * manually in the archive.
     *
     * MusicBrainz release groups represent the
     * overall album rather than an individual pressing
     * or reissue, so first-release-date is appropriate
     * for our archive.
     */

    async function getAlbumReleaseYear(artist, title) {

      if (!artist || !title) {
        return null;
      }

      try {

        const query =
          `artist:"${artist}" AND releasegroup:"${title}"`;

        const url =
          `https://musicbrainz.org/ws/2/release-group/` +
          `?query=${encodeURIComponent(query)}` +
          `&fmt=json` +
          `&limit=5`;

        const response =
          await fetch(url, {
            headers: {
              "Accept": "application/json"
            }
          });

        if (!response.ok) {
          return null;
        }

        const result =
          await response.json();

        const matches =
          Array.isArray(result["release-groups"])
            ? result["release-groups"]
            : [];

        if (!matches.length) {
          return null;
        }


        /*
         * Prefer the highest-scoring result that has
         * a first release date.
         */

        const match =
          matches.find(
            item =>
              item["first-release-date"]
          );

        if (!match) {
          return null;
        }

        const releaseDate =
          match["first-release-date"];

        const year =
          releaseDate.match(/^\d{4}/);

        return year
          ? year[0]
          : null;

      } catch (error) {

        /*
         * MusicBrainz is an enhancement, not a
         * dependency. If the lookup fails, simply
         * leave the release year blank.
         */

        console.warn(
          `MusicBrainz lookup failed for ${artist} — ${title}`,
          error
        );

        return null;

      }

    }


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


        const isAlbum =
          groupType === "ALBUM";


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


        const trackListClass =
          isAlbum
            ? "tracklist tracklist-album"
            : "tracklist tracklist-compilation";


        const trackList =
          tracks.length > 0
            ? `

              <section class="${trackListClass}">

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
                     *
                     * Album tracks normally only contain
                     * the track title because artist and
                     * album are already shown in the
                     * group heading.
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
         * Use a stored release year when available.
         *
         * For albums without one, the initial heading
         * is rendered without a year. The MusicBrainz
         * lookup below can then add it automatically.
         */

        const releaseYear =
          group.release_year || "";


        /*
         * Build the complete Group.
         */

        return `

          <section
            class="group-block"
            data-group-index="${index}"
          >

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


                  <div
                    class="release-year"
                    ${
                      releaseYear
                        ? ""
                        : 'style="display:none"'
                    }
                  >
                    ${releaseYear}
                  </div>

                </div>

              </div>

            </section>


            ${trackList}

          </section>

        `;

      }).join("");


    /*
     * Fetch missing release years for albums.
     *
     * This happens after the page has rendered so
     * the archive itself is immediately visible.
     */

    const albumLookups =
      groups.map(async (group, index) => {

        if (
          !group.type ||
          group.type.toUpperCase() !== "ALBUM" ||
          group.release_year
        ) {
          return;
        }


        const year =
          await getAlbumReleaseYear(
            group.artist,
            group.title
          );


        if (!year) {
          return;
        }


        const groupBlock =
          groupsContainer.querySelector(
            `[data-group-index="${index}"]`
          );

        if (!groupBlock) {
          return;
        }


        const releaseYearElement =
          groupBlock.querySelector(".release-year");

        if (!releaseYearElement) {
          return;
        }


        releaseYearElement.textContent =
          year;

        releaseYearElement.style.display =
          "";

      });


    await Promise.all(albumLookups);


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
