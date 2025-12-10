# Project Context: MRMC Medical AI Annotation Study

## 1. Project Overview

This project is a React-based web application for a Multi-Reader Multi-Case (MRMC) medical imaging study. The goal is to evaluate how AI assistance influences the performance of human annotators (medical students/doctors) in detecting arthritis from hand X-rays.

The study is longitudinal, consisting of two phases separated by a mandatory 28-day washout period.

### Key Technical Stack

- **Frontend:** React (TypeScript), Tailwind CSS.  
- **Backend/Auth:** Firebase (Firestore, Authentication).  
- **Routing:** React Router DOM.  
- **Assets:** Images and Videos are hosted locally in the public folder (not Firebase Storage).

### Reference Implementation ("DANNY-redo")

**Crucial Instruction:** A folder named `DANNY-redo` exists in the project root.

**Usage:** Use this legacy code strictly for UI/UX inspiration (layout, styling, component structure, bbox tool canvas logic).

**Warning:** Do NOT copy the user journey or state management logic from DANNY-redo. The flow and business logic defined in this document supersede all legacy code.

---

## 2. Core Business Logic

### A. Authentication & ID Generation (Strict Anonymity)

**Goal:** Completely separate user identity (Name/PIN) from the study data (userID).

#### Login/Register Process:

1. User enters Name and 4-digit PIN.
2. System checks a specialized `user_identity` collection to see if this Name+PIN combo exists.
3. **If Exists:** Retrieve the associated userID and log them in.
4. **If New:**
   - Fetch the `global_counter` to determine the group (see Section B).
   - Generate a New User ID.
   - Create two documents:
     - one in `user_identity` (linking Name → ID)
     - one in `participants` (using ID → Data)

#### User ID Format:

- **Format:** `[GroupPrefix]-[RandomString]`
- **GroupPrefix:** 0 or 1  
- **RandomString:** alphanumeric (e.g., `X7K9P`)
- **Example IDs:** `0-A8J2L`, `1-M4N5B`

#### 28-Day Lockout Check:

Upon login, check `phase1CompletedAt` in the participants collection.

- If `currentPhase === 'phase1'` and complete:
  - Calculate days elapsed.
  - If `< 28 days`: show error:  
    **"Phase 1 complete. Please return in _X_ days."**
  - If `>= 28 days`: update `currentPhase` to `phase2`.

---

### B. Group Randomization (Alternating Arrival)

**Strict Rule:** Group assignment alternates based on order of arrival.

#### Algorithm:

1. Read global counter from `system_stats/global_counter`.
2. **Prefix Logic:**
   - Even → Group 0 (Control)
   - Odd → Group 1 (Treatment)
3. Atomically increment the global counter.

---

### C. Image Randomization & Interruption Handling

- Generate a randomized array of image IDs (1–50) at user creation → save as `imageSequence`.
- Do **not** rely on local storage.
- On interruption: user resumes at the same image index stored in Firestore.
- Half-drawn bounding boxes do **not** need to be restored.

---

### D. Configuration

Create `src/config.ts`.

- **IS_DEBUG_MODE**
  - `true`: 5 trials  
  - `false`: 50 trials  

---

## 3. User Journey & Flows

The application has 4 paths based on Group and Phase.

### Phase 1

#### Group 0 (Start No-AI)

1. Landing Page → Auth  
2. Demographic Questionnaire  
3. Big 5 Personality Test  
4. IQ Test  
5. Learning Material (Video + checkbox)  
6. Annotation Task (NO-AI Mode)

#### Group 1 (Start AI)

1. Landing Page → Auth  
2. Demographic Questionnaire  
3. Learning Material (Video + checkbox)  
4. Annotation Task (WITH-AI Mode)

---

### Phase 2 (After 28 days)

#### Group 0 (Crossover to AI)

1. Landing Page → Auth (28-day check)  
2. Learning Material (Video)  
3. Annotation Task (WITH-AI Mode)

#### Group 1 (Crossover to No-AI)

1. Landing Page → Auth (28-day check)  
2. Big 5 Personality Test  
3. IQ Test  
4. Learning Material (Video)  
5. Annotation Task (NO-AI Mode)

> Note: Group 1 performs psychometrics in Phase 2; Group 0 in Phase 1. Balances session length.

---

## 4. Component Requirements

### A. Annotation Interface: **NO-AI Mode**

- Display: Image only.
- Inputs:
  - Binary Diagnosis (Igen / Nem)
  - Confidence (1–7)
- Action: Send → Next trial

---

### B. Annotation Interface: **WITH-AI Mode**

1. **Initial View:** image only.
2. **Classification Dropdown:**
   - `tünet` → bbox mandatory  
   - `bizonytalan` → bbox optional  
   - `nincsen tünet` → bbox disabled  
3. **Diagnosis:** Igen / Nem → Send  
4. **Pre-Feedback Confidence:** 1–7  
5. **AI Feedback Modal:**
   - AI heatmap overlay  
   - User bounding box  
   - AI confidence (%)  
   - IoU score  
   - Options: **Revise** or **Keep**
6. **Post-Feedback Confidence:** 1–7  
7. Next trial

---

### C. Landing Pages

Simple info screens before Big 5, IQ, and annotation sections.

---

### D. Training Video

- Stored in `public/videos`
- User must check: **"I have watched the video"** before continuing.

---

## 5. Data & Storage Structure

### **Collection 1: `user_identity` (PII Storage)**

Purpose: Map Names → Anonymous IDs.

**Document ID:** `lowercase_name_pin` (e.g., `janos_kovacs_1234`)

**Fields:**

- `name`: string  
- `pin`: string  
- `assignedUserID`: string → links to `participants`

---

### **Collection 2: `participants` (Study Data)**

Anonymous scientific data.

**Document ID:** `[assignedUserID]`

**Fields:**

- `userID`: string  
- `treatmentGroup`: '0' | '1'  
- `currentPhase`: 'phase1' | 'phase2'  
- `imageSequence`: number  
- `phase1CompletedAt`: Timestamp  
- `phase2CompletedAt`: Timestamp  
- `demographics`: {…}  
- `big5`: { scores… }  
- `iq`: { score… }  
- `trials`: sub-collection/map  

---

### CSV / JSON Lookups

AI predictions + ground truth must come from local JSON/CSV files, **not** Firestore queries.

