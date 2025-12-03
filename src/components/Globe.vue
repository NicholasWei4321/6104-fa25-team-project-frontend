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
      world
        .polygonsData(
          countries.features.filter((d) => d.properties.ISO_A2 !== "AQ")
        )
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
            emit("select-country", countryName);
          }
        });
    });

  // Auto-rotate
  world.controls().autoRotate = false;

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

onUnmounted(() => {
  window.removeEventListener("resize", onWindowResize);
  window.removeEventListener("mousemove", onMouseMove);
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
