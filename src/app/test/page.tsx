"use client";

import MatrixCell from "@/components/matrix-cell";
import bank from "@/data/items-bank.json";
import thetaReference from "@/data/theta-reference.json";
import { MAX_ITEMS, MIN_ITEMS, TARGET_SE, mergeBanks, nextItem, shouldStop, type ItemBank } from "@/lib/items";
import { REFERENCE_NOTE, cronbachAlpha, itemStats, score, type ItemStat } from "@/lib/scoring";
import { useEffect, useMemo, useRef, useState } from "react";

const ITEMS = mergeBanks([bank] as ItemBank[]);
const REFERENCE = [...(thetaReference as number[])].sort((a, b) => a - b);

type Answer = { itemId: string; correct: boolean; ruleDistance: number | null };

/**
 * Shuffle driven by a per-session seed, so re-renders keep the same order and
 * two people do not see the same position for the same item.
 */
function shuffled<T>(list: T[], seed: number): T[] {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const noise = Math.sin((i + 1) * 12.9898 + seed * 78.233) * 43758.5453;
    const j = Math.floor((noise - Math.floor(noise)) * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export default function TestPage() {
  const [picked, setPicked] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [away, setAway] = useState(0);
  // Seed is null until the test is started, so nothing random is rendered on the
  // server and the first paint on the client matches it.
  const [seed, setSeed] = useState<number | null>(null);
  const [voided, setVoided] = useState(false);
  const inAway = useRef(false);

  const options = useMemo(() => {
    const map = new Map<string, typeof ITEMS[number]["options"]>();
    if (seed === null) return map;
    for (const item of ITEMS) map.set(item.id, shuffled(item.options, seed));
    return map;
  }, [seed]);

  function markAway() {
    if (inAway.current) return;
    inAway.current = true;
    setAway((n) => n + 1);
  }

  // One absence, one count. Tab switch and window blur fire together, so a flag
  // keeps one interruption from being counted twice.
  useEffect(() => {
    const onHide = () => (document.hidden ? markAway() : (inAway.current = false));
    const onBlur = () => (document.hasFocus() ? (inAway.current = false) : markAway());
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("blur", onBlur);
    window.addEventListener("focus", onBlur);
    return () => {
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("focus", onBlur);
    };
  }, []);

  // Browsers refuse to trap someone in fullscreen, so leaving it is allowed and
  // the run is voided instead. That part is enforceable.
  useEffect(() => {
    if (seed === null || voided) return;
    const onChange = () => {
      if (!document.fullscreenElement) setVoided(true);
    };
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, [seed, voided]);

  async function start() {
    setSeed(Math.random());
    setVoided(false);
    try {
      await document.documentElement.requestFullscreen();
    } catch {
      // Some phones and embeds refuse. Nothing to enforce there, so the tab
      // counter stays the only guard and the result says so.
    }
  }

  const responses = answers.map((answer) => ({ itemId: answer.itemId, correct: answer.correct }));
  // Theta and its standard error come from the answers so far. With no answers
  // yet the score returns theta 0, which is the neutral starting point.
  const progress = score(ITEMS, responses, REFERENCE);
  const answered = answers.map((answer) => answer.itemId);
  const item = nextItem(ITEMS, answered, progress.theta);
  const done = shouldStop(answers.length, progress.standardError);

  function choose(optionIndex: number) {
    const choices = item && options.get(item.id);
    if (picked !== null || !choices) return;
    const option = choices[optionIndex];
    setPicked(optionIndex);
    setAnswers((prev) => [
      ...prev,
      {
        itemId: item.id,
        correct: option.correct,
        ruleDistance: option.correct ? null : option.ruleDistance,
      },
    ]);
  }

  function next() {
    setPicked(null);
  }

  function restart() {
    setAnswers([]);
    setPicked(null);
    setAway(0);
    setSeed(null);
    setVoided(false);
  }

  if (seed === null) {
    return (
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
        <h1 className="text-2xl font-semibold">Uji penalaran matriks</h1>
        <p className="mt-2">
          Tes ini adaptif: urutan butir menyesuaikan jawaban Anda, jadi jumlah butir tidak
          selalu sama. Butir yang dipakai sedikitnya {MIN_ITEMS}, paling banyak {MAX_ITEMS}.
        </p>
        <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-white/70">
          <li>Tombol di bawah meminta layar penuh. Keluar dari layar penuh selama tes membatalkan hasil.</li>
          <li>Mematikan atau mengganti tab juga tercatat, dan muncul di laporan hasil.</li>
          <li>Urutan empat pilihan diacak tiap sesi, dan nomor butir di laporan memakai urutan tes, bukan nomor asli di bank.</li>
        </ul>
        <p className="mt-4 text-sm text-white/60">
          Batas jujurnya: peramban tidak bisa mengintip layar kedua, dan butir di tes ini
          berasal dari bank publik, jadi orang yang sudah menyiapkan kunci jawaban di luar
          halaman ini tidak bisa dicegat. Yang bisa ditegakkan adalah Anda tidak meninggalkan
          tab ini.
        </p>
        <button
          onClick={start}
          className="mt-6 rounded border border-white/30 px-4 py-2 hover:bg-white/10"
        >
          Mulai tes
        </button>
      </main>
    );
  }

  if (done || !item) {
    const result = progress;
    const alpha = cronbachAlpha(ITEMS, responses);
    const stats = itemStats(ITEMS, responses, result.theta);
    const lengthLimited = answered.length >= MAX_ITEMS;
    return (
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
        <h1 className="text-2xl font-semibold">Selesai</h1>
        <p className="mt-2">
          {result.rawCorrect} benar dari {result.rawTotal} butir.
        </p>
        <p className="mt-1 text-sm text-white/60">
          {lengthLimited
            ? `Tes berhenti di batas panjang ${MAX_ITEMS} butir, bukan karena ukurannya sudah cukup: galat bakunya masih ${result.standardError.toFixed(2)}, di atas batas ${TARGET_SE}.`
            : `Tes berhenti setelah ${answered.length} butir karena galat bakunya turun ke ${result.standardError.toFixed(2)}, di bawah batas ${TARGET_SE}.`}
        </p>
        <p className="mt-2 text-sm text-white/60">
          {away === 0
            ? "Tidak ada perpindahan tab tercatat selama tes, dan tes tidak pernah keluar dari layar penuh."
            : `Tab ditinggalkan ${away} kali selama tes. Hasil tetap dihitung, tapi angka ini bagian dari catatan integritas, bukan skor.`}
        </p>
        <p className="mt-1 text-sm text-white/60">
          Catatan jujur: penghitungan ini melihat tab yang disembunyikan peramban dan jendela
          yang kehilangan fokus. Layar kedua, jendela di monitor lain yang tidak menutup tab ini,
          bantuan orang lain, dan jawaban yang disalin ke alat bantu AI di luar halaman ini
          tidak bisa dideteksi dari sisi peramban.
        </p>

        <dl className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-white/15 bg-black/20 p-4">
            <dt className="text-sm text-white/60">Theta</dt>
            <dd className="text-2xl font-semibold">{result.theta.toFixed(2)}</dd>
            <dd className="text-sm text-white/60">
              galat baku {result.standardError.toFixed(2)}
            </dd>
          </div>
          <div className="rounded-lg border border-white/15 bg-black/20 p-4">
            <dt className="text-sm text-white/60">Persentil</dt>
            <dd className="text-2xl font-semibold">{Math.round(result.percentile)}</dd>
            <dd className="text-sm text-white/60">
              rentang {Math.round(result.percentileLow)} sampai {Math.round(result.percentileHigh)}
            </dd>
          </div>
          <div className="rounded-lg border border-white/15 bg-black/20 p-4">
            <dt className="text-sm text-white/60">Reliabilitas</dt>
            <dd className="text-2xl font-semibold">
              {alpha === null ? "tidak terdefinisi" : alpha.toFixed(2)}
            </dd>
            <dd className="text-sm text-white/60">Cronbach alpha dari {stats.filter((s) => s.observedTotal === 1).length} butir terjawab</dd>
          </div>
        </dl>

        <details className="mt-8">
          <summary className="cursor-pointer text-sm text-white/60">
            Grafik butir: informasi butir di theta Anda
          </summary>
          <ItemChart stats={stats.filter((stat) => stat.observedTotal === 1)} />
          <p className="mt-2 text-sm text-white/60">
            Tinggi batang = informasi butir di theta Anda: makin tinggi, makin besar
            andalnya butir itu membedakan kemampuan dekat nilai Anda. Sumbu mendatar =
            tingkat kesulitan butir (beta). Sumbu tegak = informasi.
          </p>
        </details>

        <details className="mt-4">
          <summary className="cursor-pointer text-sm text-white/60">Kesulitan butir yang dipakai</summary>
          <ul className="mt-2 space-y-1 text-sm">
            {stats
              .filter((stat) => stat.observedTotal === 1)
              .sort((a, b) => a.beta - b.beta)
              .map((stat, i) => (
              <li key={stat.itemId}>
                Butir {i + 1}: beta {stat.beta.toFixed(2)}, alpha {stat.alpha.toFixed(2)},
                informasi {stat.information.toFixed(2)}
              </li>
            ))}
          </ul>
        </details>

        <p className="mt-6 text-sm text-white/60">{REFERENCE_NOTE}</p>
        <p className="mt-2 text-sm text-white/60">
          Model yang dipakai: 2PL dengan alpha2pl = alpha3pl x (1 - gamma), gamma = 0,25.
          Alpha dan beta diambil dari analisis kalibrasi MaRs-IB. Versi 3PL aslinya memakai
          gamma tetap, jadi angka di sini estimator yang sama dengan bentuk yang sedikit disederhanakan.
        </p>
        <p className="mt-2 text-sm text-white/60">
          Urutan butir di sini adaptif: setiap butir dipilih karena paling informatif untuk
          perkiraan kemampuan Anda sejauh ini, lalu tes berhenti saat galat bakunya cukup kecil,
          atau saat panjangnya mencapai {MAX_ITEMS} butir. Bank soal berisi {ITEMS.length} butir dari
          54 pola aturan, dua butir per pola supaya satu pola tidak dihitung dua kali, dengan
          tingkat kesulitan yang membentang dari butir paling mudah sampai paling sulit. Karena itu
          pola jawaban yang wajar biasanya berhenti di 26 sampai 34 butir dengan galat baku sekitar
          0,35. Pola jawaban yang ekstrem, semua benar atau semua salah, tidak pernah cukup
          presisi: tes dihentikan batas panjang dengan galat baku sekitar 0,45 sampai 0,48.
        </p>

        <button
          onClick={restart}
          className="mt-6 rounded border border-white/30 px-4 py-2 hover:bg-white/10"
        >
          Ulangi
        </button>
      </main>
    );
  }

  if (voided) {
    return (
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
        <h1 className="text-2xl font-semibold text-red-300">Hasil dibatalkan</h1>
        <p className="mt-2">
          Tes ini dijalankan di luar layar penuh, jadi hasilnya tidak sah dan tidak ditampilkan.
          Aturannya ada supaya jawaban mengulang dari halaman lain tidak ikut terhitung.
        </p>
        <p className="mt-2 text-sm text-white/60">
          Peramban tidak mengizinkan memaksa seseorang tetap di layar penuh: yang bisa
          dilakukan adalah membatalkan hasil, seperti yang terjadi di sini.
        </p>
        <button
          onClick={restart}
          className="mt-6 rounded border border-white/30 px-4 py-2 hover:bg-white/10"
        >
          Ulangi
        </button>
      </main>
    );
  }

  const vocab = item.vocab;
  const choices = options.get(item.id) ?? item.options;

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
      <h1 className="text-2xl font-semibold">Uji penalaran matriks</h1>
      <p className="mt-1 text-sm text-white/60">
        Butir {answered.length + 1}. Pilih satu kotak yang melengkapi pola. Urutan butir menyesuaikan
        jawaban Anda, jadi jumlah butir tidak selalu sama. Minimal {MIN_ITEMS} butir, paling banyak{" "}
        {MAX_ITEMS}.
      </p>
      <p
        className={`mt-2 rounded border px-3 py-2 text-sm ${
          away === 0
            ? "border-white/15 text-white/60"
            : "border-amber-400/60 bg-amber-400/10 text-amber-200"
        }`}
      >
        {away === 0
          ? "Jangan tinggalkan tab ini selama tes. Setiap perpindahan tab tercatat dan muncul di laporan hasil."
          : `Peringatan: tab ini ditinggalkan ${away} kali. Jumlah ini ikut dilaporkan di hasil akhir.`}
      </p>

      <div className="mt-6 grid grid-cols-3 gap-2 rounded-lg bg-black/20 p-2">
        {item.matrix.map((cell, i) => (
          <MatrixCell
            key={i}
            cell={cell}
            colors={vocab.colors}
            sizes={vocab.sizes}
            nudgeV={vocab.nudgeV}
            nudgeH={vocab.nudgeH}
          />
        ))}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {choices.map((option, i) => {
          const chosen = picked === i;
          const reveal = picked !== null;
          const state = !reveal
            ? ""
            : option.correct
              ? "border-emerald-400 bg-emerald-400/10"
              : chosen
                ? "border-red-400 bg-red-400/10"
                : "border-white/15 opacity-60";
          return (
            <button
              key={i}
              onClick={() => choose(i)}
              disabled={reveal}
              className={`rounded-lg border border-white/15 bg-black/20 p-2 text-left transition ${state}`}
            >
              <MatrixCell
                cell={option.cell}
                colors={vocab.colors}
                sizes={vocab.sizes}
                nudgeV={vocab.nudgeV}
                nudgeH={vocab.nudgeH}
                missingLabel=""
              />
            </button>
          );
        })}
      </div>

      {picked !== null && (
        <div className="mt-6 flex items-center gap-4">
          <p className="text-sm">
            {choices[picked].correct
              ? "Benar. Aturan pola Anda benar."
              : `Belum tepat. Jawaban ini melanggar ${choices[picked].ruleDistance} aturan pola.`}
          </p>
          <button
            onClick={next}
            className="rounded border border-white/30 px-4 py-2 hover:bg-white/10"
          >
            Lanjut
          </button>
        </div>
      )}

      <details className="mt-8 text-sm text-white/60">
        <summary className="cursor-pointer">Aturan yang dipakai butir ini</summary>
        <ul className="mt-2 space-y-1">
          {item.ruleEntries.map((entry) => (
            <li key={`${entry.group}-${entry.attr}`}>
              {entry.attr} berubah pada {entry.code === 1 ? "satu arah" : "dua arah"}
            </li>
          ))}
        </ul>
      </details>
    </main>
  );
}
/** Item information curve of the whole bank at one theta, as a simple bar chart. */
function ItemChart({ stats }: { stats: ItemStat[] }) {
  const peak = Math.max(...stats.map((stat) => stat.information), 0.001);
  const minBeta = Math.min(...stats.map((stat) => stat.beta));
  const maxBeta = Math.max(...stats.map((stat) => stat.beta));
  const span = maxBeta - minBeta || 1;
  const sorted = [...stats].sort((a, b) => a.beta - b.beta);

  return (
    <div className="mt-4">
      <svg viewBox="0 0 600 160" className="w-full">
        {sorted.map((stat) => {
          const x = 40 + ((stat.beta - minBeta) / span) * 540;
          const h = (stat.information / peak) * 120;
          return (
            <g key={stat.itemId}>
              <rect x={x - 3} y={140 - h} width={6} height={h} className="fill-sky-400/70" />
              <text x={x} y={154} className="fill-white/40 text-[6px]" textAnchor="middle">
                {stat.beta.toFixed(1)}
              </text>
            </g>
          );
        })}
        <line x1={40} y1={140} x2={580} y2={140} className="stroke-white/25" />
        <text x={40} y={12} className="fill-white/40 text-[8px]">
          informasi {peak.toFixed(2)}
        </text>
        <text x={540} y={154} className="fill-white/40 text-[8px]">
          beta {maxBeta.toFixed(1)}
        </text>
      </svg>
    </div>
  );
}
