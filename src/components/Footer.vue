<script setup lang="ts">
import FerrariShield from './FerrariShield.vue';

const currentYear = new Date().getFullYear();

// Social SVGs representing Weibo, WeChat, YouTube, Instagram
const socialIcons = [
  {
    name: 'Weibo',
    svgPath: 'M10 21C5.03 21 1 17.51 1 13.2C1 8.89 5.03 5.4 10 5.4C14.97 5.4 19 8.89 19 13.2C19 17.51 14.97 21 10 21ZM10 6.9C5.86 6.9 2.5 9.73 2.5 13.2C2.5 16.67 5.86 19.5 10 19.5C14.14 19.5 17.5 16.67 17.5 13.2C17.5 9.73 14.14 6.9 10 6.9ZM11.25 10.65C11.25 11.2 10.8 11.65 10.25 11.65C9.7 11.65 9.25 11.2 9.25 10.65C9.25 10.1 9.7 9.65 10.25 9.65C10.8 9.65 11.25 10.1 11.25 10.65ZM10.25 12.65C8.04 12.65 6.25 13.55 6.25 14.65C6.25 15.75 8.04 16.65 10.25 16.65C12.46 16.65 14.25 15.75 14.25 14.65C14.25 13.55 12.46 12.65 10.25 12.65Z',
  },
  {
    name: 'WeChat',
    svgPath: 'M8.5 3C4.91 3 2 5.57 2 8.75C2 10.5 3.1 12 4.8 13L4.2 15L6.3 14.1C7 14.4 7.7 14.5 8.5 14.5C12.09 14.5 15 11.93 15 8.75C15 5.57 12.09 3 8.5 3ZM12.5 12C10.01 12 8 13.68 8 15.75C8 16.89 8.74 17.89 9.87 18.52L9.47 19.83L10.87 19.24C11.38 19.41 11.93 19.5 12.5 19.5C14.99 19.5 17 17.82 17 15.75C17 13.68 14.99 12 12.5 12ZM6 6.5C6.55 6.5 7 6.95 7 7.5C7 8.05 6.55 8.5 6 8.5C5.45 8.5 5 8.05 5 7.5C5 6.95 5.45 6.5 6 6.5ZM11 6.5C11.55 6.5 12 6.95 12 7.5C12 8.05 11.55 8.5 11 8.5C10.45 8.5 10 8.05 10 7.5C10 6.95 10.45 6.5 11 6.5Z',
  },
  {
    name: 'YouTube',
    svgPath: 'M21.543 6.498C22 8.249 22 12 22 12s0 3.751-.457 5.502c-.254.985-.997 1.76-1.938 2.022C17.896 20 12 20 12 20s-5.893 0-7.605-.476c-.945-.262-1.684-1.037-1.938-2.022C2 15.751 2 12 2 12s0-3.751.457-5.502c.254-.985.997-1.76 1.938-2.022C6.107 4 12 4 12 4s5.896 0 7.605.476c.945.262 1.684 1.037 1.938 2.022zM9.545 15.568l5.818-3.568-5.818-3.568v7.136z',
  },
  {
    name: 'Instagram',
    svgPath: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z',
  },
];

const linkColumns = [
  {
    title: '关于我们',
    links: [
      { label: '车队历史', url: '#history' },
      { label: '品牌故事', url: '#' },
      { label: '加入我们', url: '#' },
    ],
  },
  {
    title: '赛事',
    links: [
      { label: 'F1赛事', url: '#timeline' },
      { label: '赛事日志', url: '#' },
      { label: '比赛成绩', url: '#' },
    ],
  },
  {
    title: '媒体中心',
    links: [
      { label: '新闻中心', url: '#' },
      { label: '图片廊', url: '#' },
      { label: '视频库', url: '#' },
    ],
  },
  {
    title: '合作伙伴',
    links: [
      { label: '官方合作伙伴', url: '#' },
      { label: '技术支持合作', url: '#' },
      { label: '品牌赞助', url: '#' },
    ],
  },
];
</script>

<template>
  <footer id="history" class="bg-[#050505] text-white pt-20 pb-8 border-t border-white/5 relative z-10">
    <div class="max-w-7xl mx-auto px-6">
      
      <!-- Main Columns Grid -->
      <div class="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8 pb-16 border-b border-white/5">
        
        <!-- Logo Brand block -->
        <div class="md:col-span-4 flex flex-col gap-5">
          <div class="flex items-center gap-3">
            <FerrariShield :size="44" />
            <div class="flex flex-col">
              <span class="font-sans font-black tracking-widest text-[#E80020] text-sm leading-none">
                SCUDERIA
              </span>
              <span class="font-sans font-semibold tracking-tight text-white text-xs leading-none mt-1">
                Ferrari
              </span>
            </div>
          </div>
          <p class="text-stone-500 font-sans text-xs leading-relaxed max-w-xs mt-2">
            自 1929 年恩佐·法拉利创立车队以来，法拉利标志便代表着追求卓越的速度信念。它是一份传奇，更是一种不曾妥协的热爱。
          </p>
        </div>

        <!-- Links columns -->
        <div class="md:col-span-6 grid grid-cols-2 sm:grid-cols-4 gap-6">
          <div v-for="(col, index) in linkColumns" :key="index" class="flex flex-col gap-4">
            <span class="text-xs font-bold tracking-wider text-stone-300 font-sans uppercase">
              {{ col.title }}
            </span>
            <ul class="flex flex-col gap-2.5 text-xs text-stone-500 font-sans font-medium">
              <li v-for="(link, lIndex) in col.links" :key="lIndex">
                <a :href="link.url" class="hover:text-[#E80020] transition-colors duration-200">
                  {{ link.label }}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <!-- Social connections -->
        <div class="md:col-span-2 flex flex-col gap-4 md:items-end">
          <span class="text-xs font-bold tracking-wider text-stone-300 font-sans uppercase">
            关注我们
          </span>
          <div class="flex gap-4 md:justify-end mt-1">
            <a
              v-for="(social, index) in socialIcons"
              :key="index"
              href="#"
              :aria-label="social.name"
              class="w-8 h-8 rounded-full bg-stone-900 border border-white/5 flex items-center justify-center text-stone-400 hover:text-white hover:bg-stone-850 hover:border-[#E80020]/40 transition-all duration-200"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path :d="social.svgPath" />
              </svg>
            </a>
          </div>
        </div>

      </div>

      <!-- Legal bar -->
      <div class="flex flex-col sm:flex-row justify-between items-center pt-8 gap-4 text-[11px] text-stone-600 font-sans font-medium">
        <span>&copy; {{ currentYear }} Ferrari S.p.A. All Rights Reserved.</span>
        <div class="flex gap-6">
          <a href="#" class="hover:text-stone-400 transition-colors">隐私政策</a>
          <a href="#" class="hover:text-stone-400 transition-colors">使用条款</a>
          <a href="#" class="hover:text-stone-400 transition-colors">Cookie设置</a>
        </div>
      </div>

    </div>
  </footer>
</template>
