import { useState, useEffect, useRef } from 'react';
import { Card } from '@astryxdesign/core/Card';
import { VStack } from '@astryxdesign/core/VStack';
import { HStack } from '@astryxdesign/core/HStack';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { Button } from '@astryxdesign/core/Button';
import { Badge } from '@astryxdesign/core/Badge';
import { ProgressBar } from '@astryxdesign/core/ProgressBar';
import { Kbd } from '@astryxdesign/core/Kbd';
import { Check, ChevronLeft, ChevronRight, Expand } from 'lucide-react';
import type { SiteContent } from '../types/site';
import { getWebpSrcSet, parseRichBold } from '../utils/siteData';

interface InteractiveTourProps {
  tour: SiteContent['tour'];
  onOpenLightbox: (imageSrc: string) => void;
}

export function InteractiveTour({ tour, onOpenLightbox }: InteractiveTourProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const stepRefs = useRef<Array<HTMLElement | null>>([]);

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.getAttribute('data-step-idx'));
            if (!Number.isNaN(idx)) setActiveIndex(idx);
          }
        });
      },
      { rootMargin: '-38% 0px -46% 0px' },
    );

    stepRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [tour.steps.length]);

  const activeStep = tour.steps[activeIndex] || tour.steps[0];
  const progress = Math.round(((activeIndex + 1) / Math.max(1, tour.steps.length)) * 100);

  const selectStep = (index: number, scrollIntoView = false) => {
    const safeIdx = (index + tour.steps.length) % tour.steps.length;
    setActiveIndex(safeIdx);
    if (scrollIntoView) {
      stepRefs.current[safeIdx]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <section id="percurso" className="movix-section" aria-labelledby="t-tour">
      <div className="movix-wrap">
        <VStack gap={6}>
          <HStack align="end" justify="between" gap={4} wrap="wrap">
            <VStack gap={2} maxWidth={720}>
              <Heading level={2} id="t-tour" textWrap="balance">
                {tour.title}
              </Heading>
              <Text type="body" color="secondary">
                {tour.intro}
              </Text>
            </VStack>

            <HStack gap={2} align="center">
              <Button
                label="Anterior"
                size="sm"
                variant="secondary"
                icon={<ChevronLeft size={16} />}
                onClick={() => selectStep(activeIndex - 1, true)}
              />
              <Badge variant="neutral" label={`${activeIndex + 1} de ${tour.steps.length}`} />
              <Button
                label="Próxima"
                size="sm"
                variant="secondary"
                endContent={<ChevronRight size={16} />}
                onClick={() => selectStep(activeIndex + 1, true)}
              />
            </HStack>
          </HStack>

          <div className="movix-tour-grid">
            <VStack gap={3}>
              {tour.steps.map((step, idx) => {
                const isActive = idx === activeIndex;
                return (
                  <article
                    key={step.id}
                    id={step.id}
                    data-step-idx={idx}
                    ref={(el) => {
                      stepRefs.current[idx] = el;
                    }}
                    style={{ scrollMarginTop: 92 }}
                  >
                    <button
                      type="button"
                      className="movix-tour-step-btn"
                      data-active={isActive ? 'true' : 'false'}
                      onClick={() => selectStep(idx, false)}
                      aria-current={isActive ? 'step' : undefined}
                    >
                      <VStack gap={3}>
                        <HStack justify="between" align="center" gap={2}>
                          <HStack gap={2} align="center">
                            <Kbd keys={step.key} />
                            <Badge variant={isActive ? 'yellow' : 'neutral'} label={step.exit} />
                          </HStack>
                          <Text type="supporting" color="secondary" hasTabularNumbers>
                            0{idx + 1}
                          </Text>
                        </HStack>

                        <Heading level={3} style={{ fontSize: '1.2rem' }} textWrap="balance">
                          {step.title}
                        </Heading>

                        <Text type="body" color="secondary">
                          {step.text}
                        </Text>

                        {isActive && (
                          <ul className="movix-ticks" style={{ paddingTop: 4 }}>
                            {step.ticks.map((tick, tIdx) => (
                              <li key={tIdx}>
                                <span className="movix-tick-icon" aria-hidden="true">
                                  <Check size={13} strokeWidth={3} />
                                </span>
                                <span>
                                  {parseRichBold(tick).map((part, pIdx) =>
                                    part.bold ? (
                                      <strong key={pIdx}>{part.text}</strong>
                                    ) : (
                                      <span key={pIdx}>{part.text}</span>
                                    ),
                                  )}
                                </span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </VStack>
                    </button>
                  </article>
                );
              })}
            </VStack>

            {activeStep && (
              <div className="movix-tour-sticky">
                <Card padding={4} elevation="low">
                  <VStack gap={3}>
                    <HStack justify="between" align="center" gap={2} wrap="wrap">
                      <HStack align="center" gap={2}>
                        <Kbd keys={activeStep.key} />
                        <Text type="body" weight="bold">
                          {activeStep.label}
                        </Text>
                      </HStack>
                      <Button
                        label="Ampliar"
                        size="sm"
                        variant="secondary"
                        icon={<Expand size={14} />}
                        onClick={() => onOpenLightbox(activeStep.image)}
                      />
                    </HStack>

                    <div className="movix-stage-card" style={{ boxShadow: 'none' }}>
                      <div
                        className="movix-shot-viewport"
                        role="button"
                        tabIndex={0}
                        aria-label={`Ampliar tela: ${activeStep.label}`}
                        onClick={() => onOpenLightbox(activeStep.image)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            onOpenLightbox(activeStep.image);
                          }
                        }}
                      >
                        <img
                          key={activeStep.image}
                          src={activeStep.image}
                          srcSet={getWebpSrcSet(activeStep.image)}
                          sizes="(max-width: 960px) 92vw, 660px"
                          width={1440}
                          height={900}
                          loading="lazy"
                          alt={activeStep.alt}
                        />
                        <span className="movix-shot-zoom-pill">
                          <Expand size={13} />
                          Ver em tela cheia
                        </span>
                      </div>
                    </div>

                    <ProgressBar
                      label="Progresso no percurso de telas"
                      isLabelHidden
                      value={progress}
                      max={100}
                      variant="accent"
                    />
                  </VStack>
                </Card>
              </div>
            )}
          </div>
        </VStack>
      </div>
    </section>
  );
}
