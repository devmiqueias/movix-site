import { useState } from 'react';
import { Card } from '@astryxdesign/core/Card';
import { VStack } from '@astryxdesign/core/VStack';
import { HStack } from '@astryxdesign/core/HStack';
import { Grid } from '@astryxdesign/core/Grid';
import { Badge } from '@astryxdesign/core/Badge';
import { Text } from '@astryxdesign/core/Text';
import { SegmentedControl, SegmentedControlItem } from '@astryxdesign/core/SegmentedControl';
import {
  Check,
  Expand,
  Keyboard,
  MessageCircle,
  Play,
  ShieldCheck,
  WifiOff,
  HardDriveDownload,
  CreditCard,
} from 'lucide-react';
import type { SiteContent } from '../types/site';
import { buildWhatsappUrl, getWebpSrcSet } from '../utils/siteData';

interface HeroSectionProps {
  data: SiteContent;
  onOpenLightbox: (imageSrc: string) => void;
}

interface HeroPreviewTab {
  id: string;
  label: string;
  image: string;
  alt: string;
  caption: string;
}

const STRIP_ICONS = [WifiOff, Keyboard, CreditCard, HardDriveDownload];

export function HeroSection({ data, onOpenLightbox }: HeroSectionProps) {
  const waHeroUrl = buildWhatsappUrl(
    data.contact.whatsapp,
    data.hero.ctaMessage || data.contact.message,
  );

  const previewTabs: HeroPreviewTab[] = [
    {
      id: 'caixa',
      label: 'Caixa',
      image: data.hero.image,
      alt: data.hero.imageAlt,
      caption: data.hero.imageLabel || 'Movix · Caixa (F2)',
    },
    ...data.tour.steps
      .filter((s) => ['pagamento', 'fiado', 'estoque', 'painel'].includes(s.id))
      .map((s) => ({
        id: s.id,
        label: s.id === 'painel' ? 'Lucro' : s.label.split(' ')[0],
        image: s.image,
        alt: s.alt,
        caption: `Movix · ${s.label}`,
      })),
  ];

  const [activeTabId, setActiveTabId] = useState(previewTabs[0]?.id || 'caixa');
  const activeTab = previewTabs.find((t) => t.id === activeTabId) || previewTabs[0];

  return (
    <section id="inicio" className="movix-hero">
      <div className="movix-wrap">
        <VStack gap={6}>
          <div className="movix-hero-grid">
            {/* Left: Main Value Proposition & Conversion Plate */}
            <div className="movix-plate">
              <VStack gap={4} style={{ position: 'relative', zIndex: 1 }}>
                <HStack align="center" gap={2} wrap="wrap">
                  <Badge variant="warning" label="PDV OFFLINE" />
                  <Text
                    type="label"
                    color="inherit"
                    style={{ opacity: 0.92, letterSpacing: '0.05em', textTransform: 'uppercase' }}
                  >
                    {data.hero.route}
                  </Text>
                </HStack>

                <h1 className="movix-hero-title">
                  {data.hero.titleBefore}{' '}
                  <em>{data.hero.titleHighlight}</em>{' '}
                  {data.hero.titleAfter}
                </h1>

                <p className="movix-hero-lead">{data.hero.lead}</p>

                <HStack gap={3} wrap="wrap" align="center">
                  <a
                    href={waHeroUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="movix-cta-amber"
                  >
                    <MessageCircle size={18} />
                    <span>{data.hero.cta}</span>
                  </a>
                  <a href="#caixa-demo" className="movix-cta-outline-light">
                    <Play size={16} />
                    <span>Testar o caixa</span>
                  </a>
                </HStack>

                <HStack gap={4} wrap="wrap" style={{ paddingTop: 4 }}>
                  {data.hero.facts.map((fact) => (
                    <HStack key={fact} gap={1.5} align="center">
                      <Check size={16} color="#FFD200" strokeWidth={3} />
                      <Text type="label" color="inherit">
                        {fact}
                      </Text>
                    </HStack>
                  ))}
                </HStack>
              </VStack>
            </div>

            {/* Right: Clean Real Product Preview with Screen Switcher */}
            <VStack gap={3}>
              <div className="movix-stage-wrap">
                <div className="movix-stage-card">
                  <div className="movix-window-bar">
                    <HStack align="center" gap={2}>
                      <div className="movix-window-dots" aria-hidden="true">
                        <span />
                        <span />
                        <span />
                      </div>
                      <Text type="label" weight="semibold">
                        {activeTab.caption}
                      </Text>
                    </HStack>
                    <Text type="supporting" color="inherit">
                      Windows 10 e 11
                    </Text>
                  </div>

                  <div
                    className="movix-shot-viewport"
                    role="button"
                    tabIndex={0}
                    aria-label={`Ampliar tela: ${activeTab.caption}`}
                    onClick={() => onOpenLightbox(activeTab.image)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onOpenLightbox(activeTab.image);
                      }
                    }}
                  >
                    <img
                      key={activeTab.image}
                      src={activeTab.image}
                      srcSet={getWebpSrcSet(activeTab.image)}
                      sizes="(max-width: 980px) 92vw, 680px"
                      width={1440}
                      height={900}
                      fetchPriority="high"
                      alt={activeTab.alt}
                    />
                    <span className="movix-shot-zoom-pill">
                      <Expand size={13} />
                      Ampliar tela
                    </span>
                  </div>
                </div>
              </div>

              <HStack align="center" justify="between" gap={2} wrap="wrap">
                <SegmentedControl
                  label="Alternar tela real do Movix"
                  size="md"
                  value={activeTabId}
                  onChange={setActiveTabId}
                >
                  {previewTabs.map((tab) => (
                    <SegmentedControlItem key={tab.id} value={tab.id} label={tab.label} />
                  ))}
                </SegmentedControl>

                <HStack align="center" gap={1.5}>
                  <ShieldCheck size={15} color="var(--color-icon-accent)" />
                  <Text type="supporting" color="secondary">
                    Telas reais do sistema
                  </Text>
                </HStack>
              </HStack>
            </VStack>
          </div>

          {/* 4-Benefit Proof Strip */}
          <Grid columns={{ minWidth: 220, max: 4 }} gap={3}>
            {data.strip.map((item, idx) => {
              const IconComp = STRIP_ICONS[idx % STRIP_ICONS.length];
              return (
                <Card key={item.value} padding={4} elevation="low">
                  <HStack gap={3} align="start">
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 3,
                        background: '#FFD200',
                        color: '#111111',
                        display: 'grid',
                        placeItems: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <IconComp size={18} />
                    </div>
                    <VStack gap={0.5}>
                      <Text type="body" weight="bold" hasTabularNumbers>
                        {item.value}
                      </Text>
                      <Text type="supporting" color="secondary">
                        {item.label}
                      </Text>
                    </VStack>
                  </HStack>
                </Card>
              );
            })}
          </Grid>
        </VStack>
      </div>
    </section>
  );
}
