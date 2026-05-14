import { ref, onMounted, onUnmounted } from "vue";

export function useBreakpoint(breakpoint = 640) {
  const isMobile = ref(false);

  const check = () => {
    isMobile.value = window.innerWidth < breakpoint;
  };

  onMounted(() => {
    check();
    window.addEventListener("resize", check);
  });

  onUnmounted(() => {
    window.removeEventListener("resize", check);
  });

  return { isMobile };
}

export function useWindowWidth() {
  const width = ref(typeof window !== "undefined" ? window.innerWidth : 1024);

  const onResize = () => {
    width.value = window.innerWidth;
  };

  onMounted(() => {
    window.addEventListener("resize", onResize);
  });

  onUnmounted(() => {
    window.removeEventListener("resize", onResize);
  });

  return { width };
}
