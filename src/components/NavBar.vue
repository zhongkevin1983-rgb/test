<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { Search, ChevronDown, Menu, X } from 'lucide-vue-next';
import FerrariShield from './FerrariShield.vue';

defineProps<{
  activeSection: string;
}>();

const emit = defineEmits<{
  (e: 'navigate', sectionId: string): void;
}>();

const scrolled = ref(false);
const mobileMenuOpen = ref(false);

const handleScroll = () => {
  scrolled.value = window.scrollY > 20;
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});

const navItems = [
  { id: 'hero', label: '首页' },
  { id: 'timeline', label: '历年赛车' },
  { id: 'glory', label: '赛事辉煌' },
  { id: 'history', label: '车队历史' },
  { id: 'news', label: '新闻中心' },
  { id: 'partners', label: '合作伙伴' },
  { id: 'store', label: '商店' },
];

const triggerNavigate = (sectionId: string) => {
  emit('navigate', sectionId);
  mobileMenuOpen.value = false;
};
</script>

<template>
  <nav
    id="main-navbar"
    :class="[
      'fixed top-0 left-0 w-full z-50 transition-all duration-500',
      scrolled
        ? 'bg-black/90 backdrop-blur-md border-b border-white/5 py-3'
        : 'bg-gradient-to-b from-black/80 via-black/40 to-transparent py-5'
    ]"
  >
    <div class="max-w-7xl mx-auto px-6 flex items-center justify-between">
      <!-- Left Side: Brand Logo -->
      <div
        @click="triggerNavigate('hero')"
        class="flex items-center gap-3 cursor-pointer group"
      >
        <FerrariShield :size="44" class="transition-transform duration-300 group-hover:scale-105" />
        <div class="flex flex-col">
          <span class="font-sans font-black tracking-widest text-[#E80020] text-sm leading-none">
            SCUDERIA
          </span>
          <span class="font-sans font-medium tracking-tight text-white text-xs leading-none mt-1">
            Ferrari
          </span>
        </div>
      </div>

      <!-- Center: Navigation Options -->
      <div class="hidden md:flex items-center gap-8">
        <button
          v-for="item in navItems"
          :key="item.id"
          @click="triggerNavigate(item.id)"
          :class="[
            'relative font-sans text-sm tracking-wide font-medium py-2 transition-colors duration-300',
            activeSection === item.id ? 'text-[#E80020]' : 'text-gray-300 hover:text-white'
          ]"
        >
          {{ item.label }}
          <span
            v-if="activeSection === item.id"
            class="absolute bottom-0 left-1/4 right-1/4 h-[3px] bg-[#E80020] rounded-full filter shadow-[0_0_8px_#E80020]"
          />
        </button>
      </div>

      <!-- Right Side: Tools -->
      <div class="hidden md:flex items-center gap-6">
        <button class="text-gray-300 hover:text-white transition-colors duration-200">
          <Search :size="18" />
        </button>
        <div class="relative group cursor-pointer flex items-center gap-1.5 text-xs font-semibold tracking-wider text-gray-300 hover:text-white transition-colors duration-200">
          <span>2H</span>
          <ChevronDown :size="14" class="text-gray-400 group-hover:text-white transition-transform duration-200 group-hover:rotate-180" />
          <div class="absolute top-full right-0 mt-2 w-28 bg-[#111] border border-white/10 rounded-md overflow-hidden opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-300">
            <div class="py-1.5 px-3 hover:bg-white/5 text-xs text-white">简体中文</div>
            <div class="py-1.5 px-3 hover:bg-white/5 text-xs text-stone-400">English (EN)</div>
            <div class="py-1.5 px-3 hover:bg-white/5 text-xs text-stone-400">ITA (Italiano)</div>
          </div>
        </div>
      </div>

      <!-- Mobile menu trigger -->
      <div class="md:hidden flex items-center gap-4">
        <button
          @click="mobileMenuOpen = !mobileMenuOpen"
          class="text-gray-300 hover:text-white p-1"
        >
          <X v-if="mobileMenuOpen" :size="24" />
          <Menu v-else :size="24" />
        </button>
      </div>
    </div>

    <!-- Mobile Menu Panels -->
    <div v-if="mobileMenuOpen" class="md:hidden absolute top-full left-0 w-full bg-black/95 backdrop-blur-lg border-b border-white/10 animate-fade-in">
      <div class="flex flex-col px-6 py-4 gap-4">
        <button
          v-for="item in navItems"
          :key="item.id"
          @click="triggerNavigate(item.id)"
          :class="[
            'text-left font-sans text-base py-1.5',
            activeSection === item.id ? 'text-[#E80020] font-semibold' : 'text-gray-300'
          ]"
        >
          {{ item.label }}
        </button>
        <hr class="border-white/10 my-1" />
        <div class="flex items-center justify-between py-1.5 text-gray-300">
          <span class="text-sm">语言 / Language</span>
          <span class="text-xs bg-white/10 px-2.5 py-1 rounded">简体中文</span>
        </div>
      </div>
    </div>
  </nav>
</template>
