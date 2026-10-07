# Sumber dan rujukan

Semua tautan di bawah dicatat sebagai provenance. Tidak ada satu pun file dari
sumber di luar lisensinya yang disalin ke repository ini tanpa dicatat di
[NOTICE](../../NOTICE) dan [ITEMS-LICENSE.md](../../ITEMS-LICENSE.md).

## Butir stimuli (MaRs-IB)

- Artikel: Chierchia, G., Fuhrmann, D., Knoll, L. J., Pi-Sunyer, B. P.,
  Sakhardande, A. L., & Blakemore, S. J. (2019). A novel open-access
  Matrix Reasoning Item Bank. Royal Society Open Science, 6(10), 190232.
  DOI 10.1098/rsos.190232
  - https://royalsocietypublishing.org/rsos/article/6/10/190232/94631/
- Repositori OSF (node g96f4): https://osf.io/g96f4/
- Pracetak (preprint): https://osf.io/uvteh/
- Demo interaktif Gorilla: https://app.gorilla.sc/openmaterials/36164
- Salinan README komponen (bukti ketentuan lisensi):
  `MaRs_IB_README.pdf` di folder ini

Ketentuan lisensi butir diringkas di [ITEMS-LICENSE.md](../../ITEMS-LICENSE.md):
academic and non-commercial purposes only, wajib menyitasi artikel di atas,
material dimiliki atau dilisensikan kepada peneliti, institusi mereka, atau
Cauldron Science.

## Parameter psychometrik butir

- Zorowitz, M. D., et al. (2023). An item response theory analysis of the
  Matrix Reasoning Item Bank (MaRs-IB). Behavior Research Methods.
  DOI 10.3758/s13428-023-02067-8
- Repositori kode dan data: https://github.com/ndawlab/mars-irt (MIT, Daw Lab)
  - Salinan berkas yang dipakai ada di `../../data/item-parameters/`
  - Klon lengkap untuk keperluan riset: `/media/gondrong/DATA/Workspace/repos/mars-irt`
  - Rincian kolom dan batas penggunaan: [ITEM-PARAMETERS.md](../../ITEM-PARAMETERS.md)

## Bank butir alternatif yang ditolak

- ICAR, ICAR Project. https://icar-project.org/
  Statistik publik per butir: https://icar-project.org/types/MR/MRstats.html
  Katalog: https://icar-project.org/ICAR_Catalogue.pdf
  Arsip.zip PsychArchives: https://doi.org/10.23668/psycharchives.22167
  Alasan ditolak: akses butir perlu registrasi dan persetujuan manual,
  lisensi Scientific Use License v1, dan penggunaan dibatasi untuk keperluan
  akademik. Bukan bank butir bebas pakai untuk project ini.
- Hagen Matrices Test, International Cognitive Ability Resource, dan
  iq-misc/rpm-iq-exam. Alasan ditolak: jumlah butir terlalu sedikit untuk
  analisis butir, atau tidak ada dokumentasi cara skoring.

## Repositori acuan yang dibaca, bukan disalin

- https://github.com/ikhlasulov-gb/open-rpm-web (GPL-3.0)
- https://openrpm.ikhlasulov.site (demo)
- https://github.com/Ksound22/iq-measurer (MIT)
- https://github.com/Zburgers/OpenIQ
- https://github.com/iq-misc/rpm-iq-exam (MIT)
- https://rpmtest.pages.dev/ (demo)

Dari repositori ini yang dipakai hanya konsep, struktur berkas, dan metodologi.
Tidak ada kode sumber yang disalin mentah. Rinciannya ada di bagian Credit
pada [README](../../README.md).

## Bentuk stimulus

Setiap butir MaRs-IB terdiri atas satu matriks 3x3 dan delapan kandidat jawaban
(9 berkas gambar), dengan kunci `_T1_` untuk jawaban benar dan `_T2_`, `_T3_`,
`_T4_` untuk pengecoh. Jumlah opsi jawaban wajib dikonfirmasi dari berkas
stimuli asli sebelum antarmuka tes dibuat.
