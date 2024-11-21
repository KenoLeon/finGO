import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import * as d3 from 'd3';
import { generateDummyData } from './utils/dummyData';

let camera, scene, renderer;
let controls;
const textMeshes = [];

function init() {
  // Create a scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1a1a1a); // Dark grey background

  // Create a camera
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 200, 400); // Adjusted position to center the plots

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
  controls.maxDistance = 1000;
  controls.maxPolarAngle = Math.PI / 2;

  // Generate dummy data
  const dummyData = generateDummyData(100, 365);
  console.log(dummyData);

  // Log the last slice of the data
  const lastSlice = dummyData.map(tickerData => ({
    ticker: tickerData.ticker,
    volume: tickerData.data[tickerData.data.length - 1].volume,
    priceChange: tickerData.data[tickerData.data.length - 1].priceChange
  }));
  console.log('Last slice of the data:', lastSlice);

  // Calculate total volume
  const totalVolume = lastSlice.reduce((sum, tickerData) => sum + tickerData.volume, 0);

  // Find the min and max price changes
  const minPriceChange = Math.min(...lastSlice.map(d => d.priceChange));
  const maxPriceChange = Math.max(...lastSlice.map(d => d.priceChange));

  // Define the size of the base plate
  const basePlateSize = 200;
  const zOffset = 0.1; // Elevation offset for volume squares
  const alpha = 0.7; // Transparency value

  // Create a D3 treemap layout
  const root = d3.hierarchy({ children: lastSlice })
    .sum(d => d.volume)
    .sort((a, b) => b.value - a.value);

  d3.treemap()
    .size([basePlateSize, basePlateSize])
    .padding(1)
    (root);

  // Function to get color based on price change
  function getColor(priceChange) {
    if (priceChange === 0) return new THREE.Color(0xffffff); // White for no change
    if (priceChange > 0) {
      const greenValue = 1 - (priceChange / maxPriceChange);
      return new THREE.Color(`rgba(${Math.floor(255 * greenValue)}, 255, ${Math.floor(255 * greenValue)}, ${alpha})`);
    } else {
      const redValue = 1 - (priceChange / minPriceChange);
      return new THREE.Color(`rgba(255, ${Math.floor(255 * redValue)}, ${Math.floor(255 * redValue)}, ${alpha})`);
    }
  }

  // Function to create the 3D treemap
  function createTreemap(root, basePlateSize) {
    const loader = new FontLoader();
    loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function (font) {
      root.leaves().forEach(leaf => {
        const { x0, y0, x1, y1 } = leaf;
        const width = x1 - x0;
        const depth = y1 - y0;
        const height = Math.abs(leaf.data.priceChange); // Height based on price change
        const color = getColor(leaf.data.priceChange);

        const geometry = new THREE.BoxGeometry(width, height, depth);
        const material = new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: alpha });
        const cube = new THREE.Mesh(geometry, material);
        cube.position.set(x0 + width / 2 - basePlateSize / 2, height / 2, y0 + depth / 2 - basePlateSize / 2);
        scene.add(cube);

        // Add edges to the cube
        const edges = new THREE.EdgesGeometry(geometry);
        const lineMaterial = new THREE.LineBasicMaterial({ color: 0x888888 }); // Grey borders
        const line = new THREE.LineSegments(edges, lineMaterial);
        line.position.copy(cube.position);
        scene.add(line);

        // Add text label for the ticker
        const textGeometry = new TextGeometry(leaf.data.ticker, {
          font: font,
          size: 1,
          height: 0.1,
        });
        const textMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff }); // White text
        const textMesh = new THREE.Mesh(textGeometry, textMaterial);
        textMesh.position.set(x0 + width / 2 - basePlateSize / 2, height + 2, y0 + depth / 2 - basePlateSize / 2);
        textMeshes.push(textMesh);
        scene.add(textMesh);
      });
    });
  }

  // Create the treemap
  createTreemap(root, basePlateSize);

  // Add dramatic lighting
  const ambientLight = new THREE.AmbientLight(0x404040); // Soft white light
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(0, 100, 100).normalize();
  scene.add(directionalLight);

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

  // Make text labels always face the camera
  textMeshes.forEach(textMesh => {
    textMesh.lookAt(camera.position);
  });

  renderer.render(scene, camera);
}

init();
animate();