import { useState } from 'react';
import { ChevronRight, Plus, Shield } from 'lucide-react';
import { chilimbaGroups } from '../data';
import { body, type Colors } from '../tokens';
import { Card, Eyebrow, ScreenHeader } from '../ui';

export function ChilimbaScreen({ c }: { c: Colors }) {
  const [openGroup, setOpenGroup] = useState<number | null>(null);

  if (openGroup) {
    const g = chilimbaGroups.find((x) => x.id === openGroup)!;
    return (
      <div>
        <ScreenHeader c={c} title={g.name} onBack={() => setOpenGroup(null)} />
        <div style={{ padding: 20 }}>
          <Card c={c} style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ ...body, fontSize: 13, color: c.muted }}>Your position</span>
              <span style={{ ...body, fontSize: 13, fontWeight: 700, color: c.text }}>{g.position} of {g.members}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ ...body, fontSize: 13, color: c.muted }}>Next contribution</span>
              <span style={{ ...body, fontSize: 13, fontWeight: 700, color: c.text }}>{g.next}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ ...body, fontSize: 13, color: c.muted }}>Next payout</span>
              <span style={{ ...body, fontSize: 13, fontWeight: 700, color: c.text }}>{g.payoutWeek}</span>
            </div>
          </Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, ...body, fontSize: 13, color: c.success, fontWeight: 700, marginBottom: 16 }}>
            <Shield size={16} /> Protection: ON
          </div>
          <Eyebrow c={c}>Group ledger</Eyebrow>
          <div style={{ marginTop: 10 }}>
            {['Contribution — You', 'Contribution — Faides', 'Payout — Grace'].map((entry, i) => (
              <div key={i} style={{ padding: '10px 0', borderBottom: `1px solid ${c.border}`, ...body, fontSize: 13, color: c.text }}>
                {entry}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <ScreenHeader c={c} title="Chilimba" />
      <div style={{ padding: '8px 20px 20px' }}>
        <Eyebrow c={c}>My groups</Eyebrow>
        <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {chilimbaGroups.map((g) => (
            <button key={g.id} onClick={() => setOpenGroup(g.id)} style={{ textAlign: 'left', background: c.surface, border: `1px solid ${c.border}`, borderRadius: 16, padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ ...body, fontWeight: 700, fontSize: 15, color: c.text }}>{g.name}</div>
                <ChevronRight size={16} color={c.muted} />
              </div>
              <div style={{ ...body, fontSize: 12, color: c.muted, marginTop: 4 }}>{g.members} members · {g.next}</div>
            </button>
          ))}
        </div>
        <button style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none' }}>
          <Plus size={16} color={c.accent} />
          <span style={{ ...body, fontSize: 14, fontWeight: 600, color: c.accent }}>Create a group</span>
        </button>
      </div>
    </div>
  );
}
