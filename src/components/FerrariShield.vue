<script setup lang="ts">
import { ref } from 'vue';

withDefaults(defineProps<{
  className?: string;
  size?: number;
}>(), {
  className: '',
  size: 48
});

// 📌 赛车标志图片源配置 (你可以根据需要自由修改此处的路径)
// 默认采用高保真官方 SVG 直链，方便直接预览。
// 如果你在本地（WebStorm 或 VS Code）开发：
// 1. 将自定义的图片（如 `.png`、`.svg` 或 `.jpg`）命名为 `ferrari-shield.png` 等。
// 2. 将其放至项目的 `public/` 目录下（例如 `public/ferrari-shield.png`）。
// 3. 将下方变量修改为: const logoUrl = ref('/ferrari-shield.png');
const logoUrl = ref('/src/assets/images/logo.png');

// 加载失败时的备用占位渲染 (以防断网或 CDN 在本地受限)
const isError = ref(false);
const handleImageError = () => {
  isError.value = true;
};
</script>

<template>
  <div
      id="ferrari-shield-logo"
      :class="[className, 'relative flex items-center justify-center select-none']"
      :style="{
      width: `${size}px`,
      height: `${size * 1.3}px`
    }"
  >
    <!-- 1. 优先使用高清图片进行渲染 -->
    <img
        v-if="!isError"
        :src="logoUrl"
        alt="Scuderia Ferrari Shield"
        class="w-full h-full object-contain filter drop-shadow-[0_2px_8px_rgba(255,208,0,0.4)] transition-transform duration-300 transform"
        @error="handleImageError"
    />

    <!-- 2. 断网或加载失败时的优雅后备渲染（带有金色法拉利盾牌特征的现代 CSS 徽章） -->
    <div
        v-else
        class="w-full h-full bg-[#FFEB00] border-2 border-black rounded-[50%_50%_50%_50%_/_30%_30%_70%_70%] shadow-[0_2px_10px_rgba(255,208,0,0.5)] flex flex-col items-center justify-between py-1 relative px-1 overflow-hidden"
    >
      <!-- 高雅的意大利三色旗条纹 -->
      <div class="absolute top-0 inset-x-0 h-1.5 flex">
        <div class="w-1/3 h-full bg-[#009246]"></div>
        <div class="w-1/3 h-full bg-[#FFFFFF]"></div>
        <div class="w-1/3 h-full bg-[#CE2B37]"></div>
      </div>
      <!-- 极简跃马 & 队名标识首字母 -->
      <span class="text-[10px] font-serif font-black text-black select-none mt-2">🐎</span>
      <div class="flex justify-between w-full px-1.5 text-[8px] font-serif font-extrabold text-black leading-none">
        <span>S</span>
        <span>F</span>
      </div>
    </div>
  </div>
</template>

