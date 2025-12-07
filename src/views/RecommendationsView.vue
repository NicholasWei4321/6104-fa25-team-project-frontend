<script setup>
import { ref, onMounted, computed } from "vue";
import SongCard from "@/components/SongCard.vue";
import { getSystemRecs, getCommunityRecs } from "@/api/recommendations.js";

const emit = defineEmits(["close"]);
const props = defineProps({ country: { type: String, default: "Taiwan" } });
const country = computed(() => props.country || "Taiwan");

const ourPicks = ref([]);
const communityPicks = ref([]);
const loading = ref(false);

const error = ref(null);
const showSuggestForm = ref(false);
const suggestLoading = ref(false);
const suggestError = ref("");
const suggestSuccess = ref("");
const showNotification = ref(false);
const notificationMessage = ref("");
const suggestFields = ref({
  songTitle: "",
  artist: "",
  language: "",
  youtubeURL: "",
  genre: "",
});

function handleSuggestClick() {
  console.log("[Button Click] Suggest Song button clicked");
  if (showSuggestForm.value) {
    closeSuggestForm();
  } else {
    showSuggestForm.value = true;
  }
}

function closeSuggestForm() {
  console.log("[Button Click] Suggest form closed");
  showSuggestForm.value = false;
  suggestError.value = "";
  suggestSuccess.value = "";
  suggestFields.value = {
    songTitle: "",
    artist: "",
    language: "",
    youtubeURL: "",
    genre: "",
  };
}

async function submitSuggestion() {
  console.log("[Button Click] Submit suggestion button clicked");
  suggestLoading.value = true;
  suggestError.value = "";
  suggestSuccess.value = "";
  try {
    console.log("[Action] Submitting song suggestion:", suggestFields.value);
    const res = await import("@/api/recommendations.js").then((m) =>
      m.addCommunityRec({
        countryName: country.value,
        ...suggestFields.value,
      })
    );
    if (res.error) {
      suggestError.value = res.error;
    } else {
      suggestSuccess.value = "Song suggestion submitted!";
      notificationMessage.value = "Thank you for your suggestion!";
      showNotification.value = true;
      setTimeout(() => {
        showNotification.value = false;
      }, 3000);
      closeSuggestForm();
    }
  } catch (e) {
    suggestError.value = "Failed to submit suggestion.";
  } finally {
    suggestLoading.value = false;
  }
}

onMounted(async () => {
  loading.value = true;
  error.value = null;

  try {
    const [systemRecs, commRecs] = await Promise.all([
      getSystemRecs(country.value),
      getCommunityRecs(country.value),
    ]);

    ourPicks.value = systemRecs || [];
    communityPicks.value = commRecs || [];
  } catch (e) {
    console.error("Failed to fetch recommendations", e);
    error.value = "Failed to load recommendations";
    ourPicks.value = [];
    communityPicks.value = [];
  } finally {
    loading.value = false;
  }
});

function handleClose() {
  emit("close");
}

function handleSongReported() {
  console.log("[Event] Song reported notification triggered");
  notificationMessage.value = "Thank you for reporting this song.";
  showNotification.value = true;
  setTimeout(() => {
    showNotification.value = false;
  }, 3000);
}

function handleSongAlreadyReported() {
  console.log("[Event] Song already reported notification triggered");
  notificationMessage.value = "You've already reported this song.";
  showNotification.value = true;
  setTimeout(() => {
    showNotification.value = false;
  }, 3000);
}

function handleSongReportError() {
  console.log("[Event] Song report error notification triggered");
  notificationMessage.value = "Error reporting song. Please try again later.";
  showNotification.value = true;
  setTimeout(() => {
    showNotification.value = false;
  }, 3000);
}

function handlePlaylistAdded() {
  console.log("[Event] Playlist add notification triggered");
  notificationMessage.value = "Song added to playlist.";
  showNotification.value = true;
  setTimeout(() => {
    showNotification.value = false;
  }, 3000);
}

function handlePlaylistAddError() {
  console.log("[Event] Playlist add error notification triggered");
  notificationMessage.value = "Failed to add song to playlist.";
  showNotification.value = true;
  setTimeout(() => {
    showNotification.value = false;
  }, 3000);
}

function handleSongAlreadyInPlaylist() {
  console.log("[Event] Song already in playlist notification triggered");
  notificationMessage.value = "Song already in playlist.";
  showNotification.value = true;
  setTimeout(() => {
    showNotification.value = false;
  }, 3000);
}
</script>

<template>
  <div class="modal-backdrop" @click.self="handleClose">
    <div class="modal-panel">
      <button class="close-btn" aria-label="Close" @click="handleClose">
        ×
      </button>
      <div class="modal-content">
        <div class="title-container">
          <h1>{{ country }}</h1>
        </div>
        <div v-if="loading" class="loading">Loading recommendations…</div>
        <div v-else class="main-container">
          <div class="panel-container">
            <h1>Our Picks</h1>
            <div class="song-container">
              <SongCard
                v-for="s in ourPicks"
                :key="s._id"
                :song-id="s._id || ''"
                :title="s.title"
                :artist="s.artist"
                :genre="s.genre"
                :language="s.language"
                :youtube-url="s.youtubeUrl"
                :country="country"
                :rec-type="s.recType || 'System'"
                @song-reported="handleSongReported"
                @song-already-reported="handleSongAlreadyReported"
                @song-report-error="handleSongReportError"
                @playlist-added="handlePlaylistAdded"
                @playlist-add-error="handlePlaylistAddError"
                @song-already-in-playlist="handleSongAlreadyInPlaylist"
              />
            </div>
          </div>
          <div class="panel-container">
            <h1>Community Picks</h1>
            <div class="song-container">
              <SongCard
                v-for="s in communityPicks"
                :key="s._id"
                :song-id="s._id || ''"
                :title="s.title"
                :artist="s.artist"
                :genre="s.genre"
                :language="s.language"
                :youtube-url="s.youtubeUrl"
                :country="country"
                :rec-type="s.recType || 'Community'"
                @song-reported="handleSongReported"
                @song-already-reported="handleSongAlreadyReported"
                @song-report-error="handleSongReportError"
                @playlist-added="handlePlaylistAdded"
                @playlist-add-error="handlePlaylistAddError"
                @song-already-in-playlist="handleSongAlreadyInPlaylist"
              />

              <!-- Suggestion Form Card -->
              <div v-if="showSuggestForm" class="suggest-card">
                <div class="suggest-card__header">
                  <div class="suggest-card__icon">
                    <font-awesome-icon :icon="['fas', 'plus']" class="icon" />
                  </div>
                  <h3 class="suggest-card__title">Suggest a song!</h3>
                </div>
                <form class="suggest-form" @submit.prevent="submitSuggestion">
                  <input
                    v-model="suggestFields.songTitle"
                    type="text"
                    placeholder="Song Title"
                    class="suggest-input"
                    required
                  />
                  <input
                    v-model="suggestFields.artist"
                    type="text"
                    placeholder="Artist"
                    class="suggest-input"
                    required
                  />
                  <input
                    v-model="suggestFields.language"
                    type="text"
                    placeholder="Language"
                    class="suggest-input"
                    required
                  />
                  <input
                    v-model="suggestFields.youtubeURL"
                    type="text"
                    placeholder="YouTube URL"
                    class="suggest-input"
                    required
                  />
                  <input
                    v-model="suggestFields.genre"
                    type="text"
                    placeholder="Genre (optional)"
                    class="suggest-input"
                  />
                  <button
                    class="submit-btn"
                    type="submit"
                    :disabled="suggestLoading"
                  >
                    {{ suggestLoading ? "Submitting..." : "Submit" }}
                  </button>
                  <div v-if="suggestError" class="suggest-error">
                    {{ suggestError }}
                  </div>
                  <div v-if="suggestSuccess" class="suggest-success">
                    {{ suggestSuccess }}
                  </div>
                </form>
              </div>
            </div>

            <button class="suggest-btn" @click="handleSuggestClick">
              {{ showSuggestForm ? "Cancel" : "Suggest a Song" }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Notification Toast -->
  <Transition name="fade-slide">
    <div v-if="showNotification" class="notification-toast">
      <p>{{ notificationMessage }}</p>
    </div>
  </Transition>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-panel {
  position: relative;
  width: min(1100px, 92vw);
  max-height: 86vh;
  background: #0b0b0b;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
  overflow: hidden;
}

.close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  font-size: 24px;
  line-height: 24px;
  cursor: pointer;
}
.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.modal-content {
  padding: 16px 20px 20px 20px;
  color: #fff;
  overflow-y: auto;
  max-height: 86vh;
}

.title-container {
  display: flex;
  padding: 0;
  margin-bottom: 8px;
  gap: 0;
}
.title-container h1 {
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  font-size: 2rem;
  font-weight: 600;
  margin: 0;
  color: #38bdf8;
  letter-spacing: 0.05em;
}

.main-container {
  display: flex;
  flex-direction: row;
  gap: 2rem;
  justify-content: space-around;
  padding: 0rem 0.5rem 0.5rem;
  flex: 1;
  max-width: 100%;
  width: 100%;
  height: 100%;
  max-height: 100%;
  min-height: 0%;
}

.panel-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: start;
  gap: 1rem;
  padding: 0rem 0.5rem 0.5rem;
  flex: 1;
}
.panel-container h1 {
  font-size: 1.4rem;
  font-weight: 600;
  margin: 0;
  color: #38bdf8;
  letter-spacing: 0.05em;
}

.song-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow-y: auto;
  scrollbar-gutter: stable;
  scrollbar-width: thin;
  width: 100%;
  max-width: 100%;
}

.song-container::-webkit-scrollbar {
  width: 6px;
}
.song-container::-webkit-scrollbar-track {
  background: transparent;
}
.song-container::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.25);
  border-radius: 4px;
}
.song-container::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.4);
}

.loading {
  padding: 8px;
  color: #ddd;
}

/* Suggestion Card Styles */
.suggest-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: 0.75rem;
  background: var(--color-background-soft);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.suggest-card__header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.25rem;
}

.suggest-card__icon {
  background: linear-gradient(135deg, #7c3aed, #2563eb);
  color: white;
  border-radius: 9999px;
  padding: 0.6rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6px 20px rgba(124, 58, 237, 0.3);
}

.suggest-card__icon .icon {
  width: 24px;
  height: 24px;
}

.suggest-card__title {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-heading);
}

.suggest-error {
  color: #ef4444;
  margin-top: 0.5rem;
  font-size: 0.9rem;
  text-align: center;
}

.suggest-success {
  color: #22c55e;
  margin-top: 0.5rem;
  font-size: 0.9rem;
  text-align: center;
}

.suggest-btn {
  margin-bottom: 0.5rem;
  padding: 0.5rem 1.5rem;
  background: linear-gradient(135deg, #7c3aed, #2563eb);
  color: #fff;
  border: none;
  border-radius: 9999px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);
}

.suggest-btn:hover {
  background: linear-gradient(135deg, #6d28d9, #1d4ed8);
  box-shadow: 0 6px 20px rgba(124, 58, 237, 0.4);
  transform: translateY(-1px);
}

.suggest-form {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 90%;
  align-items: stretch;
}

.suggest-input {
  padding: 0.6rem 0.85rem;
  border-radius: 0.5rem;
  border: 1px solid var(--color-border);
  background: var(--color-background);
  color: var(--color-text);
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.suggest-input:focus {
  outline: none;
  border-color: #7c3aed;
  box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
}

.suggest-input::placeholder {
  color: var(--color-text);
  opacity: 0.5;
}

.submit-btn {
  padding: 0.6rem 1.2rem;
  background: linear-gradient(135deg, #7c3aed, #2563eb);
  color: #fff;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 0.25rem;
  box-shadow: 0 4px 12px rgba(124, 58, 237, 0.25);
  width: 50%;
  align-self: center;
}

.submit-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #6d28d9, #1d4ed8);
  box-shadow: 0 6px 20px rgba(124, 58, 237, 0.35);
  transform: translateY(-1px);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Notification Toast */
.notification-toast {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #7c3aed, #2563eb);
  color: white;
  padding: 1rem 2rem;
  border-radius: 0.5rem;
  box-shadow: 0 8px 24px rgba(124, 58, 237, 0.3);
  z-index: 3000;
  font-weight: 500;
  font-size: 0.95rem;
}

.notification-toast p {
  margin: 0;
}

/* Fade and slide animations */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(20px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(20px);
}
</style>
