import { initialPots } from '../data';
import { body, display, type Colors } from '../tokens';
import { AddRow, Card, Eyebrow, PotRow, ScreenHeader } from '../ui';

export function PotsScreen({ c }: { c: Colors }) {
  return (
    <div>
      <ScreenHeader c={c} title="Pots" />
      <div style={{ padding: '8px 20px 20px' }}>
        <Card c={c} style={{ marginBottom: 20 }}>
          {initialPots.map((p) => (
            <PotRow key={p.id} c={c} pot={p} />
          ))}
          <AddRow c={c} label="Add a pot" />
        </Card>

        <Eyebrow c={c}>Auto-split on every sale</Eyebrow>
        <Card c={c} style={{ marginTop: 10, marginBottom: 20 }}>
          {initialPots.filter((p) => p.pct > 0).map((p) => (
            <div key={p.id} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', ...body, fontSize: 13, color: c.text, marginBottom: 6 }}>
                <span>{p.name}</span>
                <span style={{ fontWeight: 700 }}>{p.pct}%</span>
              </div>
              <div style={{ height: 8, borderRadius: 4, background: c.border, overflow: 'hidden' }}>
                <div style={{ width: `${p.pct}%`, height: '100%', background: c.accent }} />
              </div>
            </div>
          ))}
        </Card>

        <Eyebrow c={c}>Self-paid salary</Eyebrow>
        <Card c={c} style={{ marginTop: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ ...body, fontSize: 13, color: c.muted }}>Holding</div>
              <div style={{ ...display, fontSize: 22, fontWeight: 700, color: c.text }}>K 180.00</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ ...body, fontSize: 13, color: c.muted }}>Next payday</div>
              <div style={{ ...body, fontSize: 15, fontWeight: 700, color: c.text }}>Friday · K150</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
