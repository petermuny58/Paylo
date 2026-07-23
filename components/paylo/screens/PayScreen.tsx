import { useState } from 'react';
import { ArrowDownLeft, Camera, Check, QrCode, Send } from 'lucide-react';
import { body, display, formatK, type Colors } from '../tokens';
import { Eyebrow, ScreenHeader } from '../ui';

export function PayScreen({
  c,
  payView,
  setPayView,
}: {
  c: Colors;
  payView: string;
  setPayView: (view: string) => void;
}) {
  const [pendingPayment, setPendingPayment] = useState({ amount: 2500, to: "Mrs. Banda's Stall" });
  const [sendRecipient, setSendRecipient] = useState('');
  const [sendAmount, setSendAmount] = useState('');
  const [sendNote, setSendNote] = useState('');

  const inputStyle = {
    width: '100%',
    background: c.surface,
    borderWidth: 1,
    borderStyle: 'solid' as const,
    borderColor: c.border,
    borderRadius: 12,
    padding: '14px 16px',
    ...body,
    fontSize: 15,
    color: c.text,
    marginTop: 8,
    outline: 'none',
    boxSizing: 'border-box' as const,
  };

  if (payView === 'receive') {
    return (
      <div>
        <ScreenHeader c={c} title="Receive" onBack={() => setPayView('choice')} />
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Eyebrow c={c}>Amount to charge</Eyebrow>
          <div style={{ ...display, fontSize: 40, fontWeight: 700, color: c.text, marginTop: 8, marginBottom: 24 }}>K 25.00</div>
          <div style={{ width: 200, height: 200, background: '#fff', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderStyle: 'solid', borderColor: c.border }}>
            <QrCode size={140} color={c.text} />
          </div>
          <div style={{ ...body, fontSize: 13, color: c.muted, marginTop: 16 }}>Waiting for buyer to pay…</div>
        </div>
      </div>
    );
  }

  if (payView === 'scan') {
    return (
      <div>
        <ScreenHeader c={c} title="Scan to Pay" onBack={() => setPayView('choice')} />
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: '100%', height: 260, background: '#000', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            <div style={{ width: 160, height: 160, borderWidth: 3, borderStyle: 'solid', borderColor: c.accent, borderRadius: 12 }} />
          </div>
          <div style={{ ...body, fontSize: 13, color: c.muted, marginTop: 16, marginBottom: 20 }}>Line up the seller's QR code inside the frame</div>
          <button
            onClick={() => {
              setPendingPayment({ amount: 2500, to: "Mrs. Banda's Stall" });
              setPayView('confirm');
            }}
            style={{ background: c.accent, border: 'none', borderRadius: 14, padding: '14px 24px', ...body, fontWeight: 700, color: '#fff' }}
          >
            Simulate a scan
          </button>
        </div>
      </div>
    );
  }

  if (payView === 'send') {
    const canContinue = sendRecipient.trim().length > 0 && Number(sendAmount) > 0;
    return (
      <div>
        <ScreenHeader c={c} title="Send" onBack={() => setPayView('choice')} />
        <div style={{ padding: 20 }}>
          <Eyebrow c={c}>To</Eyebrow>
          <input
            value={sendRecipient}
            onChange={(e) => setSendRecipient(e.target.value)}
            placeholder="@handle or phone number"
            style={{ ...inputStyle, marginBottom: 20 }}
          />

          <Eyebrow c={c}>Amount</Eyebrow>
          <div style={{ display: 'flex', alignItems: 'center', marginTop: 8, marginBottom: 20 }}>
            <span style={{ ...display, fontSize: 32, fontWeight: 700, color: c.accent, marginRight: 8 }}>K</span>
            <input
              value={sendAmount}
              onChange={(e) => setSendAmount(e.target.value)}
              placeholder="0.00"
              inputMode="decimal"
              style={{ flex: 1, background: 'none', border: 'none', ...display, fontSize: 32, fontWeight: 700, color: c.text, outline: 'none' }}
            />
          </div>

          <Eyebrow c={c}>Note (optional)</Eyebrow>
          <input
            value={sendNote}
            onChange={(e) => setSendNote(e.target.value)}
            placeholder="e.g. for fees"
            style={{ ...inputStyle, marginBottom: 28 }}
          />

          <button
            disabled={!canContinue}
            onClick={() => {
              setPendingPayment({ amount: Math.round(Number(sendAmount) * 100), to: sendRecipient });
              setPayView('confirm');
            }}
            style={{
              width: '100%',
              background: c.accent,
              border: 'none',
              borderRadius: 14,
              padding: 16,
              ...body,
              fontWeight: 700,
              fontSize: 15,
              color: '#fff',
              opacity: canContinue ? 1 : 0.4,
            }}
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  if (payView === 'confirm') {
    return (
      <div>
        <ScreenHeader c={c} title="Confirm Payment" onBack={() => setPayView('choice')} />
        <div style={{ padding: 20 }}>
          <Eyebrow c={c}>Pay</Eyebrow>
          <div style={{ ...display, fontSize: 40, fontWeight: 700, color: c.text, marginTop: 6 }}>K {formatK(pendingPayment.amount)}</div>
          <div style={{ ...body, fontSize: 14, color: c.muted, marginTop: 4, marginBottom: 24 }}>to {pendingPayment.to}</div>
          <Eyebrow c={c}>Enter your 4-digit PIN</Eyebrow>
          <div style={{ display: 'flex', gap: 14, marginTop: 12, marginBottom: 28 }}>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} style={{ width: 16, height: 16, borderRadius: 8, background: i < 2 ? c.accent : 'transparent', borderWidth: 2, borderStyle: 'solid', borderColor: i < 2 ? c.accent : c.border }} />
            ))}
          </div>
          <button
            onClick={() => setPayView('done')}
            style={{ width: '100%', background: c.accent, border: 'none', borderRadius: 14, padding: '16px', ...body, fontWeight: 700, color: '#fff' }}
          >
            Confirm
          </button>
        </div>
      </div>
    );
  }

  if (payView === 'done') {
    return (
      <div style={{ padding: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginTop: 60 }}>
        <div style={{ width: 64, height: 64, borderRadius: 32, background: c.success, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
          <Check size={30} color="#fff" />
        </div>
        <div style={{ ...display, fontSize: 20, fontWeight: 700, color: c.text }}>Payment successful</div>
        <div style={{ ...body, fontSize: 13, color: c.muted, marginTop: 6 }}>K {formatK(pendingPayment.amount)} to {pendingPayment.to}</div>
        <button
          onClick={() => {
            setSendRecipient('');
            setSendAmount('');
            setSendNote('');
            setPayView('choice');
          }}
          style={{ marginTop: 24, background: 'none', border: 'none', ...body, fontWeight: 700, color: c.accent }}
        >
          Done
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <ScreenHeader c={c} title="Pay" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
        <button onClick={() => setPayView('receive')} style={{ display: 'flex', alignItems: 'center', gap: 14, background: c.surface, borderWidth: 1, borderStyle: 'solid', borderColor: c.border, borderRadius: 16, padding: 18, textAlign: 'left' }}>
          <div style={{ width: 42, height: 42, borderRadius: 21, background: c.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ArrowDownLeft size={20} color="#fff" />
          </div>
          <div>
            <div style={{ ...body, fontWeight: 700, fontSize: 15, color: c.text }}>Receive</div>
            <div style={{ ...body, fontSize: 12, color: c.muted }}>Generate a QR for a buyer to scan</div>
          </div>
        </button>
        <button onClick={() => setPayView('scan')} style={{ display: 'flex', alignItems: 'center', gap: 14, background: c.surface, borderWidth: 1, borderStyle: 'solid', borderColor: c.border, borderRadius: 16, padding: 18, textAlign: 'left' }}>
          <div style={{ width: 42, height: 42, borderRadius: 21, background: c.text, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Camera size={20} color={c.bg} />
          </div>
          <div>
            <div style={{ ...body, fontWeight: 700, fontSize: 15, color: c.text }}>Scan</div>
            <div style={{ ...body, fontSize: 12, color: c.muted }}>Pay a seller's QR code</div>
          </div>
        </button>
        <button onClick={() => setPayView('send')} style={{ display: 'flex', alignItems: 'center', gap: 14, background: c.surface, borderWidth: 1, borderStyle: 'solid', borderColor: c.border, borderRadius: 16, padding: 18, textAlign: 'left' }}>
          <div style={{ width: 42, height: 42, borderRadius: 21, background: c.surfaceRaised, borderWidth: 1, borderStyle: 'solid', borderColor: c.border, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Send size={18} color={c.text} />
          </div>
          <div>
            <div style={{ ...body, fontWeight: 700, fontSize: 15, color: c.text }}>Send</div>
            <div style={{ ...body, fontSize: 12, color: c.muted }}>To a saved handle or phone number</div>
          </div>
        </button>
      </div>
    </div>
  );
}
