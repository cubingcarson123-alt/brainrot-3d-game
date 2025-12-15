console.log("GAME START");

// ===== SCENE =====
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);

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

// ===== FLOOR =====
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(50, 50),
  new THREE.MeshBasicMaterial({ color: 0x222222 })
);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

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
enemy.position.set(0, 0.6, -15);
scene.add(enemy);

// ===== MAZE WALLS =====
const walls = [];

function addWall(x, z, w, d) {
  const wall = new THREE.Mesh(
    new THREE.BoxGeometry(w, 2, d),
    new THREE.MeshBasicMaterial({ color: 0x555555 })
  );
  wall.position.set(x, 1, z);
  scene.add(wall);
  walls.push(wall);
}

// outer walls
addWall(0, -25, 50, 2);
addWall(0, 25, 50, 2);
addWall(-25, 0, 2, 50);
addWall(25, 0, 2, 50);

// inner maze
addWall(0, -10, 20, 2);
addWall(-10, -5, 2, 20);
addWall(10, 5, 2, 20);
addWall(0, 10, 20, 2);

// ===== CONTROLS =====
const keys = {};
window.addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
window.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

// ===== COLLISION =====
function collides(pos) {
  for (const wall of walls) {
    if (
      Math.abs(pos.x - wall.position.x) < 1.2 &&
      Math.abs(pos.z - wall.position.z) < 1.2
    ) {
      return true;
    }
  }
  return false;
}

// ===== GAME LOOP =====
function animate() {
  const speed = 0.12;
  const oldPos = player.position.clone();

  if (keys["w"]) player.position.z -= speed;
  if (keys["s"]) player.position.z += speed;
  if (keys["a"]) player.position.x -= speed;
  if (keys["d"]) player.position.x += speed;

  if (collides(player.position)) {
    player.position.copy(oldPos);
  }

  // enemy chase
  const dir = new THREE.Vector3().subVectors(player.position, enemy.position);
  dir.y = 0;
  dir.normalize();
  enemy.position.addScaledVector(dir, 0.04);

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
