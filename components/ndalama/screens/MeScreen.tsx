import { useState } from 'react';
import { Check, ChevronRight, Moon, Sun } from 'lucide-react';
import { body, display, type Colors, type ThemeMode } from '../tokens';
import { Card, Eyebrow, ScreenHeader, SettingsRow } from '../ui';

function AccountSettingsScreen({
  c,
  onBack,
  phoneNumber,
}: {
  c: Colors;
  onBack: () => void;
  phoneNumber?: string;
}) {
  return (
    <div>
      <ScreenHeader c={c} title="Account Settings" onBack={onBack} />
      <div style={{ padding: '8px 20px 20px' }}>
        <Eyebrow c={c}>Profile</Eyebrow>
        <Card c={c} style={{ marginTop: 10, marginBottom: 20 }}>
          <SettingsRow c={c} label="Name" value="Mrs. Banda" />
          <SettingsRow c={c} label="Phone number" value={phoneNumber ?? '—'} />
          <SettingsRow c={c} label="Email" value="Not set" last />
        </Card>

        <Eyebrow c={c}>Account</Eyebrow>
        <Card c={c} style={{ marginTop: 10, marginBottom: 24 }}>
          <SettingsRow c={c} label="Change password" />
          <SettingsRow c={c} label="Download my data" last />
        </Card>

        <button
          style={{
            width: '100%',
            background: 'none',
            borderWidth: 1,
            borderStyle: 'solid',
            borderColor: c.danger,
            borderRadius: 14,
            padding: 14,
            ...body,
            fontWeight: 700,
            fontSize: 14,
            color: c.danger,
          }}
        >
          Delete account
        </button>
      </div>
    </div>
  );
}

function HealthScoreScreen({ c, onBack }: { c: Colors; onBack: () => void }) {
  const score = 82;
  const factors = [
    { label: 'Consistent restocking', good: true },
    { label: 'Savings discipline', good: true },
    { label: 'On-time chilimba contributions', good: true },
    { label: 'Payday consistency', good: false },
  ];
  return (
    <div>
      <ScreenHeader c={c} title="Financial Health Score" onBack={onBack} />
      <div style={{ padding: '8px 20px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div
          style={{
            width: 168,
            height: 168,
            borderRadius: '50%',
            background: `conic-gradient(${c.accent} ${score * 3.6}deg, ${c.border} 0deg)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 12,
            marginBottom: 28,
          }}
        >
          <div style={{ width: 134, height: 134, borderRadius: '50%', background: c.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ ...display, fontSize: 40, fontWeight: 700, color: c.text }}>{score}</div>
            <div style={{ ...body, fontSize: 11, color: c.muted }}>out of 100</div>
          </div>
        </div>

        <Eyebrow c={c}>What's contributing</Eyebrow>
        <Card c={c} style={{ marginTop: 10, width: '100%', boxSizing: 'border-box', marginBottom: 20 }}>
          {factors.map((f, i) => (
            <div
              key={f.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '12px 0',
                borderWidth: 0,
                borderBottomWidth: i === factors.length - 1 ? 0 : 1,
                borderStyle: 'solid',
                borderColor: c.border,
              }}
            >
              {f.good ? (
                <Check size={16} color={c.success} />
              ) : (
                <div style={{ width: 16, height: 16, borderRadius: 8, borderWidth: 2, borderStyle: 'solid', borderColor: c.muted }} />
              )}
              <span style={{ ...body, fontSize: 14, color: c.text }}>{f.label}</span>
            </div>
          ))}
        </Card>

        <Eyebrow c={c}>Unlocks</Eyebrow>
        <Card c={c} style={{ marginTop: 10, width: '100%', boxSizing: 'border-box' }}>
          <div style={{ ...body, fontSize: 14, color: c.text, lineHeight: 1.5 }}>
            Restock Advance eligibility, priority Chilimba group invites, and lower Ndalama Till fees.
          </div>
        </Card>
      </div>
    </div>
  );
}

function RestockAdvanceScreen({ c, onBack }: { c: Colors; onBack: () => void }) {
  const [requested, setRequested] = useState(false);

  if (requested) {
    return (
      <div>
        <ScreenHeader c={c} title="Restock Advance" onBack={onBack} />
        <div style={{ padding: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginTop: 40 }}>
          <div style={{ width: 64, height: 64, borderRadius: 32, background: c.success, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
            <Check size={30} color="#fff" />
          </div>
          <div style={{ ...display, fontSize: 20, fontWeight: 700, color: c.text }}>Advance sent to Restock</div>
          <div style={{ ...body, fontSize: 13, color: c.muted, marginTop: 8 }}>
            K 800.00 is in your Restock pot. Repayments are 10% of each sale, automatically, until it's cleared.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <ScreenHeader c={c} title="Restock Advance" onBack={onBack} />
      <div style={{ padding: '8px 20px 20px' }}>
        <Card c={c} hero style={{ marginBottom: 20 }}>
          <div style={{ ...body, fontSize: 12, fontWeight: 700, letterSpacing: 1.4, textTransform: 'uppercase', color: 'rgba(255,255,255,0.75)' }}>
            You're eligible for
          </div>
          <div style={{ ...display, fontSize: 38, fontWeight: 700, color: '#fff', marginTop: 6 }}>K 800.00</div>
        </Card>

        <Eyebrow c={c}>Why you qualify</Eyebrow>
        <Card c={c} style={{ marginTop: 10, marginBottom: 20 }}>
          <div style={{ ...body, fontSize: 14, color: c.text, lineHeight: 1.5 }}>
            Six months of consistent restocking and on-time self-paid salary, based on your own ledger —
            no collateral needed.
          </div>
        </Card>

        <Eyebrow c={c}>Repayment</Eyebrow>
        <Card c={c} style={{ marginTop: 10, marginBottom: 24 }}>
          <div style={{ ...body, fontSize: 14, color: c.text }}>10% of every sale, automatically, until repaid. No fixed due date.</div>
        </Card>

        <button
          onClick={() => setRequested(true)}
          style={{ width: '100%', background: c.accent, border: 'none', borderRadius: 14, padding: 16, ...body, fontWeight: 700, fontSize: 15, color: '#fff' }}
        >
          Send K800 to Restock pot
        </button>
      </div>
    </div>
  );
}

export function MeScreen({
  c,
  mode,
  setMode,
  phoneNumber,
}: {
  c: Colors;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  phoneNumber?: string;
}) {
  const [view, setView] = useState('list');

  if (view === 'account-settings') {
    return <AccountSettingsScreen c={c} onBack={() => setView('list')} phoneNumber={phoneNumber} />;
  }
  if (view === 'health-score') {
    return <HealthScoreScreen c={c} onBack={() => setView('list')} />;
  }
  if (view === 'restock-advance') {
    return <RestockAdvanceScreen c={c} onBack={() => setView('list')} />;
  }

  const rows = [
    'Account Settings',
    'Financial Health Score',
    'Restock Advance',
    'Linked mobile money',
    'Security & PIN',
    'Language',
    'Ndalama Till mode',
  ];
  return (
    <div>
      <ScreenHeader c={c} title="Me" />
      <div style={{ padding: '8px 20px 20px' }}>
        <Card c={c} style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, ...body, fontWeight: 700, fontSize: 14, color: c.text }}>
              {mode === 'dark' ? <Moon size={16} /> : <Sun size={16} />} Appearance
            </div>
            <div style={{ display: 'flex', background: c.surfaceRaised, borderRadius: 20, padding: 3, border: `1px solid ${c.border}` }}>
              <button
                onClick={() => setMode('dark')}
                style={{ padding: '6px 14px', borderRadius: 16, border: 'none', background: mode === 'dark' ? c.accent : 'transparent', color: mode === 'dark' ? '#fff' : c.muted, ...body, fontSize: 12, fontWeight: 700 }}
              >
                Graphite
              </button>
              <button
                onClick={() => setMode('light')}
                style={{ padding: '6px 14px', borderRadius: 16, border: 'none', background: mode === 'light' ? c.accent : 'transparent', color: mode === 'light' ? '#fff' : c.muted, ...body, fontSize: 12, fontWeight: 700 }}
              >
                Cream
              </button>
            </div>
          </div>
        </Card>

        {rows.map((r) => (
          <button
            key={r}
            onClick={() => {
              if (r === 'Account Settings') setView('account-settings');
              if (r === 'Financial Health Score') setView('health-score');
              if (r === 'Restock Advance') setView('restock-advance');
            }}
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px 0',
              background: 'none',
              borderWidth: 0,
              borderBottomWidth: 1,
              borderStyle: 'solid',
              borderColor: c.border,
            }}
          >
            <span style={{ ...body, fontSize: 14, color: c.text }}>{r}</span>
            <ChevronRight size={16} color={c.muted} />
          </button>
        ))}
      </div>
    </div>
  );
}
