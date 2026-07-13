import { useState } from 'react';
import type { DashboardPot, DashboardTransaction } from '../../lib/types';
import { body, palette, type ThemeMode } from './tokens';
import { BottomNav } from './ui';
import { AuthPanel, WalletActions } from './WalletForms';
import { ChilimbaScreen } from './screens/ChilimbaScreen';
import { HomeScreen } from './screens/HomeScreen';
import { MeScreen } from './screens/MeScreen';
import { PayScreen } from './screens/PayScreen';
import { PotsScreen } from './screens/PotsScreen';

export type NdalamaAppProps = {
  user: { id: string; phoneNumber: string } | null;
  walletBalance: number;
  pots: DashboardPot[];
  recentActivity: DashboardTransaction[];
};

export default function NdalamaPrototype({
  user,
  walletBalance,
  pots,
  recentActivity,
}: NdalamaAppProps) {
  const [mode, setMode] = useState<ThemeMode>('dark');
  const [tab, setTab] = useState('home');
  const [payView, setPayView] = useState('choice');
  const c = palette[mode];

  const goPay = (view: string) => {
    setPayView(view);
    setTab('pay');
  };

  const handleSetTab = (t: string) => {
    setTab(t);
    if (t === 'pay') setPayView('choice');
  };

  if (!user) {
    return (
      <div style={{ ...body, minHeight: 640, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', padding: 20 }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Inter:wght@400;500;600;700&display=swap');`}</style>
        <div
          style={{
            width: 390,
            height: 780,
            background: c.bg,
            borderRadius: 44,
            border: '10px solid #111114',
            boxShadow: '0 24px 60px rgba(0,0,0,0.35)',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <div style={{ position: 'absolute', inset: 0, overflowY: 'auto' }}>
            <AuthPanel c={c} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ ...body, minHeight: 640, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', padding: 20 }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Inter:wght@400;500;600;700&display=swap');`}</style>
      <div
        style={{
          width: 390,
          height: 780,
          background: c.bg,
          borderRadius: 44,
          border: '10px solid #111114',
          boxShadow: '0 24px 60px rgba(0,0,0,0.35)',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingBottom: 90 }}>
          {tab === 'home' && (
            <>
              <HomeScreen
                c={c}
                goPay={goPay}
                setTab={handleSetTab}
                walletBalance={walletBalance}
                pots={pots}
                recentActivity={recentActivity}
              />
              <WalletActions c={c} pots={pots} />
            </>
          )}
          {tab === 'pots' && <PotsScreen c={c} pots={pots} />}
          {tab === 'pay' && <PayScreen c={c} payView={payView} setPayView={setPayView} />}
          {tab === 'chilimba' && <ChilimbaScreen c={c} />}
          {tab === 'me' && <MeScreen c={c} mode={mode} setMode={setMode} phoneNumber={user.phoneNumber} />}
        </div>
        <BottomNav c={c} tab={tab} setTab={handleSetTab} />
      </div>
    </div>
  );
}
