import { Card } from '@astryxdesign/core/Card';
import { VStack } from '@astryxdesign/core/VStack';
import { HStack } from '@astryxdesign/core/HStack';
import { Grid } from '@astryxdesign/core/Grid';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { Button } from '@astryxdesign/core/Button';
import { Badge } from '@astryxdesign/core/Badge';
import { Collapsible, CollapsibleGroup } from '@astryxdesign/core/Collapsible';
import { Divider } from '@astryxdesign/core/Divider';
import { useToast } from '@astryxdesign/core/Toast';
import { Check, Copy, MessageCircle, Sparkles, Phone } from 'lucide-react';
import type { SiteContent } from '../types/site';
import { buildWhatsappUrl } from '../utils/siteData';

interface PlansAndFaqProps {
  data: SiteContent;
}

const INCLUDED_IN_ALL = [
  'Instalação e ativação pela Brantec',
  'Funciona 100% offline no computador da loja',
  'Suporte direto no WhatsApp e backup diário',
];

export function PlansAndFaq({ data }: PlansAndFaqProps) {
  const showToast = useToast();
  const waMainUrl = buildWhatsappUrl(data.contact.whatsapp, data.contact.message);

  const handleCopyPhone = async () => {
    try {
      await navigator.clipboard.writeText(data.contact.phoneDisplay);
      showToast({
        uniqueID: 'copy-phone',
        body: `WhatsApp ${data.contact.phoneDisplay} copiado!`,
      });
    } catch {
      showToast({
        uniqueID: 'copy-phone-fallback',
        body: `WhatsApp da ${data.site.company}: ${data.contact.phoneDisplay}`,
      });
    }
  };

  return (
    <>
      {/* PLANS */}
      <section id="planos" className="movix-section" aria-labelledby="t-planos">
        <div className="movix-wrap">
          <VStack gap={5}>
            <VStack gap={2} maxWidth={740}>
              <Heading level={2} id="t-planos" textWrap="balance">
                {data.plans.title}
              </Heading>
              <Text type="body" color="secondary">
                {data.plans.intro}
              </Text>
            </VStack>

            <Grid columns={{ minWidth: 280, max: 3 }} gap={4}>
              {data.plans.items.map((plan) => {
                const planWaUrl = buildWhatsappUrl(data.contact.whatsapp, plan.message);
                return (
                  <Card
                    key={plan.name}
                    padding={5}
                    elevation={plan.featured ? 'med' : 'low'}
                    className={plan.featured ? 'movix-plan-featured' : undefined}
                  >
                    <VStack gap={4} height="100%" justify="between">
                      <VStack gap={3}>
                        <HStack justify="between" align="center">
                          <Heading level={3} style={{ fontSize: '1.35rem' }}>
                            {plan.name}
                          </Heading>
                          {plan.tag && (
                            <Badge
                              variant="warning"
                              label={plan.tag}
                              icon={<Sparkles size={12} />}
                            />
                          )}
                        </HStack>

                        {plan.price && (
                          <HStack align="end" gap={1}>
                            <Text
                              type="body"
                              weight="bold"
                              hasTabularNumbers
                              style={{ fontSize: '2rem' }}
                            >
                              {plan.price}
                            </Text>
                            {plan.period && (
                              <Text type="supporting" color="secondary">
                                {plan.period}
                              </Text>
                            )}
                          </HStack>
                        )}

                        <Text type="body" color="secondary">
                          {plan.note}
                        </Text>

                        <Divider />

                        <ul className="movix-ticks">
                          {INCLUDED_IN_ALL.map((feat) => (
                            <li key={feat}>
                              <span className="movix-tick-icon" aria-hidden="true">
                                <Check size={13} strokeWidth={3} />
                              </span>
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </VStack>

                      <Button
                        label={plan.cta}
                        variant={plan.featured ? 'primary' : 'secondary'}
                        size="lg"
                        width="100%"
                        icon={<MessageCircle size={17} />}
                        href={planWaUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      />
                    </VStack>
                  </Card>
                );
              })}
            </Grid>
          </VStack>
        </div>
      </section>

      {/* CLEAN FAQ ACCORDION (zero unnecessary search box) */}
      <section id="perguntas" className="movix-section movix-section-surface" aria-labelledby="t-faq">
        <div className="movix-wrap">
          <VStack gap={5} maxWidth={860}>
            <Heading level={2} id="t-faq" textWrap="balance">
              {data.faq.title}
            </Heading>

            <Card padding={3} elevation="low">
              <CollapsibleGroup type="single" defaultValue="faq-0" hasDividers density="spacious">
                {data.faq.items.map((item, idx) => (
                  <Collapsible
                    key={item.q}
                    value={`faq-${idx}`}
                    trigger={
                      <Text type="body" weight="bold">
                        {item.q}
                      </Text>
                    }
                  >
                    <Text type="body" color="secondary">
                      {item.a}
                    </Text>
                  </Collapsible>
                ))}
              </CollapsibleGroup>
            </Card>
          </VStack>
        </div>
      </section>

      {/* FINAL CONVERSION CTA */}
      <section className="movix-section">
        <div className="movix-wrap">
          <div className="movix-plate">
            <HStack
              justify="between"
              align="center"
              gap={5}
              wrap="wrap"
              style={{ position: 'relative', zIndex: 1 }}
            >
              <VStack gap={2} maxWidth={620}>
                <Heading
                  level={2}
                  color="inherit"
                  textWrap="balance"
                  style={{ fontSize: 'clamp(1.7rem, 3vw, 2.35rem)' }}
                >
                  {data.final.title}
                </Heading>
                <Text type="body" color="inherit" style={{ opacity: 0.92 }}>
                  {data.final.text}
                </Text>
              </VStack>

              <VStack gap={3} align="start">
                <a
                  href={waMainUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="movix-cta-amber"
                >
                  <MessageCircle size={19} />
                  <span>{data.final.cta}</span>
                </a>
                <button
                  type="button"
                  onClick={handleCopyPhone}
                  className="movix-cta-outline-light"
                  style={{ minHeight: 40, fontSize: '0.9rem' }}
                >
                  <Phone size={15} />
                  <span className="movix-num">{data.contact.phoneDisplay}</span>
                  <Copy size={14} opacity={0.8} />
                </button>
              </VStack>
            </HStack>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ paddingBlock: '24px 44px', borderTop: '1px solid var(--color-border)' }}>
        <div className="movix-wrap">
          <HStack justify="between" align="center" gap={3} wrap="wrap">
            <Text type="supporting" color="secondary">
              {data.footer.left}
            </Text>
            <Text type="supporting" color="secondary">
              {data.footer.right}
            </Text>
          </HStack>
        </div>
      </footer>
    </>
  );
}
