console.log("BRAINROT MAZE RUNNING");

// ===== SCENE =====
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0b0b0b);

// ===== CAMERA =====
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 2, 6);

// ===== RENDERER =====
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// ===== LIGHT =====
scene.add(new THREE.AmbientLight(0xffffff, 0.9));

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

// 1 = wall, 0 = path
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

// build maze
maze.forEach((row, z) => {
  [...row].forEach((cell, x) => {
    if (cell === "1") {
      addWall(
        (x - 5) * cellSize,
        (z - 5) * cellSize
      );
    }
  });
});

// ===== CONTROLS =====
const keys = {};
window.addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
window.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

// ===== COLLISION =====
function blocked(x, z, size = 0.4) {
  const box = new THREE.Box3(
    new THREE.Vector3(x - size, 0, z - size),
    new THREE.Vector3(x + size, 1, z + size)
  );

  for (const wall of walls) {
    const wallBox = new THREE.Box3().setFromObject(wall);
    if (box.intersectsBox(wallBox)) return true;
  }
  return false;
}

// ===== GAME LOOP =====
function animate() {
  const speed = 0.15;

  // player move
  let px = player.position.x;
  let pz = player.position.z;

  if (keys["w"]) pz -= speed;
  if (keys["s"]) pz += speed;
  if (keys["a"]) px -= speed;
  if (keys["d"]) px += speed;

  if (!blocked(px, player.position.z)) player.position.x = px;
  if (!blocked(player.position.x, pz)) player.position.z = pz;

  // enemy move
  const dir = new THREE.Vector3().subVectors(player.position, enemy.position);
  dir.y = 0;
  dir.normalize();

  const ex = enemy.position.x + dir.x * 0.03;
  const ez = enemy.position.z + dir.z * 0.03;

  if (!blocked(ex, enemy.position.z, 0.5)) enemy.position.x = ex;
  if (!blocked(enemy.position.x, ez, 0.5)) enemy.position.z = ez;

  // camera follow
  camera.position.x = player.position.x;
  camera.position.z = player.position.z + 6;
  camera.lookAt(player.position);

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();

// ===== RESIZE =====
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
