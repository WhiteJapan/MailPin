import { useEffect, useState } from 'react';

export type ThemePreference = 'light' | 'dark' | 'system';

const storageKey = 'mailpin-theme';
let fallbackTimer: number | undefined;

function readPreference(): ThemePreference {
  try {
    const saved = localStorage.getItem(storageKey);
    return saved === 'light' || saved === 'dark' || saved === 'system' ? saved : 'system';
  } catch {
    return 'system';
  }
}

function applyTheme(preference: ThemePreference): void {
  const dark = preference === 'dark'
    || preference === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches;
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
  document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')
    .forEach((meta) => { meta.content = dark ? '#080809' : '#f6f8fc'; });
}

export function useTheme() {
  const [theme, setThemeState] = useState<ThemePreference>(() => {
    const initial = readPreference();
    applyTheme(initial);
    return initial;
  });

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const updateFromDevice = () => { if (theme === 'system') applyTheme('system'); };
    media.addEventListener('change', updateFromDevice);
    return () => media.removeEventListener('change', updateFromDevice);
  }, [theme]);

  function setTheme(next: ThemePreference) {
    if (next === theme) return;
    try { localStorage.setItem(storageKey, next); } catch { /* 外観は保存できなくても切り替える */ }
    const update = () => {
      applyTheme(next);
      setThemeState(next);
    };

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      update();
      return;
    }

    const root = document.documentElement;
    root.classList.remove('theme-changing');
    void root.offsetWidth;
    root.classList.add('theme-changing');
    window.requestAnimationFrame(update);
    window.clearTimeout(fallbackTimer);
    fallbackTimer = window.setTimeout(() => root.classList.remove('theme-changing'), 460);
  }

  return { theme, setTheme };
}
