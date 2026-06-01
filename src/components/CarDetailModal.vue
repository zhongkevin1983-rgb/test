<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue';
import { X, Volume2, VolumeX, Shield, Zap, Sparkles, Activity } from 'lucide-vue-next';
import { Car } from '../types';
import { startEngine, stopEngine, setRPM } from '../utils/audio';
import InteractiveCar3D from './InteractiveCar3D.vue';

const props = defineProps<{
  car: Car;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const isPlaying = ref(false);
const rpm = ref(0.1); // 0.1 is idle
const isPressingRev = ref(false);
const mediaTab = ref<'3d' | 'image'>('3d');

let revIntervalId: any = null;

const clearRevInterval = () => {
  if (revIntervalId) {
    clearInterval(revIntervalId);
    revIntervalId = null;
  }
};

const updateSimulation = () => {
  clearRevInterval();

  if (isPressingRev.value && isPlaying.value) {
    // Accelerate rapidly up to redline (1.0)
    revIntervalId = window.setInterval(() => {
      rpm.value = Math.min(rpm.value + 0.08, 1.0);
      setRPM(rpm.value);
    }, 30);
  } else {
    // Decelerate slowly back to idle (0.1)
    revIntervalId = window.setInterval(() => {
      rpm.value = Math.max(rpm.value - 0.05, 0.1);
      setRPM(rpm.value);
      if (rpm.value === 0.1) {
        clearRevInterval();
      }
    }, 40);
  }
};

watch([isPressingRev, isPlaying], () => {
  updateSimulation();
});

// Stop sound when modal closes or car changes
watch(() => props.car, () => {
  stopEngine();
  isPlaying.value = false;
  rpm.value = 0.1;
  clearRevInterval();
});

onUnmounted(() => {
  clearRevInterval();
  stopEngine();
});

const handleToggleSound = () => {
  if (isPlaying.value) {
    stopEngine();
    isPlaying.value = false;
    rpm.value = 0.1;
  } else {
    startEngine(props.car.audioType);
    setRPM(0.1);
    isPlaying.value = true;
    rpm.value = 0.1;
  }
};

const handleRpmSliderChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const val = parseFloat(target.value);
  if (!isPlaying.value) {
    startEngine(props.car.audioType);
    isPlaying.value = true;
  }
  rpm.value = val;
  setRPM(val);
};

// Estimated RPM for display based on car era
const getDisplayRpm = () => {
  if (props.car.audioType === 'v6') {
    return Math.floor(4000 + rpm.value * 8500); // F1 V6 turbo hybrid rev limit
  } else if (props.car.audioType === 'v8') {
    return Math.floor(6000 + rpm.value * 13000); // Screamer V8
  } else {
    return Math.floor(2500 + rpm.value * 4500); // Vintage V12
  }
};

// Helper for dynamic coloring of the tachometer bars
const getTachometerColorClass = (index: number, activeCount: number) => {
  const isActive = index < activeCount;
  if (!isActive) return 'bg-zinc-800';
  
  if (index < 12) return 'bg-green-500 shadow-[0_0_8px_#22c55e]'; // Green lights (safe range)
  if (index < 17) return 'bg-yellow-500 shadow-[0_0_8px_#eab308]'; // Yellow lights (power peak)
  return 'bg-red-500 animate-pulse shadow-[0_0_12px_#ef4444]'; // Redline flashes
};
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-black/90 backdrop-blur-xl animate-fade-in">
    <div class="relative w-full max-w-5xl bg-gradient-to-br from-zinc-950 via-[#0c0001] to-black rounded-2xl border border-white/10 shadow-[0_20px_60px_rgba(232,0,32,0.15)] overflow-hidden max-h-[90vh] flex flex-col">
      
      <!-- Top Header Controls -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-white/5">
        <div class="flex items-center gap-3">
          <span class="text-[10px] tracking-widest font-mono text-zinc-500 uppercase">
            Scuderia Ferrari Archive
          </span>
          <span class="text-xs bg-[#E80020]/20 text-[#E80020] px-2.5 py-0.5 rounded-full font-semibold border border-[#E80020]/30 font-mono">
            ★ {{ car.year }}
          </span>
        </div>
        <button
          @click="emit('close')"
          class="text-stone-400 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-full transition-all duration-200"
        >
          <X :size="20" />
        </button>
      </div>

      <!-- Scrollable Content Outer Body -->
      <div class="flex-1 overflow-y-auto p-6 md:p-8">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <!-- Left Column: Image Area & Audio Panel -->
          <div class="lg:col-span-5 flex flex-col gap-6">
            <!-- Tab Selector for 3D vs Image -->
            <div class="flex bg-[#111] p-1 rounded-lg border border-white/5">
              <button
                @click="mediaTab = '3d'"
                :class="[
                  'flex-1 py-1.5 text-xs font-bold tracking-wide rounded-md transition-all',
                  mediaTab === '3d'
                    ? 'bg-[#E80020] text-white shadow-[0_2px_8px_rgba(232,0,32,0.3)]'
                    : 'text-stone-400 hover:text-white font-medium'
                ]"
              >
                🌐 3D 互动模型 (CAD)
              </button>
              <button
                @click="mediaTab = 'image'"
                :class="[
                  'flex-1 py-1.5 text-xs font-bold tracking-wide rounded-md transition-all',
                  mediaTab === 'image'
                    ? 'bg-[#E80020] text-white shadow-[0_2px_8px_rgba(232,0,32,0.3)]'
                    : 'text-stone-400 hover:text-white font-medium'
                ]"
              >
                🖼️ 赛车官方大图
              </button>
            </div>

            <!-- View Container -->
            <InteractiveCar3D
              v-if="mediaTab === '3d'"
              :car-id="car.id"
              :year="car.year"
              :highlight-color="car.highlightColor"
              :rpm-normalized="rpm"
              :glb-model="car.glbModel"
            />
            
            <!-- Image Frame -->
            <div v-else class="relative group bg-radial from-zinc-900 to-black p-4 rounded-xl border border-white/5 overflow-hidden shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]">
              <div class="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10" />
              <img
                :src="car.image"
                :alt="car.name"
                referrerpolicy="no-referrer"
                class="w-full h-auto object-contain max-h-[220px] transition-transform duration-500 group-hover:scale-105 z-0"
              />
              <div class="absolute bottom-3 left-4 z-20 flex flex-col">
                <span class="text-[10px] tracking-wider text-[#E80020] font-bold font-mono">
                  CHASSIS DESIGNATION
                </span>
                <span class="text-lg font-black tracking-wide text-white font-sans uppercase">
                  {{ car.chassis }}
                </span>
              </div>
            </div>

            <!-- Engine Synthesizer Controls Panel -->
            <div class="bg-zinc-900/50 rounded-xl p-5 border border-white/10 flex flex-col gap-4">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <Activity class="text-[#E80020] animate-pulse" :size="18" />
                  <span class="text-sm font-semibold tracking-wider text-white">
                    数字引擎模拟器
                  </span>
                </div>
                <button
                  @click="handleToggleSound"
                  :class="[
                    'flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-300',
                    isPlaying
                      ? 'bg-red-600 text-white shadow-[0_0_12px_rgba(232,0,32,0.4)]'
                      : 'bg-white/10 text-stone-300 hover:bg-white/20'
                  ]"
                >
                  <Volume2 v-if="isPlaying" :size="14" />
                  <VolumeX v-else :size="14" />
                  {{ isPlaying ? 'ENGINE ON' : 'START ENGINE' }}
                </button>
              </div>

              <div class="text-xs text-stone-400 leading-relaxed font-sans">
                用 Web Audio 实时数字合成 F1 赛车声浪。点击启动引擎，体验
                <span class="text-white font-mono font-bold tracking-wider underline decoration-[#E80020]">
                  {{ car.audioType === 'v6'
                    ? '1.6L V6涡轮增压混动排音'
                    : car.audioType === 'v8'
                    ? 'V8狂吼（19,000 RPM 尖啸）'
                    : '经典V12管弦乐乐章波形' }}
                </span>
                。
              </div>

              <!-- Tachometer Visuals -->
              <div class="flex flex-col gap-1 mt-1">
                <div class="flex justify-between items-center px-1 text-[10px] font-mono tracking-widest text-[#E80020]">
                  <span>RPM DETECTOR</span>
                  <span class="text-white font-bold bg-zinc-950 px-2 py-0.5 rounded border border-white/5">
                    {{ getDisplayRpm() }} RPM
                  </span>
                </div>
                
                <!-- 20-bar tachometer -->
                <div class="flex gap-1.5 h-8 w-full mt-4 items-end bg-[#1a1a1a] p-1.5 rounded-md border border-white/5">
                  <div
                    v-for="(_, i) in 20"
                    :key="i"
                    :class="[
                      'flex-1 h-full rounded-sm transition-all duration-75',
                      getTachometerColorClass(i, Math.floor(rpm * 20))
                    ]"
                  />
                </div>
              </div>

              <!-- Throttle Controls -->
              <div class="flex flex-col gap-2.5 mt-2">
                <label class="text-xs text-stone-400 flex justify-between font-medium">
                  <span>手动调校节气门</span>
                  <span class="font-mono text-zinc-500">{{ (rpm * 100).toFixed(0) }}% THROTTLE</span>
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.01"
                  :value="rpm"
                  @input="handleRpmSliderChange"
                  class="w-full accent-[#E80020] h-1.5 bg-zinc-800 rounded-lg cursor-pointer animate-none"
                />
              </div>

              <!-- Accelerator Button Simulation -->
              <button
                @mousedown="isPlaying ? null : handleToggleSound(); isPressingRev = true"
                @mouseup="isPressingRev = false"
                @mouseleave="isPressingRev = false"
                @touchstart.prevent="isPlaying ? null : handleToggleSound(); isPressingRev = true"
                @touchend.prevent="isPressingRev = false"
                :class="[
                  'w-full py-3.5 mt-2 rounded-xl text-xs font-black tracking-widest text-center uppercase border transition-all duration-300 select-none cursor-pointer',
                  isPressingRev
                    ? 'bg-[#E80020] text-white border-[#E80020] scale-98 shadow-[inset_0_2px_8px_rgba(0,0,0,0.5)]'
                    : 'bg-zinc-950 text-[#E80020] border-[#E80020]/20 hover:border-[#E80020]/50 hover:bg-red-950/20'
                ]"
              >
                {{ isPressingRev ? '🔥 正在红线轰鸣 !' : '🏎️ 长按深踩油门 (REV ENGINE)' }}
              </button>
            </div>
          </div>

          <!-- Right Column: Descriptions & Tech Spec Dossier -->
          <div class="lg:col-span-7 flex flex-col gap-6">
            <div>
              <div class="flex items-center gap-2 mb-1.5 flex-wrap">
                <span class="font-mono text-xs font-black text-[#E80020] uppercase tracking-wider bg-red-600/10 px-2 py-0.5 rounded border border-red-500/20">
                  {{ car.era }}
                </span>
                <span class="font-mono text-xs text-stone-500 font-bold">
                  {{ car.eraRange }}
                </span>
                <span class="text-xs text-zinc-500">•</span>
                <span class="font-mono text-xs text-stone-300">发行年份: {{ car.year }}</span>
              </div>
              <h2 class="text-3xl font-black font-sans text-white uppercase tracking-tight mt-1.5">
                {{ car.fullName }}
              </h2>
              <p class="mt-3 text-stone-300 text-sm leading-relaxed font-sans">
                {{ car.longDescription }}
              </p>
            </div>

            <!-- Technical Specifications dossier -->
            <div class="bg-zinc-950/60 rounded-xl p-5 border border-white/5 flex flex-col gap-4">
              <span class="text-xs font-mono font-bold tracking-widest text-stone-400 flex items-center gap-1.5 uppercase border-b border-white/5 pb-2.5">
                <Shield :size="14" class="text-[#E80020]" /> TECHNICAL DOSSIER / 技术档案
              </span>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-xs">
                <!-- Engine -->
                <div class="flex flex-col gap-1 border-b border-white/5 pb-2 sm:border-0 sm:pb-0">
                  <span class="text-stone-500 uppercase font-bold tracking-wide">动力心脏 / ENGINE</span>
                  <span class="text-stone-200 font-mono font-semibold">{{ car.specs.engine }}</span>
                </div>
                <!-- Power -->
                <div class="flex flex-col gap-1 border-b border-white/5 pb-2 sm:border-0 sm:pb-0">
                  <span class="text-stone-500 uppercase font-bold tracking-wide">最高功率 / HORSEPOWER</span>
                  <span class="text-[#E80020] font-mono font-bold flex items-center gap-1">
                    <Zap :size="12" fill="#E80020" /> {{ car.specs.horsepower }}
                  </span>
                </div>
                <!-- Weight -->
                <div class="flex flex-col gap-1 border-b border-white/5 pb-2 sm:border-0 sm:pb-0">
                  <span class="text-stone-500 uppercase font-bold tracking-wide">空载车重 / WEIGHT</span>
                  <span class="text-stone-200 font-mono font-semibold">{{ car.specs.weight }}</span>
                </div>
                <!-- Top speed -->
                <div class="flex flex-col gap-1 border-b border-white/5 pb-2 sm:border-0 sm:pb-0">
                  <span class="text-stone-500 uppercase font-bold tracking-wide">极限速度 / TOP SPEED</span>
                  <span class="text-stone-200 font-mono font-semibold">≥ {{ car.specs.topSpeed }}</span>
                </div>
              </div>

              <!-- Grid row 3 (spanning full width) -->
              <div class="border-t border-white/5 pt-3.5 flex flex-col gap-1 text-xs">
                <span class="text-stone-500 uppercase font-bold tracking-wide flex items-center gap-1">
                  <Sparkles :size="12" class="text-[#E80020]" /> 历史勋章 / HISTORIC ACHIEVEMENTS
                </span>
                <span class="text-stone-300 font-sans leading-relaxed">
                  {{ car.specs.championships }}
                </span>
              </div>
            </div>

            <!-- Legendary drivers list -->
            <div class="bg-zinc-950/20 border border-white/5 p-4 rounded-xl flex flex-col gap-3">
              <span class="text-xs font-mono font-bold text-stone-400 uppercase tracking-widest border-b border-white/5 pb-2">
                🔥 LEGENDARY DRIVERS / 传奇掌舵者
              </span>
              <div class="flex flex-wrap gap-2.5">
                <span
                  v-for="(driver, index) in car.specs.drivers"
                  :key="index"
                  class="px-3.5 py-1.5 rounded-full bg-stone-900 border border-white/10 text-stone-300 font-medium text-xs font-sans tracking-tight hover:border-[#E80020]/50 transition-colors duration-200"
                >
                  🏎️ {{ driver }}
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>

      <!-- Bottom Footer Action -->
      <div class="px-6 py-4 border-t border-white/5 bg-zinc-950 flex justify-end gap-3">
        <button
          @click="emit('close')"
          class="px-5 py-2 text-xs font-bold tracking-wider text-stone-300 hover:text-white hover:bg-white/5 rounded-md border border-white/10 transition-all duration-200 cursor-pointer"
        >
          关闭档案
        </button>
      </div>
    </div>
  </div>
</template>
