import './style.css';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import * as THREE from 'three';

gsap.registerPlugin(ScrollTrigger);


// ==========================================
// 1. THREE.JS VECTOR/SCHEMATIC SCENE
// ==========================================
const container = document.getElementById('assembly-container');
const scene = new THREE.Scene();
const frustumSize = 10;

function getContainerSize() {
  return { w: container.clientWidth || window.innerWidth * 0.4, h: window.innerHeight };
}

const { w: initW, h: initH } = getContainerSize();
const aspect = initW / initH;
const camera = new THREE.OrthographicCamera(
  frustumSize * aspect / -2,
  frustumSize * aspect / 2,
  frustumSize / 2,
  frustumSize / -2,
  1, 1000
);
camera.position.set(20, 20, 20);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize(initW, initH);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
container.appendChild(renderer.domElement);

const deviceGroup = new THREE.Group();
scene.add(deviceGroup);

const matBlack = new THREE.MeshBasicMaterial({ color: 0x1A1A1A });
const matOutline = new THREE.LineBasicMaterial({ color: 0x1A1A1A, linewidth: 2 });
const matOrange = new THREE.MeshBasicMaterial({ color: 0xFF4500 });

function createBoard(w, l, d, mat) {
  const g = new THREE.Group();
  const geo = new THREE.BoxGeometry(w, d, l);
  g.add(new THREE.Mesh(geo, mat));
  g.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo), matOutline));
  return g;
}

const basePlate = createBoard(6, 4, 0.2, new THREE.MeshBasicMaterial({ color: 0xE0E0D8 }));
const pcb = createBoard(5.5, 3.5, 0.1, matBlack);
const chip1 = createBoard(1, 1, 0.2, matOrange);
chip1.position.set(-1.5, 0.15, -0.5);
pcb.add(chip1);
const chip2 = createBoard(0.5, 1.5, 0.2, new THREE.MeshBasicMaterial({ color: 0xffffff }));
chip2.position.set(1, 0.15, 0);
pcb.add(chip2);
const cover = createBoard(6, 4, 0.1, new THREE.MeshBasicMaterial({ color: 0xF8F8F5 }));
const screenMesh = new THREE.Mesh(new THREE.PlaneGeometry(5, 3), matBlack);
screenMesh.rotation.x = -Math.PI / 2;
screenMesh.position.y = 0.06;
cover.add(screenMesh);

deviceGroup.add(basePlate);
deviceGroup.add(pcb);
deviceGroup.add(cover);

deviceGroup.position.set(0, 0, 0);
deviceGroup.scale.set(0.65, 0.65, 0.65);
basePlate.position.y = -3.5;
pcb.position.y = 0;
cover.position.y = 3.5;

function animate() {
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();

window.addEventListener('resize', () => {
  const { w, h } = getContainerSize();
  const a = w / h;
  camera.left = -frustumSize * a / 2;
  camera.right = frustumSize * a / 2;
  camera.top = frustumSize / 2;
  camera.bottom = -frustumSize / 2;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);

  const s = window.innerWidth < 900 ? 0.4 : 0.65;
  deviceGroup.scale.set(s, s, s);
});
window.dispatchEvent(new Event('resize'));


// ==========================================
// 2. GSAP SCROLL ANIMATIONS
// ==========================================

// A. 3D Assembly — layers compress as you scroll
gsap.timeline({
  scrollTrigger: {
    trigger: "#scroll-container",
    start: "top top",
    end: "bottom bottom",
    scrub: 1.5,
  }
})
  .to(cover.position, { y: 0.15, ease: "none" }, 0)
  .to(basePlate.position, { y: -0.15, ease: "none" }, 0)
  .to(deviceGroup.rotation, { y: Math.PI / 3, ease: "none" }, 0);


// B. Hero stat counter animation
gsap.utils.toArray('.stat-val').forEach(el => {
  gsap.from(el, {
    y: 15,
    opacity: 0,
    duration: 0.6,
    delay: 0.5,
    ease: "power2.out",
  });
});

// C. Company blocks reveal
gsap.utils.toArray('.company-block').forEach(block => {
  gsap.from(block, {
    y: 50,
    opacity: 0,
    duration: 0.7,
    ease: "power2.out",
    scrollTrigger: {
      trigger: block,
      start: "top 85%",
      toggleActions: "play none none reverse"
    }
  });
});

// D. Bullet list items stagger in per company block
gsap.utils.toArray('.bullet-list').forEach(list => {
  gsap.utils.toArray(list.querySelectorAll('li')).forEach((li, i) => {
    gsap.from(li, {
      x: -15,
      opacity: 0,
      duration: 0.4,
      delay: i * 0.06,
      ease: "power2.out",
      scrollTrigger: {
        trigger: list,
        start: "top 85%",
        toggleActions: "play none none reverse"
      }
    });
  });
});

// E. Education section
gsap.from('.edu-section', {
  y: 50,
  opacity: 0,
  duration: 0.7,
  ease: "power2.out",
  scrollTrigger: {
    trigger: '.edu-section',
    start: "top 85%",
    toggleActions: "play none none reverse"
  }
});
