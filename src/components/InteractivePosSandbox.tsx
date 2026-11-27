import { useState, useMemo, useCallback, useEffect } from 'react';
import { Card } from '@astryxdesign/core/Card';
import { VStack } from '@astryxdesign/core/VStack';
import { HStack } from '@astryxdesign/core/HStack';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { Button } from '@astryxdesign/core/Button';
import { Badge } from '@astryxdesign/core/Badge';
import { SegmentedControl, SegmentedControlItem } from '@astryxdesign/core/SegmentedControl';
import { ProgressBar } from '@astryxdesign/core/ProgressBar';
import { Kbd } from '@astryxdesign/core/Kbd';
import { Theme } from '@astryxdesign/core/theme';
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  CheckCircle2,
  ShieldAlert,
  MessageCircle,
  RotateCcw,
} from 'lucide-react';
import { themes, defaultThemeSlug } from '../../astryx-themes.js';
import type { SiteContact, SiteDemo } from '../types/site';
import { buildWhatsappUrl, formatBrl, parseBrNumber } from '../utils/siteData';

interface InteractivePosSandboxProps {
  demo: SiteDemo;
  contact: SiteContact;
}

type PaymentMethod = 'PIX' | 'DINHEIRO' | 'CARTAO' | 'FIADO';

interface CartLine {
  name: string;
  price: number;
  qty: number;
  isKg: boolean;
}

function suggestedCashNote(total: number): number {
  const notes = [10, 20, 50, 100, 200];
  return notes.find((n) => n >= total) || Math.ceil(total / 50) * 50;
}

export function InteractivePosSandbox({ demo, contact }: InteractivePosSandboxProps) {
  const customerDebt = useMemo(() => parseBrNumber(demo.customerDebt), [demo.customerDebt]);
  const customerLimit = useMemo(() => parseBrNumber(demo.customerLimit), [demo.customerLimit]);

  const products = useMemo(
    () =>
      demo.products.map((p, index) => {
        const isKg = /^kg$/i.test(p.unit || '');
        return {
          id: `prod-${index}`,
          name: p.name,
          price: parseBrNumber(p.price),
          priceDisplay: p.price,
          isKg,
          unitLabel: isKg ? 'kg' : 'un',
          step: isKg ? 0.25 : 1,
        };
      }),
    [demo.products],
  );

  const [cart, setCart] = useState<CartLine[]>([]);
  const [method, setMethod] = useState<PaymentMethod>('PIX');
  const [flashedProduct, setFlashedProduct] = useState<string | null>(null);
  const [saleState, setSaleState] = useState<'idle' | 'auth' | 'done'>('idle');

  const cartTotal = useMemo(
    () => cart.reduce((acc, item) => acc + Math.round(item.price * item.qty * 100) / 100, 0),
    [cart],
  );

  const projectedDebt = customerDebt + (method === 'FIADO' ? cartTotal : 0);
  const fiadoOverLimit = method === 'FIADO' && projectedDebt > customerLimit;
  const debtPercent = Math.min(100, Math.round((projectedDebt / Math.max(1, customerLimit)) * 100));

  const cashNote = suggestedCashNote(cartTotal);
  const cashChange = Math.max(0, cashNote - cartTotal);

  const addProduct = (prod: (typeof products)[number]) => {
    if (saleState !== 'idle') setSaleState('idle');
    setCart((prev) => {
      const existing = prev.find((l) => l.name === prod.name);
      if (existing) {
        return prev.map((l) =>
          l.name === prod.name
            ? { ...l, qty: Math.round((l.qty + prod.step) * 1000) / 1000 }
            : l,
        );
      }
      return [...prev, { name: prod.name, price: prod.price, qty: prod.step, isKg: prod.isKg }];
    });
    setFlashedProduct(prod.name);
    window.setTimeout(() => setFlashedProduct(null), 260);
  };

  const updateLineQty = (name: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((l) =>
          l.name === name ? { ...l, qty: Math.round((l.qty + delta) * 1000) / 1000 } : l,
        )
        .filter((l) => l.qty > 0.001),
    );
  };

  const resetSale = () => {
    setCart([]);
    setSaleState('idle');
  };

  const finishSale = useCallback(() => {
    if (cart.length === 0 || saleState !== 'idle') return;
    if (method === 'FIADO' && customerDebt + cartTotal > customerLimit) {
      setSaleState('auth');
    } else {
      setSaleState('done');
    }
  }, [cart.length, cartTotal, customerDebt, customerLimit, method, saleState]);

  // Allow pressing real F9 on desktop when cart has items
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F9' && cart.length > 0 && saleState === 'idle') {
        e.preventDefault();
        finishSale();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [cart.length, saleState, finishSale]);

  const methodSummary: Record<PaymentMethod, string> = {
    PIX: 'no PIX',
    DINHEIRO: `em dinheiro (troco de ${formatBrl(cashChange)})`,
    CARTAO: 'no cartão',
    FIADO: `no fiado de ${demo.customer}`,
  };

  const waDemoUrl = buildWhatsappUrl(
    contact.whatsapp,
    'Testei a demonstração do caixa no site e quero ver o Movix com os produtos da minha loja.',
  );

  return (
    <section id="caixa-demo" className="movix-section movix-section-surface" aria-labelledby="t-demo">
      <div className="movix-wrap">
        <VStack gap={5}>
          <VStack gap={2} maxWidth={720}>
            <HStack align="center" gap={2} wrap="wrap">
              <Heading level={2} id="t-demo" textWrap="balance">
                {demo.title}
              </Heading>
              <Kbd keys="F2" />
            </HStack>
            <Text type="body" color="secondary">
              {demo.intro}
            </Text>
          </VStack>

          <Card padding={4} elevation="low">
            <div className="movix-pos-layout">
              {/* Left: Simple 1-click product grid (zero unnecessary inputs) */}
              <div className="movix-pos-products" role="group" aria-label="Produtos da demonstração">
                {products.map((prod) => (
                  <button
                    key={prod.id}
                    type="button"
                    className="movix-pos-prod-btn"
                    data-flash={flashedProduct === prod.name ? 'true' : 'false'}
                    onClick={() => addProduct(prod)}
                  >
                    <HStack justify="between" align="center" width="100%">
                      <Badge
                        variant={prod.isKg ? 'yellow' : 'neutral'}
                        label={prod.isKg ? 'BALANÇA · KG' : 'UN'}
                      />
                      <Plus size={16} color="var(--color-icon-accent)" />
                    </HStack>

                    <Text type="body" weight="bold">
                      {prod.name}
                    </Text>

                    <Text type="body" weight="bold" color="accent" hasTabularNumbers>
                      R$ {prod.priceDisplay}
                      <Text as="span" type="supporting" color="secondary">
                        /{prod.unitLabel}
                      </Text>
                    </Text>
                  </button>
                ))}
              </div>

              {/* Right: Clean Sale Summary */}
              <div className="movix-subsurface">
                {saleState === 'idle' && (
                  <VStack gap={4}>
                    <HStack align="center" justify="between">
                      <HStack align="center" gap={2}>
                        <ShoppingCart size={17} color="var(--color-icon-accent)" />
                        <Heading level={3} style={{ fontSize: '1.05rem' }}>
                          Carrinho de venda
                        </Heading>
                      </HStack>
                      {cart.length > 0 && (
                        <Button
                          label="Limpar"
                          size="sm"
                          variant="ghost"
                          icon={<Trash2 size={14} />}
                          onClick={resetSale}
                        />
                      )}
                    </HStack>

                    {cart.length === 0 ? (
                      <div className="movix-subsurface-row" style={{ paddingBlock: 22 }}>
                        <VStack gap={1} align="center" style={{ textAlign: 'center' }}>
                          <Text type="body" weight="semibold">
                            Toque nos produtos ao lado para montar uma venda
                          </Text>
                          <Text type="supporting" color="secondary">
                            Itens por KG entram por peso, como na balança do balcão.
                          </Text>
                        </VStack>
                      </div>
                    ) : (
                      <VStack gap={1} style={{ maxHeight: 210, overflowY: 'auto' }}>
                        {cart.map((line) => (
                          <div key={line.name} className="movix-subsurface-row">
                            <HStack align="center" justify="between" gap={2}>
                              <VStack gap={0} style={{ minWidth: 0, flex: 1 }}>
                                <Text type="label" weight="bold">
                                  {line.name}
                                </Text>
                                <Text type="supporting" color="secondary" hasTabularNumbers>
                                  {line.isKg
                                    ? `${line.qty.toLocaleString('pt-BR', { minimumFractionDigits: 3 })} kg`
                                    : `${line.qty}×`}{' '}
                                  · {formatBrl(line.price)}
                                </Text>
                              </VStack>

                              <HStack align="center" gap={1}>
                                <Button
                                  label="Diminuir"
                                  size="sm"
                                  variant="ghost"
                                  isIconOnly
                                  icon={<Minus size={13} />}
                                  onClick={() => updateLineQty(line.name, line.isKg ? -0.25 : -1)}
                                />
                                <Text type="label" weight="bold" hasTabularNumbers>
                                  {formatBrl(line.price * line.qty)}
                                </Text>
                                <Button
                                  label="Aumentar"
                                  size="sm"
                                  variant="ghost"
                                  isIconOnly
                                  icon={<Plus size={13} />}
                                  onClick={() => updateLineQty(line.name, line.isKg ? 0.25 : 1)}
                                />
                              </HStack>
                            </HStack>
                          </div>
                        ))}
                      </VStack>
                    )}

                    <Theme theme={themes[defaultThemeSlug] || themes.neutral} mode="dark">
                      <div className="movix-plate" style={{ padding: 20, borderRadius: 14 }}>
                        <VStack gap={3} style={{ position: 'relative', zIndex: 1 }}>
                          <HStack align="end" justify="between">
                            <Text
                              type="label"
                              color="inherit"
                              style={{ opacity: 0.88, letterSpacing: '0.08em', textTransform: 'uppercase' }}
                            >
                              Total
                            </Text>
                            <span
                              className="movix-num"
                              style={{ fontSize: 'clamp(1.9rem, 3vw, 2.35rem)', fontWeight: 800 }}
                            >
                              {formatBrl(cartTotal)}
                            </span>
                          </HStack>

                          <SegmentedControl
                            label="Forma de pagamento"
                            size="md"
                            layout="fill"
                            value={method}
                            onChange={(v) => setMethod(v as PaymentMethod)}
                          >
                            <SegmentedControlItem value="PIX" label="PIX" />
                            <SegmentedControlItem value="DINHEIRO" label="Dinheiro" />
                            <SegmentedControlItem value="CARTAO" label="Cartão" />
                            <SegmentedControlItem value="FIADO" label="Fiado" />
                          </SegmentedControl>

                          {method === 'DINHEIRO' && cartTotal > 0 && (
                            <HStack
                              justify="between"
                              align="center"
                              style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 3, padding: '8px 12px' }}
                            >
                              <Text type="supporting" color="inherit">
                                Cliente pagou com {formatBrl(cashNote)}
                              </Text>
                              <Text
                                type="label"
                                weight="bold"
                                color="inherit"
                                hasTabularNumbers
                                style={{ color: '#FFD200' }}
                              >
                                Troco {formatBrl(cashChange)}
                              </Text>
                            </HStack>
                          )}

                          {method === 'FIADO' && (
                            <VStack
                              gap={1.5}
                              style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 3, padding: '10px 12px' }}
                            >
                              <HStack justify="between" align="center">
                                <Text type="label" color="inherit">
                                  {demo.customer} · limite {formatBrl(customerLimit)}
                                </Text>
                                <Text type="supporting" color="inherit" hasTabularNumbers>
                                  {formatBrl(projectedDebt)}
                                </Text>
                              </HStack>
                              <ProgressBar
                                label="Limite de fiado"
                                isLabelHidden
                                value={debtPercent}
                                max={100}
                                variant={fiadoOverLimit ? 'warning' : 'success'}
                              />
                              <Text
                                type="supporting"
                                color="inherit"
                                style={{ color: fiadoOverLimit ? '#FFD200' : '#C9C9C4' }}
                              >
                                {fiadoOverLimit
                                  ? 'Ultrapassa o limite: o caixa pede a senha do administrador.'
                                  : `Já deve ${formatBrl(customerDebt)} · dentro do limite combinado.`}
                              </Text>
                            </VStack>
                          )}

                          <button
                            type="button"
                            disabled={cart.length === 0}
                            onClick={finishSale}
                            className="movix-cta-amber"
                            style={{
                              width: '100%',
                              opacity: cart.length === 0 ? 0.55 : 1,
                              cursor: cart.length === 0 ? 'not-allowed' : 'pointer',
                            }}
                          >
                            <CheckCircle2 size={18} />
                            <span>Finalizar venda</span>
                            <Kbd keys="F9" />
                          </button>
                        </VStack>
                      </div>
                    </Theme>
                  </VStack>
                )}

                {saleState === 'auth' && (
                  <VStack gap={4} align="center" style={{ textAlign: 'center', paddingBlock: 20 }}>
                    <ShieldAlert size={44} color="var(--color-warning)" />
                    <Heading level={3} style={{ fontSize: '1.25rem' }}>
                      Proteção de fiado ativada
                    </Heading>
                    <Text type="body" color="secondary" style={{ maxWidth: '38ch' }}>
                      {demo.customer} passaria a dever{' '}
                      <strong>{formatBrl(customerDebt + cartTotal)}</strong>, acima do limite de{' '}
                      <strong>{formatBrl(customerLimit)}</strong>. No Movix, só o administrador libera.
                    </Text>
                    <HStack gap={2} wrap="wrap" justify="center">
                      <Button
                        label="Autorizar (simulação)"
                        variant="primary"
                        onClick={() => setSaleState('done')}
                      />
                      <Button label="Voltar" variant="secondary" onClick={() => setSaleState('idle')} />
                    </HStack>
                  </VStack>
                )}

                {saleState === 'done' && (
                  <VStack gap={4} align="center" style={{ textAlign: 'center', paddingBlock: 20 }}>
                    <CheckCircle2 size={46} color="var(--color-icon-accent)" />
                    <Heading level={3} style={{ fontSize: '1.3rem' }}>
                      Venda concluída em segundos
                    </Heading>
                    <Text type="body" color="secondary" style={{ maxWidth: '38ch' }}>
                      <strong>{formatBrl(cartTotal)}</strong> recebidos {methodSummary[method]}. No
                      Movix real, o estoque baixa na hora e o valor entra no fechamento do turno.
                    </Text>
                    <HStack gap={2} wrap="wrap" justify="center">
                      <Button
                        label="Agendar demonstração"
                        variant="primary"
                        icon={<MessageCircle size={15} />}
                        href={waDemoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      />
                      <Button
                        label="Nova venda"
                        variant="secondary"
                        icon={<RotateCcw size={15} />}
                        onClick={resetSale}
                      />
                    </HStack>
                  </VStack>
                )}
              </div>
            </div>
          </Card>

          <Text type="supporting" color="secondary">
            Simulação com produtos de exemplo. Na sua loja, o leitor de código de barras e a balança fazem esse trabalho automaticamente.
          </Text>
        </VStack>
      </div>
    </section>
  );
}
