# PLAN — open-iq-lab

Tes penalaran matriks (matrix reasoning) open-source, berbahasa Indonesia, dengan skor yang bisa dipertanggungjawabkan.

Status: **PLAN ONLY — belum ada koding.** Menunggu persetujuan Gondrong.

---

## 1. Keputusan Gate 1 (default, tinggal bilang "lanjut")

| Gate | Keputusan | Alasan |
|---|---|---|
| Lisensi project | **GPL-3.0** | Gondrong mau public. GPL mengizinkan ambil kode GPL (open-rpm-web) tanpa beli izin. Yang prohibiting bukan lisensi, tapi paste tanpa kredit. |
| Akun GitHub | **jejakmasgondrong** | Default repo di `/media/gondrong/DATA/Workspace/jejakmasgondrong/`. Remote `git@github-jejakmasgondrong:jejakmasgondrong/<repo>.git` (WAJIB pakai alias host, bukan `github.com`). |
| Nama repo | **open-iq-lab** | Diputuskan Gondrong. Dipisah dari `rpm-lab` supaya tidak terlihat mengikuti repo lain. Berbeda dari `Zburgers/OpenIQ` (organisasi berbeda, tidak bentrok di GitHub). |

Kalau ternyata mau MIT nanti: **wajib buang semua kode open-rpm-web**, hanya boleh pakai reimplementasi sendiri. Itu keputusan besar, jadi ini Gate 1.

---

## 2. Yang diambil / dibuang dari tiap repo

| Repo | Lisensi | Ambil | Buang |
|---|---|---|---|
| `ikhlasulov-gb/open-rpm-web` | GPL-3.0 | Konsep adaptive testing, pola koreksi usia, reliability check (Series A banding), struktur 5 Series | Judul "Raven's" (item asli milik Pearson), item soal itu sendiri |
| `Ksound22/iq-measurer` | MIT | Struktur bank soal JSON, layout tes,timer per soal | `src/lib/scorer.js` SELURUHNYA — konstanta mean 0,62 / SD 0,15 tanpa sumber, tidak ada koreksi usia |
| `Zburgers/OpenIQ` | sendiri | Metodologi saja: prinsip "no fake precision", "no silent timing bonus", struktur laporan theta + SE, protokol replikasi | Tidak ada kode untuk diambil (`app/` kosong) |
| `iq-misc/rpm-iq-exam` | MIT | **Tidak ada** | Semua — README AI-generated, nol dokumentasi scoring |

Tidak ada kode yang di-copy-paste mentah. Yang diambil = *pola dan metode*, ditulis ulang sendiri. Kalau ada baris kode yang ikut, file itu wajib header komentar yang menunjuk ke sumber + commit hash.

---

## 3. Sumber item soal (pembatas utama project ini)

**Item RPM asli = proprietary (Pearson).** Tidak ada repo OSS yang punya item asli + norma asli. Jadi project ini **tidak boleh** menulis "Raven's Progressive Matrices" di judul atau marketing.

Sumber yang legal & terverifikasi:

**MaRs-IB** — Chierchia, Fuhrmann, Knoll, Pi-Sunyer, Sakhardande, Blakemore (2019), *Royal Society Open Science* 6(10):190232. DOI 10.1098/rsos.190232
- 80 item novel, open-access, tiap item dalam 3 varian bentuk
- Format: matriks 3x3, 8 dari 9 sel terisi, pilih 1 dari **8 opsi** (README resmi MaRs-IB: satu item = 1 matriks + 8 kandidat solusi = 9 jpeg; key `_T1_`, `_T2_`/`_T3_`/`_T4_`, set distractor `_md_` vs `_pd_`). Catatan: OSF menyebut `_T1_`..`_T4_` tapi menyebut 8 solusi — jumlah opsi per item harus dikonfirmasi dari file stimulus asli sebelum UI dibuat.
- Relasi yang bisa berubah: warna, ukuran, posisi, bentuk (1 relasi = mudah, 3 relasi = sulit)
- Data: N = 659 peserta, usia **11–33**; item-level accuracy + response time per age group
- Lisensi material: **academic & non-commercial use only**, wajib sitasi paper
- Repository OSF + demo interaktif Gorilla

Batas yang harus dijawab jujur di README:
- MaRs-IB **hanya matrix reasoning**. Tidak ada bank soal verbal / working memory yang gratis + terverifikasi. Kalau mau domain lain → **bikin sendiri dari nol** (domain publik = aman).
- N = 659 dan usia 11–33 → **tidak bisa dipakai sebagai norma populasi umum**, apalagi Indonesia.
- Konsekuensi: output project = **theta + persentil dalam sample MaRs-IB**, bukan "IQ 118".

---

## 4. Arsitektur scoring — SATU JALUR

Tidak boleh ada dua jalur (jika ada, sesi yang sama menghasilkan dua angka berbeda = bug).

```
raw per-item (benar/salah, waktu jawab)
  -> theta (IRT 2PL, koefisien per item di-bake dari statistik MaRs-IB)
  -> persentil terhadap sample MaRs-IB (usia 11-33)
  -> rentang / tingkat keyakinan (standard error dari IRT)
```

Tidak ada langkah "konversi ke angka IQ". Alasan: OpenIQ + MaRs-IB Article sama-sama bukan instrumen klinis, dan konversi ke IQ butuh norma yang tidak ada. Ini keputusan yang bisa dipertanggungjawabkan saat ada yang protes.

Koreksi usia: hanyavalid untuk rentang 11–33, di luar itu → tampilkan "di luar rentang data acuan".

---

## 5. Fase kerja

| Fase | Isi | Estimasi |
|---|---|---|
| 0 | `scripts/new-webapp.sh` → scaffold Next.js + badge versi (HUKUM §14), `git init`, LICENSE GPL-3.0 + NOTICE, README kerangka | 1 sesi |
| 1 | Taruh item JSON (60 item dari MaRs-IB, 3 varian) + metadata lisensi + sitasi di `ITEMS-LICENSE.md` | 1-2 sesi |
| 2 | Skor: IRT 2PL offline (Python, `py-lib/`) → koefisien bake ke JSON → fungsi skor TypeScript + **satu self-check berbasis assert** | 2 sesi |
| 3 | UI tes: matriks 3x3 SVG, opsi jawaban, timer, adaptif (pakai difficulty MaRs-IB), Bahasa Indonesia | 3-4 sesi |
| 4 | Laporan: theta, persentil, rentang, grafik butir, reliability check | 2 sesi |
| 5 | README + CONTRIBUTING + LICENSE/NOTICE utuh, audit atribusi, commit + tag v0.1.0 + push | 1 sesi |

Total MVP ≈ 2-3 minggu kerja nyata. Bukan proyek OpenIQ-jenis.

**Status 2026-10-07 — Fase 2 tidak lagi terblokir.** Parameter IRT, skor dimensionality, dan tiga short form sudah diperoleh dari `ndawlab/mars-irt` (MIT) dan disimpan di `data/item-parameters/`, rinciannya di `ITEM-PARAMETERS.md`. Yang masih kosong hanya gambar stimulus (jpeg). Fase 1 dan 2 bisa jalan tanpa gambar stimulus; Fase 3 (UI) butuh gambar.

**Status 2026-10-07 — Fase 0 sampai 4 selesai.** Butir digambar ulang sendiri dengan generator di `py-lib/open_iq_item_gen.py`, mesin skoring ada di `src/lib/scoring.ts` (2PL, MAP dengan prior normal baku, galat baku dari kelengkungan likelihood, persentil terhadap 1.501 peserta kalibrasi), dan runner self-check di `src/lib/scoring-self-check.ts`. Tidak ada konversi ke angka IQ. Yang tersisa dari Fase 4: grafik butir dan reliability check. Belum dikerjakan: urutan tes adaptif dan bank butir di luar penalaran matriks.

---

## 6. Anti-"asal tempel" — ini yang Gondrong takuti

Checklist sebelum push pertama:

1. `LICENSE` = GPL-3.0 utuh, **tidak diedit**.
2. `NOTICE` berisi nama & copyright asli Whoever kode yang di Adaptasi.
3. File yang di Adaptasi punya header komentar: sumber repo, lisensi, commit hash.
4. `ITEMS-LICENSE.md` menyebut MaRs-IB + DOI + syarat non-commercial + sitasi wajib.
5. `README` tidak menyebut "Raven's", "WAIS", "Stanford-Binet" sebagai milik project ini.
6. `README` ada bagian "What this is NOT": bukan diagnosis klinis, bukan IQ standart.
7. Credit repo yang jadi rujukan ada di README (boleh tanpa kode yang diambil).

Kalau sampai tahap ini lolos, tidak ada yang bisa protes dengan alasan lisensi.

---

## 7. Belum diketahui (bukan blocker, tapi jujur)

- Bank soal verbal & working memory: harus bikin sendiri → menambah 1-2 minggu kalau mau domain lengkap.
- Nomor atau sirve Vercel untuk project ini (WAJIB tanya sebelum deploy, HUKUM §17).
- Item-file format MaRs-IB (JSON/ stimuli gambar) belum diunduh — perlu cek isi repository OSF dulu di Fase 1.