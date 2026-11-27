import { Card } from '@astryxdesign/core/Card';
import { VStack } from '@astryxdesign/core/VStack';
import { HStack } from '@astryxdesign/core/HStack';
import { Grid } from '@astryxdesign/core/Grid';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import {
  ShieldCheck,
  KeyRound,
  Lock,
  HardDrive,
  DatabaseBackup,
  Fingerprint,
} from 'lucide-react';
import type { SiteContent } from '../types/site';

interface SecurityShowcaseProps {
  security: SiteContent['security'];
}

const GUARD_ICONS = [
  KeyRound,
  ShieldCheck,
  Lock,
  HardDrive,
  DatabaseBackup,
  Fingerprint,
];

export function SecurityShowcase({ security }: SecurityShowcaseProps) {
  return (
    <section id="seguranca" className="movix-section movix-section-surface" aria-labelledby="t-seg">
      <div className="movix-wrap">
        <VStack gap={5}>
          <VStack gap={2} maxWidth={740}>
            <Heading level={2} id="t-seg" textWrap="balance">
              {security.title}
            </Heading>
            <Text type="body" color="secondary">
              {security.intro}
            </Text>
          </VStack>

          <Grid columns={{ minWidth: 280, max: 3 }} gap={4}>
            {security.items.map((item, idx) => {
              const IconComp = GUARD_ICONS[idx % GUARD_ICONS.length];
              return (
                <Card key={item.title} padding={4} elevation="low">
                  <VStack gap={2}>
                    <HStack align="center" gap={2}>
                      <IconComp size={19} color="var(--color-icon-accent)" style={{ flexShrink: 0 }} />
                      <Heading level={3} style={{ fontSize: '1.12rem' }} textWrap="balance">
                        {item.title}
                      </Heading>
                    </HStack>
                    <Text type="body" color="secondary">
                      {item.text}
                    </Text>
                  </VStack>
                </Card>
              );
            })}
          </Grid>
        </VStack>
      </div>
    </section>
  );
}
