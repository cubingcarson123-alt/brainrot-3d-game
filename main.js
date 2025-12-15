import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.152.2/build/three.module.js";

let gameStarted = true;
scene.background = new THREE.Color(0x222222);


// ===== SCENE =====
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

// ===== CAMERA =====
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 2, 5);

// ===== RENDERER =====
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// ===== LIGHT =====
scene.add(new THREE.AmbientLight(0xffffff, 1));

// ===== GROUND =====
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(100, 100),
  new THREE.MeshBasicMaterial({ color: 0x2ecc71 })
);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

// ===== PLAYER =====
const player = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshBasicMaterial({ color: 0x3498db })
);
player.position.y = 0.5;
scene.add(player);

// ===== ENEMY =====
const enemy = new THREE.Mesh(
  new THREE.BoxGeometry(1.2, 1.2, 1.2),
  new THREE.MeshBasicMaterial({ color: 0xe74c3c })
);
enemy.position.set(0, 0.6, -10);
scene.add(enemy);

// ===== CONTROLS =====
const keys = {};
window.addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
window.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

// ===== LOOP =====
function animate() {
  if (gameStarted) {
    if (keys["w"]) player.position.z -= 0.1;
    if (keys["s"]) player.position.z += 0.1;
    if (keys["a"]) player.position.x -= 0.1;
    if (keys["d"]) player.position.x += 0.1;

    const dir = new THREE.Vect
