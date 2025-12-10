<template>
  <div class="globe-wrapper">
    <div ref="container" class="globe-container"></div>
    <div
      v-if="tooltip.visible"
      class="globe-tooltip"
      :style="{
        left: tooltip.x + 'px',
        top: tooltip.y + 'px',
      }"
    >
      <div class="tooltip-content">
        <strong>{{ tooltip.content }}</strong>
        <div v-if="tooltip.subContent" class="tooltip-sub">
          {{ tooltip.subContent }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
// import { useRouter } from 'vue-router';
const emit = defineEmits(["select-country"]);
import Globe from "globe.gl";
import * as THREE from "three";

// const router = useRouter();

const container = ref(null);
const tooltip = ref({
  visible: false,
  content: "",
  subContent: "",
  x: 0,
  y: 0,
});

let world;
let countriesData = []; // Store countries data for random selection
let autoRotateTimeout = null;
let isUserInteracting = false;

onMounted(() => {
  // Initialize Globe
  world = Globe()(container.value)
    .globeImageUrl(
      "https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
    )
    .bumpImageUrl(
      "https://unpkg.com/three-globe/example/img/earth-topology.png"
    )
    .backgroundColor("#000000") // Use solid color instead of image
    .showAtmosphere(true)
    .atmosphereColor("#3a228a")
    .atmosphereAltitude(0.25)
    .width(container.value.clientWidth)
    .height(container.value.clientHeight);

  // Add custom stars
  const starGeometry = new THREE.BufferGeometry();
  const starMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.5,
    transparent: true,
    opacity: 0.4, // Reduced opacity as requested
  });

  const starCount = 5000; // Adjust count as needed
  const starPositions = new Float32Array(starCount * 3);

  for (let i = 0; i < starCount; i++) {
    const x = (Math.random() - 0.5) * 2000;
    const y = (Math.random() - 0.5) * 2000;
    const z = (Math.random() - 0.5) * 2000;
    starPositions[i * 3] = x;
    starPositions[i * 3 + 1] = y;
    starPositions[i * 3 + 2] = z;
  }

  starGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(starPositions, 3)
  );
  const stars = new THREE.Points(starGeometry, starMaterial);
  world.scene().add(stars);

  // Fetch Country Data
  fetch(
    "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson"
  )
    .then((res) => res.json())
    .then((countries) => {
      // Filter countries by minimum population to ensure there's likely music content
      const MIN_POPULATION = 500000; // 1 million

      countriesData = countries.features.filter((d) => {
        // Exclude Antarctica
        if (d.properties.ISO_A2 === "AQ") return false;

        // Exclude countries with population below threshold
        const population = d.properties.POP_EST || 0;
        if (population < MIN_POPULATION) return false;

        return true;
      });

      console.log(`Loaded ${countriesData.length} countries for random selection (population > ${MIN_POPULATION.toLocaleString()})`);

      world
        .polygonsData(countriesData)
        .polygonAltitude(0.01)
        .polygonCapColor(() => "rgba(0,0,0,0)")
        .polygonSideColor(() => "rgba(0,0,0,0)")
        .polygonStrokeColor(() => "#111")
        .polygonLabel(() => null) // Disable default tooltip to use our custom one
        .onPolygonHover((hoverD) => {
          // Update styles
          world
            .polygonCapColor((d) =>
              d === hoverD ? "rgba(70, 130, 180, 0.6)" : "rgba(0,0,0,0)"
            )
            .polygonSideColor((d) =>
              d === hoverD ? "rgba(70, 130, 180, 0.15)" : "rgba(0,0,0,0)"
            )
            .polygonStrokeColor((d) => (d === hoverD ? "#30d5c8" : "#111")) // Highlight border
            .polygonAltitude((d) => (d === hoverD ? 0.06 : 0.01));

          // Update tooltip state
          if (hoverD) {
            tooltip.value.visible = true;
            tooltip.value.content = hoverD.properties.ADMIN;
            tooltip.value.subContent = `Population: ${Math.round(
              hoverD.properties.POP_EST / 1000000
            )}M`;
          } else {
            tooltip.value.visible = false;
          }
        })
        .onPolygonClick((clickD) => {
          if (clickD) {
            const countryName = clickD.properties.ADMIN;

            // Hide tooltip immediately on click
            tooltip.value.visible = false;

            // Stop auto-rotation
            const controls = world.controls();
            controls.autoRotate = false;
            isUserInteracting = true;

            // Clear any pending timeout
            if (autoRotateTimeout) {
              clearTimeout(autoRotateTimeout);
            }

            // Calculate center coordinates of the country
            let lat, lng;
            if (clickD.geometry.type === "Polygon") {
              const coords = clickD.geometry.coordinates[0];
              lng = coords.reduce((sum, c) => sum + c[0], 0) / coords.length;
              lat = coords.reduce((sum, c) => sum + c[1], 0) / coords.length;
            } else if (clickD.geometry.type === "MultiPolygon") {
              const allCoords = clickD.geometry.coordinates.flat(2);
              lng = allCoords.filter((_, i) => i % 2 === 0).reduce((sum, c) => sum + c, 0) / (allCoords.length / 2);
              lat = allCoords.filter((_, i) => i % 2 === 1).reduce((sum, c) => sum + c, 0) / (allCoords.length / 2);
            }

            // Zoom into the country with animation
            world.pointOfView({ lat, lng, altitude: 1.2 }, 1000); // 1 second animation

            // Emit the country selection after zoom animation completes
            setTimeout(() => {
              emit("select-country", countryName);
            }, 1000);
          }
        });
    });

  // Auto-rotate when not interacting
  world.controls().autoRotate = true;
  world.controls().autoRotateSpeed = 0.5;

  // Stop rotation when user interacts
  const controls = world.controls();
  controls.addEventListener('start', () => {
    isUserInteracting = true;
    controls.autoRotate = false;

    // Clear any pending timeout
    if (autoRotateTimeout) {
      clearTimeout(autoRotateTimeout);
    }
  });

  controls.addEventListener('end', () => {
    isUserInteracting = false;

    // Resume auto-rotate after 3 seconds of inactivity
    autoRotateTimeout = setTimeout(() => {
      if (!isUserInteracting) {
        controls.autoRotate = true;
      }
    }, 3000);
  });

  // Handle resize
  window.addEventListener("resize", onWindowResize);
  window.addEventListener("mousemove", onMouseMove);
});

const onMouseMove = (event) => {
  if (tooltip.value.visible) {
    tooltip.value.x = event.clientX + 15;
    tooltip.value.y = event.clientY + 15;
  }
};

const onWindowResize = () => {
  if (world && container.value) {
    world.width(window.innerWidth);
    world.height(window.innerHeight);
  }
};

// Function to select a random country and spin to it
const selectRandomCountry = () => {
  if (!countriesData || countriesData.length === 0 || !world) {
    console.warn("Countries data not loaded yet");
    return;
  }

  // Select a random country
  const randomCountry = countriesData[Math.floor(Math.random() * countriesData.length)];
  const countryName = randomCountry.properties.ADMIN;

  // Get the center coordinates of the country
  const bbox = randomCountry.geometry.coordinates;
  let lat, lng;

  // Calculate center from geometry
  if (randomCountry.geometry.type === "Polygon") {
    const coords = randomCountry.geometry.coordinates[0];
    lng = coords.reduce((sum, c) => sum + c[0], 0) / coords.length;
    lat = coords.reduce((sum, c) => sum + c[1], 0) / coords.length;
  } else if (randomCountry.geometry.type === "MultiPolygon") {
    const allCoords = randomCountry.geometry.coordinates.flat(2);
    lng = allCoords.filter((_, i) => i % 2 === 0).reduce((sum, c) => sum + c, 0) / (allCoords.length / 2);
    lat = allCoords.filter((_, i) => i % 2 === 1).reduce((sum, c) => sum + c, 0) / (allCoords.length / 2);
  }

  // Spin globe to the country
  world.pointOfView({ lat, lng, altitude: 1.5 }, 2000); // 2 second animation

  // Hide tooltip
  tooltip.value.visible = false;

  // Emit the country selection after the globe animation
  setTimeout(() => {
    emit("select-country", countryName);
  }, 2000);
};

// Function to hide tooltip (can be called from parent)
const hideTooltip = () => {
  tooltip.value.visible = false;
};

// Function to reset view and resume rotation
const resetView = () => {
  if (!world) return;

  // Zoom out to default view
  world.pointOfView({ lat: 0, lng: 0, altitude: 2.5 }, 1000);

  // Resume auto-rotation
  const controls = world.controls();
  controls.autoRotate = true;
  isUserInteracting = false;
};

// Expose the function to parent component
defineExpose({
  selectRandomCountry,
  hideTooltip,
  resetView
});

onUnmounted(() => {
  window.removeEventListener("resize", onWindowResize);
  window.removeEventListener("mousemove", onMouseMove);

  // Clear timeout
  if (autoRotateTimeout) {
    clearTimeout(autoRotateTimeout);
  }

  if (world) {
    world._destructor(); // Cleanup if available
    // Or clear container
    if (container.value) container.value.innerHTML = "";
  }
});
</script>

<style scoped>
.globe-wrapper {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

.globe-container {
  width: 100%;
  height: 100%;
}

.globe-tooltip {
  position: fixed;
  background: rgba(15, 23, 42, 0.9);
  color: white;
  padding: 12px 16px;
  border-radius: 8px;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  font-size: 14px;
  pointer-events: none;
  z-index: 1000;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(8px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
  transition: opacity 0.2s ease;
}

.tooltip-content strong {
  display: block;
  font-size: 16px;
  margin-bottom: 4px;
  color: #38bdf8;
}

.tooltip-sub {
  color: #94a3b8;
  font-size: 12px;
}
</style>
