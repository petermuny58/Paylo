import { useState, type ReactNode } from 'react';
import type { DashboardPot, DashboardTransaction } from '../../lib/types';
import { palette, type ThemeMode } from './tokens';
import { BottomNav } from './ui';
import { AuthPanel, WalletActions } from './WalletForms';
import { ChilimbaScreen } from './screens/ChilimbaScreen';
import { HomeScreen } from './screens/HomeScreen';
import { MeScreen } from './screens/MeScreen';
import { PayScreen } from './screens/PayScreen';
import { PotsScreen } from './screens/PotsScreen';

export type PayloAppProps = {
  user: { id: string; phoneNumber: string } | null;
  walletBalance: number;
  pots: DashboardPot[];
  recentActivity: DashboardTransaction[];
};

// Mobile-first: the app fills the whole viewport on phones (fixed overlay so it
// escapes any surrounding page chrome and respects device safe areas). From the
// `sm` breakpoint up it becomes a centered phone mockup with a bezel.
const frameStyles = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Inter:wght@400;500;600;700&display=swap');

.paylo-root {
  font-family: 'Inter', sans-serif;
  display: flex;
  align-items: stretch;
  justify-content: center;
  min-height: 100dvh;
  background: transparent;
}
.paylo-frame {
  position: fixed;
  inset: 0;
  z-index: 50;
  overflow: hidden;
}
.paylo-scroll {
  position: absolute;
  inset: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
  padding-top: env(safe-area-inset-top, 0px);
}
@media (min-width: 640px) {
  .paylo-root {
    align-items: center;
    min-height: 100vh;
    padding: 24px;
  }
  .paylo-frame {
    position: relative;
    inset: auto;
    z-index: auto;
    width: 390px;
    height: min(780px, calc(100vh - 48px));
    border-radius: 44px;
    border: 10px solid #111114;
    box-shadow: 0 24px 60px rgba(0, 0, 0, 0.35);
  }
  .paylo-scroll {
    padding-top: 0;
  }
}
`;

function PhoneFrame({ bg, children }: { bg: string; children: ReactNode }) {
  return (
    <div className="paylo-root">
      <style>{frameStyles}</style>
      <div className="paylo-frame" style={{ background: bg }}>
        {children}
      </div>
    </div>
  );
}

const scrollPaddingBottom = 'calc(90px + env(safe-area-inset-bottom, 0px))';

export default function PayloPrototype({
  user,
  walletBalance,
  pots,
  recentActivity,
}: PayloAppProps) {
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
      <PhoneFrame bg={c.bg}>
        <div className="paylo-scroll">
          <AuthPanel c={c} />
        </div>
      </PhoneFrame>
    );
  }

  return (
    <PhoneFrame bg={c.bg}>
      <div className="paylo-scroll" style={{ paddingBottom: scrollPaddingBottom }}>
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
    </PhoneFrame>
  );
}
