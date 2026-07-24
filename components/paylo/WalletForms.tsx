import { useState } from "react";
import { reload } from "vike/client/router";
import type { DashboardPot } from "../../lib/types";
import { body, type Colors } from "./tokens";

function errorMessageFromBody(data: unknown): string {
  if (!data || typeof data !== "object") return "Request failed";
  const err = (data as { error?: unknown }).error;
  if (typeof err === "string") return err;
  if (err && typeof err === "object" && "message" in err) {
    const msg = (err as { message?: unknown }).message;
    if (typeof msg === "string") {
      if (/Protected deployment/i.test(msg)) {
        return "This Vercel preview is Deployment-Protected. Disable protection for the preview, or test on the production domain / locally with `npm run dev`.";
      }
      return msg;
    }
  }
  return "Request failed";
}

async function postJson<T>(url: string, body: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error(
      "Could not reach the auth API (network timeout). On Vercel previews, turn off Deployment Protection or use `npm run dev` locally.",
    );
  }
  const data: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(errorMessageFromBody(data));
  }
  return data as T;
}

export function AuthPanel({ c }: { c: Colors }) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const url = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const payload =
        mode === "login"
          ? { phoneNumber, password }
          : { phoneNumber, password, pin };
      await postJson(url, payload);
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const fieldStyle = {
    width: "100%",
    boxSizing: "border-box" as const,
    padding: "10px 12px",
    borderRadius: 10,
    border: `1px solid ${c.border}`,
    background: c.surfaceRaised,
    color: c.text,
    marginBottom: 10,
    ...body,
    fontSize: 14,
  };

  return (
    <div style={{ padding: "24px 20px" }}>
      <div style={{ ...body, fontSize: 18, fontWeight: 700, color: c.text, marginBottom: 16 }}>
        {mode === "login" ? "Log in" : "Create account"}
      </div>
      <form onSubmit={submit}>
        <input
          style={fieldStyle}
          placeholder="Phone number"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          autoComplete="tel"
        />
        <input
          style={fieldStyle}
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
        />
        {mode === "register" && (
          <input
            style={fieldStyle}
            type="password"
            inputMode="numeric"
            maxLength={4}
            placeholder="4-digit transaction PIN"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
          />
        )}
        {error && (
          <div style={{ ...body, fontSize: 13, color: c.danger, marginBottom: 10 }}>{error}</div>
        )}
        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            background: c.accent,
            border: "none",
            borderRadius: 12,
            padding: 14,
            color: "#fff",
            ...body,
            fontWeight: 700,
            fontSize: 15,
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Please wait…" : mode === "login" ? "Log in" : "Register"}
        </button>
      </form>
      <button
        type="button"
        onClick={() => {
          setMode(mode === "login" ? "register" : "login");
          setError(null);
        }}
        style={{
          marginTop: 14,
          background: "none",
          border: "none",
          color: c.accent,
          ...body,
          fontSize: 13,
          fontWeight: 600,
          width: "100%",
        }}
      >
        {mode === "login" ? "Need an account? Register" : "Already have an account? Log in"}
      </button>
    </div>
  );
}

export function WalletActions({
  c,
  pots,
}: {
  c: Colors;
  pots: DashboardPot[];
}) {
  const [topUpAmount, setTopUpAmount] = useState("");
  const [sendAmount, setSendAmount] = useState("");
  const [sendPotId, setSendPotId] = useState(pots[0]?.id ?? "");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawPin, setWithdrawPin] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  const run = async (key: string, fn: () => Promise<void>) => {
    setMessage(null);
    setError(null);
    setLoading(key);
    try {
      await fn();
      setMessage("Done — balances updated.");
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(null);
    }
  };

  const fieldStyle = {
    width: "100%",
    boxSizing: "border-box" as const,
    padding: "8px 10px",
    borderRadius: 8,
    border: `1px solid ${c.border}`,
    background: c.surfaceRaised,
    color: c.text,
    marginBottom: 8,
    ...body,
    fontSize: 13,
  };

  const btnStyle = {
    width: "100%",
    background: c.accent,
    border: "none",
    borderRadius: 10,
    padding: "10px 12px",
    color: "#fff",
    ...body,
    fontWeight: 700,
    fontSize: 13,
    marginTop: 4,
    marginBottom: 16,
    opacity: loading ? 0.7 : 1,
  };

  return (
    <div style={{ padding: "0 20px 20px" }}>
      <div style={{ ...body, fontSize: 12, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: c.muted, marginBottom: 10 }}>
        Wallet actions
      </div>

      {message && <div style={{ ...body, fontSize: 12, color: c.success, marginBottom: 8 }}>{message}</div>}
      {error && <div style={{ ...body, fontSize: 12, color: c.danger, marginBottom: 8 }}>{error}</div>}

      <div style={{ ...body, fontSize: 13, fontWeight: 600, color: c.text, marginBottom: 4 }}>Mock top-up (ZMW)</div>
      <input
        style={fieldStyle}
        placeholder="e.g. 100.00"
        value={topUpAmount}
        onChange={(e) => setTopUpAmount(e.target.value)}
      />
      <button
        type="button"
        style={btnStyle}
        disabled={!!loading}
        onClick={() =>
          run("topup", async () => {
            await postJson("/api/wallet/mock-top-up", { amountZmw: topUpAmount });
            setTopUpAmount("");
          })
        }
      >
        {loading === "topup" ? "Topping up…" : "Mock top-up"}
      </button>

      <div style={{ ...body, fontSize: 13, fontWeight: 600, color: c.text, marginBottom: 4 }}>Send to pot (ZMW)</div>
      <select
        style={fieldStyle}
        value={sendPotId}
        onChange={(e) => setSendPotId(e.target.value)}
      >
        {pots.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
      <input
        style={fieldStyle}
        placeholder="Amount"
        value={sendAmount}
        onChange={(e) => setSendAmount(e.target.value)}
      />
      <button
        type="button"
        style={btnStyle}
        disabled={!!loading || !sendPotId}
        onClick={() =>
          run("send", async () => {
            await postJson("/api/wallet/send-to-pot", { amountZmw: sendAmount, potId: sendPotId });
            setSendAmount("");
          })
        }
      >
        {loading === "send" ? "Sending…" : "Send to pot"}
      </button>

      <div style={{ ...body, fontSize: 13, fontWeight: 600, color: c.text, marginBottom: 4 }}>Withdraw from wallet (ZMW)</div>
      <input
        style={fieldStyle}
        placeholder="Amount"
        value={withdrawAmount}
        onChange={(e) => setWithdrawAmount(e.target.value)}
      />
      <input
        style={fieldStyle}
        type="password"
        inputMode="numeric"
        maxLength={4}
        placeholder="Transaction PIN"
        value={withdrawPin}
        onChange={(e) => setWithdrawPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
      />
      <button
        type="button"
        style={btnStyle}
        disabled={!!loading}
        onClick={() =>
          run("withdraw", async () => {
            await postJson("/api/wallet/withdraw", {
              amountZmw: withdrawAmount,
              pin: withdrawPin,
            });
            setWithdrawAmount("");
            setWithdrawPin("");
          })
        }
      >
        {loading === "withdraw" ? "Withdrawing…" : "Withdraw"}
      </button>
    </div>
  );
}
