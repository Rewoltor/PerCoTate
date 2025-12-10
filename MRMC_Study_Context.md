# Implementation Plan: MRMC Medical AI Annotation Study

This document outlines the step-by-step development strategy for the MRMC Study application. It prioritizes architectural stability (Authentication & Data Integrity) before UI complexity (Annotation tools).

**Pre-requisite:** Familiarize with `MRMC_Study_Context.md` for business logic and `DANNY-redo/` for UI reference.

---

## Phase 0: Project Foundation & Configuration

**Goal:** Establish the codebase structure, configuration constants, and type definitions.

### Initialize Project
- Setup React + TypeScript + Tailwind CSS.
- Install dependencies: `firebase`, `react-router-dom`, `lucide-react` (for icons).

### Configuration (`src/config.ts`)
- Implement `IS_DEBUG_MODE` toggle.
- Define Firestore collection names (`user_identity`, `participants`, `system_stats`).
- Define constant `WASHOUT_PERIOD_MS` (28 days).

### Type Definitions (`src/types/index.ts`)
- Define interfaces for `Participant`, `TrialData`, `Big5Response`, etc.
- Strictly type the `TreatmentGroup` (`'0' | '1'`) and `Phase` (`'phase1' | 'phase2'`).

---

## Phase 1: Authentication & Identity Architecture (CRITICAL)

**Goal:** Implement the strict "Arrival Order" randomization and Anonymity separation. This is the most complex logic and must be robust.

### Firebase Setup
- Initialize Auth (Anonymous) and Firestore.

### Global Counter Logic
- Create a helper function to safely increment `system_stats/global_counter` via a Firestore Transaction.

### ID Generation Utility
- Create function `generateUserID(groupPrefix: '0' | '1')` → returns string like `0-X9J2K`.

### Auth Context (`src/contexts/AuthContext.tsx`)
Implement `login(name, pin)` function.

**Logic:**
1. Check `user_identity` collection first.
2. If new:
   - Run transaction to get Global Counter.
   - Determine Group (Even=0, Odd=1).
   - Generate ID.
   - Write to `user_identity` **and** `participants` atomically.
3. Lockout Logic: Implement the check for `phase1CompletedAt` vs Current Time.

---

## Phase 2: Routing & State Management

**Goal:** Create the "Traffic Controller" that directs users based on Group and Phase.

### Route Guards
- Create `<PrivateRoute>` component that checks for `auth.participant`.
- Create `<PhaseGuard>` component that ensures a user in Phase 1 cannot access Phase 2 URLs.

### Main Router (`src/App.tsx`)
Define strict paths:

- `/` (Login)
- `/phase1/group0/landing`
- `/phase1/group1/landing`
- `/phase2/group0/landing`
- `/phase2/group1/landing`
- ...plus specific test routes.

### Navigation Logic
- Write helper hook `useStudyNavigation()` that reads `participant.treatmentGroup` and `participant.currentPhase` to redirect to the correct next step.

---

## Phase 3: "No-AI" Annotation Flow (The Baseline)

**Goal:** Implement the simpler annotation loop to validate data saving and image sequencing.

### Image Loader
- Implement logic to read `participant.imageSequence` and load images from `public/annotation/`.

### Trial Logic
- Build `<NoAITrial>` component.
- Inputs: Binary Diagnosis, Confidence (1–7).

### Data Saving
- Save trial result to `participants/{id}/trials/{trialId}`.
- Ensure strict `await` on Firestore writes before moving to the next image.

### Progress Tracking
- Ensure if user refreshes, they land on the same image index.

---

## Phase 4: "With-AI" Annotation Flow (The Core Feature)

**Goal:** Implement the complex, multi-step AI interaction flow.

### Lookup Integration
- Create `src/utils/aiLookup.ts` to fetch AI prediction/heatmap path based on Image ID.

### Bounding Box Tool
- Port/Refine `BBoxTool` from `DANNY-redo`.
- Ensure coordinate systems (Screen vs Natural image size) are accurate.

### Step-by-Step UI (`<AITrial>`)
**State 1:** Image + Dropdown  
- Implement Logic: *tünet* = Mandatory Box, *nincsen* = Disabled Box.

**State 2:** Binary Decision → Send.

**State 3:** Pre-Confidence Modal.

**State 4:** Feedback Modal (Overlay)  
- Implement IoU calculation (`src/utils/math.ts`).  
- Render AI Box (Red) vs User Box (Blue).

**State 5:** Post-Confidence Modal.

---

## Phase 5: Psychometric Tests & Questionnaires

**Goal:** Implement the auxiliary data collection modules.

### Demographics Form
- Simple form, save to `participants/{id}`.

### Big 5 Test
- 50-item questionnaire (10 items per page).
- Scoring logic (if needed immediately) or raw storage.

### IQ Test
- Raven's Matrices style logic.
- Timer logic (per question or global).

### Video Module
- Embed video player.
- "I have watched" checkbox (disabled until video end or manual check).

---

## Phase 6: Final Polish & "Washout" Simulation

**Goal:** Ensure the full longitudinal flow works.

### Landing Pages
- Create clear, context-aware landing pages (e.g., "Welcome back for Phase 2").

### Washout Testing
- Manually edit a test user's `phase1CompletedAt` in Firestore to 29 days ago.
- Verify the Login system correctly unlocks Phase 2.

### Group Swap Logic
- Verify Group 0 gets "With-AI" in Phase 2.
- Verify Group 1 gets "No-AI" + Psychometrics in Phase 2.

---

## Phase 7: Deployment & Validation

### Build
- `npm run build`.

### Deploy
- Firebase Hosting.

### Verification
- Create 4 dummy users (0, 1, 0, 1 IDs).
- Verify data separation in Firestore (`user_identity` vs `participants`).
- Verify Image Sequences are randomized and persisted.
