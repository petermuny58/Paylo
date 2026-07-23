import { ArrowDownLeft, Camera, ChevronRight } from 'lucide-react';
import type { DashboardPot, DashboardTransaction } from '../../../lib/types';
import { body, display, formatK, type Colors } from '../tokens';
import { Card, Eyebrow } from '../ui';

export function HomeScreen({
  c,
  goPay,
  setTab,
  walletBalance,
  pots,
  recentActivity,
}: {
  c: Colors;
  goPay: (view: string) => void;
  setTab: (tab: string) => void;
  walletBalance: number;
  pots: DashboardPot[];
  recentActivity: DashboardTransaction[];
}) {
  return (
    <div style={{ padding: '24px 20px 20px' }}>
      <Card c={c} hero style={{ marginBottom: 20 }}>
        <div style={{ ...body, fontSize: 12, fontWeight: 700, letterSpacing: 1.4, textTransform: 'uppercase', color: 'rgba(255,255,255,0.75)' }}>
          Wallet Balance
        </div>
        <div style={{ ...display, fontSize: 42, fontWeight: 700, color: '#fff', marginTop: 6 }}>K {formatK(walletBalance)}</div>
        <div style={{ ...body, fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 4 }}>3 weeks of salary banked</div>
      </Card>

      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        <button
          onClick={() => goPay('receive')}
          style={{ flex: 1, background: c.accent, border: 'none', borderRadius: 18, padding: '18px 16px', textAlign: 'left' }}
        >
          <ArrowDownLeft size={22} color="#fff" />
          <div style={{ ...body, fontWeight: 700, fontSize: 16, color: '#fff', marginTop: 10 }}>Receive</div>
        </button>
        <button
          onClick={() => goPay('scan')}
          style={{ flex: 1, background: c.surface, border: `1px solid ${c.border}`, borderRadius: 18, padding: '18px 16px', textAlign: 'left' }}
        >
          <Camera size={22} color={c.text} />
          <div style={{ ...body, fontWeight: 700, fontSize: 16, color: c.text, marginTop: 10 }}>Scan</div>
        </button>
      </div>

      <Eyebrow c={c}>Pots</Eyebrow>
      <div style={{ display: 'flex', gap: 10, overflowX: 'auto', marginTop: 10, marginBottom: 22, paddingBottom: 2 }}>
        {pots.map((p) => (
          <div key={p.id} style={{ flexShrink: 0, background: c.surface, border: `1px solid ${c.border}`, borderRadius: 14, padding: '10px 14px', minWidth: 108 }}>
            <div style={{ ...body, fontSize: 11, color: c.muted, fontWeight: 600 }}>{p.name}</div>
            <div style={{ ...display, fontSize: 15, fontWeight: 700, color: c.text, marginTop: 2 }}>K {formatK(p.balance)}</div>
          </div>
        ))}
        <button onClick={() => setTab('pots')} style={{ flexShrink: 0, background: 'none', border: `1px dashed ${c.border}`, borderRadius: 14, padding: '10px 14px', minWidth: 60, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ChevronRight size={18} color={c.muted} />
        </button>
      </div>

      <Eyebrow c={c}>Recent</Eyebrow>
      <div style={{ marginTop: 10 }}>
        {recentActivity.length === 0 ? (
          <div style={{ ...body, fontSize: 13, color: c.muted, padding: '10px 0' }}>No transactions yet</div>
        ) : (
          recentActivity.map((tx) => (
            <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${c.border}` }}>
              <div style={{ ...body, fontSize: 14, color: c.text }}>{tx.label}</div>
              <div style={{ ...display, fontSize: 14, fontWeight: 600, color: tx.dir === 'in' ? c.success : c.text }}>
                {tx.dir === 'in' ? '+' : ''}K {formatK(Math.abs(tx.amount))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
