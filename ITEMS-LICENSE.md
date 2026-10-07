# ITEMS-LICENSE.md — Terms for the test items

Test stimuli are **not** covered by this project's GPL-3.0 license. This file records
the terms under which the item bank may be used, and the obligations that come with it.

## Item bank: MaRs-IB

**MaRs-IB** (Matrix Reasoning Item Bank) is the intended source of stimuli.

- Chierchia, G., Fuhrmann, D., Knoll, L. J., Pi-Sunyer, B. P., Sakhardande, A. L., &
  Blakemore, S. J. (2019). The matrix reasoning item bank (MaRs-IB): novel, open-access
  abstract reasoning items for adolescents and adults. *Royal Society Open Science*,
  6(10), 190232.
- DOI: `10.1098/rsos.190232`
- OSF repository: `osf.io/g96f4` (README retrieved 2026-10-07, vendored at
  `docs/sources/MaRs_IB_README.pdf`)

### License

Two independent statements apply and both must be honoured:

1. **OSF metadata license: CC BY-NC 3.0** (Creative Commons Attribution-NonCommercial
   3.0 Unported). Every component on the OSF node carries this license id
   (`563c1cf88c5e4a3877f9e96e`), including the `Items` and `Item-level norms`
   components.
2. **The authors' README, verbatim:** "Researchers may use any of the materials
   provided here for academic and non-commercial purposes only as they are either
   owned by or licensed to the researchers, their institutions or Cauldron Science. In
   relation to such use we ask that you cite the paper referenced above."

**Practical reading:** academic and non-commercial use only, with mandatory citation.
Note that the authors name **Cauldron Science** among the licensors of the materials;
treat that as a third party whose terms have not been separately inspected here.

### Obligations for this project

- Non-commercial use only. Do not monetise this project, its item bank, or any
  derivative that ships these stimuli.
- Cite Chierchia et al. (2019) wherever the items are presented (README, item credit
  screen, results screen).
- Keep this file. Do not merge its contents into the code license.

## Item parameters are a separate, permissive source

The psychometrics used to score items are **not** covered by the terms above. They come
from a separate MIT-licensed analysis of the same item bank:

- `ndawlab/mars-irt`, "An item response theory analysis of the Matrix Reasoning Item Bank
  (MaRs-IB)", Zorowitz et al. (2023), *Behavior Research Methods*, DOI
  `10.3758/s13428-023-02067-8`
- Copyright (c) 2019-2022 Daw Lab, `https://dawlab.princeton.edu/`

The vendored tables live in `data/item-parameters/`, with full details, column
definitions, and usage limits in `ITEM-PARAMETERS.md`. Reading the item parameters still
requires obeying the item terms in this file, because the parameters are derived from
participants' responses to the items.

## What the authors say this test is not (verbatim)

> "Please note that our task is not an IQ test. It is not intended to be used to
> determine someone's intelligence or cognitive ability in, for example, educational,
> clinical or commercial contexts. This is because we do not have population norms for
> our task, so it does not generate an IQ score."

This is the authors' own statement, not an inference. It is the reason this project
reports **theta and a percentile within the reference sample** and never converts to an
IQ number (see `PLAN.md` section 4).

## Item bank structure (from the authors' README)

- **3 item sets** (`ss1`, `ss2`, `ss3`) — identical apart from colours. `ss1` is the set
  used in the study; all item-level statistics refer to `ss1`. `ss2` and `ss3` use
  colour-blind-friendly palettes (Wong et al., 2011) and have **not** been tested.
- **3 test forms** (`tf1`, `tf2`, `tf3`) — identical apart from the shapes used.
- **80 items per test form.**
- **Each item = 9 jpeg images: one 3x3 matrix + eight candidate solutions** (720 images
  per test form). Naming conventions: `_M_` marks the matrix, `_T1_` marks the correct
  solution, `_T2_`/`_T3_`/`_T4_` the distractors, `_md_` = minimal-difference distractor
  set and `_pd_` = paired-difference distractor set.
- **Difficulty:** each of the 80 items has a dimensionality score
  (`Item dimensionality.csv`) that predicts difficulty. The item-to-score association
  is fixed across test forms, shape sets, and distractor strategy — so the score is
  portable, which is what makes adaptive selection possible.

## Reference sample (norms)

- N = 659 participants, ages **11–33**. Age group labels: `YA` younger adolescents,
  `MA` mid adolescents, `OA` older adolescents, `Ad` adults.
- Three item-level tables: by test form, by shape set, by age group. Columns include
  `N`, `Percentage.correct`, `SE.correct`, `RT.median.corr`, `RT.IQR.corr`, `IES`
  (inverse efficiency).

**These are not population norms.** They describe this sample only. Any percentile this
project reports is a percentile *within the reference sample*, not within a general
population, and the age correction is only defensible inside the 11–33 range.

## Status: item stimulus files not yet retrievable (re-checked 2026-10-07)

The `Items` and `Item-level norms` components on the OSF node return an empty file
listing from both the OSF API (`/v2/nodes/{id}/files/osfstorage/`) and the WaterButler
endpoint (`files.osf.io`). Only the README PDF downloaded successfully.

A second route was found and does work: the item **psychometrics** are published openly
under MIT in `ndawlab/mars-irt` and are vendored at `data/item-parameters/`. What remains
missing is only the **stimulus images**. See `ITEM-PARAMETERS.md`.

Consequence: stimuli are **not** yet included in this repository. Nothing in `src/`
depends on them. Before Phase 3 (UI) the retrieval route has to be settled, and the
plan's assumption of 4 answer options per item must be corrected to 8 (see below).

## Attribution requirements for this project

Any screen or document that presents an item must show, without being cut off:

> MaRs-IB — Chierchia et al. (2019), *Royal Society Open Science* 6(10): 190232.
> Academic and non-commercial use only.