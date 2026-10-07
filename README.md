# Open IQ Lab

Uji penalaran abstrak berbasis matriks. Hasilnya berupa skor **theta** dan **persentil** beserta rentang, bukan angka IQ.

Bahasa Indonesia · Next.js + TypeScript · Lisensi GPL-3.0

## Apa yang belum ada

Project ini masih sangat awal. Yang sudah ada: lisensi, dokumen rencana, aturan main, parameter psychometrik butir, dan 36 butir matriks yang digambar ulang dari spesifikasi aturan. Belum ada mesin skoring dan belum ada antarmuka tes. Parameter psychometrik butir bisa dilihat di [ITEM-PARAMETERS.md](./ITEM-PARAMETERS.md). Lihat [PLAN.md](./PLAN.md) untuk peta jalan lengkap per fase.

## Apa yang bukan project ini

Bagian ini sengaja ada di depan supaya tidak disalahpahami.

- **Bukan tes IQ.** Tidak menghasilkan angka IQ. Task rujukan yang dipakai tidak punya norma populasi, jadi konversi ke skala IQ tidak bisa dilakukan dengan jujur.
- **Bukan alat diagnosis klinis.** Tidak ada klaim medicolegal, tidak ada nilai ambang, tidak untuk keputusan pendidikan atau rekrutmen.
- **Bukan turunan Raven, WAIS, atau Stanford-Binet.** Matriks 3x3 memang umum dipakai di banyak tes IQ, tapi butir asli tiap instrument itu milik penerbitnya masing-masing dan tidak dipakai di sini.
- **Bukan pengganti tes psikolog.** Untuk screening akurat atau diagnosis, bawa ke psikolog berlisensi.

## Prinsip skoring

Rantai skoring hanya satu jalur, tanpa cabang:

```
 jawaban per butir
        ↓
   theta (IRT 2PL)
        ↓
persentil terhadap sampel acuan
        ↓
 rentang + standard error
```

Tidak ada langkah konversi ke angka IQ. Koreksi usia hanya sah di rentang usia sampel acuan; di luar itu sistem menyatakan di luar jangkauan data, bukan mengarang angka.

Prinsip metodologi yang diambil dari `Zburgers/OpenIQ`: no fake precision, no silent timing bonus. Waktu respons dicatat sebagai data, tidak dipakai menambah skor diam-diam.

## Sumber butir

Rencana memakai Materials for Adaptive Reasoning Suite — Item Bank (MaRs-IB) dari Chierchia dkk. 2019. Lisensi butir: non-komersial, wajib sitasi. Rinciannya ada di [ITEMS-LICENSE.md](./ITEMS-LICENSE.md).

Status unduhan per pemeriksaan terbaru: repositori OSF tidak menyediakan gambar stimulus secara publik, baru PDF dokumentasi. Parameter IRT dan skor dimensionality berhasil diperoleh dari analisis terbuka terpisah dengan lisensi MIT, disimpan di [data/item-parameters](./data/item-parameters). Yang belum ada hanya gambar butirnya.

## Credit

Repo berikut jadi rujukan **metode dan struktur**, bukan kode yang disalin. Rincian di [NOTICE](./NOTICE).

| Repo | Dipakai untuk |
|---|---|
| [ndawlab/mars-irt](https://github.com/ndawlab/mars-irt) | Parameter IRT butir MaRs-IB (MIT), disalin ke `data/item-parameters/` |
| [ikhlasulov-gb/open-rpm-web](https://github.com/ikhlasulov-gb/open-rpm-web) | Konsep adaptive, pola koreksi usia, reliability check |
| [Ksound22/iq-measurer](https://github.com/Ksound22/iq-measurer) | Struktur bank soal JSON, layout, timer |
| [Zburgers/OpenIQ](https://github.com/Zburgers/OpenIQ) | Metodologi IRT, disiplin laporan, prinsip epistemik |
| [iq-misc/rpm-iq-exam](https://github.com/iq-misc/rpm-iq-exam) | Tidak dipakai |

Mesin skoring di repo ini ditulis dari nol. Tidak ada kode yang di-copy-paste dari repo lain. Kalau nanti ada baris yang diadaptasi, file-nya akan punya header komentar sumber, lisensi, dan commit hash.

## Menjalankan

```bash
npm install
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

Lain-lain:

```bash
npm run build   # production build
npm run lint    # eslint
```

## Struktur

```
src/app/          halaman dan layout (App Router)
src/components/   komponen UI
docs/sources/     dokumen sumber yang di-vendor sebagai bukti provenance
PLAN.md           peta jalan + keputusan lisensi
ITEMS-LICENSE.md  ketentuan lisensi butir
NOTICE            atribusi
LICENSE           GPL-3.0
```

## Lisensi

Kode: GPL-3.0. Butir stimuli: punya lisensi sendiri yang terpisah dan tidak tunduk pada GPL. Baca kedua file sebelum memakai apa pun di sini.

## Sitasi

Chierchia, G., Fuhrmann, D., Knoll, L. J., Pi-Sunyer, B. P., Sakhardande, A. L., & Blakemore, S. J. (2019). MaRs-IB. *Royal Society Open Science*, 6(10), 190232. [https://doi.org/10.1098/rsos.190232](https://doi.org/10.1098/rsos.190232)