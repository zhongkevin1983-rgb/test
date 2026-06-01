<script setup lang="ts">
import { ArrowRight, ChevronRight } from 'lucide-vue-next';
import { Car } from '../types';

defineProps<{
  cars: Car[];
  selectedCar: Car;
}>();

const emit = defineEmits<{
  (e: 'selectCar', car: Car): void;
  (e: 'exploreTimeline'): void;
}>();
</script>

<template>
  <section
    id="hero"
    class="relative min-h-screen bg-[#050505] text-white flex flex-col justify-between pt-24 overflow-hidden"
  >
    <!-- Absolute Ambient Background Lights matching Ferrari theme -->
    <div class="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-red-900/15 rounded-full blur-[140px] pointer-events-none z-0" />
    <div class="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-red-950/10 rounded-full blur-[100px] pointer-events-none z-0" />

    <!-- Hero Body Content Grid -->
    <div class="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center flex-1 z-10 py-12">
      
      <!-- Left Column Typography layout -->
      <div class="lg:col-span-5 flex flex-col justify-center gap-6">
        <div class="space-y-1">
          <span class="text-xs uppercase tracking-[0.25em] text-[#E80020] font-mono font-black">
            SCUDERIA FERRARI
          </span>
          <h1 class="text-5xl md:text-7xl font-sans font-black tracking-tighter leading-[0.9] text-white uppercase mt-1">
            DRIVEN BY <br />
            <span class="text-[#E80020] filter drop-shadow-[0_4px_16px_rgba(232,0,32,0.3)]">
              PASSION
            </span>
          </h1>
          <p class="text-lg md:text-xl font-medium tracking-tight text-white/95 mt-3">
            以热爱·驱动传奇
          </p>
        </div>

        <p class="text-stone-400 font-sans text-sm md:text-base leading-relaxed max-w-sm">
          自 1950 年首战 F1 至今，混动引擎的轰鸣与激情仍不曾稍息。法拉利红色车影划破赛道，书写着速度与荣耀的极致历史。
        </p>

        <div class="flex flex-wrap gap-4 mt-2">
          <button
            @click="emit('exploreTimeline')"
            class="group inline-flex items-center gap-2 px-7 py-3.5 bg-transparent border border-[#E80020] hover:bg-[#E80020] rounded text-white text-xs font-black tracking-widest uppercase transition-all duration-300 filter drop-shadow-[0_2px_8px_rgba(232,0,32,0.15)] cursor-pointer"
          >
            <span>探索历年赛车</span>
            <ArrowRight :size="14" class="transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        </div>
      </div>

      <!-- Right Column: Hero Car Dynamic Showcase inside elegant frame -->
      <div class="lg:col-span-7 relative flex items-center justify-center min-h-[300px] lg:min-h-[480px]">
        <!-- Scuderia Giant Stallion Cavallino Crest faint logo in core background -->
        <div class="absolute inset-0 flex items-center justify-center opacity-[0.035] pointer-events-none select-none z-0">
          <svg viewBox="0 0 100 130" class="w-[85%] h-auto max-w-[420px]" fill="currentColor">
            <path d="M51 68C51 68 53.5 61.5 56 61.5C58.5 61.5 59.5 65.5 61.5 65.5C63.5 65.5 65 60.5 62 57.5C59 54.5 57 51 58.5 45C60 39 63.5 31.5 58.5 27.5C53.5 23.5 44 26 44 26C44 26 43 18.5 44 14C45 9.5 49 6 49 6C49 6 42.5 7.5 39.5 14C36.5 20.5 37 25 37 25C37 25 31.5 20.5 25.5 23C19.5 25.5 21.5 30.5 23.5 31C25.5 31.5 28 30 28 30C28 30 24 37 19.5 35.5C15 34 11.5 29 11.5 29C11.5 29 15.5 36.5 21.5 38.5C27.5 40.5 31.5 37 31.5 37C31.5 37 28 44.5 24 47C20 49.5 14 47.5 14 47.5C14 47.5 20.5 51.5 25.5 51C30.5 50.5 33 46 33 46C33 46 33.5 52.5 34 58.5C34.5 64.5 31.5 67 31.5 67C31.5 67 36.5 64.5 38.5 59C40.5 53.5 40.5 48.5 40.5 48.5C40.5 48.5 44 54 44 60.5C44 67 39 74.5 39 74.5" />
          </svg>
        </div>

        <!-- Glowing Red Underlight reflection floor ellipse -->
        <div class="absolute bottom-[10%] left-1/4 right-1/4 h-[40px] bg-red-600/25 rounded-full blur-[25px] pointer-events-none z-0" />

        <!-- Active F1 Car Display with subtle entry motion -->
        <div class="relative z-10 w-full flex flex-col items-center">
          <img
            :src="selectedCar.image"
            :alt="selectedCar.fullName"
            class="w-full max-w-[580px] h-auto object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.9)] transition-all duration-700 hover:scale-102"
            referrerpolicy="no-referrer"
          />
          <!-- Overlay quick spec tag -->
          <div class="absolute bottom-[-15px] bg-black/80 backdrop-blur border border-white/5 rounded px-4 py-2 flex items-center gap-4 text-xs tracking-wider font-mono shadow-xl z-20">
            <span class="text-zinc-500">YEAR : <strong class="text-white">{{ selectedCar.year }}</strong></span>
            <span class="h-3 w-px bg-zinc-800" />
            <span class="text-zinc-500">CHASSIS : <strong class="text-[#E80020]">{{ selectedCar.name }}</strong></span>
          </div>
        </div>
      </div>

    </div>

    <!-- Horizontal Carousel Selector Section ("历年经典赛车" banner) -->
    <div class="bg-[#0b0b0d] border-t border-b border-white/5 py-6 z-10">
      <div class="max-w-7xl mx-auto px-6">
        
        <!-- Subtitle banner header -->
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-3">
            <span class="text-xs font-bold tracking-widest text-zinc-400 uppercase">
              历年经典赛车
            </span>
            <div class="h-px w-20 bg-gradient-to-r from-[#E80020] to-transparent" />
          </div>
          <button
            @click="emit('exploreTimeline')"
            class="inline-flex items-center text-[11px] font-bold tracking-wider text-zinc-500 hover:text-[#E80020] transition-colors gap-1 uppercase"
          >
            <span>查看全部赛车</span>
            <ChevronRight :size="12" />
          </button>
        </div>

        <!-- Carousel elements -->
        <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
          <button
            v-for="car in cars"
            :key="car.id"
            @click="emit('selectCar', car)"
            :class="[
              'relative group flex flex-col items-center p-3 rounded bg-zinc-950 border transition-all duration-500 text-center',
              selectedCar.id === car.id
                ? 'border-[#E80020] shadow-[0_0_15px_rgba(232,0,32,0.15)]'
                : 'border-white/5 hover:border-white/10'
            ]"
          >
            <!-- Subtle hover red back-lighting -->
            <div v-if="selectedCar.id === car.id" class="absolute inset-0 bg-gradient-to-b from-[#E80020]/5 to-transparent rounded pointer-events-none" />

            <div class="relative h-12 w-full flex items-center justify-center overflow-hidden">
              <img
                :src="car.image"
                :alt="car.name"
                referrerpolicy="no-referrer"
                class="max-h-11 object-contain drop-shadow-[0_4px_6px_rgba(0,0,0,0.8)] filter transition-transform duration-300 group-hover:scale-105"
              />
            </div>

            <div class="mt-2.5 flex flex-col">
              <span class="text-[10px] font-mono tracking-widest text-[#E80020] font-black">
                {{ car.name }}
              </span>
              <span class="text-[9px] font-mono text-stone-500 mt-0.5">
                F1 {{ car.year }}
              </span>
            </div>
          </button>
        </div>

        <!-- Scroll Guide Indicator -->
        <div class="flex flex-col items-center mt-7 gap-1">
          <span class="text-[9px] font-mono text-zinc-500 tracking-[0.2em] uppercase">
            向下滚动 / SCROLL
          </span>
          <div class="w-5 h-8 border border-zinc-700 hover:border-[#E80020] rounded-full flex justify-center p-1 cursor-pointer transition-colors duration-200" @click="emit('exploreTimeline')">
            <div class="w-1 h-2 bg-[#E80020] rounded-full animate-bounce" />
          </div>
        </div>

      </div>
    </div>
  </section>
</template>
