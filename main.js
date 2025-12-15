import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.152.2/build/three.module.js";

/* ================== BASIC SETUP ================== */
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0f0f0f);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

scene.add(new THREE.AmbientLight(0xffffff, 1));

/* ================== GROUND ================== */
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(200, 200),
  new THREE.MeshBasicMaterial({ color: 0x222222 })
);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

/* ================== MAZE SETTINGS ================== */
const CELL = 4;
const SIZE = 15;
const walls = [];

/* ================== WALL ================== */
function addWall(x, z) {
  const w = new THREE.Mesh(
    new THREE.BoxGeometry(CELL, 3, CELL),
    new THREE.MeshBasicMaterial({ color: 0x444444 })
  );
  w.position.set(x, 1.5, z);
  scene.add(w);
  walls.push(w);
}

/* ================== MAZE GRID ================== */
const maze = Array.from({ length: SIZE }, () =>
  Array(SIZE).fill(1)
);

/* ================== DFS MAZE (SOLVABLE) ================== */
function carve(x, z) {
  maze[z][x] = 0;

  const dirs = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1]
  ].sort(() => Math.random() - 0.5);

  for (const [dx, dz] of dirs) {
    const nx = x + dx * 2;
    const nz = z + dz * 2;

    if (
      nx > 0 && nz > 0 &&
      nx < SIZE - 1 &&
      nz < SIZE - 1 &&
      maze[nz][nx] === 1
    ) {
      maze[z + dz][x + dx] = 0;
      carve(nx, nz);
    }
  }
}

carve(1, 1);

/* ================== BUILD MAZE ================== */
for (let z = 0; z < SIZE; z++) {
  for (let x = 0; x < SIZE; x++) {
    if (maze[z][x] === 1) {
      addWall(
        (x - SIZE / 2) * CELL,
        (z - SIZE / 2) * CELL
      );
    }
  }
}

/* ================== PLAYER ================== */
const player = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshBasicMaterial({ color: 0x4aa3ff })
);
player.position.set(
  (1 - SIZE / 2) * CELL,
  0.5,
  (1 - SIZE / 2) * CELL
)
