"use client";

import MatrixCell from "@/components/matrix-cell";
import sf1 from "@/data/items-sf1.json";
import sf2 from "@/data/items-sf2.json";
import sf3 from "@/data/items-sf3.json";
import thetaReference from "@/data/theta-reference.json";
import { MIN_ITEMS, TARGET_SE, mergeBanks, nextItem, shouldStop, type ItemBank } from "@/lib/items";
import { REFERENCE_NOTE, cronbachAlpha, itemStats, score, type ItemStat } from "@/lib/scoring";
import { useEffect, useState } from "react";

const ITEMS = mergeBanks([sf1, sf2, sf3] as ItemBank[]);
const REFERENCE = [...(thetaReference as number[])].sort((a, b) => a - b);

type Answer = { itemId: string; correct: boolean; ruleDistance: number | null };

export default function TestPage() {
  const [picked, setPicked] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [away, setAway] = useState(0);

  // ponytail: satu event, satu penghitung. Tabswitch, minimize, dan jendela lain
  // semuanya membuat dokumen tersembunyi, jadi visibilitychange cukup.
  useEffect(() => {
    const onHide = () => {
      if (document.hidden) setAway((n) => n + 1);
    };
    document.addEventListener("visibilitychange", onHide);
    return () => document.removeEventListener("visibilitychange", onHide);
  }, []);

  const responses = answers.map((answer) => ({ itemId: answer.itemId, correct: answer.correct }));
  // Theta and its standard error come from the answers so far. With no answers
  // yet the score returns theta 0, which is the neutral starting point.
  const progress = score(ITEMS, responses, REFERENCE);
  const answered = answers.map((answer) => answer.itemId);
  const item = nextItem(ITEMS, answered, progress.theta);
  const done = item === undefined || shouldStop(answers.length, progress.standardError);

  function choose(optionIndex: number) {
    if (picked !== null || !item) return;
    const option = item.options[optionIndex];
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
  }

  if (done || !item) {
    const result = progress;
    const alpha = cronbachAlpha(ITEMS, responses);
    const stats = itemStats(ITEMS, responses, result.theta);
    const exhausted = answered.length >= ITEMS.length;
    return (
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
        <h1 className="text-2xl font-semibold">Selesai</h1>
        <p className="mt-2">
          {result.rawCorrect} benar dari {result.rawTotal} butir.
        </p>
        <p className="mt-1 text-sm text-white/60">
          {exhausted
            ? `Semua ${ITEMS.length} butir terpakai. Tes adaptif berhenti karena bank soal habis, bukan karena ukurannya sudah cukup.`
            : `Tes berhenti setelah ${answered.length} butir karena galat bakunya turun ke ${result.standardError.toFixed(2)}, di bawah batas ${TARGET_SE}.`}
        </p>
        <p className="mt-2 text-sm text-white/60">
          {away === 0
            ? "Tidak ada perpindahan tab tercatat selama tes."
            : `Perpindahan tab tercatat ${away} kali selama tes. Ini catatan, bukan skor; baca sendiri hasilnya.`}
        </p>
        <p className="mt-1 text-sm text-white/60">
          Catatan jujur: penghitungan ini hanya melihat tab yang sedang disembunyikan peramban.
          Layar kedua, jendela di monitor lain yang tidak menutup tab ini, dan bantuan orang lain
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
              .map((stat) => (
              <li key={stat.itemId}>
                {stat.itemId}: beta {stat.beta.toFixed(2)}, alpha {stat.alpha.toFixed(2)},
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
          perkiraan kemampuan Anda sejauh ini, lalu tes berhenti saat galat bakunya cukup kecil.
          Batasnya ada di bank soal, bukan di aturan berhenti. Tingkat kesulitan butir hanya
          mentok di 1,6, jadi pola jawaban yang sangat kuat atau sangat lemah mendorong theta
          melewati butir paling sulit atau paling mudah, dan setelah itu tidak ada butir lain
          yang informatif. Jalur seperti itu memakai seluruh {ITEMS.length} butir dan berakhir
          dengan galat baku sekitar 0,5, lebih lebar daripada batas {TARGET_SE}.
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

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
      <h1 className="text-2xl font-semibold">Uji penalaran matriks</h1>
      <p className="mt-1 text-sm text-white/60">
        Butir {answered.length + 1}. Pilih satu kotak yang melengkapi pola. Urutan butir menyesuaikan
        jawaban Anda, jadi jumlah butir tidak selalu sama. Minimal {MIN_ITEMS} butir.
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
        {item.options.map((option, i) => {
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
            {item.options[picked].correct
              ? "Benar. Aturan pola Anda benar."
              : `Belum tepat. Jawaban ini melanggar ${item.options[picked].ruleDistance} aturan pola.`}
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
