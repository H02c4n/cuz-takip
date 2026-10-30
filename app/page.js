"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { slugify } from "@/lib/slugify";

export default function Home() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const slug = slugify(value);
  const valid = slug.length >= 3;

  function go(e) {
    e.preventDefault();
    if (valid) router.push(`/h/${slug}`);
  }

  return (
    <main className="home">
      <h1>Cüz Takip</h1>
      <p className="lead">
        Arkadaşlarınla bir halka aç, herkes okuyacağı cüzü seçsin, okuyunca
        “okudum” desin. 30 cüz dolunca hatim tamam.
      </p>
      <form onSubmit={go} className="home-form">
        <label htmlFor="halka">Halka adı</label>
        <input
          id="halka"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="örn. ramazan grubu"
          autoComplete="off"
        />
        <p className="hint">
          {valid ? (
            <>Adres: <b>/h/{slug}</b></>
          ) : (
            "En az 3 harf. Aynı adı yazan herkes aynı halkaya girer."
          )}
        </p>
        <button className="btn primary" disabled={!valid}>Halkaya gir</button>
      </form>
    </main>
  );
}
