<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { ChevronDown, ArrowRight } from 'lucide-vue-next';
import { FERRARI_CARS } from '../data/cars';
import { Car } from '../types';

const emit = defineEmits<{
  (e: 'selectCar', car: Car): void;
}>();

const hoveredCarId = ref<string | null>(null);

// SVG Bezier S-curve track path for 8 eras/cars
const trackPath = "M 400,0 C 720,175, 80,525, 400,700 C 720,875, 80,1225, 400,1400 C 720,1575, 80,1925, 400,2100 C 720,2275, 80,2625, 400,2800";

// Coordinates of dots on the track corresponding to the 8 cars/eras (at Y values roughly every 350px)
const carNodes = [
  { id: 'f125-f1', x: 560, y: 175, side: 'right' },
  { id: 'f156-sharknose', x: 240, y: 525, side: 'left' },
  { id: 'f312-t2', x: 560, y: 875, side: 'right' },
  { id: 'f126c2', x: 240, y: 1225, side: 'left' },
  { id: 'f641', x: 560, y: 1575, side: 'right' },
  { id: 'f2004', x: 240, y: 1925, side: 'left' },
  { id: 'f2008', x: 560, y: 2275, side: 'right' },
  { id: 'sf-24', x: 240, y: 2625, side: 'left' },
];

const sectionRef = ref<HTMLDivElement | null>(null);
const pathRef = ref<SVGPathElement | null>(null);
const carPos = ref<{ x: number, y: number, angle: number } | null>(null);

const handleScroll = () => {
  const section = sectionRef.value;
  const pathEl = pathRef.value;
  if (!section || !pathEl) return;

  const rect = section.getBoundingClientRect();
  const viewportHeight = window.innerHeight;

  // Start calculating as soon as timeline comes into halfway of viewport, and finish by the end of it
  const startTrigger = viewportHeight * 0.6;
  const endTrigger = viewportHeight * 0.3;

  const totalScrollableHeight = rect.height - endTrigger;
  const scrolledRelative = -rect.top + startTrigger;

  let progress = scrolledRelative / totalScrollableHeight;
  progress = Math.max(0, Math.min(0.999, progress)); // Keep slightly below 1 to prevent out of bounds

  try {
    const totalLength = pathEl.getTotalLength();
    const currentLength = progress * totalLength;

    // Trace points slightly ahead and behind to compute trajectory angle/tangent
    const p1 = pathEl.getPointAtLength(Math.max(0, currentLength - 6));
    const p2 = pathEl.getPointAtLength(Math.min(totalLength, currentLength + 6));
    const pCenter = pathEl.getPointAtLength(currentLength);

    const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x) * (180 / Math.PI);

    carPos.value = {
      x: pCenter.x,
      y: pCenter.y,
      angle: angle
    };
  } catch (err) {
    // Safe check for systems where getTotalLength is not available initially
  }
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true });
  window.addEventListener('resize', handleScroll);
  
  // Delayed trigger to compute initial placement
  setTimeout(handleScroll, 200);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
  window.removeEventListener('resize', handleScroll);
});
</script>

<template>
  <section ref="sectionRef" id="timeline" class="relative bg-[#050505] text-white py-24 overflow-hidden border-t border-white/5">
    <!-- Absolute red radial lighting behind top text -->
    <div class="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-red-900/15 rounded-full blur-[120px] pointer-events-none" />

    <!-- Main Container -->
    <div class="max-w-7xl mx-auto px-6">
      
      <!-- Header Block -->
      <div class="flex flex-col mb-16 relative z-10 max-w-xl">
        <div class="flex items-center gap-3">
          <span class="h-0.5 w-10 bg-[#E80020] rounded-full" />
          <h2 class="font-sans font-black text-3xl md:text-4xl tracking-tight text-white uppercase flex items-center gap-2">
            历年赛车
          </h2>
        </div>
        <p class="mt-4 text-stone-400 font-sans text-sm md:text-base leading-relaxed">
          沿着时间的赛道，回顾法拉利 F1 赛车的进化之旅。每一台赛车都是对速度与技术的极致追求。从经典自吸到现代混动，红色激情在赛道上永不止息。
        </p>
      </div>

      <!-- Winding Track Timeline Container -->
      <div class="relative min-h-[2900px] md:min-h-[2850px] py-10">
        
        <!-- Racetrack SVG Overlay in Middle -->
        <div class="absolute inset-y-0 left-1/2 -translate-x-1/2 w-full max-w-[800px] pointer-events-none hidden md:block">
          <svg
            width="100%"
            height="2800"
            viewBox="0 0 800 2800"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            class="opacity-70"
          >
            <!-- broad asphalt under-lane shadow -->
            <path
              :d="trackPath"
              stroke="#000000"
              stroke-width="70"
              stroke-linecap="round"
              opacity="0.9"
            />

            <!-- Asphalt grey main lane -->
            <path
              :d="trackPath"
              stroke="#1c1c1f"
              stroke-width="56"
              stroke-linecap="round"
            />

            <!-- Left Stripe Curbs (alternated red & white) -->
            <!-- White dashed -->
            <path
              :d="trackPath"
              stroke="#ffffff"
              stroke-width="5"
              stroke-linecap="round"
              stroke-dasharray="24 24"
              transform="translate(-27, 0)"
            />
            <!-- Red dashed -->
            <path
              :d="trackPath"
              stroke="#E80020"
              stroke-width="5"
              stroke-linecap="round"
              stroke-dasharray="24 24"
              stroke-dashoffset="24"
              transform="translate(-27, 0)"
            />

            <!-- Right Stripe Curbs (alternated red & white) -->
            <!-- White dashed -->
            <path
              :d="trackPath"
              stroke="#ffffff"
              stroke-width="5"
              stroke-linecap="round"
              stroke-dasharray="24 24"
              transform="translate(27, 0)"
            />
            <!-- Red dashed -->
            <path
              :d="trackPath"
              stroke="#E80020"
              stroke-width="5"
              stroke-linecap="round"
              stroke-dasharray="24 24"
              stroke-dashoffset="24"
              transform="translate(27, 0)"
            />

            <!-- Center dashes (Yellow/Gold racing line) -->
            <path
              ref="pathRef"
              :d="trackPath"
              stroke="#eab308"
              stroke-width="1.5"
              stroke-dasharray="10 16"
              opacity="0.75"
            />

            <!-- Interactive Scrolling Car on the track -->
            <g 
              v-if="carPos"
              :transform="`translate(${carPos.x}, ${carPos.y}) rotate(${carPos.angle - 90})`" 
              class="transition-transform duration-75 ease-out"
            >
              <!-- Shadow of the car -->
              <rect
                x="-12"
                y="-26"
                width="24"
                height="52"
                rx="6"
                fill="black"
                opacity="0.4"
                transform="translate(2, 4)"
              />

              <!-- Rear Wing -->
              <rect
                x="-18"
                y="-24"
                width="36"
                height="5"
                rx="1"
                fill="#111111"
              />
              <!-- Rear Wing Endplates -->
              <rect x="-19" y="-25" width="2" height="7" rx="0.5" fill="#E80020" />
              <rect x="17" y="-25" width="2" height="7" rx="0.5" fill="#E80020" />

              <!-- Rear Wheels/Tires -->
              <rect x="-21" y="-14" width="7" height="12" rx="2" fill="#18181b" stroke="#374151" stroke-width="0.5" />
              <rect x="14" y="-14" width="7" height="12" rx="2" fill="#18181b" stroke="#374151" stroke-width="0.5" />

              <!-- Sidepods and Chassis Body -->
              <path
                d="M -11,-15 C -11,-15 -13,-4 -11,4 C -9,12 -5,17 -3,22 L 3,22 C 5,17 9,12 11,4 C 13,-4 11,-15 11,-15 Z"
                fill="#E80020"
                stroke="#b91c1c"
                stroke-width="0.5"
              />

              <!-- Front Wheels/Tires -->
              <rect x="-19" y="10" width="6" height="10" rx="1.5" fill="#18181b" stroke="#374151" stroke-width="0.5" />
              <rect x="13" y="10" width="6" height="10" rx="1.5" fill="#18181b" stroke="#374151" stroke-width="0.5" />

              <!-- Front Wing -->
              <rect
                x="-16"
                y="21"
                width="32"
                height="3.5"
                rx="0.5"
                fill="#E80020"
              />
              <rect x="-17" y="20.5" width="2" height="4.5" rx="0.5" fill="#111" />
              <rect x="15" y="20.5" width="2" height="4.5" rx="0.5" fill="#111" />

              <!-- Driver Cockpit Hole & Yellow Helmet -->
              <ellipse cx="0" cy="-2" rx="3.5" ry="5.5" fill="#111111" />
              <circle cx="0" cy="-2" r="2.5" fill="#facc15" />

              <!-- Engine Spine/Fin -->
              <line x1="0" y1="-14" x2="0" y2="-6" stroke="#111111" stroke-width="1.5" stroke-linecap="round" />

              <!-- Aero flow lights -->
              <line x1="-1" y1="-26" x2="-1" y2="-32" stroke="#ef4444" stroke-width="1" opacity="0.6" />
              <line x1="1" y1="-26" x2="1" y2="-32" stroke="#ef4444" stroke-width="1" opacity="0.6" />
            </g>

            <!-- Interactive nodes on the track -->
            <g v-for="node in carNodes" :key="node.id" class="transition-all duration-300">
              <!-- Outer pulse aura -->
              <circle
                :cx="node.x"
                :cy="node.y"
                :r="hoveredCarId === node.id ? 20 : 12"
                :class="[
                  'transition-all duration-500 fill-red-600/20 stroke-red-600/40',
                ]"
                :stroke-width="hoveredCarId === node.id ? 2 : 1"
              />
              <!-- Solid core indicator -->
              <circle
                :cx="node.x"
                :cy="node.y"
                :r="hoveredCarId === node.id ? 8 : 5"
                :class="[
                  'transition-all duration-300',
                  hoveredCarId === node.id ? 'fill-[#E80020] stroke-white' : 'fill-stone-300 stroke-[#18181b]'
                ]"
                stroke-width="1.5"
              />
              <!-- Glowing highlight indicator -->
              <circle
                v-if="hoveredCarId === node.id"
                :cx="node.x"
                :cy="node.y"
                r="30"
                class="fill-none stroke-red-500/10 animate-ping"
                stroke-width="1"
              />
            </g>
          </svg>
        </div>

        <!-- Cars Cards Grid Layout -->
        <div class="relative z-20 flex flex-col gap-28 md:gap-32">
          <div
            v-for="(car, index) in FERRARI_CARS"
            :key="car.id"
            :class="[
              'flex flex-col md:grid md:grid-cols-12 items-center w-full transition-all duration-500',
              (index % 2 === 0) ? '' : 'md:flex-row-reverse'
            ]"
            @mouseenter="hoveredCarId = car.id"
            @mouseleave="hoveredCarId = null"
          >
            
            <!-- Information Column -->
            <div
              :class="[
                'md:col-span-5 flex flex-col justify-center px-4 w-full',
                (index % 2 === 0) ? 'md:text-right md:items-end' : 'md:text-left md:items-start'
              ]"
            >
              <div class="flex flex-col gap-2">
                <!-- Era badge and Range -->
                <div :class="['flex items-center gap-2 mb-1 flex-wrap', (index % 2 === 0) ? 'md:justify-end' : 'md:justify-start']">
                  <span class="px-2 py-0.5 text-[10px] font-black tracking-wider uppercase bg-[#E80020]/15 text-[#E80020] border border-[#E80020]/25 rounded font-mono">
                    {{ car.era }}
                  </span>
                  <span class="text-xs font-mono font-black text-stone-500">
                    {{ car.eraRange }}
                  </span>
                </div>
                <!-- Year badge -->
                <span class="font-sans font-black text-5xl md:text-6xl text-white/10 tracking-tight leading-none leading-none">
                  {{ car.year }}
                </span>
                <!-- Model designation label -->
                <h3 class="font-sans font-black text-2xl md:text-3xl text-white uppercase tracking-tight mt-1">
                  {{ car.name }}
                </h3>
                <!-- Technical summary description -->
                <p :class="['mt-3 text-stone-400 font-sans text-sm leading-relaxed max-w-sm', (index % 2 === 0) ? 'md:ml-auto' : 'md:mr-auto']">
                  {{ car.description }}
                </p>
                <!-- Expand details link -->
                <button
                  @click="emit('selectCar', car)"
                  :class="[
                    'mt-4 group inline-flex items-center gap-1.5 text-xs font-bold tracking-wider text-[#E80020] uppercase py-1.5 px-3 rounded-lg hover:bg-red-950/20 border border-transparent hover:border-red-950/40 transition-all duration-300',
                    (index % 2 === 0) ? 'md:self-end' : 'md:self-start'
                  ]"
                >
                  <span>查看详情</span>
                  <ArrowRight :size="14" class="transition-transform duration-300 group-hover:translate-x-1" />
                </button>
              </div>
            </div>

            <!-- Middle Column Spacer for the SVG track overlay -->
            <div class="hidden md:block md:col-span-2" />

            <!-- Right/Left Column (Image display) -->
            <div
              @click="emit('selectCar', car)"
              class="md:col-span-5 w-full flex justify-center items-center mt-6 md:mt-0 px-4 cursor-pointer"
            >
              <div class="relative group w-full max-w-[340px] flex items-center justify-center p-4 bg-[#111]/40 hover:bg-zinc-900/60 rounded-xl border border-white/5 hover:border-white/10 transition-all duration-500 hover:shadow-[0_8px_30px_rgba(232,0,32,0.1)]">
                <!-- Backlighting effect -->
                <div class="absolute inset-0 bg-radial from-red-600/10 to-transparent transition-opacity duration-500 opacity-60 group-hover:opacity-100 rounded-xl" />

                <!-- Display image with no-referrer policy -->
                <img
                  :src="car.image"
                  :alt="car.name"
                  referrerpolicy="no-referrer"
                  :class="[
                    'w-full h-auto object-contain max-h-[160px] drop-shadow-[0_10px_20px_rgba(0,0,0,0.85)] z-10 transition-transform duration-500 group-hover:scale-105',
                    (index % 2 === 0) ? 'scale-x-[-1]' : ''
                  ]"
                />

                <!-- Absolute corner graphic elements -->
                <div class="absolute top-2 right-3 text-[10px] font-mono tracking-widest text-[#E80020] font-black opacity-30 group-hover:opacity-100 transition-opacity duration-300 uppercase">
                  {{ car.chassis }}
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>

      <!-- Load More Button -->
      <div class="flex justify-center mt-20 relative z-10">
        <button class="flex items-center gap-2 group px-8 py-3.5 bg-transparent hover:bg-[#E80020]/10 border border-[#E80020]/20 hover:border-[#E80020]/50 rounded-md text-stone-200 hover:text-white text-xs font-black tracking-widest uppercase transition-all duration-300 filter drop-shadow-md">
          <span>加载更多赛车</span>
          <ChevronDown :size="14" class="text-[#E80020] group-hover:translate-y-0.5 transition-transform duration-300" />
        </button>
      </div>

    </div>
  </section>
</template>
