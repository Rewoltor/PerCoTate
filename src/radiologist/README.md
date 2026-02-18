# 🩻 Radiologist Annotation Module

A self-contained module within PerCoTate for collecting expert radiologist annotations on knee X-ray images. Designed as an **isolated flow** that shares only the Firebase backend with the main application — no authentication overlap, no shared collections, no route conflicts.

---

## Purpose

This module implements an **MRMC (Multi-Reader Multi-Case)** annotation pipeline where radiologists evaluate knee X-ray images independently. Each radiologist:

1. Starts a session (no login/registration required)
2. Provides professional demographics
3. Reviews instructions
4. Annotates **80 knee X-ray images** in randomized order
5. Sees a completion screen

The collected data forms the **ground truth** for the main PerCoTate study, where non-expert participants' annotations (with and without AI assistance) are compared against expert radiologist consensus.

---

## Flow Overview

```
Landing Page (/radiology)
    │
    ▼  Click "Kezdés →" → auto-generates RAD-XXXXX ID
Demographics (/radiology/demographics)
    │
    ▼  Enter age, residence, experience, profession
Instructions (/radiology/instructions)
    │
    ▼  Click "Annotáció Indítása →"
Annotation (/radiology/annotation)
    │  For each of 80 images:
    │    1. Is the image readable? (Igen / Nem)
    │    2. KL Grade 0–4 (only if readable)
    │    3. Confidence 1–7 (only if readable)
    │
    ▼  All 80 completed
Completion (/radiology/complete)
```

### Session Management

- **No authentication required** — a single click on "Kezdés" auto-generates a unique `RAD-XXXXX` identifier
- Sessions persist in `localStorage` and Firestore — if a radiologist closes the browser, they resume where they left off
- Anonymous Firebase Auth is used under the hood solely for Firestore write permissions
- The flow is **completely isolated** from the main app's auth system

### Image Randomization

Each radiologist sees all images in a unique **Fisher-Yates shuffled** order, generated at session start. This prevents ordering bias across annotators.

---

## Architecture

### Module Isolation

The radiologist module is fully self-contained under `src/radiologist/`:

```
src/radiologist/
├── README.md                         # This file
├── RadiologistRoutes.tsx             # Routing with session guards
├── config.ts                        # Module configuration
├── types.ts                         # TypeScript interfaces
├── contexts/
│   └── RadiologistAuthContext.tsx    # Session management context
├── components/
│   ├── RadiologistAnnotation.tsx     # Main annotation screen
│   └── RadiologistDemographicsForm.tsx
└── pages/
    ├── RadiologistLanding.tsx        # Landing / session start
    ├── RadiologistInstructions.tsx   # Pre-annotation instructions
    └── RadiologistCompletion.tsx     # Thank-you screen
```

### Safety Boundaries

The module includes a **runtime safety check** (`config.ts`) that throws an error at module load if any radiologist collection name accidentally matches a main-app collection. This prevents data cross-contamination.

### Route Protection

All routes except the landing page are wrapped in a `RequireSession` guard that redirects unauthenticated visitors to `/radiology`.

---

## Configuration

All module-level settings live in `src/radiologist/config.ts`:

| Setting | Value | Description |
|---------|-------|-------------|
| `TOTAL_IMAGES` | `80` | Number of X-ray images to annotate |
| `IMAGE_BASE_PATH` | `/radioData/` | Path to images in `public/` |
| `SESSION_STORAGE_KEY` | `radio_user_session` | `localStorage` key for session persistence |
| `COLLECTIONS.RADIO_PARTICIPANTS` | `radio_participants` | Firestore collection name |

### Image Assets

X-ray images are stored in `public/radioData/` as `1.png` through `80.png`. These are **not included** in the repository and must be added manually.

---

## Data Model

### Firestore Structure

```
radio_participants/{RAD-XXXXX}
├── radId: "RAD-XXXXX"
├── imageSequence: [23, 7, 45, ...]     # Shuffled order
├── currentTrialIndex: 15               # 0-based progress
├── completedTrials: { trial_1: true, trial_2: true, ... }
├── demographics: {
│     age: 42,
│     residence: "Budapest",
│     yearsOfExperience: 12,
│     profession: "Radiológus"
│   }
├── createdAt: Timestamp
├── completedAt: 1707000000000          # Set when all trials done
└── trials/
    ├── trial_1: {
    │     trialId: "trial_1",
    │     imageFileName: "23.png",
    │     startTime: 1707000001000,
    │     endTime: 1707000015000,
    │     duration: 14.0,
    │     isReadable: true,
    │     klGrade: 2,
    │     confidence: 5
    │   }
    ├── trial_2: {
    │     trialId: "trial_2",
    │     imageFileName: "7.png",
    │     isReadable: false,
    │     klGrade: null,             # null when not readable
    │     confidence: null,          # null when not readable
    │     ...
    │   }
    └── ...
```

### TypeScript Types

| Type | Description |
|------|-------------|
| `RadiologistParticipant` | Top-level participant record with session state |
| `RadiologistDemographics` | Age, residence, experience, profession |
| `RadiologistTrialData` | Per-image annotation data with timing |

---

## Annotation Details

### Step 1: Readability (Olvasható a kép?)

Binary choice: **Igen** (Yes) or **Nem** (No).

If "Nem" is selected, the trial is submitted immediately with `klGrade: null` and `confidence: null`. No further questions are shown.

### Step 2: KL Grade (Kellgren-Lawrence Fokozat)

Only shown if the image is readable. A 5-point scale (0–4):

| Grade | Description |
|-------|-------------|
| 0 | Normal — no features of OA |
| 1 | Doubtful — questionable osteophytes |
| 2 | Minimal — definite osteophytes, possible joint space narrowing |
| 3 | Moderate — moderate osteophytes, definite joint space narrowing |
| 4 | Severe — large osteophytes, marked joint space narrowing, sclerosis |

### Step 3: Confidence (Bizonyosság)

Only shown after KL Grade is selected. A 7-point Likert scale (1 = uncertain, 7 = fully confident).

---

## Integration with Main App

The module is mounted at `/radiology/*` in `src/App.tsx`:

```tsx
<Route path="/radiology/*" element={<RadiologistRoutes />} />
```

This single line is the **only touchpoint** between the main app and the radiologist module. Everything else is self-contained.

---

## Development

### Adding More Images

1. Place new PNG files in `public/radioData/` (named sequentially, e.g. `51.png`, `52.png`, ...)
2. Update `TOTAL_IMAGES` in `src/radiologist/config.ts` to match the total count
3. New sessions will automatically include the additional images

### Testing

```bash
npm run dev
# Open http://localhost:5173/radiology
```

Each session creates a new `RAD-XXXXX` entry. To reset and test again, clear `localStorage` in the browser dev tools.

### Accessing Collected Data

Radiologist annotations are stored in the `radio_participants` Firestore collection. Each participant's trials are stored as subcollections under their document. Use the Firebase Console or the data extraction scripts in `public/scripts/` to retrieve the data.
