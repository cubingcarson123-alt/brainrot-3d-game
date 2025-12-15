import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.152.2/build/three.module.js";

// ===== SCENE =====
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x222222);

// ===== CAMERA =====
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 3, 6);

// ===== RENDERER =====
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// ===== LIGHT =====
scene.add(new THREE.AmbientLight(0xffffff, 1));

// ===== GROUND =====
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(300, 300),
  new THREE.MeshBasicMaterial({ color: 0x2b2b2b })
);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

// ===== MAZE (SNAG HEAVY) =====
const walls = [];
const GRID = 21;
const CELL = 3;

function addWall(x, z) {
  const w = new THREE.Mesh(
    new THREE.BoxGeometry(CELL, 2, CELL),
    new THREE.MeshBasicMaterial({ color: 0x666666 })
  );
  w.position.set(x, 1, z);
  scene.add(w);
  walls.push(w);
}

const maze = Array.from({ length: GRID }, () =>
  Array(GRID).fill(true)
);

function carve(x, z) {
  const dirs = [
    [2, 0], [-2, 0], [0, 2], [0, -2]
  ].sort(() => Math.random() - 0.5);

  for (const [dx, dz] of dirs) {
    const nx = x + dx;
    const nz = z + dz;
    if (
      nx > 0 && nz > 0 &&
      nx < GRID - 1 && nz < GRID - 1 &&
      maze[nz][nx]
    ) {
      maze[z + dz / 2][x + dx / 2] = false;
      maze[nz][nx] = false;
      carve(nx, nz);
    }
  }
}

maze[1][1] = false;
carve(1, 1);

for (let z = 0; z < GRID; z++) {
  for (let x = 0; x < GRID; x++) {
    if (maze[z][x]) {
      addWall(
        (x - GRID / 2) * CELL,
        (z - GRID / 2) * CELL
      );
    }
  }
}

// ===== COLLISION =====
function blocked(x, z, r = 0.6) {
  for (const w of walls) {
    if (
      Math.abs(x - w.position.x) < r + CELL / 2 &&
      Math.abs(z - w.position.z) < r + CELL / 2
    ) return true;
  }
  return false;
}

// ===== PLAYER =====
const player = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshBasicMaterial({ color: 0x4aa3ff })
);
player.position.set(-CELL * (GRID / 2 - 1), 0.5, -CELL * (GRID / 2 - 1));
scene.add(player);

// ===== ENEMY (SLOWER) =====
const enemy = new THREE.Mesh(
  new THREE.BoxGeometry(1.2, 1.2, 1.2),
  new THREE.MeshBasicMaterial({ color: 0xff4444 })
);
enemy.position.set(CELL * (GRID / 2 - 1), 0.6, CELL * (GRID / 2 - 1));
scene.add(enemy);

// ===== CONTROLS =====
const keys = {};
window.addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
window.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

const playerSpeed = 0.14;
const enemySpeed = 0.085; // 👈 SLOWER AI
let stuck = 0;

// ===== GAME LOOP =====
function animate() {
  requestAnimationFrame(animate);

  // PLAYER MOVE
  let px = player.position.x;
  let pz = player.position.z;

  if (keys.w) pz -= playerSpeed;
  if (keys.s) pz += playerSpeed;
  if (keys.a) px -= playerSpeed;
  if (keys.d) px += playerSpeed;

  if (!blocked(px, pz)) {
    player.position.x = px;
    player.position.z = pz;
  }

  // CAMERA FOLLOW
  camera.position.x = player.position.x;
  camera.position.z = player.position.z + 6;
  camera.lookAt(player.position);

  // ENEMY AI (SLOW + UNSTUCK)
  const dir = new THREE.Vector2(
    player.position.x - enemy.position.x,
    player.position.z - enemy.position.z
  ).normalize();

  const ex = enemy.position.x + dir.x * enemySpeed;
  const ez = enemy.position.z + dir.y * enemySpeed;

  if (!blocked(ex, ez)) {
    enemy.position.x = ex;
    enemy.position.z = ez;
    stuck = 0;
  } else {
    stuck++;
  }

  if (stuck > 25) {
    enemy.position.x += (Math.random() - 0.5) * CELL;
    enemy.position.z += (Math.random() - 0.5) * CELL;
    stuck = 0;
  }

  renderer.render(scene, camera);
}

animate();

// ===== RESIZE =====
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
