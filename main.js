import * as THREE from "https://cdn.skypack.dev/three@0.152.2";

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

// ===== GROUND ==
