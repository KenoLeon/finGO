import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { generateDummyData } from './utils/dummyData';

let camera, scene, renderer;
let controls;

function init() {
  // Create a scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x002b36); // Base03

  // Create a camera
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 100, 200); // Adjusted position to center the plots

  // Create a renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.getElementById('chart-container').appendChild(renderer.domElement);

  // Add OrbitControls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.screenSpacePanning = false;
  controls.minDistance = 1;
  controls.maxDistance = 500;
  controls.maxPolarAngle = Math.PI / 2;

  // Generate dummy data
  const dummyData = generateDummyData(5, 365);
  console.log(dummyData);

  // Define Solarized Dark theme colors
  const colors = [
    0xb58900, // Yellow
    0xcb4b16, // Orange
    0xdc322f, // Red
    0xd33682, // Magenta
    0x6c71c4, // Violet
    0x268bd2, // Blue
    0x2aa198, // Cyan
    0x859900  // Green
  ];

  // Function to create a line plot for a ticker's data
  function createLinePlot(data, offsetX, offsetZ, color) {
    const geometry = new THREE.BufferGeometry();
    const vertices = new Float32Array(data.length * 3);

    data.forEach((point, index) => {
      vertices[index * 3] = index - data.length / 2; // Center the plot
      vertices[index * 3 + 1] = parseFloat(point.close);
      vertices[index * 3 + 2] = 0;
    });

    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    const material = new THREE.LineBasicMaterial({ color: color });

    const line = new THREE.Line(geometry, material);
    line.position.x = offsetX;
    line.position.z = offsetZ;
    scene.add(line);
  }

  // Function to create volume bars for a ticker's data
  function createVolumeBars(data, offsetX, offsetZ, color) {
    data.forEach((point, index) => {
      const geometry = new THREE.BoxGeometry(0.5, point.volume / 1000, 0.5);
      const material = new THREE.MeshBasicMaterial({ color: color });
      const bar = new THREE.Mesh(geometry, material);
      bar.position.x = index - data.length / 2; // Center the bars
      bar.position.y = point.volume / 2000; // Half the height to position the bar correctly
      bar.position.z = offsetZ;
      scene.add(bar);
    });
  }

  // Create line plots and volume bars for each ticker
  const offsetStep = 50;
  dummyData.forEach((tickerData, index) => {
    const color = colors[index % colors.length];
    createLinePlot(tickerData.data, 0, index * offsetStep, color);
    createVolumeBars(tickerData.data, 0, index * offsetStep - 10, color); // Offset volume bars slightly
  });

  // Handle window resize
  window.addEventListener('resize', onWindowResize, false);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  // Update controls
  controls.update();

  renderer.render(scene, camera);
}

init();
animate();