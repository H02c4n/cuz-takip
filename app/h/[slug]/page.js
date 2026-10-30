"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

const NAME_KEY = "cuz-takip-ad";
const JUZ = Array.from({ length: 30 }, (_, i) => i + 1);

function Ring({ juz }) {
  const done = JUZ.filter((n) => juz[n]?.status === "done").length;
  return (
    <div className="ring" role="img" aria-label={`${done} / 30 cüz okundu`}>
      <svg viewBox="0 0 200 200">
        {JUZ.map((n, i) => (
          <line
            key={n}
            x1="100" y1="6" x2="100" y2="24"
            transform={`rotate(${i * 12} 100 100)`}
            className={`seg ${juz[n]?.status ?? "free"}`}
          />
        ))}
      </svg>
      <div className="ring-center">
        <strong>{done}</strong>
        <span>/ 30 cüz</span>
      </div>
    </div>
  );
}

export default function Halka() {
  const { slug } = useParams();
  const api = `/api/halka/${slug}`;

  const [juz, setJuz] = useState({});
  const [loaded, setLoaded] = useState(false);
  const [name, setName] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try { setName(localStorage.getItem(NAME_KEY) ?? ""); } catch {}
  }, []);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch(api, { cache: "no-store" });
      if (!res.ok) throw new Error();
      setJuz((await res.json()).juz);
      setLoaded(true);
    } catch {
      setMsg("Liste yüklenemedi. İnternetini kontrol et.");
    }
  }, [api]);

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 5000);
    const onVis = () => document.visibilityState === "visible" && refresh();
    document.addEventListener("visibilitychange", onVis);
    return () => {
      clearInterval(t);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [refresh]);

  function changeName(v) {
    setName(v);
    try { localStorage.setItem(NAME_KEY, v.trim()); } catch {}
  }

  async function act(n, action) {
    const me = name.trim();
    if (!me) {
      setMsg("Önce yukarıya adını yaz.");
      document.getElementById("ad")?.focus();
      return;
    }
    setMsg("");
    setBusy(n);
    try {
      const res = await fetch(api, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ juz: n, action, name: me }),
      });
      const data = await res.json();
      if (data.juz) setJuz(data.juz);
      if (!res.ok) setMsg(data.error ?? "Bir hata oldu");
    } catch {
      setMsg("Kaydedilemedi. Tekrar dene.");
    }
    setBusy(null);
  }

  async function newHatim() {
    if (!confirm("Tüm işaretler silinip yeni hatim başlayacak. Emin misin?")) return;
    const res = await fetch(api, { method: "DELETE" });
    if (res.ok) setJuz({});
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  const me = name.trim();
  const doneCount = JUZ.filter((n) => juz[n]?.status === "done").length;
  const readingCount = JUZ.filter((n) => juz[n]?.status === "reading").length;

  const perPerson = useMemo(() => {
    const m = {};
    for (const n of JUZ) {
      const e = juz[n];
      if (e?.status === "done") m[e.name] = (m[e.name] ?? 0) + 1;
    }
    return Object.entries(m).sort((a, b) => b[1] - a[1]);
  }, [juz]);

  return (
    <main className="halka">
      <header className="top">
        <Link href="/" className="back" aria-label="Ana sayfa">Cüz Takip</Link>
        <h1>{String(slug).replace(/-/g, " ")}</h1>
        <button className="btn ghost" onClick={copyLink}>
          {copied ? "Kopyalandı" : "Bağlantıyı kopyala"}
        </button>
      </header>

      <section className="summary">
        <Ring juz={juz} />
        <div className="summary-side">
          <label htmlFor="ad">Adın</label>
          <input
            id="ad"
            value={name}
            onChange={(e) => changeName(e.target.value)}
            placeholder="Arkadaşların seni böyle görecek"
            maxLength={30}
            autoComplete="given-name"
          />
          <p className="counts">
            {doneCount} okundu, {readingCount} okunuyor, {30 - doneCount - readingCount} boşta
          </p>
          {perPerson.length > 0 && (
            <p className="people">
              {perPerson.map(([who, c]) => `${who}: ${c}`).join("  •  ")}
            </p>
          )}
        </div>
      </section>

      {doneCount === 30 && (
        <div className="hatim">
          <p>Hatim tamamlandı. Allah kabul etsin.</p>
          <button className="btn primary" onClick={newHatim}>Yeni hatim başlat</button>
        </div>
      )}

      <p className="msg" role="status" aria-live="polite">{msg}</p>

      {!loaded ? (
        <p className="loading">Yükleniyor…</p>
      ) : (
        <ul className="grid">
          {JUZ.map((n) => {
            const e = juz[n];
            const mine = e && e.name === me && me !== "";
            const state = e?.status ?? "free";
            return (
              <li key={n} className={`cuz ${state} ${mine ? "mine" : ""}`}>
                <span className="num">{n}</span>
                <span className="who">
                  {state === "free" && "Boşta"}
                  {state === "reading" && (mine ? "Sen okuyorsun" : `${e.name} okuyor`)}
                  {state === "done" && (mine ? "Sen okudun" : `${e.name} okudu`)}
                </span>
                <div className="actions">
                  {state === "free" && (
                    <button className="btn small" disabled={busy === n} onClick={() => act(n, "claim")}>
                      Okuyacağım
                    </button>
                  )}
                  {state === "reading" && mine && (
                    <>
                      <button className="btn small primary" disabled={busy === n} onClick={() => act(n, "done")}>
                        Okudum
                      </button>
                      <button className="btn small ghost" disabled={busy === n} onClick={() => act(n, "release")}>
                        Vazgeç
                      </button>
                    </>
                  )}
                  {state === "done" && mine && (
                    <button className="btn small ghost" disabled={busy === n} onClick={() => act(n, "release")}>
                      Geri al
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {doneCount < 30 && doneCount > 0 && (
        <button className="btn ghost reset" onClick={newHatim}>Yeni hatim başlat (sıfırla)</button>
      )}
    </main>
  );
}
