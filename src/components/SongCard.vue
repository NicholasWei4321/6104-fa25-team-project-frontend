<template>
  <div class="song-card" :class="{ expanded: isExpanded }">
    <div class="song-card__row" @click="toggleExpand">
      <div class="song-card__icon">
        <font-awesome-icon :icon="['fas', 'music']" class="icon" />
      </div>

      <div class="song-card__content">
        <p class="song-card__title">{{ title }}</p>
        <p class="song-card__artist">{{ artist }}</p>

        <div class="song-card__meta">
          <font-awesome-icon :icon="['fas', 'language']" class="lang-icon" />
          <span class="song-card__lang">{{ language }}</span>
        </div>
      </div>

      <button
        class="song-card__flag-btn"
        @click.stop="handleFlag"
        title="Report song"
      >
        <font-awesome-icon :icon="['fas', 'flag']" />
      </button>

      <button
        v-if="isExpanded"
        class="song-card__add-btn"
        @click.stop="handleAdd"
        title="Add to playlist"
        ref="addBtnRef"
      >
        <font-awesome-icon :icon="['fas', 'plus']" />
      </button>
      <!-- Playlist selection popup anchored to + button -->
      <div v-if="showPlaylistPopup" class="playlist-popup" ref="popupRef">
        <div class="playlist-popup__header">Add to playlist</div>
        <div class="playlist-popup__list">
          <template v-if="playlistItems.length">
            <div
              v-for="p in playlistItems"
              :key="p.playlist"
              class="playlist-popup__item"
              @click.stop="addToPlaylist(p.playlist)"
            >
              <span>{{ p.name }}</span>
            </div>
          </template>
          <div v-else class="playlist-popup__empty">
            No playlists yet. Create one in the Playlist tab.
          </div>
        </div>
      </div>
    </div>

    <!-- <div class="song-card__footer">
      <span class="song-card__genre">{{ genre }}</span>
    </div> -->

    <div v-if="isExpanded" class="song-card__video">
      <div class="video-container">
        <iframe
          :src="embedUrl"
          :title="`${title} - ${artist}`"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
        ></iframe>
      </div>
    </div>
  </div>
</template>

<script>
import { useAuthStore } from "@/stores/auth.js";
import { usePlaylistStore } from "@/stores/playlist.js";
import { logExploration } from "@/api/passport.js";
import { reportObject } from "@/api/reporting.js";

export default {
  name: "SongCard",
  emits: [
    "song-reported",
    "song-already-reported",
    "song-report-error",
    "playlist-added",
    "playlist-add-error",
    "song-already-in-playlist",
  ],
  props: {
    songId: { type: String, default: "" },
    title: { type: String, required: true },
    artist: { type: String, required: true },
    genre: { type: String, default: "" },
    language: { type: String, required: true },
    youtubeUrl: { type: String, required: true },
    country: { type: String, required: true },
    recType: { type: String, default: "" },
  },
  data() {
    return {
      isExpanded: false,
      showPlaylistPopup: false,
      popupRef: null,
      addBtnRef: null,
    };
  },
  computed: {
    embedUrl() {
      // Extract video ID from various YouTube URL formats
      const videoId = this.extractVideoId(this.youtubeUrl);
      return `https://www.youtube.com/embed/${videoId}`;
    },
    playlistItems() {
      const playlistStore = usePlaylistStore();
      return playlistStore.playlists || [];
    },
  },
  methods: {
    async toggleExpand() {
      console.log("[Card Click] Song card clicked:", {
        title: this.title,
        artist: this.artist,
      });
      this.isExpanded = !this.isExpanded;

      // Log exploration when card is expanded (clicked)
      if (this.isExpanded) {
        try {
          const authStore = useAuthStore();
          if (authStore.user) {
            // Create song object matching API spec
            const songObject = {
              _id: this.songId,
              countryName: this.country,
              songTitle: this.title,
              artist: this.artist,
              language: this.language,
              youtubeURL: this.youtubeUrl,
              recType: this.recType,
              genre: this.genre,
            };
            console.log("[Action] Logging song exploration");
            await logExploration(authStore.user, songObject, this.country);
          }
        } catch (error) {
          console.error("Failed to log exploration:", error);
        }
      }
    },
    async handleFlag() {
      console.log("[Button Click] Flag/Report button clicked for song:", {
        title: this.title,
        artist: this.artist,
      });
      try {
        const authStore = useAuthStore();
        if (!authStore.user) {
          alert("You must be logged in to report a song.");
          return;
        }
        console.log("[Action] Reporting song:", this.songId);
        const result = await reportObject(this.songId, authStore.user);
        if (result && result.error) {
          if (result.error.includes("already reported")) {
            this.$emit("song-already-reported");
          } else {
            this.$emit("song-report-error");
          }
        } else {
          this.$emit("song-reported");
        }
      } catch (error) {
        console.error("Failed to report song:", error);
        alert("Failed to report song. Please try again later.");
      }
    },
    handleAdd() {
      console.log("[Button Click] Add to playlist button clicked for song:", {
        title: this.title,
        artist: this.artist,
      });
      // Toggle popup and ensure playlists loaded
      const authStore = useAuthStore();
      if (!authStore.user) {
        alert("You must be logged in to add to a playlist.");
        return;
      }
      const playlistStore = usePlaylistStore();
      if (!playlistStore.playlists || playlistStore.playlists.length === 0) {
        // Fetch playlists for the logged-in user (pass full user object)
        playlistStore.fetchPlaylists(authStore.user).catch(() => {});
      }
      this.showPlaylistPopup = !this.showPlaylistPopup;
    },
    async addToPlaylist(playlistId) {
      console.log("[Card Click] Playlist selected from popup:", {
        playlistId,
        song: this.title,
      });
      try {
        console.log("[Action] Adding song to playlist:", {
          songId: this.songId,
          playlistId,
        });
        const playlistStore = usePlaylistStore();
        await playlistStore.addSong(playlistId, this.songId);
        this.showPlaylistPopup = false;
        this.$emit("playlist-added");
      } catch (e) {
        const playlistStore = usePlaylistStore();
        const errorMsg = playlistStore.error || "";
        console.error(
          "Error adding song:",
          e,
          "Store error:",
          errorMsg
        );
        if (errorMsg.includes("DUPLICATE_SONG")) {
          this.$emit("song-already-in-playlist");
        } else {
          this.$emit("playlist-add-error");
        }
      }
    },
    mounted() {
      // Close popup when clicking outside
      this._outsideClickHandler = (e) => {
        if (!this.showPlaylistPopup) return;
        const popupEl = this.$refs.popupRef;
        const btnEl = this.$refs.addBtnRef;
        if (popupEl && (popupEl === e.target || popupEl.contains(e.target)))
          return;
        if (btnEl && (btnEl === e.target || btnEl.contains(e.target))) return;
        this.showPlaylistPopup = false;
      };
      document.addEventListener("click", this._outsideClickHandler);
    },
    extractVideoId(url) {
      // Handle youtube.com/watch?v=ID
      const watchMatch = url.match(/[?&]v=([^&]+)/);
      if (watchMatch) return watchMatch[1];

      // Handle youtu.be/ID
      const shortMatch = url.match(/youtu\.be\/([^?]+)/);
      if (shortMatch) return shortMatch[1];

      // Handle youtube.com/embed/ID
      const embedMatch = url.match(/embed\/([^?]+)/);
      if (embedMatch) return embedMatch[1];

      // Fallback: return the url as-is
      return url;
    },
  },
  mounted() {
    // Close popup when clicking outside
    this._outsideClickHandler = (e) => {
      if (!this.showPlaylistPopup) return;
      const popupEl = this.$refs.popupRef;
      const btnEl = this.$refs.addBtnRef;
      if (popupEl && (popupEl === e.target || popupEl.contains(e.target)))
        return;
      if (btnEl && (btnEl === e.target || btnEl.contains(e.target))) return;
      this.showPlaylistPopup = false;
    };
    document.addEventListener("click", this._outsideClickHandler, true);
  },
  unmounted() {
    document.removeEventListener("click", this._outsideClickHandler, true);
  },
};
</script>

<style scoped>
.song-card {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: 0.75rem;
  background: var(--color-background-soft);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  font-size: 0.9rem;
  transition: all 0.3s ease;
  /* overflow: scroll; */
}
.song-card.expanded {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  border-color: #7c3aed;
}
.song-card__row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  position: relative;
}
.song-card__flag-btn {
  position: absolute;
  top: -0.25rem;
  right: 0;
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 0.25rem;
  font-size: 1rem;
  transition: color 0.2s ease;
}
.song-card__flag-btn:hover {
  color: #ef4444;
}
.song-card__add-btn {
  position: absolute;
  top: 2rem; /* appears underneath the flag button */
  right: 0;
  width: 30px;
  height: 30px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 9999px; /* circle */
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.06);
  color: #6b7280;
  cursor: pointer;
  padding: 0;
  font-size: 0.95rem;
  transition: all 0.2s ease;
}
.song-card__add-btn:hover {
  color: #10b981; /* green tint on hover */
  border-color: #d1fae5;
  background: #f0fdf4;
}
.song-card__icon {
  background: linear-gradient(135deg, #7c3aed, #2563eb);
  color: white;
  border-radius: 9999px;
  padding: 0.6rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6px 20px rgba(124, 58, 237, 0.3);
}
.song-card__icon .icon {
  width: 24px;
  height: 24px;
}
.song-card__content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
.song-card__title {
  margin: 0;
  text-align: left;
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-heading);
}
.song-card__artist {
  /* margin: 0.15rem 0 0; */
  color: var(--color-text);
}
.song-card__meta {
  margin-top: 0.15rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.lang-icon {
  color: #6d28d9;
  width: 16px;
  height: 16px;
}
.song-card__lang {
  color: #6d28d9;
  background: #ede9fe;
  padding: 0.25rem 0.6rem;
  border-radius: 9999px;
  font-size: 0.8rem;
}
.song-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.song-card__genre {
  color: var(--color-text);
}
.song-card__youtube {
  color: var(--color-text);
  text-decoration: none;
}
.song-card__youtube:hover {
  text-decoration: underline;
}
.song-card__video {
  margin: 0.5rem 0;
}
.playlist-popup {
  position: absolute;
  top: 4rem; /* directly below the + button */
  right: 0;
  width: 220px;
  max-height: 240px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  overflow: hidden;
  z-index: 10;
}
.playlist-popup__header {
  padding: 0.5rem 0.75rem;
  font-weight: 600;
  color: #374151;
  border-bottom: 1px solid #f3f4f6;
}
.playlist-popup__list {
  max-height: 200px;
  overflow-y: auto;
}
.playlist-popup__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  color: #374151;
}
.playlist-popup__item:hover {
  background: #f9fafb;
}
.playlist-popup__empty {
  padding: 0.75rem;
  color: #6b7280;
}
.video-container {
  position: relative;
  width: 100%;
  padding-bottom: 56.25%; /* 16:9 aspect ratio */
  background: #000;
  border-radius: 0.5rem;
  overflow: auto;
}
.video-container iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>
