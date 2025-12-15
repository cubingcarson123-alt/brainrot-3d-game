import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.152.2/build/three.module.js";

console.log("MAIN JS RUNNING");

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

// ===== RENDERER =====
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// ===== LIGHT =====
scene.add(new THREE.AmbientLight(0xffffff, 0.6));

// ===== PLAYER =====
const player = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshStandardMaterial({ color: 0x3498db })
);
player.position.y = 0.5;
scene.add(player);

// ===== ENEMY (BRAINROT) =====
const enemy = new THREE.Mesh(
  new THREE.BoxGeometry(1.2, 1.2, 1.2),
  new THREE.MeshStandardMaterial({ color: 0xe74c3c })
);
enemy.position.set(0, 0.6, -15);
scene.add(enemy);

// ===== CAMERA FOLLOW =====
camera.position.set(0, 2, 5);
camera.lookAt(player.position);

// ===== GROUND =====
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(100, 100),
  new THREE.MeshStandardMaterial({ color: 0x2ecc71 })
);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

// ===== CONTROLS =====
const keys = {};
window.addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
window.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

// ===== PLAYER MOVEMENT =====
function movePlayer() {
  const speed = 0.15;
  if (keys["w"]) player.position.z -= speed;
  if (keys["s"]) player.position.z += speed;
  if (keys["a"]) player.position.x -= speed;
  if (keys["d"]) player.position.x += speed;

  camera.position.x = player.position.x;
  camera.position.z = player.position.z + 5;
  camera.lookAt(player.position);
}

// ===== ENEMY AI =====
function moveEnemy() {
  const dir = new THREE.Vector3();
  dir.subVectors(player.position, enemy.position);
  dir.y = 0;

  if (dir.length() > 0.1) {
    dir.normalize();
    enemy.position.addScaledVector(dir, 0.07);
  }

  if (enemy.position.distanceTo(player.position) < 1) {
    alert("YOU GOT CAUGHT 😈");
    player.position.set(0, 0.5, 0);
    enemy.position.set(0, 0.6, -15);
  }
}

// ===== LOOP =====
function animate() {
  movePlayer();
  moveEnemy();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();

// ===== RESIZE =====
window.addEventListener("resize",
