import {
  Home as HomeIcon,
  PiggyBank,
  QrCode,
  Users,
  User,
  ChevronLeft,
  ChevronRight,
  Plus,
} from 'lucide-react';
import type { CSSProperties, ReactNode } from 'react';
import { body, display, facet, formatK, type Colors } from './tokens';

export function Eyebrow({ c, children }: { c: Colors; children: ReactNode }) {
  return (
    <div style={{ ...body, fontSize: 12, fontWeight: 700, letterSpacing: 1.4, textTransform: 'uppercase', color: c.muted }}>
      {children}
    </div>
  );
}

export function Card({ c, children, hero, style }: { c: Colors; children: ReactNode; hero?: boolean; style?: CSSProperties }) {
  return (
    <div
      style={{
        background: hero ? c.accent : c.surface,
        border: hero ? 'none' : `1px solid ${c.border}`,
        borderRadius: 20,
        padding: 20,
        ...(hero ? facet : {}),
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function PotRow({ c, pot }: { c: Colors; pot: { name: string; balance: number; pct: number } }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: `1px solid ${c.border}` }}>
      <div>
        <div style={{ ...body, fontSize: 15, fontWeight: 600, color: c.text }}>{pot.name}</div>
        {pot.pct > 0 && <div style={{ ...body, fontSize: 12, color: c.muted, marginTop: 2 }}>{pot.pct}% of every sale</div>}
      </div>
      <div style={{ ...display, fontSize: 17, fontWeight: 600, color: c.text }}>K {formatK(pot.balance)}</div>
    </div>
  );
}

export function BottomNav({ c, tab, setTab }: { c: Colors; tab: string; setTab: (tab: string) => void }) {
  const items = [
    { id: 'home', label: 'Home', icon: HomeIcon },
    { id: 'pots', label: 'Pots', icon: PiggyBank },
    { id: 'pay', label: 'Pay', icon: QrCode, center: true },
    { id: 'chilimba', label: 'Chilimba', icon: Users },
    { id: 'me', label: 'Me', icon: User },
  ];
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        minHeight: 84,
        background: c.surface,
        borderTop: `1px solid ${c.border}`,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-around',
        paddingTop: 10,
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      {items.map((item) => {
        const Icon = item.icon;
        const active = tab === item.id;
        if (item.center) {
          return (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              style={{
                marginTop: -26,
                width: 56,
                height: 56,
                borderRadius: 28,
                background: c.accent,
                border: `4px solid ${c.surface}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 6px 16px rgba(0,0,0,0.25)',
              }}
            >
              <Icon size={22} color={c.accentText} />
            </button>
          );
        }
        return (
          <button
            key={item.id}
            onClick={() => setTab(item.id)}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, background: 'none', border: 'none' }}
          >
            <Icon size={20} color={active ? c.accent : c.muted} />
            <span style={{ ...body, fontSize: 11, fontWeight: 600, color: active ? c.accent : c.muted }}>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export function ScreenHeader({ c, title, onBack }: { c: Colors; title: string; onBack?: () => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '20px 20px 4px' }}>
      {onBack && (
        <button onClick={onBack} style={{ background: 'none', border: 'none', padding: 4 }}>
          <ChevronLeft size={22} color={c.text} />
        </button>
      )}
      <div style={{ ...display, fontSize: 20, fontWeight: 700, color: c.text }}>{title}</div>
    </div>
  );
}

export function SettingsRow({ c, label, value, danger, last }: { c: Colors; label: string; value?: string; danger?: boolean; last?: boolean }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '14px 0',
        borderWidth: 0,
        borderBottomWidth: last ? 0 : 1,
        borderStyle: 'solid',
        borderColor: c.border,
      }}
    >
      <span style={{ ...body, fontSize: 14, color: danger ? c.danger : c.text, fontWeight: danger ? 700 : 400 }}>{label}</span>
      {value ? (
        <span style={{ ...body, fontSize: 14, color: c.muted }}>{value}</span>
      ) : (
        <ChevronRight size={16} color={c.muted} />
      )}
    </div>
  );
}

export function AddRow({ c, label }: { c: Colors; label: string }) {
  return (
    <button style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', padding: '14px 0 4px' }}>
      <Plus size={16} color={c.accent} />
      <span style={{ ...body, fontSize: 14, fontWeight: 600, color: c.accent }}>{label}</span>
    </button>
  );
}
