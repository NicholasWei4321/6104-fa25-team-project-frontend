<template>
  <div class="song-card" :class="{ expanded: isExpanded }">
    <div class="song-card__row" @click="toggleExpand">
      <div class="song-card__icon">
        <font-awesome-icon :icon="['fas', 'music']" class="icon" />
      </div>

      <div class="song-card__content">
        <h3 class="song-card__title">{{ title }}</h3>
        <p class="song-card__artist">{{ artist }}</p>

        <div class="song-card__meta">
          <font-awesome-icon :icon="['fas', 'language']" class="lang-icon" />
          <span class="song-card__lang">{{ language }}</span>
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
import { useAuthStore } from '@/stores/auth.js';
import { logExploration } from '@/api/passport.js';

export default {
  name: "SongCard",
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
    };
  },
  computed: {
    embedUrl() {
      // Extract video ID from various YouTube URL formats
      const videoId = this.extractVideoId(this.youtubeUrl);
      return `https://www.youtube.com/embed/${videoId}`;
    },
  },
  methods: {
    async toggleExpand() {
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
            await logExploration(authStore.user, songObject, this.country);
          }
        } catch (error) {
          console.error('Failed to log exploration:', error);
        }
      }
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
