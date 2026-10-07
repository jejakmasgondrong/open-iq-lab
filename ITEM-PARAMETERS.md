# ITEM-PARAMETERS.md — Parameter IRT untuk butir MaRs-IB

Dokumen ini mencatat asal, lisensi, dan isi berkas parameter psychometrik di
`data/item-parameters/`. Dokumen ini terpisah dari `ITEMS-LICENSE.md` karena lisensinya
beda: `ITEMS-LICENSE.md` mengatur butir stimuli, dokumen ini mengatur angka parameter
yang diturunkan dari respons peserta.

## Sumber

- **Repositori:** `ndawlab/mars-irt`
- **Lisensi:** MIT — "Copyright (c) 2019-2022 Daw Lab, https://dawlab.princeton.edu/"
  (salinan teks lisensi di `data/item-parameters/LICENSE-dawlab-mars-irt.txt`)
- **Kutipan sitasi:** Zorowitz, M., et al. (2023). An item response theory analysis of
  the Matrix Reasoning Item Bank (MaRs-IB). *Behavior Research Methods*.
  DOI: `10.3758/s13428-023-02067-8`
- **Data di dalam:** analisis IRT atas respons 1.501 peserta terhadap butir MaRs-IB.
  Skrip dan data kalibrasi ada di repositori tersebut; yang dipakai di sini hanya
  keluaran tabel parameter dan tiga short form.

## Isi direktori

| Berkas | Isi | Jumlah |
| --- | --- | --- |
| `maRs-ib-item-params.csv` | Parameter IRT per item | 384 baris data |
| `maRs-ib-dimensionality.csv` | Skor dimensionality per item (Chierchia et al., 2019) | 80 baris data |
| `maRs-ib-features.csv` | Spesifikasi struktural tiap butir per fitur dan aturan | 384 baris data |
| `maRs-ib-shortform-sf1.csv` | Short form 1, 12 butir | 12 baris data |
| `maRs-ib-shortform-sf2.csv` | Short form 2, 12 butir | 12 baris data |
| `maRs-ib-shortform-sf3.csv` | Short form 3, 12 butir | 12 baris data |

### `maRs-ib-item-params.csv`

Kolom: `item_id`, `item`, `n_elements`, `n_rules`, `distractor`, `shape_set`, `beta`,
`alpha`, `gamma`.

- `beta` = parameter difficultas pada skala logit (nilai lebih besar = lebih sulit).
- `alpha` = parameter diskriminasi.
- `gamma` = parameter tebakan. Pada model 3PL, nilainya tetap 0.25 untuk semua butir.
- `distractor` = `md` (minimal-difference) atau `pd` (paired-difference).
- `shape_set` = 1, 2, atau 3.

384 baris adalah 80 butir asli dikalikan kombinasi test form dan set distractor, bukan
384 butir berbeda. Butir yang unik adalah kolom `item` (1 sampai 80).

### `maRs-ib-features.csv`

Kolom aturan `f1_*` sampai `f4_*` bernilai 0 (tidak berubah), 1 (berubah pada baris atau
kolom), atau 2 (berubah pada baris dan kolom) untuk fitur warna, bentuk, posisi segitiga,
posisi baris, posisi kolom, dan ukuran. Kolom ini adalah deskripsi formal dari aturan
pola tiap butir, sehingga stimulus dapat digambar ulang dari spesifikasi, bukan disalin
dari gambar asli.

### Short form

Tiga short form tervalidasi, 12 butir masing-masing, berasal dari publikasi
Zorowitz et al. (2023). Bentuk-bentuk ini adalah panjang tes siap pakai dari paper,
sehingga tidak perlu menebak panjang tes sendiri.

## Batas penggunaan parameter ini

1. Parameter ini **bukan skor**. Nilai `beta` dan `alpha` adalah hasil kalibrasi pada
   1.501 peserta besar. Terapkan ke peserta lain harus tetap dilaporkan dengan
   ketidakpastian.
2. Model yang benar-benar difit adalah 3PL, bukan 2PL. Karena `gamma` konstan di 0.25,
   diskriminasi 2PL yang dipakai project ini diturunkan dari 3PL dengan `c = 0`, yaitu
   `alpha_2pl = alpha_3pl x (1 - c)`. Ini penyederhanaan yang harus disebut di laporan.
3. Norma usia hanya sah untuk rentang usia sampel kalibrasi, bukan populasi umum.
   Percentil yang dilaporkan project ini adalah persentil di dalam sampel acuan, sesuai
   pernyataan penulis di `ITEMS-LICENSE.md`.
4. Skor dimensionality dari Chierchia et al. (2019) berasal dari sampel N = 659 usia
   11 sampai 33, sedangkan parameter IRT Zorowitz et al. (2023) dari sampel yang lebih
   besar. Keduanya boleh dipakai, tapi tidak boleh dianggap satu sampel identik.

## Yang masih tidak ada

Berkas gambar stimulus (jpeg) untuk butir MaRs-IB **tidak** ada di repositori
`ndawlab/mars-irt` dan tidak ada di node OSF `g96f4`. Repositori itu hanya berisi data
respons dan hasil kalibrasi. Pilihan pengambilan stimulus dibahas di `PLAN.md` bagian 3.
