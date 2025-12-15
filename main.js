console.log("BRAINROT MAZE AI FINAL");

// ===== SPEEDS =====
const PLAYER_SPEED = 0.15;
const ENEMY_SPEED  = 0.15;

// ===== SCENE =====
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0b0b0b);

// ===== CAMERA =====
const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);
camera.position.set(0, 2, 6);

// ===== RENDERER =====
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(devicePixelRatio);
document.body.appendChild(renderer.domElement);

// ===== LIGHT =====
scene.add(new THREE.AmbientLight(0xffffff, 1));

// ===== FLOOR =====
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(40, 40),
  new THREE.MeshBasicMaterial({ color: 0x111111 })
);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

// ===== PLAYER =====
const player = new THREE.Mesh(
  new THREE.BoxGeometry(0.8, 0.8, 0.8),
  new THREE.MeshBasicMaterial({ color: 0x4aa3ff })
);
player.position.set(-12, 0.4, 12);
scene.add(player);

// ===== ENEMY =====
const enemy = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshBasicMaterial({ color: 0xff3333 })
);
enemy.position.set(12, 0.5, -12);
scene.add(enemy);

// ===== MAZE =====
const walls = [];
const cellSize = 4;

const maze = [
  "1111111111",
  "1000000001",
  "1011111101",
  "1010000101",
  "1010110101",
  "1010110101",
  "1010000101",
  "1011111101",
  "1000000001",
  "1111111111",
];

function addWall(x, z) {
  const wall = new THREE.Mesh(
    new THREE.BoxGeometry(cellSize, 2, cellSize),
    new THREE.MeshBasicMaterial({ color: 0x333333 })
  );
  wall.position.set(x, 1, z);
  scene.add(wall);
  walls.push(wall);
}

maze.forEach((row, z) => {
  [...row].forEach((cell, x) => {
    if (cell === "1") {
      addWall((x - 5) * cellSize, (z - 5) * cellSize);
    }
  });
});

// ===== INPUT =====
const keys = {};
addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
addEventListener("keyup",   e => keys[e.key.toLowerCase()] = false);

// ===== COLLISION =====
function blocked(x, z, size = 0.4) {
  const box = new THREE.Box3(
    new THREE.Vector3(x - size, 0, z - size),
    new THREE.Vector3(x + size, 1, z + size)
  );
  for (const w of walls) {
    if (box.intersectsBox(new THREE.Box3().setFromObject(w))) return true;
  }
  return false;
}

// ===== ENEMY MEMORY =====
let enemyDir = new THREE.Vector2(0, 0);

// ===== LOOP =====
function animate() {

  // ---- PLAYER ----
  let px = player.position.x;
  let pz = player.position.z;

  if (keys.w) pz -= PLAYER_SPEED;
  if (keys.s) pz += PLAYER_SPEED;
  if (keys.a) px -= PLAYER_SPEED;
  if (keys.d) px += PLAYER_SPEED;

  if (!blocked(px, player.position.z)) player.position.x = px;
  if (!blocked(player.position.x, pz)) player.position.z = pz;

  // ---- ENEMY AI (WALL FOLLOW) ----
  const toPlayer = new THREE.Vector2(
    player.position.x - enemy.position.x,
    player.position.z - enemy.position.z
  ).normalize();

  // update intent only if not stuck
  if (enemyDir.length() === 0 || Math.random() < 0.02) {
    enemyDir.copy(toPlayer);
  }

  let ex = enemy.position.x + enemyDir.x * ENEMY_SPEED;
  let ez = enemy.position.z + enemyDir.y * ENEMY_SPEED;

  if (!blocked(ex, ez, 0.5)) {
    enemy.position.x = ex;
    enemy.position.z = ez;
  } else {
    // slide along wall
    const slideX = enemy.position.x + enemyDir.y * ENEMY_SPEED;
    const slideZ = enemy.position.z - enemyDir.x * ENEMY_SPEED;

    if (!blocked(slideX, enemy.position.z, 0.5)) {
      enemy.position.x = slideX;
    } else if (!blocked(enemy.position.x, slideZ, 0.5)) {
      enemy.position.z = slideZ;
    }
  }

  // ---- CAMERA ----
  camera.position.x = player.position.x;
  camera.position.z = player.position.z + 6;
  camera.lookAt(player.position);

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();

// ===== RESIZE =====
addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
