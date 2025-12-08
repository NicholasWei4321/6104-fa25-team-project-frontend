<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { usePlaylistStore } from '../stores/playlist.js';
import { useAuthStore } from '../stores/auth.js';
import { getAllSongHistory } from '../api/passport.js';

const router = useRouter();
const playlistStore = usePlaylistStore();
const authStore = useAuthStore();

// UI state
const showCreateModal = ref(false);
const showRenameModal = ref(false);
const showAddSongModal = ref(false);
const newPlaylistName = ref('');
const renamePlaylistName = ref('');
const playlistToRename = ref(null);
const selectedPlaylist = ref(null);
const newSongId = ref('');
const draggedSongIndex = ref(null);
const dropTargetIndex = ref(null);
const isDraggingFromHandle = ref(false);

// Add song modal state
const activeTab = ref('history'); // 'history', 'search', 'manual'
const songHistory = ref([]);
const searchQuery = ref('');
const loadingHistory = ref(false);

// Confirmation modal state
const showConfirmModal = ref(false);
const confirmMessage = ref('');
const confirmAction = ref(null);

// Computed
const sortedPlaylists = computed(() => {
  return [...playlistStore.playlists].sort((a, b) => a.name.localeCompare(b.name));
});

const filteredSongHistory = computed(() => {
  if (!searchQuery.value.trim()) return songHistory.value;

  const query = searchQuery.value.toLowerCase();
  return songHistory.value.filter(song => {
    const title = (song.songTitle || '').toLowerCase();
    const artist = (song.artist || '').toLowerCase();
    const country = (song.countryName || '').toLowerCase();
    return title.includes(query) || artist.includes(query) || country.includes(query);
  });
});

// Get enriched playlist with full song details
const enrichedPlaylist = computed(() => {
  return playlistStore.enrichedCurrentPlaylist;
});

// Helper function to check if a song is an object with details or just an ID
const isSongObject = (song) => {
  return typeof song === 'object' && song !== null && (song.songTitle || song.title);
};

// Lifecycle
onMounted(async () => {
  // Auth is already initialized by router guard and App.vue
  // Load playlists for the authenticated user
  console.log('PlaylistView mounted, authStore.user:', authStore.user);
  console.log('authStore.isAuthenticated:', authStore.isAuthenticated);

  if (authStore.user) {
    await loadPlaylists();
  } else {
    console.error('No user in authStore on mount');
  }
});

// Methods
async function loadPlaylists() {
  if (!authStore.user) {
    console.error('No authenticated user');
    return;
  }

  console.log('Loading playlists for user:', authStore.user);

  try {
    await playlistStore.fetchPlaylists(authStore.user);
    console.log('Playlists loaded successfully:', playlistStore.playlists);
    console.log('Number of playlists:', playlistStore.playlists.length);
  } catch (error) {
    console.error('Error loading playlists:', error);
    showConfirmation('Failed to load playlists: ' + (error.response?.data?.error || error.message), null);
  }
}

async function handleCreatePlaylist() {
  console.log('[Button Click] Create playlist button clicked');
  if (!newPlaylistName.value.trim()) {
    showConfirmation('Please enter a playlist name', null);
    return;
  }

  try {
    console.log('[Action] Creating new playlist:', newPlaylistName.value);
    await playlistStore.createPlaylist(newPlaylistName.value);
    newPlaylistName.value = '';
    showCreateModal.value = false;
  } catch (error) {
    showConfirmation(playlistStore.error || 'Failed to create playlist', null);
  }
}

function handleDeletePlaylist(playlistId) {
  console.log('[Button Click] Delete playlist button clicked:', playlistId);
  showConfirmation(
    'Are you sure you want to delete this playlist?',
    async () => {
      console.log('[Action] Deleting playlist:', playlistId);
      try {
        await playlistStore.deletePlaylist(playlistId);
        if (selectedPlaylist.value === playlistId) {
          selectedPlaylist.value = null;
        }
      } catch (error) {
        // Show error in confirmation modal
        showConfirmation(
          playlistStore.error || 'Failed to delete playlist',
          null
        );
      }
    }
  );
}

function openRenameModal(playlist) {
  console.log('[Button Click] Edit/Rename playlist button clicked:', playlist.name);
  playlistToRename.value = playlist.playlist;
  renamePlaylistName.value = playlist.name;
  showRenameModal.value = true;
}

async function handleRenamePlaylist() {
  console.log('[Button Click] Rename playlist button clicked');
  if (!renamePlaylistName.value.trim()) {
    showConfirmation('Please enter a new playlist name', null);
    return;
  }

  try {
    console.log('[Action] Renaming playlist to:', renamePlaylistName.value);
    await playlistStore.renamePlaylist(playlistToRename.value, renamePlaylistName.value);
    showRenameModal.value = false;
    playlistToRename.value = null;
    renamePlaylistName.value = '';
  } catch (error) {
    showConfirmation(playlistStore.error || 'Failed to rename playlist', null);
  }
}

async function selectPlaylist(playlistId) {
  console.log('[Card Click] Playlist selected:', playlistId);
  selectedPlaylist.value = playlistId;
  try {
    console.log('[Action] Fetching playlist details');
    await playlistStore.fetchPlaylistDetails(playlistId);
  } catch (error) {
    showConfirmation('Failed to load playlist details', null);
  }
}

async function openAddSongModal() {
  console.log('[Button Click] Add Song button clicked');
  showAddSongModal.value = true;
  activeTab.value = 'history';
  searchQuery.value = '';
  newSongId.value = '';

  // Load song history
  await loadSongHistory();
}

async function loadSongHistory() {
  if (!authStore.user) return;

  loadingHistory.value = true;
  try {
    const history = await getAllSongHistory(authStore.user);
    songHistory.value = history;
  } catch (error) {
    console.error('Failed to load song history:', error);
    songHistory.value = [];
  } finally {
    loadingHistory.value = false;
  }
}

async function handleAddSong() {
  console.log('[Button Click] Add Song (manual ID) button clicked');
  if (!newSongId.value.trim()) {
    showConfirmation('Please enter a song ID', null);
    return;
  }

  try {
    console.log('[Action] Adding song with ID:', newSongId.value);
    await playlistStore.addSong(selectedPlaylist.value, newSongId.value);
    newSongId.value = '';
    showAddSongModal.value = false;
  } catch (error) {
    showConfirmation(playlistStore.error || 'Failed to add song', null);
  }
}

async function addSongFromHistory(song) {
  console.log('[Card Click] Song selected from history:', { title: song.songTitle, artist: song.artist });
  if (!selectedPlaylist.value || !song) return;

  try {
    console.log('[Action] Adding song from history to playlist:', song);
    // Store the entire song object instead of just the ID
    await playlistStore.addSong(selectedPlaylist.value, song);
    showAddSongModal.value = false;
    // Refresh the playlist to see the updated songs
    await playlistStore.fetchPlaylistDetails(selectedPlaylist.value);
  } catch (error) {
    showConfirmation(playlistStore.error || 'Failed to add song', null);
  }
}

function handleRemoveSong(songId) {
  console.log('[Button Click] Remove song button clicked:', songId);
  showConfirmation(
    'Remove this song from the playlist?',
    async () => {
      console.log('[Action] Removing song from playlist:', songId);
      try {
        await playlistStore.removeSong(selectedPlaylist.value, songId);
      } catch (error) {
        // Show error in confirmation modal
        showConfirmation(
          playlistStore.error || 'Failed to remove song',
          null
        );
      }
    }
  );
}

// Drag and drop for reordering
function handleDragHandleMouseDown(event) {
  console.log('[Drag Start] Drag handle mouse down');
  isDraggingFromHandle.value = true;
}

function handleDragStart(event, index) {
  console.log('[Drag Event] Drag start for song at index:', index);
  // Only allow drag if started from the drag handle
  if (!isDraggingFromHandle.value) {
    event.preventDefault();
    return;
  }

  draggedSongIndex.value = index;
  event.dataTransfer.effectAllowed = 'move';
  event.dataTransfer.setData('text/html', event.target.innerHTML);
}

function handleDragOver(event, index) {
  event.preventDefault();
  event.dataTransfer.dropEffect = 'move';

  // Update drop target indicator
  if (draggedSongIndex.value !== null && draggedSongIndex.value !== index) {
    dropTargetIndex.value = index;
  }
}

function handleDragEnter(event, index) {
  event.preventDefault();
  if (draggedSongIndex.value !== null && draggedSongIndex.value !== index) {
    dropTargetIndex.value = index;
  }
}

function handleDragLeave(event) {
  // Only clear if we're leaving the list entirely
  if (event.target.classList.contains('song-list')) {
    dropTargetIndex.value = null;
  }
}

async function handleDrop(event, dropIndex) {
  event.preventDefault();
  event.stopPropagation();

  console.log('[Drag Event] Drop at index:', dropIndex);

  dropTargetIndex.value = null;

  if (draggedSongIndex.value === null || draggedSongIndex.value === dropIndex) {
    draggedSongIndex.value = null;
    isDraggingFromHandle.value = false;
    return;
  }

  const songs = [...playlistStore.currentPlaylist.songs];
  const draggedSong = songs[draggedSongIndex.value];

  // Remove from old position
  songs.splice(draggedSongIndex.value, 1);

  // Insert at new position
  songs.splice(dropIndex, 0, draggedSong);

  try {
    console.log('[Action] Reordering songs - moved from index', draggedSongIndex.value, 'to', dropIndex);
    await playlistStore.reorderSongs(selectedPlaylist.value, songs);
    draggedSongIndex.value = null;
    isDraggingFromHandle.value = false;
  } catch (error) {
    showConfirmation(playlistStore.error || 'Failed to reorder songs', null);
    draggedSongIndex.value = null;
    isDraggingFromHandle.value = false;
  }
}

function handleDragEnd() {
  draggedSongIndex.value = null;
  dropTargetIndex.value = null;
  isDraggingFromHandle.value = false;
}

// Confirmation modal methods
function showConfirmation(message, action) {
  confirmMessage.value = message;
  confirmAction.value = action;
  showConfirmModal.value = true;
}

function handleConfirm() {
  if (confirmAction.value) {
    confirmAction.value();
  }
  showConfirmModal.value = false;
  confirmAction.value = null;
}

function handleCancel() {
  showConfirmModal.value = false;
  confirmAction.value = null;
}

</script>

<template>
  <div class="playlist-page">
    <!-- Header -->
    <header class="page-header">
      <div class="header-left">
        <h1>My Playlists</h1>
      </div>
    </header>

    <!-- Main content area -->
    <div class="content-container">
      <!-- Left sidebar: Playlist names -->
      <aside class="playlist-sidebar">
        <button @click="showCreateModal = true" class="btn-create">
          + New Playlist
        </button>

        <div v-if="playlistStore.loading" class="loading">
          Loading...
        </div>

        <ul v-else class="playlist-list">
          <li
            v-for="playlist in sortedPlaylists"
            :key="playlist.playlist"
            :class="{ active: selectedPlaylist === playlist.playlist }"
            @click="selectPlaylist(playlist.playlist)"
          >
            <span class="playlist-name">{{ playlist.name }}</span>
            <div class="playlist-actions">
              <button @click.stop="openRenameModal(playlist)" class="btn-icon btn-edit" title="Rename">
                <font-awesome-icon :icon="['fas', 'pen']" />
              </button>
              <button @click.stop="handleDeletePlaylist(playlist.playlist)" class="btn-icon btn-delete" title="Delete">
                <font-awesome-icon :icon="['fas', 'trash']" />
              </button>
            </div>
          </li>
        </ul>

        <div v-if="!playlistStore.loading && sortedPlaylists.length === 0" class="empty-state">
          <p>No playlists yet. Create one to get started!</p>
        </div>
      </aside>

      <!-- Right panel: Songs in selected playlist -->
      <main class="songs-panel">
        <div v-if="!selectedPlaylist" class="empty-selection">
          <p>← Select a playlist to view songs</p>
        </div>

        <div v-else-if="playlistStore.loadingPlaylist" class="loading">
          Loading playlist...
        </div>

        <div v-else-if="playlistStore.currentPlaylist" class="playlist-details">
          <div class="songs-header">
            <h2>{{ playlistStore.currentPlaylist.name }}</h2>
            <button @click="openAddSongModal" class="btn-add-song">
              + Add Song
            </button>
          </div>

          <div v-if="!playlistStore.hasCurrentPlaylistSongs" class="empty-state">
            <p>No songs in this playlist yet.</p>
          </div>

          <ul v-else class="song-list" @dragleave="handleDragLeave">
            <li
              v-for="(song, index) in enrichedPlaylist.songs"
              :key="(isSongObject(song) ? song._id : song) + '_' + index"
              draggable="true"
              @dragstart="handleDragStart($event, index)"
              @dragover="handleDragOver($event, index)"
              @dragenter="handleDragEnter($event, index)"
              @drop="handleDrop($event, index)"
              @dragend="handleDragEnd"
              :class="{
                dragging: draggedSongIndex === index,
                'drop-target': dropTargetIndex === index && draggedSongIndex !== index
              }"
              class="song-item"
            >
              <!-- Drop indicator bar -->
              <div
                v-if="dropTargetIndex === index && draggedSongIndex !== null && draggedSongIndex !== index"
                class="drop-indicator"
                :class="{ 'drop-above': draggedSongIndex > index, 'drop-below': draggedSongIndex < index }"
              ></div>

              <span
                class="drag-handle"
                @mousedown="handleDragHandleMouseDown"
              >⋮⋮</span>

              <!-- Display song details if available, otherwise show ID -->
              <div v-if="isSongObject(song)" class="song-details">
                <div class="song-title-display">{{ song.songTitle || song.title }}</div>
                <div class="song-meta-display">
                  <span class="song-artist-display">{{ song.artist }}</span>
                  <span class="meta-separator">•</span>
                  <span class="song-country-display">{{ song.countryName || song.country }}</span>
                </div>
              </div>
              <span v-else class="song-id">{{ song }}</span>

              <button @click="handleRemoveSong(isSongObject(song) ? song._id : song)" class="btn-remove" title="Remove">
                ✕
              </button>
            </li>
          </ul>
        </div>
      </main>
    </div>

    <!-- Create Playlist Modal -->
    <div v-if="showCreateModal" class="modal-overlay" @click="showCreateModal = false">
      <div class="modal" @click.stop>
        <h3>Create Playlist</h3>
        <input
          v-model="newPlaylistName"
          type="text"
          placeholder="Playlist name"
          @keyup.enter="handleCreatePlaylist"
          autofocus
        />
        <div class="modal-actions">
          <button @click="showCreateModal = false" class="btn-cancel">Cancel</button>
          <button @click="handleCreatePlaylist" class="btn-primary">Create</button>
        </div>
      </div>
    </div>

    <!-- Rename Playlist Modal -->
    <div v-if="showRenameModal" class="modal-overlay" @click="showRenameModal = false">
      <div class="modal" @click.stop>
        <h3>Rename Playlist</h3>
        <input
          v-model="renamePlaylistName"
          type="text"
          placeholder="New name"
          @keyup.enter="handleRenamePlaylist"
          autofocus
        />
        <div class="modal-actions">
          <button @click="showRenameModal = false" class="btn-cancel">Cancel</button>
          <button @click="handleRenamePlaylist" class="btn-primary">Rename</button>
        </div>
      </div>
    </div>

    <!-- Add Song Modal -->
    <div v-if="showAddSongModal" class="modal-overlay" @click="showAddSongModal = false">
      <div class="modal modal-large" @click.stop>
        <h3>Add Song to Playlist</h3>

        <!-- Tabs -->
        <div class="modal-tabs">
          <button
            @click="activeTab = 'history'"
            :class="{ active: activeTab === 'history' }"
            class="tab-button"
          >
            Song History
          </button>
          <button
            @click="activeTab = 'search'"
            :class="{ active: activeTab === 'search' }"
            class="tab-button"
          >
            Search
          </button>
          <!-- <button
            @click="activeTab = 'manual'"
            :class="{ active: activeTab === 'manual' }"
            class="tab-button"
          >
            Manual Entry
          </button> -->
        </div>

        <!-- Tab Content -->
        <div class="modal-content">
          <!-- History Tab -->
          <div v-if="activeTab === 'history'" class="tab-content">
            <div v-if="loadingHistory" class="loading-songs">
              Loading your song history...
            </div>
            <div v-else-if="songHistory.length === 0" class="empty-history">
              <p>No song history yet. Explore some music first!</p>
            </div>
            <div v-else class="song-list-modal">
              <div
                v-for="song in songHistory"
                :key="song._id"
                @click="addSongFromHistory(song)"
                class="song-item-modal"
              >
                <div class="song-info">
                  <div class="song-title">{{ song.songTitle }}</div>
                  <div class="song-meta">
                    <span class="song-artist">{{ song.artist }}</span>
                    <span class="song-separator">•</span>
                    <span class="song-country">{{ song.countryName }}</span>
                  </div>
                </div>
                <button class="btn-add-icon">+</button>
              </div>
            </div>
          </div>

          <!-- Search Tab -->
          <div v-if="activeTab === 'search'" class="tab-content">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search by song title, artist, or country..."
              class="search-input"
            />
            <div v-if="searchQuery && filteredSongHistory.length === 0" class="empty-search">
              <p>No songs found matching "{{ searchQuery }}"</p>
            </div>
            <div v-else-if="filteredSongHistory.length > 0" class="song-list-modal">
              <div
                v-for="song in filteredSongHistory"
                :key="song._id"
                @click="addSongFromHistory(song)"
                class="song-item-modal"
              >
                <div class="song-info">
                  <div class="song-title">{{ song.songTitle }}</div>
                  <div class="song-meta">
                    <span class="song-artist">{{ song.artist }}</span>
                    <span class="song-separator">•</span>
                    <span class="song-country">{{ song.countryName }}</span>
                  </div>
                </div>
                <button class="btn-add-icon">+</button>
              </div>
            </div>
            <div v-else class="empty-search">
              <p>Start typing to search your song history...</p>
            </div>
          </div>

          <!-- Manual Entry Tab (Hidden for now) -->
          <!-- <div v-if="activeTab === 'manual'" class="tab-content">
            <label for="manual-song-id" class="input-label">Song ID</label>
            <input
              id="manual-song-id"
              v-model="newSongId"
              type="text"
              placeholder="Enter song ID"
              @keyup.enter="handleAddSong"
              class="manual-input"
            />
            <p class="input-hint">Enter the unique song ID to add it to your playlist.</p>
            <div class="modal-actions">
              <button @click="showAddSongModal = false" class="btn-cancel">Cancel</button>
              <button @click="handleAddSong" class="btn-primary">Add Song</button>
            </div>
          </div> -->
        </div>

        <!-- Close button -->
        <div class="modal-footer">
          <button @click="showAddSongModal = false" class="btn-cancel">Close</button>
        </div>
      </div>
    </div>

    <!-- Confirmation Modal -->
    <div v-if="showConfirmModal" class="modal-overlay" @click="handleCancel">
      <div class="modal modal-confirm" @click.stop>
        <div class="confirm-icon">
          <font-awesome-icon :icon="['fas', 'triangle-exclamation']" />
        </div>
        <p class="confirm-message">{{ confirmMessage }}</p>
        <div class="modal-actions modal-actions-center">
          <button @click="handleCancel" class="btn-cancel">Cancel</button>
          <button v-if="confirmAction" @click="handleConfirm" class="btn-confirm">Confirm</button>
          <button v-else @click="handleCancel" class="btn-primary">OK</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Page layout */
.playlist-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #3d5d7e;
}

/* Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  background: rgba(255, 255, 255, 0.95);
  border-bottom: 2px solid rgba(61, 93, 126, 0.3);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.header-left h1 {
  margin: 0;
  font-size: 2rem;
  font-weight: 600;
  color: #333;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* Content container */
.content-container {
  display: flex;
  flex: 1;
  overflow: hidden;
  margin: 2rem;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  background: white;
}

/* Sidebar */
.playlist-sidebar {
  width: 300px;
  background: #f8f9fa;
  border-right: 2px solid #e9ecef;
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  overflow-y: auto;
}

.btn-create {
  width: 100%;
  padding: 0.875rem;
  background: #feb503;
  color: #333;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 1rem;
}

.btn-create:hover {
  background: #e5a302;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(254, 181, 3, 0.4);
}

.playlist-list {
  list-style: none;
  padding: 0;
  margin: 0;
  overflow-y: auto;
  flex: 1;
}

.playlist-list li {
  padding: 1rem;
  margin-bottom: 0.5rem;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s;
  border-radius: 8px;
  background: white;
  border: 2px solid transparent;
}

.playlist-list li:hover {
  border-color: #3d5d7e;
  transform: translateX(4px);
}

.playlist-list li.active {
  background: #3d5d7e;
  color: white;
  border-color: #3d5d7e;
  box-shadow: 0 4px 12px rgba(61, 93, 126, 0.4);
}

.playlist-name {
  flex: 1;
  font-weight: 500;
  font-size: 0.95rem;
}

.playlist-list li.active .playlist-name {
  color: white;
}

.playlist-actions {
  display: flex;
  gap: 0.5rem;
  opacity: 0;
  transition: opacity 0.2s;
}

.playlist-list li:hover .playlist-actions {
  opacity: 1;
}

.playlist-list li.active .playlist-actions {
  opacity: 1;
}

.btn-icon {
  background: rgba(255, 255, 255, 0.8);
  border: none;
  cursor: pointer;
  font-size: 0.85rem;
  padding: 0.4rem 0.5rem;
  border-radius: 4px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-edit {
  color: #3d5d7e;
}

.btn-edit:hover {
  background: #3d5d7e;
  color: white;
}

.btn-delete {
  color: #a94a66;
}

.btn-delete:hover {
  background: #a94a66;
  color: white;
}

.playlist-list li.active .btn-icon {
  background: rgba(255, 255, 255, 0.2);
}

.playlist-list li.active .btn-edit:hover {
  background: rgba(255, 255, 255, 0.3);
  color: white;
}

.playlist-list li.active .btn-delete:hover {
  background: #a94a66;
  color: white;
}

/* Songs panel */
.songs-panel {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
  background: white;
}

.empty-selection {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #999;
  font-size: 1.1rem;
}

.playlist-details {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.songs-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e9ecef;
}

.songs-header h2 {
  margin: 0;
  color: #333;
  font-size: 1.5rem;
  font-weight: 600;
}

.btn-add-song {
  padding: 0.625rem 1.25rem;
  background: #feb503;
  color: #333;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-add-song:hover {
  background: #e5a302;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(254, 181, 3, 0.4);
}

.song-list {
  list-style: none;
  padding: 0;
  margin: 0;
  overflow-y: auto;
  flex: 1;
}

.song-item {
  display: flex;
  align-items: center;
  padding: 1rem 1.25rem;
  background: #f8f9fa;
  border: 2px solid transparent;
  border-radius: 12px;
  margin-bottom: 0.75rem;
  transition: all 0.2s;
  user-select: none;
  position: relative;
}

.song-item:hover {
  background: #e9ecef;
  border-color: #3d5d7e;
  transform: translateX(4px);
}

.song-item.dragging {
  opacity: 0.4;
  border: 2px dashed #3d5d7e;
  background: #dee2e6;
  transform: scale(0.98);
  cursor: grabbing;
}

/* Drop indicator */
.drop-indicator {
  position: absolute;
  left: 0;
  right: 0;
  height: 3px;
  background: #feb503;
  border-radius: 2px;
  box-shadow: 0 0 8px rgba(254, 181, 3, 0.6);
  z-index: 10;
  pointer-events: none;
}

.drop-indicator.drop-above {
  top: -2px;
}

.drop-indicator.drop-below {
  bottom: -2px;
}

.song-item.drop-target {
  background: rgba(254, 181, 3, 0.1);
}

.drag-handle {
  color: #999;
  margin-right: 1rem;
  cursor: grab;
  font-size: 1rem;
  user-select: none;
  transition: color 0.2s;
}

.drag-handle:hover {
  color: #3d5d7e;
}

.song-item:active .drag-handle {
  cursor: grabbing;
}

.song-id {
  flex: 1;
  color: #495057;
  font-size: 0.95rem;
  font-weight: 500;
}

/* Song details display */
.song-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
}

.song-title-display {
  font-weight: 600;
  font-size: 1rem;
  color: #212529;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-meta-display {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #6c757d;
}

.song-artist-display {
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.meta-separator {
  color: #dee2e6;
  flex-shrink: 0;
}

.song-country-display {
  color: #3d5d7e;
  font-weight: 500;
  white-space: nowrap;
  flex-shrink: 0;
}

.btn-remove {
  background: #a94a66;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.4rem 0.8rem;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-remove:hover {
  background: #8d3d54;
  transform: scale(1.05);
}

/* Modals */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  padding: 2.5rem;
  border-radius: 16px;
  min-width: 450px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  animation: modalSlideIn 0.3s ease-out;
}

.modal-large {
  min-width: 600px;
  max-width: 700px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal h3 {
  margin: 0 0 1.5rem 0;
  color: #333;
  font-size: 1.5rem;
  font-weight: 600;
}

.modal input {
  width: 100%;
  padding: 0.875rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 1rem;
  margin-bottom: 1.5rem;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.modal input:focus {
  outline: none;
  border-color: #3d5d7e;
}

.modal-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

.btn-cancel {
  padding: 0.75rem 1.5rem;
  background: #e9ecef;
  color: #495057;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover {
  background: #dee2e6;
  transform: translateY(-1px);
}

.btn-primary {
  padding: 0.75rem 1.5rem;
  background: #3d5d7e;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover {
  background: #2f4a63;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(61, 93, 126, 0.4);
}

/* Loading and empty states */
.loading {
  text-align: center;
  padding: 3rem;
  color: #999;
  font-size: 1rem;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #999;
  font-size: 1rem;
}

.empty-state p {
  margin: 0;
}

/* Modal Tabs */
.modal-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #e9ecef;
}

.tab-button {
  flex: 1;
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  color: #6c757d;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.95rem;
}

.tab-button:hover {
  color: #3d5d7e;
  background: rgba(61, 93, 126, 0.05);
}

.tab-button.active {
  color: #3d5d7e;
  border-bottom-color: #feb503;
}

/* Modal Content */
.modal-content {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.tab-content {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

/* Song List in Modal */
.song-list-modal {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  overflow-y: auto;
  max-height: 400px;
  padding-right: 0.5rem;
}

.song-item-modal {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: #f8f9fa;
  border: 2px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.song-item-modal:hover {
  background: #e9ecef;
  border-color: #3d5d7e;
  transform: translateX(4px);
}

.song-info {
  flex: 1;
  min-width: 0;
}

.song-title {
  font-weight: 600;
  font-size: 1rem;
  color: #212529;
  margin-bottom: 0.25rem;
}

.song-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #6c757d;
}

.song-artist {
  font-weight: 500;
}

.song-separator {
  color: #dee2e6;
}

.song-country {
  color: #3d5d7e;
  font-weight: 500;
}

.btn-add-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #feb503;
  color: #333;
  border: none;
  font-size: 1.5rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.btn-add-icon:hover {
  background: #e5a302;
  transform: scale(1.1);
}

/* Search Input */
.search-input {
  width: 100%;
  padding: 0.875rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 1rem;
  margin-bottom: 1rem;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.search-input:focus {
  outline: none;
  border-color: #3d5d7e;
}

/* Manual Entry */
.input-label {
  display: block;
  font-weight: 600;
  color: #495057;
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
}

.manual-input {
  width: 100%;
  padding: 0.875rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 1rem;
  margin-bottom: 0.5rem;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.manual-input:focus {
  outline: none;
  border-color: #3d5d7e;
}

.input-hint {
  color: #6c757d;
  font-size: 0.875rem;
  margin: 0 0 1.5rem 0;
}

/* Loading and Empty States in Modal */
.loading-songs {
  text-align: center;
  padding: 3rem;
  color: #6c757d;
  font-size: 1rem;
}

.empty-history,
.empty-search {
  text-align: center;
  padding: 3rem;
  color: #6c757d;
}

.empty-history p,
.empty-search p {
  margin: 0;
  font-size: 1rem;
}

/* Modal Footer */
.modal-footer {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 2px solid #e9ecef;
  display: flex;
  justify-content: flex-end;
}

/* Scrollbar for modal lists */
.song-list-modal::-webkit-scrollbar {
  width: 6px;
}

.song-list-modal::-webkit-scrollbar-track {
  background: transparent;
}

.song-list-modal::-webkit-scrollbar-thumb {
  background: rgba(61, 93, 126, 0.3);
  border-radius: 3px;
}

.song-list-modal::-webkit-scrollbar-thumb:hover {
  background: rgba(61, 93, 126, 0.5);
}

/* Confirmation Modal */
.modal-confirm {
  max-width: 400px;
  text-align: center;
}

.confirm-icon {
  font-size: 3.5rem;
  margin-bottom: 1rem;
  color: #feb503;
}

.confirm-message {
  font-size: 1.1rem;
  color: #495057;
  margin: 0 0 2rem 0;
  line-height: 1.5;
}

.modal-actions-center {
  justify-content: flex-end;
}

.btn-confirm {
  padding: 0.75rem 1.5rem;
  background: #a94a66;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-confirm:hover {
  background: #8d3d54;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(169, 74, 102, 0.4);
}

</style>
