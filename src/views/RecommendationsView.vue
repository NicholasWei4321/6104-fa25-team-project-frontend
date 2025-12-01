<script setup>
import { ref, onMounted } from "vue";
import SongCard from "@/components/SongCard.vue";
import { getSystemRecs } from "@/api/recommendations.js";

// const ourPicks = ref([]);
// const communityPicks = ref([]);

// Temporary hardcoded data
const country = "Taiwan";

const ourPicks = [
  {
    title: "Imagine",
    artist: "John Lennon",
    genre: "Rock",
    language: "English",
    youtubeUrl: "https://www.youtube.com/watch?v=YkgkThdzX-8",
  },
  {
    title: "Shape of You",
    artist: "Ed Sheeran",
    genre: "Pop",
    language: "English",
    youtubeUrl: "https://www.youtube.com/watch?v=JGwWNGJdvx8",
  },
  {
    title: "Bohemian Rhapsody",
    artist: "Queen",
    genre: "Rock",
    language: "English",
    youtubeUrl: "https://www.youtube.com/watch?v=fJ9rUzIMcZQ",
  },
];

const communityPicks = [
  {
    title: "Despacito",
    artist: "Luis Fonsi",
    genre: "Reggaeton",
    language: "Spanish",
    youtubeUrl: "https://www.youtube.com/watch?v=kJQP7kiw5Fk",
  },
  {
    title: "Gangnam Style",
    artist: "PSY",
    genre: "K-Pop",
    language: "Korean",
    youtubeUrl: "https://www.youtube.com/watch?v=9bZkp7q19f0",
  },
];

// onMounted(async () => {
//   try {
//     const recs = await getSystemRecs(country);
//     ourPicks.value = recs || [];
//   } catch (e) {
//     console.error('Failed to fetch system recommendations', e);
//     ourPicks.value = [];
//   }
// });
</script>

<template>
  <div class="recommendations">
    <div class="display-box">
      <div class="title-container">
        <!-- TODO: "Country" to be changed to country name that is passed in as a prop -->
        <h1>{{ country }}</h1>
      </div>
      <div class="main-container">
        <div class="panel-container">
          <h1>Our Picks</h1>
          <div class="song-container">
            <SongCard
              v-for="s in ourPicks"
              :key="s.title"
              :title="s.title"
              :artist="s.artist"
              :genre="s.genre"
              :language="s.language"
              :youtube-url="s.youtubeUrl"
            />
          </div>
        </div>
        <div class="panel-container">
          <h1>Community Picks</h1>
          <div class="song-container">
            <SongCard
              v-for="s in communityPicks"
              :key="s.title"
              :title="s.title"
              :artist="s.artist"
              :genre="s.genre"
              :language="s.language"
              :youtube-url="s.youtubeUrl"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* temporary background */
.recommendations {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100vh;
  background: darkred;
}
.display-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
  background: rgba(253, 254, 255, 0.8);
  backdrop-filter: blur(12px);
  padding: 1rem;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 15px 15px 40px -5px rgba(0, 0, 0, 0.3);
  color: white;
  text-align: center;
  width: 70%;
  height: 80%;
  overflow: auto;
}

.title-container {
  background-color: coral;
  display: flex;
  /* padding: 0.5rem; */
}
.title-container h1 {
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  font-size: 2.5rem;
  font-weight: 600;
  margin: 0;
  color: #38bdf8;
  letter-spacing: 0.05em;
}

.main-container {
  background-color: blue;
  display: flex;
  flex-direction: row;
  gap: 2rem;
  /* align-items: center; */
  justify-content: space-around;
  padding: 1rem;
  flex: 1;
  max-width: 100%;
  width: 100%;
  height: 100%;
  max-height: 100%;
  min-height: 0%;
}

.panel-container {
  background-color: green;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: start;
  gap: 1rem;
  padding: 1rem;
  flex: 1;
}
.panel-container h1 {
  /* font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif; */
  font-size: 2rem;
  font-weight: 600;
  margin: 0;
  color: white;
  letter-spacing: 0.05em;
}

.song-container {
  background-color: lightseagreen;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow-y: auto;
  scrollbar-gutter: stable;
  scrollbar-width: thin;
  width: 100%;
  max-width: 100%;
}

/* Webkit browsers */
.song-container::-webkit-scrollbar {
  width: 6px; /* width of scrollbar */
}

.song-container::-webkit-scrollbar-track {
  background: transparent; /* hide the track */
}

.song-container::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.25); /* simple thumb */
  border-radius: 4px;
}

/* Thumb hover effect */
.song-container::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.4);
}

/* Remove arrows */
.song-container::-webkit-scrollbar-button {
  display: none;
}
</style>
