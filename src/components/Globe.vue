<template>
  <div ref="container" class="globe-container"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import * as THREE from 'three';

const container = ref(null);

// Three.js variables
let scene, camera, renderer;
let earth, stars;
let animationId;

// Interaction state
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };
const baseAutoRotateSpeed = 0.0005; // Constant speed
let targetRotationSpeed = { x: 0, y: baseAutoRotateSpeed }; // Target speed to decay to
let currentRotationSpeed = { x: 0, y: baseAutoRotateSpeed }; // Current actual speed
let dragVelocity = { x: 0, y: 0 }; // Instantaneous velocity from drag
let lastFrameTime = 0;

const init = () => {
  // 1. Scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  // 2. Camera
  const fov = 45;
  const aspect = window.innerWidth / window.innerHeight;
  const near = 0.1;
  const far = 1000;
  camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.z = 3.5;

  // 3. Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  container.value.appendChild(renderer.domElement);

  // 4. Textures
  const textureLoader = new THREE.TextureLoader();
  
  const earthMap = textureLoader.load('https://upload.wikimedia.org/wikipedia/commons/c/c3/Solarsystemscope_texture_2k_earth_daymap.jpg');
  const earthSpecular = textureLoader.load('https://upload.wikimedia.org/wikipedia/commons/c/c5/Solarsystemscope_texture_2k_earth_specular_map.jpg');
  const earthNormal = textureLoader.load('https://upload.wikimedia.org/wikipedia/commons/c/c3/Solarsystemscope_texture_2k_earth_normal_map.jpg');

  // 5. Earth Mesh
  const geometry = new THREE.SphereGeometry(1, 64, 64);
  const material = new THREE.MeshPhongMaterial({
    map: earthMap,
    specularMap: earthSpecular,
    normalMap: earthNormal,
    specular: new THREE.Color(0x777777), // Brighter specular
    shininess: 15, // Shinier
  });
  
  earth = new THREE.Mesh(geometry, material);
  scene.add(earth);

  // 6. Clouds (Optional but nice for realism)
  const cloudGeometry = new THREE.SphereGeometry(1.01, 64, 64);
  const cloudMaterial = new THREE.MeshPhongMaterial({
    map: textureLoader.load('https://upload.wikimedia.org/wikipedia/commons/5/56/Solarsystemscope_texture_2k_earth_clouds.jpg'),
    transparent: true,
    opacity: 0.4,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  });
  const clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
  earth.add(clouds);

  // 7. Stars (Background)
  const starsGeometry = new THREE.BufferGeometry();
  const starsCount = 2000;
  const posArray = new Float32Array(starsCount * 3);
  
  for(let i = 0; i < starsCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * 100; 
  }
  
  starsGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
  const starsMaterial = new THREE.PointsMaterial({
    size: 0.02,
    color: 0xffffff,
  });
  stars = new THREE.Points(starsGeometry, starsMaterial);
  scene.add(stars);

  // 8. Lighting
  const ambientLight = new THREE.AmbientLight(0x777777); // Even Brighter ambient
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 3.0); // Brighter sun
  directionalLight.position.set(5, 3, 5);
  scene.add(directionalLight);

  const fillLight = new THREE.DirectionalLight(0xffffff, 1.0); // Brighter fill
  fillLight.position.set(-5, 0, 5);
  scene.add(fillLight);

  // Event Listeners
  renderer.domElement.addEventListener('mousedown', onMouseDown);
  renderer.domElement.addEventListener('wheel', onMouseWheel, { passive: false }); // Add wheel listener
  window.addEventListener('resize', onWindowResize);

  // Start Loop
  animate();
};

const animate = () => {
  animationId = requestAnimationFrame(animate);

  if (!isDragging) {
    // Inertia Physics
    // Smoothly interpolate current speed towards the target base speed
    const dampingFactor = 0.05;
    
    // Decay X rotation (tilt) back to 0
    currentRotationSpeed.x += (0 - currentRotationSpeed.x) * dampingFactor;
    
    // Decay Y rotation (spin) back to base speed
    currentRotationSpeed.y += (baseAutoRotateSpeed - currentRotationSpeed.y) * dampingFactor;

    earth.rotation.x += currentRotationSpeed.x;
    earth.rotation.y += currentRotationSpeed.y;
  }
  
  renderer.render(scene, camera);
};

// Interaction Handlers
const onMouseDown = (event) => {
  isDragging = true;
  previousMousePosition = {
    x: event.clientX,
    y: event.clientY
  };
  // Reset velocity on new drag
  dragVelocity = { x: 0, y: 0 };
  
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', onMouseUp);
};

const onMouseMove = (event) => {
  if (!isDragging) return;

  const deltaMove = {
    x: event.clientX - previousMousePosition.x,
    y: event.clientY - previousMousePosition.y
  };

  const rotateSpeed = 0.005;
  
  // Apply rotation directly
  earth.rotation.y += deltaMove.x * rotateSpeed;
  earth.rotation.x += deltaMove.y * rotateSpeed;

  // Calculate velocity for inertia (y delta affects x rotation, x delta affects y rotation)
  dragVelocity = {
    x: deltaMove.y * rotateSpeed, // Dragging up/down tilts X axis
    y: deltaMove.x * rotateSpeed  // Dragging left/right spins Y axis
  };

  previousMousePosition = {
    x: event.clientX,
    y: event.clientY
  };
};

const onMouseUp = () => {
  isDragging = false;
  
  // Set current speed to the velocity at moment of release to start the "coast"
  currentRotationSpeed = {
    x: dragVelocity.x,
    y: dragVelocity.y
  };

  window.removeEventListener('mousemove', onMouseMove);
  window.removeEventListener('mouseup', onMouseUp);
};

// Zoom Handler
const onMouseWheel = (event) => {
  event.preventDefault(); // Prevent default scrolling behavior of the page

  const zoomSpeed = 0.002; // Increased sensitivity
  const minZoom = 1.5; // Closest distance (radius is 1, so 1.5 is close)
  const maxZoom = 10;  // Furthest distance

  camera.position.z += event.deltaY * zoomSpeed;

  // Clamp zoom level
  camera.position.z = Math.max(minZoom, Math.min(maxZoom, camera.position.z));
};

const onWindowResize = () => {
  if (!container.value) return;
  
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
};

onMounted(() => {
  init();
});

onUnmounted(() => {
  cancelAnimationFrame(animationId);
  if (renderer) {
    renderer.dispose();
    renderer.domElement.removeEventListener('mousedown', onMouseDown);
    renderer.domElement.removeEventListener('wheel', onMouseWheel);
  }
  window.removeEventListener('mousemove', onMouseMove);
  window.removeEventListener('mouseup', onMouseUp);
  window.removeEventListener('resize', onWindowResize);
});
</script>

<style scoped>
.globe-container {
  width: 100%;
  height: 100%;
  display: block;
}
</style>
