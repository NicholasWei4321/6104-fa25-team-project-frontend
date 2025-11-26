<script setup>
import { ref, onMounted, computed } from 'vue';
import { usePlaylistStore } from '../stores/playlist.js';
import { useAuthStore } from '../stores/auth.js';

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

// Computed
const sortedPlaylists = computed(() => {
  return [...playlistStore.playlists].sort((a, b) => a.name.localeCompare(b.name));
});

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
    alert('Failed to load playlists: ' + (error.response?.data?.error || error.message));
  }
}

async function handleCreatePlaylist() {
  if (!newPlaylistName.value.trim()) {
    alert('Please enter a playlist name');
    return;
  }

  try {
    await playlistStore.createPlaylist(newPlaylistName.value);
    newPlaylistName.value = '';
    showCreateModal.value = false;
  } catch (error) {
    alert(playlistStore.error || 'Failed to create playlist');
  }
}

async function handleDeletePlaylist(playlistId) {
  if (!confirm('Are you sure you want to delete this playlist?')) {
    return;
  }

  try {
    await playlistStore.deletePlaylist(playlistId);
    if (selectedPlaylist.value === playlistId) {
      selectedPlaylist.value = null;
    }
  } catch (error) {
    alert(playlistStore.error || 'Failed to delete playlist');
  }
}

function openRenameModal(playlist) {
  playlistToRename.value = playlist.playlist;
  renamePlaylistName.value = playlist.name;
  showRenameModal.value = true;
}

async function handleRenamePlaylist() {
  if (!renamePlaylistName.value.trim()) {
    alert('Please enter a new playlist name');
    return;
  }

  try {
    await playlistStore.renamePlaylist(playlistToRename.value, renamePlaylistName.value);
    showRenameModal.value = false;
    playlistToRename.value = null;
    renamePlaylistName.value = '';
  } catch (error) {
    alert(playlistStore.error || 'Failed to rename playlist');
  }
}

async function selectPlaylist(playlistId) {
  selectedPlaylist.value = playlistId;
  try {
    await playlistStore.fetchPlaylistDetails(playlistId);
  } catch (error) {
    alert('Failed to load playlist details');
  }
}

async function handleAddSong() {
  if (!newSongId.value.trim()) {
    alert('Please enter a song ID');
    return;
  }

  try {
    await playlistStore.addSong(selectedPlaylist.value, newSongId.value);
    newSongId.value = '';
    showAddSongModal.value = false;
  } catch (error) {
    alert(playlistStore.error || 'Failed to add song');
  }
}

async function handleRemoveSong(songId) {
  if (!confirm('Remove this song from the playlist?')) {
    return;
  }

  try {
    await playlistStore.removeSong(selectedPlaylist.value, songId);
  } catch (error) {
    alert(playlistStore.error || 'Failed to remove song');
  }
}

// Drag and drop for reordering
function handleDragStart(index) {
  draggedSongIndex.value = index;
}

function handleDragOver(event) {
  event.preventDefault();
}

async function handleDrop(dropIndex) {
  if (draggedSongIndex.value === null || draggedSongIndex.value === dropIndex) {
    return;
  }

  const songs = [...playlistStore.currentPlaylist.songs];
  const draggedSong = songs[draggedSongIndex.value];

  // Remove from old position
  songs.splice(draggedSongIndex.value, 1);

  // Insert at new position
  songs.splice(dropIndex, 0, draggedSong);

  try {
    await playlistStore.reorderSongs(selectedPlaylist.value, songs);
    draggedSongIndex.value = null;
  } catch (error) {
    alert(playlistStore.error || 'Failed to reorder songs');
  }
}

function handleDragEnd() {
  draggedSongIndex.value = null;
}
</script>

<template>
  <div class="playlist-container">
    <!-- Sidebar with playlist list -->
    <aside class="playlist-sidebar">
      <div class="sidebar-header">
        <h2>Playlists</h2>
        <button @click="showCreateModal = true" class="btn-create">
          + New Playlist
        </button>
      </div>

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
            <button @click.stop="openRenameModal(playlist)" class="btn-icon" title="Rename">
              ✏️
            </button>
            <button @click.stop="handleDeletePlaylist(playlist.playlist)" class="btn-icon" title="Delete">
              🗑️
            </button>
          </div>
        </li>
      </ul>

      <div v-if="!playlistStore.loading && sortedPlaylists.length === 0" class="empty-state">
        <p>No playlists yet.</p>
      </div>
    </aside>

    <!-- Main content area showing selected playlist details -->
    <main class="playlist-main">
      <div v-if="!selectedPlaylist" class="empty-selection">
        <p>Select a playlist to view songs</p>
      </div>

      <div v-else-if="playlistStore.loadingPlaylist" class="loading">
        Loading playlist...
      </div>

      <div v-else-if="playlistStore.currentPlaylist" class="playlist-details">
        <header class="playlist-header">
          <h1>{{ playlistStore.currentPlaylist.name }}</h1>
          <button @click="showAddSongModal = true" class="btn-add-song">
            + Add Song
          </button>
        </header>

        <div v-if="!playlistStore.hasCurrentPlaylistSongs" class="empty-state">
          <p>No songs in this playlist.</p>
        </div>

        <ul v-else class="song-list">
          <li
            v-for="(song, index) in playlistStore.currentPlaylist.songs"
            :key="song"
            draggable="true"
            @dragstart="handleDragStart(index)"
            @dragover="handleDragOver"
            @drop="handleDrop(index)"
            @dragend="handleDragEnd"
            :class="{ dragging: draggedSongIndex === index }"
            class="song-item"
          >
            <span class="drag-handle">⋮⋮</span>
            <span class="song-id">{{ song }}</span>
            <button @click="handleRemoveSong(song)" class="btn-remove" title="Remove">
              ✕
            </button>
          </li>
        </ul>
      </div>
    </main>

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
      <div class="modal" @click.stop>
        <h3>Add Song</h3>
        <input
          v-model="newSongId"
          type="text"
          placeholder="Song ID"
          @keyup.enter="handleAddSong"
          autofocus
        />
        <div class="modal-actions">
          <button @click="showAddSongModal = false" class="btn-cancel">Cancel</button>
          <button @click="handleAddSong" class="btn-primary">Add</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.playlist-container {
  display: flex;
  height: calc(100vh - 60px);
  background: #f5f5f5;
}

/* Sidebar */
.playlist-sidebar {
  width: 280px;
  background: white;
  border-right: 1px solid #ddd;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 1.5rem;
  border-bottom: 1px solid #ddd;
}

.sidebar-header h2 {
  margin: 0 0 1rem 0;
  color: #333;
  font-size: 1.25rem;
  font-weight: 600;
}

.btn-create {
  width: 100%;
  padding: 0.75rem;
  background: #333;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-create:hover {
  background: #555;
}

.playlist-list {
  list-style: none;
  padding: 0;
  margin: 0;
  overflow-y: auto;
  flex: 1;
}

.playlist-list li {
  padding: 0.875rem 1.5rem;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background 0.15s;
  border-bottom: 1px solid #f0f0f0;
}

.playlist-list li:hover {
  background: #f5f5f5;
}

.playlist-list li.active {
  background: #e8e8e8;
  font-weight: 500;
}

.playlist-name {
  flex: 1;
  color: #333;
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

.btn-icon {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
  padding: 0.25rem;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.btn-icon:hover {
  opacity: 1;
}

/* Main content */
.playlist-main {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
}

.empty-selection {
  text-align: center;
  color: #999;
  margin-top: 3rem;
}

.empty-selection p {
  font-size: 1rem;
}

.playlist-details {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.playlist-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #ddd;
}

.playlist-header h1 {
  margin: 0;
  color: #333;
  font-size: 1.5rem;
  font-weight: 600;
}

.btn-add-song {
  padding: 0.625rem 1.25rem;
  background: #333;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-add-song:hover {
  background: #555;
}

.song-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.song-item {
  display: flex;
  align-items: center;
  padding: 0.875rem;
  background: #fafafa;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  margin-bottom: 0.5rem;
  cursor: move;
  transition: background 0.15s;
}

.song-item:hover {
  background: #f0f0f0;
}

.song-item.dragging {
  opacity: 0.5;
}

.drag-handle {
  color: #999;
  margin-right: 0.875rem;
  cursor: grab;
  font-size: 0.875rem;
}

.song-id {
  flex: 1;
  font-family: monospace;
  color: #555;
  font-size: 0.9rem;
}

.btn-remove {
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 3px;
  padding: 0.25rem 0.625rem;
  cursor: pointer;
  font-size: 0.875rem;
  transition: background 0.2s;
}

.btn-remove:hover {
  background: #c82333;
}

/* Modals */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  min-width: 400px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

.modal h3 {
  margin: 0 0 1.25rem 0;
  color: #333;
  font-size: 1.25rem;
  font-weight: 600;
}

.modal input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  margin-bottom: 1.5rem;
  transition: border-color 0.2s;
}

.modal input:focus {
  outline: none;
  border-color: #333;
}

.modal-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

.btn-cancel {
  padding: 0.625rem 1.25rem;
  background: #e0e0e0;
  color: #333;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-cancel:hover {
  background: #d0d0d0;
}

.btn-primary {
  padding: 0.625rem 1.25rem;
  background: #333;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-primary:hover {
  background: #555;
}

/* Loading and empty states */
.loading {
  text-align: center;
  padding: 2rem;
  color: #999;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: #999;
}

.empty-state p {
  margin: 0;
}
</style>
