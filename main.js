// ===== BASIC SETUP =====
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// ===== LIGHTING =====
scene.add(new THREE.AmbientLight(0xffffff, 0.4));

const sun = new THREE.DirectionalLight(0xffffff, 0.8);
sun.position.set(10, 20, 10);
sun.castShadow = true;
scene.add(sun);

// ===== PLAYER =====
const player = new THREE.Object3D();
scene.add(player);

const body = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1.8, 1),
  new THREE.MeshStandardMaterial({ color: 0x3498db })
);
body.position.y = 0.9;
body.castShadow = true;
player.add(body);

camera.position.set(0, 1.5, 0);
player.add(camera);

// ===== CONTROLS =====
let yaw = 0;
let pitch = 0;
const keys = {};

document.body.addEventListener("click", () => {
  document.body.requestPointerLock();
});

document.addEventListener("mousemove", (e) => {
  if (document.pointerLockElement !== document.body) return;

  yaw -= e.movementX * 0.002;
  pitch -= e.movementY * 0.002;
  pitch = Math.max(-1.5, Math.min(1.5, pitch));

  player.rotation.y = yaw;
  camera.rotation.x = pitch;
});

window.addEventListener("keydown", (e) => {
  keys[e.key.toLowerCase()] = true;
});

window.addEventListener("keyup", (e) => {
  keys[e.key.toLowerCase()] = false;
});

// ===== MOVEMENT =====
function movePlayer() {
  const speed = 0.12;
  const dir = new THREE.Vector3();

  if (keys["w"]) dir.z -= 1;
  if (keys["s"]) dir.z += 1;
  if (keys["a"]) dir.x -= 1;
  if (keys["d"]) dir.x += 1;

  if (dir.length() > 0) {
    dir.normalize();
    dir.applyAxisAngle(new THREE.Vector3(0, 1, 0), player.rotation.y);
    player.position.addScaledVector(dir, speed);
  }
}

// ===== GROUND =====
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(200, 200),
  new THREE.MeshStandardMaterial({ color: 0x2ecc71 })
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// ===== LEVEL OBJECTS =====
const levelObjects = [];
function clearLevel() {
  levelObjects.forEach(obj => scene.remove(obj));
  levelObjects.length = 0;
  scene.fog = null;
}

// ===== ENEMY =====
const
