"use client";

import "@/app/sugoi.css";
import { ReactorProvider } from "@reactor-team/js-sdk";
import { useCallback, useEffect, useRef, useState } from "react";

import { OrbisPlayer } from "@/components/orbis-player";
import { useOrbisSession } from "@/hooks/use-orbis-session";
import { ORBIS_MODEL_NAME, ORBIS_TRACKS, requestReactorJwt } from "@/lib/orbis";
import {
  ACTION_SCENES, AXES, NEUTRAL, VIBES,
  STYLES, composePrompt, isDrop, signature, type State, type StyleId,
} from "@/lib/sugoi";

const LOGO = "https://iili.io/naVUtjI.png";
const ROUND_SECONDS = 8; // change to 6 or 10 if you like
const SHOUTS = ["GAMBARE!", "SUGOI!", "BANZAI!", "NYAAA!", "YOSHA!"];

function Speaker({ muted }: { muted: boolean }) {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true">
      <polygon points="3,9 8,9 13,4 13,20 8,15 3,15" fill="currentColor" />
      {muted ? (
        <line x1="4" y1="21" x2="21" y2="4" stroke="#DE111F" strokeWidth="3" />
      ) : (
        <>
          <polyline points="16,9 18,12 16,15" fill="none" stroke="currentColor" strokeWidth="2" />
          <polyline points="19,6 22,12 19,18" fill="none" stroke="currentColor" strokeWidth="2" />
        </>
      )}
    </svg>
  );
}

export function OrbisDemo() {
  const jwtPromise = useRef<Promise<string> | null>(null);
  const currentJwt = useRef<string | null>(null);
  const getJwt = useCallback(async () => {
    const pending = (jwtPromise.current ??= requestReactorJwt());
    try {
      const jwt = await pending;
      currentJwt.current = jwt;
      return jwt;
    } catch (error) {
      if (jwtPromise.current === pending) jwtPromise.current = null;
      throw error;
    }
  }, []);
  const getCurrentJwt = useCallback(() => currentJwt.current, []);
  const clearJwt = useCallback(() => {
    jwtPromise.current = null;
    currentJwt.current = null;
  }, []);

  useEffect(() => {
    document.title = "Sugoi Life Generator";
  }, []);

  return (
    <main className="sg-app">
      <header className="sg-head">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="sg-logo" src={LOGO} alt="Sugoi Life Generator logo" />
        <div>
          <h1 className="sg-wordmark">Sugoi Life Generator</h1>
          <div className="sg-hairline" />
        </div>
      </header>
      <ReactorProvider
        apiUrl="https://api.reactor.inc"
        modelName={ORBIS_MODEL_NAME}
        modelTracks={[...ORBIS_TRACKS]}
        connectOptions={{ autoConnect: false }}
        jwtToken={getJwt}
      >
        <SugoiSession clearJwt={clearJwt} getCurrentJwt={getCurrentJwt} />
      </ReactorProvider>
    </main>
  );
}

function SugoiSession({
  clearJwt,
  getCurrentJwt,
}: {
  clearJwt: () => void;
  getCurrentJwt: () => string | null;
}) {
  const s = useOrbisSession(clearJwt, getCurrentJwt);
  const [state, setState] = useState<State>({ ...NEUTRAL });
  const [vibeId, setVibeId] = useState(VIBES[0].id);
  const [sceneId, setSceneId] = useState(ACTION_SCENES[0].id);
  const [queued, setQueued] = useState<{ vibe?: string; scene?: string }>({});
  const [round, setRound] = useState(1);
  const [left, setLeft] = useState(ROUND_SECONDS);
  const [shout, setShout] = useState("GAMBARE!");
  const [styleId, setStyleId] = useState<StyleId>("anime");

  const prev = useRef<State>({ ...NEUTRAL });
  const lastSig = useRef("");
  const dropped = useRef(false);
  const activeScene = useRef<{ id: string; bars: number } | null>(null);
  const styleRef = useRef<StyleId>("anime");
  const stateRef = useRef(state);
  const queuedRef = useRef(queued);
  stateRef.current = state;
  queuedRef.current = queued;
  styleRef.current = styleId;

  const active = s.runStarted && !s.paused;

  // Countdown: ticks once a second while the video runs.
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setLeft((l) => l - 1), 1000);
    return () => clearInterval(id);
  }, [active]);

  // Round ends: snapshot, send ONE prompt (only if something changed), next round.
  useEffect(() => {
    if (left > 0 || !active) return;
    const cur = stateRef.current;
    const q = queuedRef.current;
    const nowDrop = isDrop(cur);
    const drop = nowDrop && !dropped.current;
    dropped.current = nowDrop;
    const sig = signature(cur) + "|" + styleRef.current;
    // An action scene stays active for 2 bars, then is removed with one more prompt.
    if (q.scene) activeScene.current = { id: q.scene, bars: 2 };
    let ended = false;
    const sc = activeScene.current;
    if (sc) {
      if (sc.bars <= 0) { activeScene.current = null; ended = true; } else sc.bars -= 1;
    }
    if (q.vibe || q.scene || ended || drop || sig !== lastSig.current) {
      void s.steerWith(
        composePrompt({ state: cur, prev: prev.current, vibeId: q.vibe, sceneId: activeScene.current?.id, styleId: styleRef.current, drop }),
      );
    }
    prev.current = cur;
    lastSig.current = sig;
    setQueued({});
    setRound((r) => r + 1);
    setLeft(ROUND_SECONDS);
    setShout(SHOUTS[Math.floor(Math.random() * SHOUTS.length)]);
  }, [left, active, s]);

  const start = async () => {
    const drop = isDrop(state);
    dropped.current = drop;
    activeScene.current = queued.scene ? { id: queued.scene, bars: 2 } : null;
    const prompt = composePrompt({ state, vibeId: queued.vibe, sceneId: queued.scene, styleId, drop });
    prev.current = state;
    lastSig.current = signature(state) + "|" + styleId;
    setQueued({});
    setRound(1);
    setLeft(ROUND_SECONDS);
    await s.startWith(prompt);
  };

  const launchVibe = () => {
    const v = VIBES.find((x) => x.id === vibeId);
    if (!v) return;
    setState({ ...v.state });
    setQueued((q) => ({ ...q, vibe: v.id }));
  };
  const launchScene = () => setQueued((q) => ({ ...q, scene: sceneId }));

  const queuedNames = [
    queued.vibe && "Vibe: " + VIBES.find((v) => v.id === queued.vibe)?.name,
    queued.scene && "Scene: " + ACTION_SCENES.find((x) => x.id === queued.scene)?.name,
  ].filter(Boolean);

  const preview = composePrompt({ state, prev: prev.current, vibeId: queued.vibe, sceneId: queued.scene ?? activeScene.current?.id, styleId, drop: isDrop(state) });

  const sliders = (group: "world" | "character") =>
    AXES.filter((a) => a.group === group).map((ax) => (
      <div className="sg-slider-row" key={ax.id}>
        <div className="sg-slider-name">{ax.label}<b>{state[ax.id] > 0 ? "+" : ""}{Math.round(state[ax.id] * 2)}</b></div>
        <input
          className="sg-slider"
          type="range"
          min={-2}
          max={2}
          step={1}
          value={Math.round(state[ax.id] * 2)}
          aria-label={ax.label}
          onChange={(e) => setState((st) => ({ ...st, [ax.id]: Number(e.target.value) / 2 }))}
        />
        <div className="sg-poles"><span>{ax.low}</span><span>{ax.high}</span></div>
      </div>
    ));

  return (
    <div className="sg-grid">
      <div>
        <div className="sg-frame">
          <OrbisPlayer
            connected={s.connected}
            muted={s.muted}
            runStarted={s.runStarted}
            status={s.status}
          />
          <button className="sg-sound" onClick={s.toggleMuted} aria-label={s.muted ? "Unmute" : "Mute"} title={s.muted ? "Sound off: click to turn on" : "Sound on: click to mute"}>
            <Speaker muted={s.muted} />
          </button>
        </div>

        <div className={"sg-timer" + (active && left <= 3 ? " is-urgent" : "")}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img key={round} className="sg-mascot is-bounce" src={LOGO} alt="" />
          <div>
            <div className="sg-round">{s.runStarted ? `BAR ${String(round).padStart(2, "0")}` : "READY?"}</div>
            <div className="sg-bubble">{s.runStarted ? shout : "SUGOI!"}</div>
          </div>
          <div className="sg-count">{s.runStarted ? Math.max(left, 0) : "--"}</div>
          <div className="sg-bar"><i style={{ width: `${s.runStarted ? (left / ROUND_SECONDS) * 100 : 0}%` }} /></div>
        </div>

        <div className="sg-panel" style={{ marginTop: 16 }}>
          <div className="sg-micro" style={{ marginBottom: 10 }}>
            {queuedNames.length ? "QUEUED FOR NEXT BAR: " + queuedNames.join(" + ") : "NOTHING QUEUED"}
          </div>
          {!s.connected ? (
            <button className="btn-primary" onClick={() => void s.connectSession()} disabled={s.controlsBusy}>Connect</button>
          ) : !s.runStarted ? (
            <button className="btn-primary" onClick={() => void start()} disabled={s.controlsBusy}>Start</button>
          ) : (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button className="btn-ghost" onClick={() => void (s.paused ? s.resume() : s.pause())}>{s.paused ? "Resume" : "Pause"}</button>
              <button className="btn-ghost" onClick={() => void s.reset()}>Reset</button>
            </div>
          )}
          {s.connected && (
            <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                <button className="btn-ghost" onClick={() => void s.disconnectSession()}>Disconnect</button>
            </div>
          )}
          {s.error && <p style={{ color: "var(--scarlet-deep)", fontWeight: 700 }}>{s.error}</p>}
        </div>
      </div>

      <div>
        <div className="sg-console">
        <section className="sg-panel"><h2>World</h2>{sliders("world")}</section>
        <section className="sg-panel"><h2>Character</h2>{sliders("character")}</section>
        <div>
        <section className="sg-panel">
          <h2>Style</h2>
          <div className="sg-seg">
            {STYLES.map((x) => (
              <button key={x.id} className={"btn-ghost" + (styleId === x.id ? " on" : "")} onClick={() => setStyleId(x.id)}>{x.name}</button>
            ))}
          </div>
        </section>
        <section className="sg-panel">
          <h2>Vibes</h2>
          <select className="sg-select" value={vibeId} onChange={(e) => setVibeId(e.target.value)} aria-label="Vibes">
            {VIBES.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
          </select>
          <button className="btn-primary" onClick={launchVibe}>Launch vibe</button>
        </section>
        <section className="sg-panel">
          <h2>Action Scenes</h2>
          <select className="sg-select" value={sceneId} onChange={(e) => setSceneId(e.target.value)} aria-label="Action scenes">
            {ACTION_SCENES.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
          </select>
          <button className="btn-primary" onClick={launchScene}>Launch scene</button>
        </section>
        </div>
        </div>
        <details className="sg-panel sg-preview">
          <summary className="sg-micro">Next prompt (what Orbis will receive)</summary>
          <p>{preview}</p>
        </details>
      </div>
    </div>
  );
}
