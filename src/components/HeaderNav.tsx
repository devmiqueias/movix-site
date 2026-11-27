import { useState } from 'react';
import { Button } from '@astryxdesign/core/Button';
import { Drawer, DrawerHeader } from '@astryxdesign/core/Drawer';
import { VStack } from '@astryxdesign/core/VStack';
import { Divider } from '@astryxdesign/core/Divider';
import { Tooltip } from '@astryxdesign/core/Tooltip';
import { Menu, Moon, Sun, MessageCircle } from 'lucide-react';
import { MovixMark } from './MovixLogo';
import type { SiteContent } from '../types/site';
import { buildWhatsappUrl } from '../utils/siteData';

interface HeaderNavProps {
  data: SiteContent;
  themeMode: 'light' | 'dark';
  onToggleTheme: () => void;
}

const NAV_ITEMS = [
  { href: '#caixa-demo', label: 'Demonstração' },
  { href: '#percurso', label: 'Como funciona' },
  { href: '#para-quem', label: 'Para quem é' },
  { href: '#seguranca', label: 'Segurança' },
  { href: '#planos', label: 'Planos' },
  { href: '#perguntas', label: 'Dúvidas' },
];

export function HeaderNav({ data, themeMode, onToggleTheme }: HeaderNavProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const waUrl = buildWhatsappUrl(data.contact.whatsapp, data.contact.message);

  return (
    <>
      <header className="movix-header">
        <div className="movix-header-inner">
          <a href="#inicio" className="movix-brand" aria-label={`${data.site.name}, início`}>
            <MovixMark size={36} />
            <VStack gap={0}>
              <span>movix</span>
              <span className="movix-brand-sub">by {data.site.company.toLowerCase()}</span>
            </VStack>
          </a>

          <nav className="movix-nav-links" aria-label="Navegação principal">
            {NAV_ITEMS.map((item) => (
              <a key={item.href} href={item.href} className="movix-nav-link">
                {item.label}
              </a>
            ))}
          </nav>

          <div className="movix-header-actions">
            <Tooltip content={themeMode === 'dark' ? 'Modo claro' : 'Modo escuro'}>
              <Button
                label={themeMode === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
                size="sm"
                variant="ghost"
                isIconOnly
                icon={themeMode === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
                onClick={onToggleTheme}
              />
            </Tooltip>

            <div className="movix-desktop-only">
              <Button
                label="Falar no WhatsApp"
                size="sm"
                variant="primary"
                icon={<MessageCircle size={15} />}
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
              />
            </div>

            <div className="movix-mobile-only">
              <Button
                label="Abrir menu"
                size="sm"
                variant="secondary"
                isIconOnly
                icon={<Menu size={18} />}
                onClick={() => setMobileOpen(true)}
              />
            </div>
          </div>
        </div>
      </header>

      <Drawer
        isOpen={mobileOpen}
        onOpenChange={setMobileOpen}
        label="Menu do Movix PDV"
        side="end"
        width={320}
      >
        <VStack gap={4}>
          <DrawerHeader
            title="Movix PDV"
            subtitle={`Sistema de caixa · ${data.site.company}`}
            onOpenChange={setMobileOpen}
          />

          <VStack gap={1}>
            {NAV_ITEMS.map((item) => (
              <Button
                key={item.href}
                label={item.label}
                variant="ghost"
                width="100%"
                href={item.href}
                onClick={() => setMobileOpen(false)}
              />
            ))}
          </VStack>

          <Divider />

          <Button
            label="Falar no WhatsApp"
            variant="primary"
            size="lg"
            width="100%"
            icon={<MessageCircle size={16} />}
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
          />
        </VStack>
      </Drawer>
    </>
  );
}
