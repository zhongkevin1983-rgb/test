<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { Rotate3d, Wind, ZoomIn, ZoomOut, RefreshCw } from 'lucide-vue-next';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const props = defineProps<{
  carId: string;
  year: number;
  highlightColor: string;
  rpmNormalized: number;
  glbModel?: string;
}>();

const containerRef = ref<HTMLDivElement | null>(null);
const mountRef = ref<HTMLDivElement | null>(null);

// UI states
const viewMode = ref<'wireframe' | 'aerodynamics' | 'solid'>('aerodynamics');
const isRotatingAutomatically = ref(true);
const zoom = ref(1.2);
const loadingState = ref<{ status: 'loading' | 'success' | 'fallback'; progress: number }>({
  status: 'loading',
  progress: 0
});

// Dragging state for custom Three.js orbit rotation
const isDragging = ref(false);
const rotationTarget = { x: -0.45, y: 0.25 };
const previousMousePosition = { x: 0, y: 0 };

// Refs for Three.js objects
let scene: THREE.Scene | null = null;
let camera: THREE.PerspectiveCamera | null = null;
let renderer: THREE.WebGLRenderer | null = null;
let carGroup: THREE.Group | null = null;
let glbModelObj: THREE.Object3D | null = null;
let proceduralCar: THREE.Group | null = null;
let particlesGroup: THREE.Group | null = null;
let gridHelper: THREE.GridHelper | null = null;
let streamlinesPoints: THREE.Points | null = null;
let streamGeometry: THREE.BufferGeometry | null = null;
const particleCount = 35;
const particleSpeeds: number[] = [];

let animationFrameId: number;

const initThree = () => {
  if (!mountRef.value) return;

  // 1. Initial Scene Setup
  scene = new THREE.Scene();
  scene.background = null;

  // 2. Camera setup
  const mountWidth = mountRef.value.clientWidth || 640;
  const mountHeight = mountRef.value.clientHeight || 320;
  camera = new THREE.PerspectiveCamera(45, mountWidth / mountHeight, 0.1, 100);
  camera.position.set(0, 1.8 * (2 - zoom.value), 6.5 * (1.8 - zoom.value));
  camera.lookAt(0, 0, 0);

  // 3. Renderer setup
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(mountWidth, mountHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;

  mountRef.value.innerHTML = '';
  mountRef.value.appendChild(renderer.domElement);

  // 4. Lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambientLight);

  const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.2);
  dirLight1.position.set(5, 8, 5);
  scene.add(dirLight1);

  const dirLight2 = new THREE.DirectionalLight(0xffffff, 0.6);
  dirLight2.position.set(-5, 4, -5);
  scene.add(dirLight2);

  // Spot light
  const spotColor = new THREE.Color(props.highlightColor);
  const spotLight = new THREE.SpotLight(spotColor, 5, 20, Math.PI / 4, 0.5, 1);
  spotLight.position.set(0, 4, 0);
  scene.add(spotLight);

  // 5. Grid Helper
  gridHelper = new THREE.GridHelper(12, 24, 0xef4444, 0x333333);
  gridHelper.position.y = -0.55;
  scene.add(gridHelper);

  // 6. Car Group
  carGroup = new THREE.Group();
  scene.add(carGroup);

  // Define fallback material
  const bodyMatColor = new THREE.Color(props.highlightColor);
  const carMaterial = new THREE.MeshStandardMaterial({
    color: bodyMatColor,
    roughness: 0.2,
    metalness: 0.8,
  });
  const wheelMaterial = new THREE.MeshStandardMaterial({
    color: 0x1a1a1a,
    roughness: 0.6,
    metalness: 0.1
  });
  const mechanicalMaterial = new THREE.MeshStandardMaterial({
    color: 0xeab308,
    roughness: 0.4,
    metalness: 0.9
  });

  const builderGroup = new THREE.Group();
  const isVintage = props.year <= 1980;

  if (isVintage) {
    // Vintage
    const bodyGeom = new THREE.CylinderGeometry(0.3, 0.35, 3.2, 8);
    bodyGeom.rotateX(Math.PI / 2);
    const bodyMesh = new THREE.Mesh(bodyGeom, carMaterial);
    bodyMesh.position.y = 0.1;
    builderGroup.add(bodyMesh);

    const noseGeom = new THREE.ConeGeometry(0.3, 0.8, 8);
    noseGeom.rotateX(-Math.PI / 2);
    const noseMesh = new THREE.Mesh(noseGeom, carMaterial);
    noseMesh.position.set(0, 0.1, 1.8);
    builderGroup.add(noseMesh);

    const steeringGeom = new THREE.CylinderGeometry(0.04, 0.04, 0.6, 6);
    steeringGeom.rotateX(Math.PI / 4);
    const steeringMesh = new THREE.Mesh(steeringGeom, mechanicalMaterial);
    steeringMesh.position.set(0, 0.35, 0.3);
    builderGroup.add(steeringMesh);

    const exhaustGeom = new THREE.CylinderGeometry(0.03, 0.03, 1.2, 5);
    exhaustGeom.rotateX(Math.PI / 2 - 0.1);
    const exhaustMesh = new THREE.Mesh(exhaustGeom, mechanicalMaterial);
    exhaustMesh.position.set(-0.25, -0.1, -1.5);
    builderGroup.add(exhaustMesh);

    const wheelPositions = [
      { x: -0.85, y: -0.1, z: 1.1, size: 0.45, width: 0.15 },
      { x: 0.85, y: -0.1, z: 1.1, size: 0.45, width: 0.15 },
      { x: -0.9, y: -0.05, z: -1.0, size: 0.52, width: 0.22 },
      { x: 0.9, y: -0.05, z: -1.0, size: 0.52, width: 0.22 }
    ];

    wheelPositions.forEach(wp => {
      const cylGeom = new THREE.CylinderGeometry(wp.size, wp.size, wp.width, 12);
      cylGeom.rotateZ(Math.PI / 2);
      const rimGeom = new THREE.CylinderGeometry(wp.size * 0.5, wp.size * 0.5, wp.width + 0.02, 6);
      rimGeom.rotateZ(Math.PI / 2);

      const tyre = new THREE.Mesh(cylGeom, wheelMaterial);
      const rim = new THREE.Mesh(rimGeom, mechanicalMaterial);
      tyre.add(rim);

      tyre.position.set(wp.x, wp.y, wp.z);
      builderGroup.add(tyre);
    });
  } else {
    // Modern F1 aerodynamic car
    const monocoqueGeom = new THREE.CylinderGeometry(0.24, 0.35, 3.4, 8);
    monocoqueGeom.rotateX(Math.PI / 2);
    const monocoque = new THREE.Mesh(monocoqueGeom, carMaterial);
    monocoque.position.set(0, 0.1, 0.2);
    builderGroup.add(monocoque);

    const frontWingMainGeom = new THREE.BoxGeometry(1.9, 0.04, 0.25);
    const frontWingMain = new THREE.Mesh(frontWingMainGeom, carMaterial);
    frontWingMain.position.set(0, -0.22, 1.8);
    builderGroup.add(frontWingMain);

    const endplateFL = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.15, 0.3), wheelMaterial);
    endplateFL.position.set(-0.95, -0.15, 1.8);
    builderGroup.add(endplateFL);

    const endplateFR = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.15, 0.3), wheelMaterial);
    endplateFR.position.set(0.95, -0.15, 1.8);
    builderGroup.add(endplateFR);

    const sidepodLGeom = new THREE.BoxGeometry(0.4, 0.3, 1.1);
    const sidepodL = new THREE.Mesh(sidepodLGeom, carMaterial);
    sidepodL.position.set(-0.55, 0.08, 0.1);
    builderGroup.add(sidepodL);

    const sidepodRGeom = new THREE.BoxGeometry(0.4, 0.3, 1.1);
    const sidepodR = new THREE.Mesh(sidepodRGeom, carMaterial);
    sidepodR.position.set(0.55, 0.08, 0.1);
    builderGroup.add(sidepodR);

    const shadowUndertray = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.03, 2.2), wheelMaterial);
    shadowUndertray.position.set(0, -0.2, 0);
    builderGroup.add(shadowUndertray);

    const rearWingPlate = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.04, 0.26), carMaterial);
    rearWingPlate.position.set(0, 0.5, -1.4);
    builderGroup.add(rearWingPlate);

    const rearWingL = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.44, 0.3), wheelMaterial);
    rearWingL.position.set(-0.6, 0.35, -1.4);
    builderGroup.add(rearWingL);

    const rearWingR = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.44, 0.3), wheelMaterial);
    rearWingR.position.set(0.6, 0.35, -1.4);
    builderGroup.add(rearWingR);

    const wheelPositions = [
      { x: -0.85, y: -0.1, z: 1.2, size: 0.42, width: 0.28 },
      { x: 0.85, y: -0.1, z: 1.2, size: 0.42, width: 0.28 },
      { x: -0.92, y: -0.05, z: -1.0, size: 0.48, width: 0.4 },
      { x: 0.92, y: -0.05, z: -1.0, size: 0.48, width: 0.4 }
    ];

    wheelPositions.forEach(wp => {
      const cylGeom = new THREE.CylinderGeometry(wp.size, wp.size, wp.width, 16);
      cylGeom.rotateZ(Math.PI / 2);
      const rimGeom = new THREE.CylinderGeometry(wp.size * 0.48, wp.size * 0.48, wp.width + 0.02, 10);
      rimGeom.rotateZ(Math.PI / 2);

      const tyre = new THREE.Mesh(cylGeom, wheelMaterial);
      const rimColor = new THREE.Color(props.highlightColor);
      const rimMat = new THREE.MeshStandardMaterial({ color: rimColor, roughness: 0.3, metalness: 0.8 });
      const rim = new THREE.Mesh(rimGeom, rimMat);
      tyre.add(rim);

      tyre.position.set(wp.x, wp.y, wp.z);
      builderGroup.add(tyre);
    });
  }

  proceduralCar = builderGroup;
  carGroup.add(builderGroup);

  // Aerodynamic wind lines particle stream setup
  particlesGroup = new THREE.Group();
  scene.add(particlesGroup);

  streamGeometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  particleSpeeds.length = 0;

  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 1.5;
    positions[i * 3 + 1] = (Math.random() - 0.2) * 0.8;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 4.0;
    particleSpeeds.push(0.04 + Math.random() * 0.06);
  }

  streamGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const particleMaterial = new THREE.PointsMaterial({
    color: 0xef4444,
    size: 0.08,
    transparent: true,
    opacity: 0.85,
  });
  streamlinesPoints = new THREE.Points(streamGeometry, particleMaterial);
  particlesGroup.add(streamlinesPoints);

  // Load actual GLB model if provided
  loadingState.value = { status: 'loading', progress: 0 };

  if (props.glbModel) {
    const loader = new GLTFLoader();
    loader.load(
      props.glbModel,
      (gltf) => {
        loadingState.value = { status: 'success', progress: 100 };
        const model = gltf.scene;
        glbModelObj = model;

        if (proceduralCar && carGroup) {
          carGroup.remove(proceduralCar);
        }

        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const targetScale = 3.2 / maxDim;
        model.scale.set(targetScale, targetScale, targetScale);

        const center = box.getCenter(new THREE.Vector3());
        model.position.x = -center.x * targetScale;
        model.position.y = -center.y * targetScale - 0.1;
        model.position.z = -center.z * targetScale;

        model.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            if (mesh.material) {
              const mat = mesh.material as THREE.MeshStandardMaterial;
              mat.roughness = Math.min(mat.roughness || 0.4, 0.25);
              mat.metalness = Math.max(mat.metalness || 0.1, 0.75);
            }
          }
        });

        if (carGroup) carGroup.add(model);
      },
      (xhr) => {
        const percent = xhr.total > 0 ? (xhr.loaded / xhr.total) * 100 : 0;
        loadingState.value.progress = Math.round(percent);
      },
      (err) => {
        console.warn('⚡ GLB load failed (fallback mesh active):', err);
        loadingState.value = { status: 'fallback', progress: 100 };
      }
    );
  } else {
    loadingState.value = { status: 'fallback', progress: 100 };
  }

  // Animation Frame Loop
  const animate = () => {
    animationFrameId = requestAnimationFrame(animate);

    if (isRotatingAutomatically.value && !isDragging.value) {
      rotationTarget.x += 0.003;
    }

    if (carGroup) {
      carGroup.rotation.y += (rotationTarget.x - carGroup.rotation.y) * 0.12;
      carGroup.rotation.x += (rotationTarget.y - carGroup.rotation.x) * 0.12;
    }

    const currentCar = glbModelObj || proceduralCar;
    if (currentCar) {
      currentCar.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          const mat = mesh.material as THREE.MeshStandardMaterial;
          if (mat) {
            mat.wireframe = viewMode.value === 'wireframe';
            mat.opacity = viewMode.value === 'aerodynamics' ? 0.35 : 1.0;
            mat.transparent = viewMode.value === 'aerodynamics';
          }
        }
      });
    }

    if (particlesGroup && streamlinesPoints && streamGeometry) {
      particlesGroup.visible = viewMode.value === 'aerodynamics';

      if (viewMode.value === 'aerodynamics') {
        const posAttr = streamGeometry.getAttribute('position') as THREE.BufferAttribute;
        const speedMultiplier = 1.0 + props.rpmNormalized * 3.2;

        for (let i = 0; i < particleCount; i++) {
          let z = posAttr.getZ(i);
          const speed = particleSpeeds[i];
          z -= speed * speedMultiplier;

          if (z < -3.0) {
            z = 3.0 + Math.random() * 1.5;
            posAttr.setX(i, (Math.random() - 0.5) * 1.5);
            posAttr.setY(i, (Math.random() - 0.2) * 0.8);
          }
          posAttr.setZ(i, z);
        }
        posAttr.needsUpdate = true;
        if (carGroup) {
          streamlinesPoints.rotation.y = carGroup.rotation.y;
          streamlinesPoints.rotation.x = carGroup.rotation.x;
        }
      }
    }

    if (renderer && scene && camera) {
      renderer.render(scene, camera);
    }
  };

  animate();
};

const handleResize = () => {
  if (!mountRef.value || !renderer || !camera) return;
  const w = mountRef.value.clientWidth;
  const h = mountRef.value.clientHeight;

  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
};

// Handle Orbit Controls
const handleMouseDown = (e: MouseEvent) => {
  isDragging.value = true;
  isRotatingAutomatically.value = false;
  previousMousePosition.x = e.clientX;
  previousMousePosition.y = e.clientY;
};

const handleMouseMove = (e: MouseEvent) => {
  if (!isDragging.value) return;
  const deltaX = e.clientX - previousMousePosition.x;
  const deltaY = e.clientY - previousMousePosition.y;

  rotationTarget.x += deltaX * 0.01;
  rotationTarget.y = Math.max(-0.4, Math.min(1.0, rotationTarget.y + deltaY * 0.008));

  previousMousePosition.x = e.clientX;
  previousMousePosition.y = e.clientY;
};

const handleMouseUp = () => {
  isDragging.value = false;
};

// Mobile Touch
const handleTouchStart = (e: TouchEvent) => {
  const touch = e.touches[0];
  if (!touch) return;
  isDragging.value = true;
  isRotatingAutomatically.value = false;
  previousMousePosition.x = touch.clientX;
  previousMousePosition.y = touch.clientY;
};

const handleTouchMove = (e: TouchEvent) => {
  if (!isDragging.value) return;
  const touch = e.touches[0];
  if (!touch) return;
  const deltaX = touch.clientX - previousMousePosition.x;
  const deltaY = touch.clientY - previousMousePosition.y;

  rotationTarget.x += deltaX * 0.012;
  rotationTarget.y = Math.max(-0.4, Math.min(1.0, rotationTarget.y + deltaY * 0.01));

  previousMousePosition.x = touch.clientX;
  previousMousePosition.y = touch.clientY;
};

watch(() => props.carId, () => {
  // Restart the scene when the car changes
  cancelAnimationFrame(animationFrameId);
  initThree();
});

watch(zoom, (newZoom) => {
  if (camera) {
    camera.position.set(0, 1.8 * (2 - newZoom), 6.5 * (1.8 - newZoom));
    camera.lookAt(0, 0, 0);
  }
});

onMounted(() => {
  initThree();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  cancelAnimationFrame(animationFrameId);
  window.removeEventListener('resize', handleResize);
  if (renderer) {
    renderer.dispose();
  }
});
</script>

<template>
  <div ref="containerRef" id="canvas-3d-dossier" class="relative flex flex-col gap-4 bg-zinc-950 p-4 rounded-xl border border-white/5 shadow-inner select-none">
    
    <!-- 3D WebGL Three.js Container Area -->
    <div 
      class="relative w-full aspect-video md:h-[280px] bg-[#050505] rounded-lg overflow-hidden border border-white/10 group cursor-grab active:cursor-grabbing"
      @mousedown="handleMouseDown"
      @mousemove="handleMouseMove"
      @mouseup="handleMouseUp"
      @mouseleave="handleMouseUp"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="handleMouseUp"
    >
      
      <!-- Diagnostic gauge loaders -->
      <div v-if="loadingState.status === 'loading'" class="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-20 backdrop-blur-sm">
        <RefreshCw :size="24" class="text-[#E80020] animate-spin mb-3" />
        <div class="text-stone-300 text-xs font-bold font-mono tracking-widest uppercase">
          CAR CAD DIAGNOSTICS ACTIVATE
        </div>
        <div class="text-[#E80020] text-lg font-black font-mono mt-1">
          {{ loadingState.progress }}%
        </div>
        <div class="text-[10px] text-zinc-500 font-mono mt-2 text-center max-w-xs px-4 leading-relaxed">
          LOADING GLB EXTERNAL MESH FROM FILE ROOT
        </div>
      </div>

      <div v-if="loadingState.status === 'fallback'" class="absolute top-3 left-3 bg-[#E80020]/10 border border-[#E80020]/20 text-[#E80020] text-[9px] font-bold font-mono px-2 py-0.5 rounded tracking-wide z-10">
        Fallback SVG-Based procedural mesh active
      </div>

      <!-- View Mode Selectors -->
      <div class="absolute top-3 right-3 flex items-center gap-1.5 z-10 pointer-events-auto">
        <button
          @click.stop="viewMode = 'solid'"
          :class="[
            'p-1.5 rounded transition-all text-[11px] font-bold',
            viewMode === 'solid' ? 'bg-[#E80020] text-white shadow-[0_2px_6px_rgba(232,0,32,0.4)]' : 'bg-black/60 hover:bg-zinc-900 border border-white/10 text-stone-300'
          ]"
          title="渲染完整车体材质与细节"
        >
          SOLID
        </button>
        <button
          @click.stop="viewMode = 'wireframe'"
          :class="[
            'p-1.5 rounded transition-all text-[11px] font-bold',
            viewMode === 'wireframe' ? 'bg-[#E80020] text-white shadow-[0_2px_6px_rgba(232,0,32,0.4)]' : 'bg-black/60 hover:bg-zinc-900 border border-white/10 text-stone-300'
          ]"
          title="显示轻量线框网格与端点"
        >
          WIRE
        </button>
        <button
          @click.stop="viewMode = 'aerodynamics'"
          :class="[
            'p-1.5 rounded transition-all text-[11px] font-bold flex items-center gap-1',
            viewMode === 'aerodynamics' ? 'bg-[#E80020] text-white shadow-[0_2px_6px_rgba(232,0,32,0.4)]' : 'bg-black/60 hover:bg-zinc-900 border border-white/10 text-stone-300'
          ]"
          title="风洞实验室空气动力学仿真流体"
        >
          <Wind :size="12" />
          AERO
        </button>
      </div>

      <!-- Instructions -->
      <div class="absolute bottom-3 right-3 text-[10px] bg-black/70 backdrop-blur text-stone-400 font-medium font-sans px-2 py-1 rounded border border-white/10 select-none pointer-events-none group-hover:text-white transition-colors duration-200">
        🖱️ 鼠标拖拽 3D 自由环绕视角
      </div>

      <!-- Stats Labels -->
      <div class="absolute bottom-3 left-3 text-[9px] font-mono text-zinc-500 flex flex-col gap-0.5 select-none pointer-events-none">
        <span class="text-[#E80020]">ENGINE REV RPM: {{ (rpmNormalized * 100).toFixed(0) }}%</span>
        <span>AIR SPEED: {{ (rpmNormalized * 220 + 80).toFixed(0) }} KM/H</span>
      </div>

      <!-- Mounted DOM Canvas Container for Three.js -->
      <div ref="mountRef" class="w-full h-full block" />
    </div>

    <!-- Controls Bar Widget Wrapper -->
    <div class="flex flex-wrap items-center justify-between gap-3 text-xs bg-zinc-900/40 p-2.5 rounded border border-white/5">
      <div class="flex items-center gap-3">
        <button
          @click="isRotatingAutomatically = !isRotatingAutomatically"
          :class="[
            'flex items-center gap-1 px-2.5 py-1 rounded border transition-colors',
            isRotatingAutomatically
              ? 'bg-[#E80020]/15 border-[#E80020]/30 text-[#E80020]'
              : 'bg-zinc-950 border-white/5 text-stone-400 hover:text-white'
          ]"
        >
          <Rotate3d :size="13" />
          <span>{{ isRotatingAutomatically ? '自动偏航: 运行中' : '自动偏航: 暂停' }}</span>
        </button>
      </div>

      <!-- Model Replacement Hint in footer -->
      <div class="text-[10px] text-zinc-500 font-mono tracking-tight hidden sm:block max-w-xs overflow-hidden text-ellipsis whitespace-nowrap">
        GLB: <span class="text-zinc-300 select-all">{{ glbModel || '无外部模型' }}</span>
      </div>

      <!-- Orbit Zoom Scale Controls -->
      <div class="flex items-center gap-2">
        <button
          @click="zoom = Math.max(0.6, zoom - 0.15)"
          class="p-1 rounded bg-zinc-950 border border-white/5 text-stone-400 hover:text-white transition-colors"
          title="缩小"
        >
          <ZoomOut :size="13" />
        </button>
        <span class="font-mono text-zinc-400 font-bold px-1 select-none w-10 text-center">
          {{ Math.round(zoom * 100) }}%
        </span>
        <button
          @click="zoom = Math.min(1.8, zoom + 0.15)"
          class="p-1 rounded bg-zinc-950 border border-white/5 text-stone-400 hover:text-white transition-colors"
          title="放大"
        >
          <ZoomIn :size="13" />
        </button>
      </div>
    </div>
  </div>
</template>
