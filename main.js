import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.152.2/build/three.module.js";

// ===== SETTINGS =====
const PLAYER_SPEED = 0.08;
const ENEMY_SPEED  = 0.08;

// ===== SCENE =====
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);

// ===== CAMERA =====
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
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
  new THREE.PlaneGeometry(100, 100),
  new THREE.MeshBasicMaterial({ color: 0x2c2c2c })
);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

// ===== WALLS =====
const walls = [];
function wall(x, z, w = 5, d = 1) {
  const m = new THREE.Mesh(
    new THREE.BoxGeometry(w, 2, d),
    new THREE.MeshBasicMaterial({ color: 0x444444 })
  );
  m.position.set(x, 1, z);
  scene.add(m);
  walls.push(m);
}
wall(0, -5, 20);
wall(-10, 0, 1, 20);
wall(10, 0, 1, 20);
wall(0, 5, 20);

// ===== PLAYER =====
const player = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshBasicMaterial({ color: 0x4aa3ff })
);
player.position.y = 0.5;
scene.add(player);

// ===== ENEMY =====
const enemy = new THREE.Mesh(
  new THREE.BoxGeometry(1.2, 1.2, 1.2),
  new THREE.MeshBasicMaterial({ color: 0xff4444 })
);
enemy.position.set(0, 0.6, -8);
scene.add(enemy);

const enemyDir = new THREE.Vector2(0, 1);
let slideCooldown = 0;

// ===== INPUT =====
const keys = {};
window.addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
window.addEventListener("keyup",   e => keys[e.key.toLowerCase()] = false);

// ===== COLLISION =====
function blocked(x, z, size = 0.5) {
  const box = new THREE.Box3(
    new THREE.Vector3(x - size, 0, z - size),
    new THREE.Vector3(x + size, 1.5, z + size)
  );
  for (const w of walls) {
    if (box.intersectsBox(new THREE.Box3().setFromObject(w))) return true;
  }
  return false;
}

// ===== LOOP =====
function animate() {
  requestAnimationFrame(animate);

  // PLAYER MOVE
  let px = player.position.x;
  let pz = player.position.z;
  if (keys["w"]) pz -= PLAYER_SPEED;
  if (keys["s"]) pz += PLAYER_SPEED;
  if (keys["a"]) px -= PLAYER_SPEED;
  if (keys["d"]) px += PLAYER_SPEED;
  if (!blocked(px, player.position.z)) player.position.x = px;
  if (!blocked(player.position.x, pz)) player.position.z = pz;

  // CAMERA FOLLOW
  camera.position.x = player.position.x;
  camera.position.z = player.position.z + 6;
  camera.lookAt(player.position);

  // ENEMY AI (NO BOUNCE)
  const toPlayer = new THREE.Vector2(
    player.position.x - enemy.position.x,
    player.position.z - enemy.position.z
  ).normalize();

  if (slideCooldown <= 0) enemyDir.copy(toPlayer);

  let ex = enemy.position.x + enemyDir.x * ENEMY_SPEED;
  let ez = enemy.position.z + enemyDir.y * ENEMY_SPEED;

  if (!blocked(ex, ez, 0.6)) {
    enemy.position.x = ex;
    enemy.position.z = ez;
    slideCooldown = 0;
  } else {
    const slide = new THREE.Vector2(-enemyDir.y, enemyDir.x);
    ex = enemy.position.x + slide.x * ENEMY_SPEED;
    ez = enemy.position.z + slide.y * ENEMY_SPEED;

    if (!blocked(ex, ez, 0.6)) {
      enemy.position.x = ex;
      enemy.position.z = ez;
      enemyDir.copy(slide);
      slideCooldown = 25;
    }
  }

  if (slideCooldown > 0) slideCooldown--;

  renderer.render(scene, camera);
}

animate();

// ===== RESIZE =====
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
