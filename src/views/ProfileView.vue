<script setup>
import Globe from '../components/Globe.vue';
import { onMounted, ref, computed } from 'vue';
import gsap from 'gsap';
import { useAuthStore } from '../stores/auth.js';

const authStore = useAuthStore();
const passport = ref(null);

// State to track which sheet is currently the "top" one on the left stack.
// -1 means book is closed (no sheets on left).
// 0 means cover is open (Cover sheet is on left).
// 1 means Page 1 is turned (Sheet 1 is on left).
const currentSheetIndex = ref(-1); 
const isAnimating = ref(false);

const totalSheets = 5; // Cover + 3 internal sheets + Back Cover

// Z-Index calculation for a sheet
const getZIndex = (index) => {
  if (index <= currentSheetIndex.value) {
    // Sheet is on the left side. Higher index should be on top.
    return index + 1;
  } else {
    // Sheet is on the right side. Lower index should be on top.
    return totalSheets - index;
  }
};

const turnPage = (direction) => {
  if (isAnimating.value) return;

  if (direction === 'next') {
    // We want to turn the next available sheet on the right (currentSheetIndex + 1) to the left
    const sheetToTurn = currentSheetIndex.value + 1;
    if (sheetToTurn >= totalSheets) return; // No more sheets

    isAnimating.value = true;
    
    // Animate sheetToTurn from 0 to -180
    gsap.to(`.sheet-${sheetToTurn}`, {
      rotationY: -180,
      duration: 1.2,
      ease: "power2.inOut",
      onStart: () => {
        // Ensure it lifts slightly above others during turn (optional visual tweak)
        gsap.set(`.sheet-${sheetToTurn}`, { zIndex: totalSheets + 10 });
      },
      onComplete: () => {
        currentSheetIndex.value = sheetToTurn;
        // Reset z-index logic to standard stacking
        // We force a reactivity update or allow Vue to handle it, 
        // but we might need to manually apply the new static z-index if Vue hasn't updated yet.
        isAnimating.value = false;
      }
    });

    // Shift passport center logic
    if (currentSheetIndex.value === -1) {
       // Opening the book (first turn), shift to center
       gsap.to(passport.value, {
         x: 160,
         duration: 1.2,
         ease: "power2.inOut"
       });
    }

    // Logic for closing the BACK cover (last sheet turned)
    if (sheetToTurn === totalSheets - 1) {
       gsap.to(passport.value, {
         x: 320, // Shift RIGHT to center the left-hanging stack (closed back)
         duration: 1.2,
         ease: "power2.inOut"
       });
    }

  } else if (direction === 'prev') {
    // We want to turn the current top-left sheet back to the right
    const sheetToTurn = currentSheetIndex.value;
    if (sheetToTurn < 0) return; // Book is closed

    isAnimating.value = true;

    gsap.to(`.sheet-${sheetToTurn}`, {
      rotationY: 0,
      duration: 1.2,
      ease: "power2.inOut",
      onStart: () => {
        gsap.set(`.sheet-${sheetToTurn}`, { zIndex: totalSheets + 10 });
      },
      onComplete: () => {
        currentSheetIndex.value = sheetToTurn - 1;
        isAnimating.value = false;
      }
    });

    // Close book logic (Front Cover)
    if (sheetToTurn === 0) {
      // Closing the front cover, shift back
       gsap.to(passport.value, {
         x: 0,
         duration: 1.2,
         ease: "power2.inOut"
       });
    }

    // Re-open from Back Cover logic
    // If we are unturning the last sheet (Back Cover), we need to shift back to "open book" center (160)
    // from the closed back position (320)
    if (sheetToTurn === totalSheets - 1) {
       gsap.to(passport.value, {
         x: 160,
         duration: 1.2,
         ease: "power2.inOut"
       });
    }
  }
};

onMounted(() => {
  // Initial animation: Open the passport (Turn Sheet 0)
  setTimeout(() => {
    turnPage('next');
  }, 800);
});
</script>

<template>
  <div class="profile">
    <Globe />
    
    <div class="passport-stage">
      <div class="passport" ref="passport">
        
        <!-- Sheets Loop -->
        <div 
          v-for="(n, index) in totalSheets" 
          :key="index" 
          class="sheet"
          :class="`sheet-${index}`"
          :style="{ zIndex: getZIndex(index) }"
        >
          
          <!-- FRONT FACE (Content when on RIGHT side) -->
          <div class="face front">
            
            <!-- Sheet 0 Front: COVER -->
            <div v-if="index === 0" class="cover-design front-cover">
              <div class="gold-print">
                <h1>PASSPORT</h1>
                <div class="seal-container">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/5/5c/Great_Seal_of_the_United_States_%28obverse%29.svg" alt="Seal" />
                </div>
                <h2>United States<br>of America</h2>
                <div class="biometric-symbol">
                  <svg viewBox="0 0 50 35" width="40" height="28">
                    <circle cx="25" cy="17.5" r="3" fill="#FFD700"/>
                    <path d="M10,17.5 H20 M30,17.5 H40" stroke="#FFD700" stroke-width="2"/>
                    <rect x="5" y="5" width="40" height="25" rx="5" stroke="#FFD700" stroke-width="2" fill="none"/>
                  </svg>
                </div>
              </div>
            </div>

            <!-- Sheet 1 Front: DATA PAGE -->
            <div v-else-if="index === 1" class="page-design data-page">
              <div class="passport-header">
                <span class="type">P</span>
                <span class="code">USA</span>
                <span class="no">123456789</span>
              </div>
              
              <div class="data-grid">
                <div class="photo-area">
                  <div class="photo-box">
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User Photo" />
                  </div>
                </div>
                
                <div class="details">
                  <div class="field">
                    <label>Username</label>
                    <div class="value">{{ authStore.username }}</div>
                  </div>
                  <div class="field">
                    <label>Nationality</label>
                    <div class="value">UNITED STATES OF AMERICA</div>
                  </div>
                  <div class="field row">
                    <div>
                      <label>Sex</label>
                      <div class="value">X</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="mrz">
                P&lt;USA{{ (authStore.username || 'TRAVELER').toUpperCase() }}&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;<br/>
                1234567897USA0001018M301010&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;06
              </div>
            </div>

            <!-- Last Sheet Front: Inside Back Cover -->
            <div v-else-if="index === totalSheets - 1" class="cover-design inside-cover">
               <div class="inner-cover-design back-inside">
                 <p class="quote">
                   "We hold these truths to be self-evident, that all men are created equal, that they are endowed by their Creator with certain unalienable Rights..."
                 </p>
                 <p class="important-notice">
                   IMPORTANT: This passport is the property of the United States Government. It must be surrendered upon demand.
                 </p>
               </div>
            </div>

            <!-- Sheets > 1 Front: VISAS (Right Side) -->
            <div v-else class="page-design stamps-page">
               <h3>Visas</h3>
               <div class="stamps-grid">
                 <div class="stamp" v-for="i in 4" :key="'front-stamp-'+index+'-'+i"></div>
               </div>
               <!-- Page Number Logic: Sheet 2 Front is Page 3, Sheet 3 Front is Page 5 -->
               <div class="page-number">{{ (index - 1) * 2 + 1 }}</div>
            </div>

          </div>

          <!-- BACK FACE (Content when on LEFT side) -->
          <div class="face back">
            
            <!-- Sheet 0 Back: INSIDE COVER -->
            <div v-if="index === 0" class="cover-design inside-cover">
              <div class="inner-cover-design">
                <p class="quote">
                  "The liberties of our country, the freedom of our civil constitution, are worth defending against all hazards: And it is our duty to defend them against all attacks."
                </p>
                <p class="author">- Samuel Adams</p>
                <div class="signature">
                  <span>Secretary of State</span>
                </div>
              </div>
            </div>
            
            <!-- Last Sheet Back: Back Cover External -->
            <div v-else-if="index === totalSheets - 1" class="cover-design front-cover back-outer">
              <!-- Back cover is usually plain or has minimal branding -->
              <div class="gold-print back-center">
                 <div class="biometric-symbol large">
                  <svg viewBox="0 0 50 35" width="80" height="56">
                    <circle cx="25" cy="17.5" r="3" fill="#FFD700"/>
                    <path d="M10,17.5 H20 M30,17.5 H40" stroke="#FFD700" stroke-width="2"/>
                    <rect x="5" y="5" width="40" height="25" rx="5" stroke="#FFD700" stroke-width="2" fill="none"/>
                  </svg>
                </div>
                <p class="back-text">PASSPORT</p>
              </div>
            </div>

            <!-- Sheet > 0 Back: VISAS (Left Side) -->
            <div v-else class="page-design stamps-page left-side">
               <h3>Visas</h3>
               <div class="stamps-grid">
                 <div class="stamp" v-for="i in 4" :key="'back-stamp-'+index+'-'+i"></div>
               </div>
               <!-- Page Number Logic: Sheet 1 Back is Page 2, Sheet 2 Back is Page 4 -->
               <div class="page-number left">{{ index * 2 }}</div>
            </div>

          </div>

        </div>

      </div>
      
      <div class="passport-controls">
        <button @click="turnPage('prev')" :disabled="isAnimating || currentSheetIndex < 0" class="control-btn">
          &larr;
        </button>
        <button @click="turnPage('next')" :disabled="isAnimating || currentSheetIndex >= totalSheets - 1" class="control-btn">
          &rarr;
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Courier+Prime:wght@400;700&family=Libre+Baskerville:wght@400;700&display=swap');

.profile {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  margin: 0;
  padding: 0;
  position: fixed;
  top: 0;
  left: 0;
  background: #0f172a; 
}

.passport-stage {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  perspective: 2000px; /* Increased perspective for better 3D */
  z-index: 10;
}

.passport {
  width: 320px;
  height: 460px;
  position: relative;
  transform-style: preserve-3d; /* Essential for children to rotate in 3D space */
}

/* --- SHEETS --- */
.sheet {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transform-origin: left center; /* Pivot on spine */
  transition: z-index 0.1s; /* Helper for z-index swaps */
}

.face {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  backface-visibility: hidden; /* Hide back when facing away */
  -webkit-backface-visibility: hidden;
}

.face.front {
  /* Default front styling */
  background: white;
  transform: rotateY(0deg);
}

.face.back {
  /* Default back styling */
  background: white;
  transform: rotateY(180deg);
}

/* --- DESIGNS --- */
.cover-design.front-cover {
  background-color: #0d1b2a; 
  background-image: linear-gradient(135deg, #132238 0%, #0a1520 100%);
  color: #FFD700;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 40px 20px;
  box-sizing: border-box;
  box-shadow: inset 3px 0 10px rgba(0,0,0,0.5);
  border-left: 5px solid #081018;
  border-radius: 2px 5px 5px 2px;
  width: 100%;
  height: 100%;
}

.cover-design.inside-cover {
  background-color: #fdfbf7;
  background-image: url('https://www.transparenttextures.com/patterns/cream-paper.png');
  padding: 30px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  border-right: 5px solid #ddd;
  box-shadow: inset -10px 0 20px -10px rgba(0,0,0,0.1);
  border-radius: 5px 0 0 5px;
  width: 100%;
  height: 100%;
}

.page-design {
  background: #fdfbf7;
  background-image: radial-gradient(#e6e6e6 1px, transparent 1px); 
  background-size: 10px 10px;
  padding: 20px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  font-family: 'Courier Prime', monospace;
  color: #333;
  width: 100%;
  height: 100%;
  box-shadow: inset 10px 0 20px -10px rgba(0,0,0,0.2); /* Shadow near spine */
  border-radius: 0 5px 5px 0;
}

.page-design.left-side {
  border-radius: 5px 0 0 5px;
  box-shadow: inset -10px 0 20px -10px rgba(0,0,0,0.2);
  border-right: 1px solid #eee;
}

/* CONTENT STYLES (Reused) */
.gold-print {
  text-align: center;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  justify-content: space-between;
}

.gold-print h1 {
  font-family: 'Libre Baskerville', serif;
  font-size: 2rem;
  letter-spacing: 2px;
  margin: 0;
  text-shadow: 0 1px 2px rgba(0,0,0,0.5);
}

.gold-print h2 {
  font-family: 'Libre Baskerville', serif;
  font-size: 1.2rem;
  text-transform: uppercase;
  margin: 0;
  letter-spacing: 1px;
}

.seal-container {
  width: 120px;
  height: 120px;
  margin: 20px 0;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
}

.seal-container img {
  width: 100%;
  height: 100%;
  filter: sepia(100%) saturate(500%) brightness(90%) hue-rotate(5deg);
}

.biometric-symbol {
  margin-top: 20px;
  opacity: 0.8;
}

.inner-cover-design {
  border: 3px double #0d1b2a;
  padding: 20px;
  height: 90%;
  width: 90%;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.quote {
  font-family: 'Libre Baskerville', serif;
  font-style: italic;
  font-size: 0.9rem;
  line-height: 1.6;
  color: #0d1b2a;
}

.author {
  margin-top: 15px;
  font-weight: bold;
  font-size: 0.8rem;
}

.signature {
  margin-top: auto;
  border-top: 1px solid #333;
  padding-top: 5px;
  font-size: 0.7rem;
  text-transform: uppercase;
}

.passport-header {
  display: flex;
  justify-content: space-between;
  font-weight: bold;
  margin-bottom: 15px;
  border-bottom: 2px solid #333;
  padding-bottom: 5px;
}

.data-grid {
  display: flex;
  gap: 15px;
}

.photo-area { width: 100px; }
.photo-box {
  width: 100%;
  height: 130px;
  background: #eee;
  border: 1px solid #ccc;
  overflow: hidden;
}
.photo-box img { width: 100%; height: 100%; object-fit: cover; }

.details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field label {
  display: block;
  font-size: 0.6rem;
  color: #666;
  text-transform: uppercase;
}

.field .value {
  font-weight: bold;
  font-size: 0.9rem;
}

.field.row { display: flex; gap: 20px; }

.mrz {
  position: absolute;
  bottom: 15px;
  left: 15px;
  right: 15px;
  font-family: 'Courier New', monospace;
  font-weight: bold;
  font-size: 0.85rem;
  line-height: 1.2;
  letter-spacing: 2px;
  white-space: nowrap;
  overflow: hidden;
}

.stamps-page h3 {
  margin-top: 0;
  text-align: center;
  text-transform: uppercase;
  border-bottom: 1px solid #ccc;
  padding-bottom: 10px;
  color: #0d1b2a;
}

.stamps-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 20px;
  height: 300px;
  margin-top: 20px;
}

.stamp {
  border: 2px dashed #ccc;
  border-radius: 10px;
  opacity: 0.5;
}

.page-number {
  position: absolute;
  bottom: 10px;
  right: 20px;
  font-size: 0.8rem;
  color: #666;
}

.page-number.left {
  left: 20px;
  right: auto;
}

.passport-controls {
  position: absolute;
  bottom: calc(50% - 280px);
  left: 50%; 
  transform: translateX(220px);
  display: flex;
  gap: 15px;
  z-index: 20;
}

.control-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.2rem;
  transition: all 0.3s ease;
}

.control-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.cover-design.back-outer {
  border-left: none;
  border-right: 5px solid #081018; /* Spine on right when closed back */
  border-radius: 5px 2px 2px 5px;
  transform: rotateY(180deg); /* Pre-rotated content correction if needed, though face handles it */
}

.back-center {
  justify-content: center;
  gap: 20px;
}

.back-text {
  font-family: 'Libre Baskerville', serif;
  color: #FFD700;
  letter-spacing: 2px;
  font-size: 1.2rem;
}

.inner-cover-design.back-inside {
  font-size: 0.8rem;
  text-align: center;
  justify-content: space-around;
}

.important-notice {
  font-weight: bold;
  color: #d00;
  border: 2px solid #d00;
  padding: 10px;
  margin-top: 20px;
  text-transform: uppercase;
  font-size: 0.7rem;
}
</style>
