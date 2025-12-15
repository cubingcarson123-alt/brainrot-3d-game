import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.152.2/build/three.module.js";

/* ================= SCENE ================= */
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0e0e0e);

/* ================= CAMERA ================= */
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

/* ================= RENDERER ================= */
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

scene.add(new THREE.AmbientLight(0xffffff, 1));

/* ================= GROUND ================= */
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(300, 300),
  new THREE.MeshBasicMaterial({ color: 0x1f1f1f })
);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

/* ================= MAZE SETTINGS ================= */
const CELL = 4;
const SIZE = 17;
const walls = [];

/* ================= WALL ================= */
function addWall(x, z) {
  const wall = new THREE.Mesh(
    new THREE.BoxGeometry(CELL, 3, CELL),
    new THREE.MeshBasicMaterial({ color: 0x444444 })
  );
  wall.position.set(x, 1.5, z);
  scene.add(wall);
  walls.push(wall);
}

/* ================= MAZE GRID ================= */
const maze = Array.from({ length: SIZE }, () =>
  Array(SIZE).fill(1)
);

/* ================= DFS MAZE (ALWAYS SOLVABLE) ================= */
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

/* ================= BUILD MAZE ================= */
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

/* ================= PLAYER ================= */
const player = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshBasicMaterial({ color: 0x4aa3ff })
);
player.position.set(
  (1 - SIZE / 2) * CELL,
  0.5,
  (1 - SIZE / 2) * CELL
);
scene.add(player);

/* ================= INPUT ================= */
const keys = {};
window.addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
window.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

/* ================= COLLISION ================= */
function blocked(x, z) {
  const box = new THREE.Box3(
    new THREE.Vector3(x - 0.5, 0, z - 0.5),
    new THREE.Vector3(x + 0.5, 1.5, z + 0.5)
  );
  return walls.some(w =>
    box.intersectsBox(new THREE.Box3().setFromObject(w))
  );
}

/* ================= LOOP ================= */
function animate() {
  requestAnimationFrame(animate);

  const speed = 0.08;
  let nx = player.position.x;
  let nz = player.position.z;

  if (keys["w"]) nz -= speed;
  if (keys["s"]) nz += speed;
  if (keys["a"]) nx -= speed;
  if (keys["d"]) nx += speed;

  if (!blocked(nx, player.position.z)) player.position.x = nx;
  if (!blocked(player.position.x, nz)) player.position.z = nz;

  camera.position.set(
    player.position.x,
    10,
    player.position.z + 10
  );
  camera.lookAt(player.position);

  renderer.render(scene, camera);
}

animate();

/* ================= RESIZE ================= */
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
