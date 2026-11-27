import { VStack } from '@astryxdesign/core/VStack';
import { Grid } from '@astryxdesign/core/Grid';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { ClickableCard } from '@astryxdesign/core/ClickableCard';
import { Expand } from 'lucide-react';
import type { SiteContent } from '../types/site';
import { getWebpSrcSet } from '../utils/siteData';

interface ScreensGalleryProps {
  data: SiteContent;
  onOpenLightbox: (imageSrc: string) => void;
}

export function ScreensGallery({ data, onOpenLightbox }: ScreensGalleryProps) {
  return (
    <section id="telas" className="movix-section" aria-labelledby="t-telas">
      <div className="movix-wrap">
        <VStack gap={5}>
          <VStack gap={2} maxWidth={680}>
            <Heading level={2} id="t-telas" textWrap="balance">
              {data.gallery.title}
            </Heading>
            <Text type="body" color="secondary">
              {data.gallery.intro}
            </Text>
          </VStack>

          <Grid columns={{ minWidth: 290, max: 3 }} gap={4}>
            {data.gallery.items.map((item) => (
              <ClickableCard
                key={item.image}
                label={`Ampliar tela: ${item.caption}`}
                padding={0}
                elevation="low"
                onClick={() => onOpenLightbox(item.image)}
              >
                <VStack gap={0}>
                  <div className="movix-shot-viewport" style={{ borderRadius: 'inherit' }}>
                    <img
                      src={item.image}
                      srcSet={getWebpSrcSet(item.image)}
                      sizes="(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 390px"
                      width={1440}
                      height={900}
                      loading="lazy"
                      alt={item.alt}
                    />
                    <span className="movix-shot-zoom-pill">
                      <Expand size={12} />
                      Ampliar
                    </span>
                  </div>
                  <VStack gap={1} padding={3}>
                    <Text type="label" weight="bold">
                      {item.caption}
                    </Text>
                  </VStack>
                </VStack>
              </ClickableCard>
            ))}
          </Grid>
        </VStack>
      </div>
    </section>
  );
}
