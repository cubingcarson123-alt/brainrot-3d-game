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
  new THREE.PlaneGeometry(200, 200),
  new THREE.MeshBasicMaterial({ color: 0x333333 })
);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

// ===== MAZE =====
const walls = [];
function addWall(x, z, w = 5, d = 1) {
  const wall = new THREE.Mesh(
    new THREE.BoxGeometry(w, 2, d),
    new THREE.MeshBasicMaterial({ color: 0x666666 })
  );
  wall.position.set(x, 1, z);
  scene.add(wall);
  walls.push(wall);
}

// HARD RANDOM MAZE
for (let i = -40; i <= 40; i += 5) {
  if (Math.random() > 0.3) addWall(i, -20);
  if (Math.random() > 0.3) addWall(i, 20);
}
for (let i = -20; i <= 20; i += 5) {
  if (Math.random() > 0.3) addWall(-40, i, 1, 5);
  if (Math.random() > 0.3) addWall(40, i, 1, 5);
}

// ===== COLLISION =====
function blocked(x, z, r = 0.6) {
  for (const w of walls) {
    const dx = Math.abs(x - w.position.x);
    const dz = Math.abs(z - w.position.z);
    if (dx < r + 2.5 && dz < r + 0.6) return true;
  }
  return false;
}

// ===== PLAYER =====
const player = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshBasicMaterial({ color: 0x4aa3ff })
);
player.position.set(-30, 0.5, 0);
scene.add(player);

// ===== ENEMY =====
const enemy = new THREE.Mesh(
  new THREE.BoxGeometry(1.2, 1.2, 1.2),
  new THREE.MeshBasicMaterial({ color: 0xff4444 })
);
enemy.position.set(30, 0.6, 0);
scene.add(enemy);

// ===== CONTROLS =====
const keys = {};
window.addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
window.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

const speed = 0.12;
let stuckFrames = 0;

// ===== LOOP =====
function animate() {
  requestAnimationFrame(animate);

  let nx = player.position.x;
  let nz = player.position.z;

  if (keys.w) nz -= speed;
  if (keys.s) nz += speed;
  if (keys.a) nx -= speed;
  if (keys.d) nx += speed;

  if (!blocked(nx, nz)) {
    player.position.x = nx;
    player.position.z = nz;
  }

  // CAMERA FOLLOW
  camera.position.x = player.position.x;
  camera.position.z = player.position.z + 5;
  camera.lookAt(player.position);

  // ENEMY AI (ANTI-STUCK)
  const dir = new THREE.Vector2(
    player.position.x - enemy.position.x,
    player.position.z - enemy.position.z
  ).normalize();

  let ex = enemy.position.x + dir.x * speed;
  let ez = enemy.position.z + dir.y * speed;

  if (!blocked(ex, ez)) {
    enemy.position.x = ex;
    enemy.position.z = ez;
    stuckFrames = 0;
  } else {
    stuckFrames++;
  }

  if (stuckFrames > 20) {
    enemy.position.x += (Math.random() - 0.5) * 2;
    enemy.position.z += (Math.random() - 0.5) * 2;
    stuckFrames = 0;
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
