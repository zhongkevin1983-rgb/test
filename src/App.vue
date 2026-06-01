<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { Trophy, Award, Flame, Radio } from 'lucide-vue-next';
import NavBar from './components/NavBar.vue';
import HeroSection from './components/HeroSection.vue';
import WindingTrack from './components/WindingTrack.vue';
import Footer from './components/Footer.vue';
import CarDetailModal from './components/CarDetailModal.vue';
import { FERRARI_CARS } from './data/cars';
import { Car } from './types';

const selectedCar = ref<Car>(FERRARI_CARS[0]!);
const activeSection = ref<string>('hero');
const detailedCar = ref<Car | null>(null);

const handleScroll = () => {
  const scrollY = window.scrollY;
  const heroEl = document.getElementById('hero');
  const timelineEl = document.getElementById('timeline');
  const gloryEl = document.getElementById('glory');
  const historyEl = document.getElementById('history');

  if (historyEl && scrollY >= historyEl.offsetTop - 300) {
    activeSection.value = 'history';
  } else if (gloryEl && scrollY >= gloryEl.offsetTop - 300) {
    activeSection.value = 'glory';
  } else if (timelineEl && scrollY >= timelineEl.offsetTop - 300) {
    activeSection.value = 'timeline';
  } else {
    activeSection.value = 'hero';
  }
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});

const handleNavigate = (sectionId: string) => {
  const el = document.getElementById(sectionId);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    activeSection.value = sectionId;
  }
};

const ferrariStats = [
  { label: '车队总冠军 (WCC)', value: '16', sub: '历史最伟大车队记录', icon: Trophy, color: '#eab308' },
  { label: '车手总冠军 (WDC)', value: '15', sub: '王者之师印记', icon: Award, color: '#E80020' },
  { label: '分站赛冠军 (Wins)', value: '244+', sub: '红色风暴横扫全球', icon: Flame, color: '#f97316' },
  { label: '分站赛杆位 (Poles)', value: '249+', sub: '极致极限排位突破', icon: Radio, color: '#a855f7' },
];
</script>

<template>
  <div id="app-root-container" class="min-h-screen bg-[#050505] text-stone-100 flex flex-col font-sans selection:bg-[#E80020]/30 selection:text-white">
    <!-- Navigation Layer -->
    <NavBar :active-section="activeSection" @navigate="handleNavigate" />

    <!-- Hero Showcase Block -->
    <HeroSection
      :cars="FERRARI_CARS"
      :selected-car="selectedCar"
      @select-car="selectedCar = $event"
      @explore-timeline="handleNavigate('timeline')"
    />

    <!-- Track Timeline Block -->
    <WindingTrack @select-car="detailedCar = $event" />

    <!-- Glory Stats Section ("赛事辉煌") -->
    <section id="glory" class="relative py-24 bg-[#08080a] text-white border-t border-white/5 overflow-hidden">
      <!-- Decorative elements -->
      <div class="absolute inset-0 bg-radial from-red-900/10 to-transparent pointer-events-none" />
      <div class="absolute top-24 right-1/2 translate-x-1/2 w-[800px] h-[1px] bg-gradient-to-r from-transparent via-[#E80020]/20 to-transparent" />

      <div class="max-w-7xl mx-auto px-6 relative z-10">
        
        <!-- Header -->
        <div class="flex flex-col mb-16 max-w-xl">
          <div class="flex items-center gap-3">
            <span class="h-0.5 w-10 bg-[#E80020] rounded-full" />
            <h2 class="font-sans font-black text-3xl md:text-4xl tracking-tight uppercase">
              赛事辉煌
            </h2>
          </div>
          <p class="mt-4 text-stone-400 font-sans text-sm md:text-base leading-relaxed">
            自 1950 年蒙扎大奖赛首次出征以来，Scuderia Ferrari 已成为 F1 史上唯一参与了全部赛季的标志性车队。那一抹烈火般的红色，铸就了无可动摇的赛道图腾。
          </p>
        </div>

        <!-- Stats Grid exactly matching premium dashboard styling -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div
            v-for="(stat, idx) in ferrariStats"
            :key="idx"
            class="bg-zinc-950/80 rounded-xl p-6 border border-white/5 hover:border-[#E80020]/30 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-[0_10px_25px_rgba(232,0,32,0.1)] flex flex-col justify-between h-[180px]"
          >
            <div class="flex items-center justify-between">
              <span class="text-stone-400 text-xs font-bold font-sans tracking-wide uppercase">
                {{ stat.label }}
              </span>
              <div
                class="w-8 h-8 rounded-lg flex items-center justify-center border border-white/5"
                :style="{ color: stat.color, backgroundColor: `${stat.color}15` }"
              >
                <component :is="stat.icon" :size="16" />
              </div>
            </div>

            <div class="mt-4 flex flex-col">
              <span
                class="font-sans font-black text-5xl tracking-tight mb-1 drop-shadow-[0_2px_10px_rgba(255,255,255,0.05)]"
                :style="{ color: stat.color }"
              >
                {{ stat.value }}
              </span>
              <span class="text-[10px] text-zinc-500 font-medium tracking-wide">
                {{ stat.sub }}
              </span>
            </div>
          </div>
        </div>

        <!-- Core Team Quote banner -->
        <div class="mt-16 bg-gradient-to-r from-[#0d0d0f] via-zinc-950 to-[#0d0d0f] rounded-xl p-8 border border-white/5 flex flex-col md:flex-row items-center gap-8 justify-between">
          <div class="flex flex-col gap-1.5 max-w-xl">
            <span class="text-[10px] tracking-widest text-[#E80020] font-bold font-mono uppercase">
              Enzo Ferrari Statement / 恩佐·法拉利信条
            </span>
            <p class="font-serif italic text-lg text-stone-200 mt-1 leading-relaxed">
              “当你给一个孩子纸和画笔，让他们画一辆车，他画出来的肯定会是红色的。”
            </p>
          </div>
          <div class="text-right flex flex-col whitespace-nowrap">
            <span class="text-sm font-bold text-white uppercase font-sans tracking-wide">
              Enzo Ferrari
            </span>
            <span class="text-xs text-stone-500 font-medium uppercase font-mono mt-0.5">
              FOUNDER OF FERRARI
            </span>
          </div>
        </div>

      </div>
    </section>

    <!-- Footer Branded Block -->
    <Footer />

    <!-- Overlay Specs Detail Modal -->
    <CarDetailModal
      v-if="detailedCar"
      :car="detailedCar"
      @close="detailedCar = null"
    />
  </div>
</template>
