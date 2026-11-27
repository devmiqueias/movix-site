import { useState, useEffect, useMemo, useCallback } from 'react';
import { Theme } from '@astryxdesign/core/theme';
import { LayerProvider } from '@astryxdesign/core/Layer';
import { Lightbox } from '@astryxdesign/core/Lightbox';
import { themes, defaultThemeSlug } from '../astryx-themes.js';
import { getSiteContent } from './utils/siteData';
import { HeaderNav } from './components/HeaderNav';
import { HeroSection } from './components/HeroSection';
import { InteractivePosSandbox } from './components/InteractivePosSandbox';
import { InteractiveTour } from './components/InteractiveTour';
import { AudienceCustomizer } from './components/AudienceCustomizer';
import { ScreensGallery } from './components/ScreensGallery';
import { SecurityShowcase } from './components/SecurityShowcase';
import { PlansAndFaq } from './components/PlansAndFaq';

function MovixExperience({
  themeMode,
  onToggleTheme,
}: {
  themeMode: 'light' | 'dark';
  onToggleTheme: () => void;
}) {
  const data = useMemo(() => getSiteContent(), []);
  const [scrollProgress, setScrollProgress] = useState(0);

  const lightboxMedia = useMemo(() => {
    const seen = new Set<string>();
    const items: Array<{ src: string; alt: string; caption: string }> = [];
    const pushUnique = (src: string, alt: string, caption: string) => {
      if (!src || seen.has(src)) return;
      seen.add(src);
      items.push({ src, alt, caption });
    };
    pushUnique(data.hero.image, data.hero.imageAlt, data.hero.imageLabel);
    data.tour.steps.forEach((s) => pushUnique(s.image, s.alt, `${s.label} — ${s.title}`));
    data.gallery.items.forEach((g) => pushUnique(g.image, g.alt, g.caption));
    return items;
  }, [data]);

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const openLightboxBySrc = useCallback(
    (src: string) => {
      const idx = lightboxMedia.findIndex((m) => m.src === src);
      setLightboxIndex(idx >= 0 ? idx : 0);
      setLightboxOpen(true);
    },
    [lightboxMedia],
  );

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        const doc = document.documentElement;
        const max = doc.scrollHeight - window.innerHeight;
        setScrollProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0);
        raf = 0;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="movix-atmosphere" data-theme-mode={themeMode}>
      <div className="movix-atmosphere-mesh" aria-hidden="true" />
      <div className="movix-scroll-lane" aria-hidden="true">
        <span style={{ transform: `scaleX(${scrollProgress})` }} />
      </div>

      <HeaderNav data={data} themeMode={themeMode} onToggleTheme={onToggleTheme} />

      <main>
        <HeroSection data={data} onOpenLightbox={openLightboxBySrc} />

        {data.demo && <InteractivePosSandbox demo={data.demo} contact={data.contact} />}

        <InteractiveTour tour={data.tour} onOpenLightbox={openLightboxBySrc} />

        <AudienceCustomizer data={data} onOpenLightbox={openLightboxBySrc} />

        <ScreensGallery data={data} onOpenLightbox={openLightboxBySrc} />

        <SecurityShowcase security={data.security} />

        <PlansAndFaq data={data} />
      </main>

      <Lightbox
        isOpen={lightboxOpen}
        onOpenChange={setLightboxOpen}
        media={lightboxMedia}
        index={lightboxIndex}
        onIndexChange={setLightboxIndex}
        hasZoom
      />
    </div>
  );
}

export default function App() {
  // Como no app Movix: tema claro por padrão, com alternador para o escuro no topo
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themeMode);
  }, [themeMode]);

  const toggleTheme = useCallback(() => {
    setThemeMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const activeTheme = themes[defaultThemeSlug as keyof typeof themes] || themes.neutral;

  return (
    <Theme theme={activeTheme} mode={themeMode}>
      <LayerProvider>
        <MovixExperience themeMode={themeMode} onToggleTheme={toggleTheme} />
      </LayerProvider>
    </Theme>
  );
}
