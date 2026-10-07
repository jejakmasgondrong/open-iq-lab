"use client";

import MatrixCell from "@/components/matrix-cell";
import sf1 from "@/data/items-sf1.json";
import sf2 from "@/data/items-sf2.json";
import sf3 from "@/data/items-sf3.json";
import thetaReference from "@/data/theta-reference.json";
import { mergeBanks, type Item, type ItemBank } from "@/lib/items";
import { REFERENCE_NOTE, score } from "@/lib/scoring";
import { useState } from "react";

const ITEMS = mergeBanks([sf1, sf2, sf3] as ItemBank[]);
const REFERENCE = [...(thetaReference as number[])].sort((a, b) => a - b);

type Answer = { itemId: string; correct: boolean; ruleDistance: number | null };

export default function TestPage() {
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);

  const item: Item | undefined = ITEMS[step];
  const done = step >= ITEMS.length;

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
    setStep((prev) => prev + 1);
  }

  function restart() {
    setAnswers([]);
    setPicked(null);
    setStep(0);
  }

  if (done) {
    const result = score(
      ITEMS,
      answers.map((answer) => ({ itemId: answer.itemId, correct: answer.correct })),
      REFERENCE,
    );
    return (
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
        <h1 className="text-2xl font-semibold">Selesai</h1>
        <p className="mt-2">
          {result.rawCorrect} benar dari {result.rawTotal} butir.
        </p>

        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
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
        </dl>

        <p className="mt-6 text-sm text-white/60">{REFERENCE_NOTE}</p>
        <p className="mt-2 text-sm text-white/60">
          Model yang dipakai: 2PL dengan alpha2pl = alpha3pl x (1 - gamma), gamma = 0,25.
          Alpha dan beta diambil dari analisis kalibrasi MaRs-IB. Versi 3PL aslinya memakai
          gamma tetap, jadi angka di sini estimator yang sama dengan bentuk yang sedikit disederhanakan.
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
        Butir {step + 1} dari {ITEMS.length}. Pilih satu kotak yang melengkapi pola.
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