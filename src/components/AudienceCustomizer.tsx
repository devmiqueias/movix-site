import { useState } from 'react';
import { Card } from '@astryxdesign/core/Card';
import { SelectableCard } from '@astryxdesign/core/SelectableCard';
import { VStack } from '@astryxdesign/core/VStack';
import { HStack } from '@astryxdesign/core/HStack';
import { Grid } from '@astryxdesign/core/Grid';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { Badge } from '@astryxdesign/core/Badge';
import { Button } from '@astryxdesign/core/Button';
import { Kbd } from '@astryxdesign/core/Kbd';
import {
  Store,
  Beer,
  Wine,
  Clock,
  MessageCircle,
  Check,
  Expand,
} from 'lucide-react';
import type { SiteContent } from '../types/site';
import { buildWhatsappUrl, getWebpSrcSet } from '../utils/siteData';

interface AudienceCustomizerProps {
  data: SiteContent;
  onOpenLightbox: (imageSrc: string) => void;
}

const AUDIENCE_PROFILES = [
  {
    icon: Store,
    badge: 'Foco: fila rápida e balança',
    keys: ['F2', 'F10', 'F6'],
    image: 'img/movix-pdv-frente-de-caixa.webp',
    highlights: [
      'Leitura direta de etiquetas da balança (frios, pão, hortifruti)',
      'Caderneta de fiado digital da vizinhança com limite por cliente',
      'Reposição inteligente antes de faltar produto na gôndola',
    ],
  },
  {
    icon: Beer,
    badge: 'Foco: entregas e volume',
    keys: ['F3', 'F2', 'F10'],
    image: 'img/movix-pedidos-comandas-entrega.webp',
    highlights: [
      'Pedidos de entrega e comandas em aberto com cobrança em 1 clique',
      'Gelo, carvão e combos rápidos no balcão em dia de movimento',
      'Controle de fiado e extrato organizado para bares e restaurantes',
    ],
  },
  {
    icon: Wine,
    badge: 'Foco: margem e estoque',
    keys: ['F6', 'F1', 'F4'],
    image: 'img/movix-controle-de-estoque.webp',
    highlights: [
      'Localização separada por freezer, gôndola e depósito',
      'Custo, preço de venda e margem real lado a lado em cada rótulo',
      'Ranking dos produtos mais lucrativos no painel DRE',
    ],
  },
  {
    icon: Clock,
    badge: 'Foco: turnos e agilidade',
    keys: ['F9', 'F2', 'F4'],
    image: 'img/movix-fechamento-de-caixa.webp',
    highlights: [
      'Fechamento de turno por operador com sangria, suprimento e troco',
      'Atendimento ultrarrápido com PIX, débito e crédito',
      'Tela bloqueia sozinha quando o atendente sai do balcão',
    ],
  },
];

export function AudienceCustomizer({ data, onOpenLightbox }: AudienceCustomizerProps) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const selectedItem = data.audiences.items[selectedIdx] || data.audiences.items[0];
  const profile = AUDIENCE_PROFILES[selectedIdx % AUDIENCE_PROFILES.length];

  const customWaUrl = buildWhatsappUrl(
    data.contact.whatsapp,
    `Olá! Tenho um(a) ${selectedItem?.title || 'comércio'} e quero ver o Movix funcionando.`,
  );

  return (
    <section id="para-quem" className="movix-section movix-section-surface" aria-labelledby="t-quem">
      <div className="movix-wrap">
        <VStack gap={5}>
          <VStack gap={2} maxWidth={700}>
            <Heading level={2} id="t-quem" textWrap="balance">
              {data.audiences.title}
            </Heading>
            <Text type="body" color="secondary">
              Selecione o seu tipo de loja para ver os fluxos e telas mais usados no seu balcão.
            </Text>
          </VStack>

          <Grid columns={{ minWidth: 220, max: 4 }} gap={3}>
            {data.audiences.items.map((item, idx) => {
              const IconComp = AUDIENCE_PROFILES[idx % AUDIENCE_PROFILES.length].icon;
              const isSelected = idx === selectedIdx;
              return (
                <SelectableCard
                  key={item.title}
                  label={item.title}
                  isSelected={isSelected}
                  onChange={() => setSelectedIdx(idx)}
                  padding={4}
                  elevation={isSelected ? 'med' : 'none'}
                >
                  <VStack gap={2}>
                    <HStack justify="between" align="center">
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 9,
                          background: isSelected
                            ? 'var(--color-accent)'
                            : 'var(--color-accent-muted)',
                          color: isSelected
                            ? 'var(--color-on-accent)'
                            : 'var(--color-text-accent)',
                          display: 'grid',
                          placeItems: 'center',
                        }}
                      >
                        <IconComp size={18} />
                      </div>
                      {isSelected && <Badge variant="yellow" label="Selecionado" />}
                    </HStack>
                    <Heading level={3} style={{ fontSize: '1.08rem' }}>
                      {item.title}
                    </Heading>
                    <Text type="supporting" color="secondary">
                      {item.text}
                    </Text>
                  </VStack>
                </SelectableCard>
              );
            })}
          </Grid>

          {/* Tailored Detail Panel */}
          {selectedItem && (
            <Card padding={4} elevation="med">
              <Grid columns={{ minWidth: 300, max: 2 }} gap={5} align="center">
                <VStack gap={3}>
                  <HStack gap={2} align="center" wrap="wrap">
                    <Badge variant="warning" label={profile.badge} />
                    <HStack gap={1}>
                      {profile.keys.map((k) => (
                        <Kbd key={k} keys={k} />
                      ))}
                    </HStack>
                  </HStack>

                  <Heading level={3} style={{ fontSize: '1.5rem' }}>
                    Movix no dia a dia de {selectedItem.title}
                  </Heading>

                  <ul className="movix-ticks">
                    {profile.highlights.map((h) => (
                      <li key={h}>
                        <span className="movix-tick-icon" aria-hidden="true">
                          <Check size={13} strokeWidth={3} />
                        </span>
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>

                  <HStack gap={3} wrap="wrap" style={{ paddingTop: 4 }}>
                    <Button
                      label={`Ver demo para ${selectedItem.title}`}
                      variant="primary"
                      size="lg"
                      icon={<MessageCircle size={17} />}
                      href={customWaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    />
                  </HStack>
                </VStack>

                <div
                  className="movix-stage-card"
                  style={{ boxShadow: 'none' }}
                >
                  <div
                    className="movix-shot-viewport"
                    role="button"
                    tabIndex={0}
                    aria-label={`Ampliar tela recomendada para ${selectedItem.title}`}
                    onClick={() => onOpenLightbox(profile.image)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onOpenLightbox(profile.image);
                      }
                    }}
                  >
                    <img
                      src={profile.image}
                      srcSet={getWebpSrcSet(profile.image)}
                      sizes="(max-width: 960px) 92vw, 560px"
                      width={1440}
                      height={900}
                      loading="lazy"
                      alt={`Tela do Movix para ${selectedItem.title}`}
                    />
                    <span className="movix-shot-zoom-pill">
                      <Expand size={12} />
                      Ampliar tela
                    </span>
                  </div>
                </div>
              </Grid>
            </Card>
          )}
        </VStack>
      </div>
    </section>
  );
}
