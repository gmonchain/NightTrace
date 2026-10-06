# Capability Map

The join between this SPEC's twelve capabilities and the requirement, architecture and journey ids that live in the adopted companions. A story author works from here: pick a CAP, find its FRs, read the FRs in `prd.md`, and take the governing invariant from `ARCHITECTURE-SPINE.md`.

- **CAP ids** are this SPEC's. They are stable and are never renumbered or reused.
- **FR ids** are the PRD's and are the normative requirement text. This SPEC states capability-level intent and success; the FRs hold the per-requirement consequences.
- **AD ids** are the architecture spine's and are the invariants an implementation must not violate. An AD binds *how* to build what the FR describes.
- **UJ ids** are the PRD's key user journeys — narrative only. No invariant derives from a journey.
- **Surface** names the DIRECTORY an implementing agent will work in.

## The map

| CAP | Capability | FRs | UJs | Governed by | Home |
| --- | --- | --- | --- | --- | --- |
| **CAP-1** | A session you cannot predict | FR-1, FR-2, FR-4, FR-35 | UJ-1, UJ-2, UJ-4 | AD-1, AD-2, AD-3, AD-4, AD-5, AD-6, AD-25, AD-26 | `src/engine/**`, `src/services/SessionService.ts` |
| **CAP-2** | Seven instruments, none of which lie | FR-5, FR-11, FR-12, FR-13, FR-14, FR-15, FR-16, FR-17 | UJ-1, UJ-2, UJ-4 | AD-2, AD-13, AD-15, AD-27, AD-29 | `src/features/{emf,radar,voice,evp,camera,tracker,sky}/`, `src/sensors/**` |
| **CAP-3** | An encounter worth the wait | FR-3, FR-38 | UJ-1, UJ-2 | AD-6, AD-2, AD-27 | `src/engine/archetypes/{Ambusher}.ts`, `src/features/camera/**` |
| **CAP-4** | Four phenomena deep, not forty shallow | FR-6, FR-7, FR-8, FR-37, FR-38, FR-39 | UJ-1, UJ-2, UJ-3, UJ-4 | AD-7, AD-9, AD-20, AD-27 | `src/engine/archetypes/**`, `src/data/{creatures,hunts,archetypes}/**` |
| **CAP-5** | Evidence that converges without concluding | FR-18, FR-19, FR-34 | UJ-1, UJ-2, UJ-4 | AD-8, AD-10, AD-11, AD-18, AD-27 | `src/engine/rules/evidence.ts`, `src/services/EvidenceService.ts` |
| **CAP-6** | The conclusion is the user's | FR-20, FR-21 | UJ-1, UJ-4 | AD-8, AD-18, AD-27 | `src/engine/rules/**`, `src/services/CaseReportService.ts`, `src/features/report/**` |
| **CAP-7** | The Case Report | FR-22, FR-23, FR-36 | UJ-1, UJ-2, UJ-4 | AD-8, AD-10, AD-15, AD-16, AD-17, AD-24, AD-25 | `src/features/report/**`, `src/services/CaseReportService.ts` |
| **CAP-8** | The share card is the growth engine | FR-24 | UJ-2 | AD-15, AD-16, AD-17, AD-27 | `src/features/report/share/**`, `src/services/ShareCardService.ts` |
| **CAP-9** | A journal that is yours alone | FR-25, FR-26, FR-27 | UJ-1, UJ-3, UJ-4 | AD-9, AD-10, AD-12, AD-24, AD-27 | `src/features/journal/**`, `src/db/repositories/Journal*.ts` |
| **CAP-10** | Progression without a grind | FR-28, FR-29 | UJ-1, UJ-2 | AD-10, AD-12, AD-24 | `src/services/ProgressionService.ts`, `src/db/repositories/Progression*.ts` |
| **CAP-11** | Start tonight, in any amount of time | FR-30, FR-31 | UJ-1, UJ-2, UJ-3 | AD-10, AD-11, AD-19, AD-24 | `src/features/home/**`, `src/features/session/**` (Field Note mode), `src/data/**` |
| **CAP-12** | Nothing here is proof, and the build enforces it | FR-32, FR-33 | UJ-1, UJ-4 | AD-16, AD-27, AD-30 | `src/app/(onboarding)/**`, `src/app/(modals)/about`, string tables, `assets/store/**` |
| **CAP-13** | The threshold before the field | FR-9, FR-10 | UJ-1, UJ-2 | AD-13, AD-14, AD-29 | `src/features/session/**`, `src/app/hunt/[huntId]/brief` |

## The cross-cutting capabilities

These are not separate features. They are contracts that cut across every CAP above, and a story that touches one of them inherits its constraint whether or not it says so.

| Concern | Invariants | Where it lands |
| --- | --- | --- |
| **Determinism & replay** | AD-3, AD-4, AD-1 | `src/engine/RandomEngine.ts`, tick storage in `src/db/**` |
| **The presenter bottleneck** | AD-2, AD-11 | `src/features/session/useSessionPresenter` — the single emission consumer and the only evidence committer |
| **Persistence & the media rule** | AD-10, AD-11, AD-12, AD-22, AD-24 | `src/db/**`, `Paths.document/cases/<caseRef>/` |
| **The no-numbers law** | AD-15, AD-17 | `src/ui/**` — no primitive renders a percentage, axis, degree, unit, distance or signal strength |
| **The claims boundary** | AD-16, AD-27 | every shipped string; the lint's surface set; five review items for the blind spots |
| **Hidden scalars** | AD-26, AD-28 | `src/engine/TensionEngine.ts`, `src/engine/rules/attunement.ts` |
| **Accessibility** | AD-28, AD-17 | `src/ui/**`, `src/features/report/**`, `src/features/journal/**` |
| **Privacy** | AD-21, AD-24, Media & Privacy conventions | the schema, the Case Report, `src/services/AnalyticsService.ts` |
| **Sensors & degradation** | AD-13 | `src/sensors/**` — the only importer of `expo-sensors`, `expo-location` and mic capture |
| **Build, CI & release** | AD-23, AD-30 | `app.config.ts`, `fastlane/`, CI |

## The three prohibitions a story author will otherwise trip over

Three separate rule classes forbid three different things, and a story can violate any one of them while passing the other two. They are routinely confused.

1. **A banned word** (AD-16) — a term from the closed list reaching a declared string surface. Caught by the build-failing lint. The lint parses strings and nothing else.
2. **A measurement-shaped number** (AD-15) — any percentage, unit, axis, degree, distance, coordinate or signal-strength value. Not caught by the banned-term lint unless the string happens to contain `%`. Readouts are bands and words.
3. **A sentence that misdescribes what the app actually did** (AD-27) — the class neither of the others can see. Voice copy implying anything was received, transmitted, heard or contacted; a tutorial connecting stillness to safety on the Shadow Person hunt; a progress readout toward a Signature match; a locked Journal entry; a Tracker surface missing its proximity disclosure; a share card carrying attribution.

The first is enforced by a lint. The second is enforced by the absence of the rendering primitives plus the `%` ban. **The third is enforced only by review** — it is one of the five blind spots AD-16 names, and SM-8's second count exists to discharge it on every release.
