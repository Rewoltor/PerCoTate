# PerCoTate

A research application for cognitive ability assessment and personality testing, built with React, TypeScript, and Firebase.

## 📋 Overview

PerCoTate is a web-based research platform that conducts:
- **Cognitive ability testing** using spatial reasoning assessments
- **Big Five personality assessment** (OCEAN model)
- **Demographic data collection** for research purposes
- **Training modules** with video content
- **Annotation trials** for AI-assisted vs. non-AI workflows

All participant data is securely stored in Firebase Firestore with anonymous authentication.

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Firebase account** - [Create free account](https://firebase.google.com/)
- **Git** - [Download here](https://git-scm.com/)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd PerCoTate
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase** (see [Firebase Setup](#-firebase-setup) below)

4. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Firebase credentials
   ```

5. **Set up cognitive test assets** (see [Cognitive Assets](#-cognitive-assets) below)

6. **Start development server**
   ```bash
   npm run dev
   ```

7. **Open your browser** to `http://localhost:5173`

---

## 🔥 Firebase Setup

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or select an existing project
3. Follow the setup wizard (Analytics is optional)

### Step 2: Enable Authentication

1. In Firebase Console, go to **Authentication** → **Sign-in method**
2. Enable **Anonymous** authentication
3. Click **Save**

### Step 3: Create Firestore Database

1. Go to **Firestore Database** → **Create database**
2. Choose **Production mode** (we'll use security rules)
3. Select your preferred region
4. Click **Enable**

### Step 4: Set Security Rules

1. In Firestore, go to **Rules** tab
2. Copy the contents from `firestore.rules` in this repo
3. Click **Publish**

### Step 5: Get Configuration

1. Go to **Project Settings** (gear icon) → **General**
2. Scroll to **"Your apps"** section
3. Click the web icon (`</>`) to add a web app
4. Register your app (nickname: "PerCoTate Web")
5. Copy the `firebaseConfig` object values
6. Paste them into your `.env.local` file:

```bash
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

**That's it!** Firebase is now configured.

---

## 🧩 Cognitive Assets

This application uses cognitive ability test materials for IQ assessment. These materials are **not included** in the public repository.

### Option 1: Use ICAR Materials (Recommended)

The original implementation uses validated test items from the **ICAR Project** (International Cognitive Ability Resource):

1. Visit **[https://icar-project.com/](https://icar-project.com/)**
2. Request access to test materials
3. Download the spatial reasoning test images
4. Place them in `public/CognitiveAssets/`:
   ```
   public/CognitiveAssets/
   ├── README.md
   ├── fig11061.png
   ├── fig11062.png
   ├── fig11063.png
   ├── fig11064.png
   ├── fig11065.png
   └── fig11066.png
   ```

### Option 2: Use Your Own Tests

You can implement your own cognitive tests:

1. Create your test images and place them in `public/CognitiveAssets/`
2. Update `src/components/psychometrics/IQTest.tsx` with your test logic
3. See `src/components/psychometrics/README.md` for implementation guide

### Option 3: Disable Cognitive Testing

If you don't need IQ testing:

1. Open `src/App.tsx`
2. Comment out or remove the IQ test stage from the flow
3. The app will skip cognitive assessment

📖 **For detailed information**, see:
- `public/CognitiveAssets/README.md`
- `src/components/psychometrics/README.md`

---

## 🧪 Data Extraction Pipeline

The project includes a complete data extraction and processing pipeline located in `public/scripts/`.

- **Location**: `public/scripts/`
- **Purpose**: Processes raw medical experiment data and handles dataset management.
- **Language**: Python

## 🩻 Medical Dataset

This research utilizes the **Knee Osteoarthritis Severity Grading Dataset**.

**Citation**:
> Pingjun Chen. 2018. Knee osteoarthritis severity grading dataset. Mendeley Data 1 (2018).
> [https://data.mendeley.com/datasets/56rmx5bjcr/1](https://data.mendeley.com/datasets/56rmx5bjcr/1)

*Note: The actual image dataset is not included in this repository due to size and licensing. Please download it from the source above if needed.*

---

## 🩻 Radiologist Annotation Module

An isolated, self-contained module for collecting expert radiologist annotations on knee X-ray images as part of the MRMC (Multi-Reader Multi-Case) study design.

### What It Does

Radiologists access the flow at `/radiology` and annotate **80 knee X-ray images** in randomized order. For each image they assess:
1. **Readability** — Is the image diagnostically evaluable?
2. **KL Grade (0–4)** — Kellgren-Lawrence osteoarthritis severity (if readable)
3. **Confidence (1–7)** — How certain they are about their grading (if readable)

### Key Design Decisions

- **No authentication** — A single click starts a session with an auto-generated `RAD-XXXXX` ID
- **Fully isolated** — Uses its own Firestore collection (`radio_participants`), context, routing, and types. No overlap with the main app
- **Session persistence** — Progress is saved to both Firestore and `localStorage`, so radiologists can resume if interrupted
- **Runtime safety** — A guard in `config.ts` throws at module load if collection names accidentally collide with the main app

### Location

| Item | Path |
|------|------|
| Source code | `src/radiologist/` |
| X-ray images | `public/radioData/` (not in repo) |
| Route entry point | `/radiology` |
| Firestore collection | `radio_participants` |

📖 **Full documentation**: See [`src/radiologist/README.md`](src/radiologist/README.md)

---

## 📊 MRMC Study Dashboard

A standalone web-based visualization dashboard for analyzing the results of the study.

### Features

- **Executive Summary**: Key metrics, accuracy comparison charts
- **Hypothesis Testing**: H1 (AI improves accuracy) ★ Supported, H2 (Personality predictors), H3 (Persistence)
- **Fatigue Analysis**: Accuracy by trial block, drop-off statistics
- **AI Interaction Patterns**: Over-reliance, effective use, agreement rates
- **Personality Analysis**: Big Five correlations, Neuroticism × Fatigue (r = 0.33)
- **Time Analysis**: Response time comparison with linear regression
- **KL Grade Breakdown**: Accuracy by osteoarthritis severity

### Quick Start

The dashboard is served alongside the main application:

```bash
npm run dev
```

Then open: **http://localhost:5173/scripts/dataVisualizer/index.html**


📖 **Full documentation**: See [`public/scripts/dataVisualizer/README.md`](public/scripts/dataVisualizer/README.md)

---

## 🔬 Data Analysis Projects

The project includes specialized analysis pipelines for the study results, located in `public/scripts/dataAnalysis/`.

### [New analysis](./public/scripts/dataAnalysis/New%20analysis/) (Publication Standard)
The primary analytical pipeline for the paper. It utilizes a **Platinum Standard** (Radiologist Consensus) to audit and correct repository label noise.
- **Workflow**: Sequence of Jupyter notebooks (`NB0`–`NB5`) supported by a shared `helpers.py`.
- **Key Metrics**: Mixed-effects regression, human-AI reliance taxonomy, and psychometric predictors.

### [Original Analysis](./public/scripts/dataAnalysis/Original%20Analysis/) (Reference)
Preliminary analysis conducted using the original (mislabeled) ground truth. It is maintained strictly for historical reference and to demonstrate the "Accuracy Paradox" caused by label noise.

---

## 📦 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server at `http://localhost:5173` |
| `npm run build` | Build for production (outputs to `dist/`) |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint to check code quality |

---

## 🏗️ Project Structure

```
PerCoTate/
├── public/
│   ├── CognitiveAssets/      # IQ test images (not in repo)
│   ├── videos/                # Training module videos
│   └── scripts/               # Data processing and visualization
│       ├── dataVisualizer/    # 📊 MRMC Study Dashboard (see README)
│       └── outputs/           # Exported CSV data
├── src/
│   ├── components/
│   │   ├── annotation/        # AI trial components
│   │   ├── psychometrics/     # Tests (IQ, Big5, Demographics)
│   │   ├── training/          # Video training modules
│   │   └── ui/                # Reusable UI components
│   ├── contexts/              # React contexts (Auth)
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Firebase configuration
│   ├── pages/                 # Main application pages
│   ├── radiologist/           # 🩻 Isolated radiologist module (see README)
│   ├── types/                 # TypeScript type definitions
│   ├── utils/                 # Utility functions
│   ├── App.tsx                # Main application component
│   └── config.ts              # App configuration
├── .env.example               # Environment variables template
├── firestore.rules            # Firestore security rules
├── firestore.indexes.json     # Firestore indexes
└── package.json               # Dependencies and scripts
```

---

## 🔒 Security & Privacy

- **Anonymous Authentication**: Users are identified by Firebase anonymous UID
- **No Personal Data**: No email, name, or identifying information collected
- **Firestore Security Rules**: Database access controlled by Firebase rules
- **Environment Variables**: API keys stored in `.env.local` (not committed)

---

## 🧪 Development Notes

### Debug Mode

Toggle debug mode in `src/config.ts`:

```typescript
export const CONFIG = {
  IS_DEBUG_MODE: true, // Set to false for production
  // ...
};
```

Debug mode:
- Reduces trials per session (5 instead of 50)
- Shows additional debugging information
- Useful for testing without completing full sessions

### Firestore Collections

The app uses these Firestore collections:

| Collection | Purpose |
|------------|---------|
| `participants` | Stores all participant data (demographics, test results, trials) |
| `user_identity` | Maps Firebase UIDs to custom user IDs |
| `system_stats` | Tracks system-wide statistics (user counts, etc.) |
| `radio_participants` | Radiologist annotation data (isolated module — see `src/radiologist/`) |

See `src/config.ts` for collection names.

---

## 🚢 Deployment

### Deploy to Firebase Hosting

1. **Install Firebase CLI** (if not already installed):
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**:
   ```bash
   firebase login
   ```

3. **Initialize Firebase Hosting** (first time only):
   ```bash
   firebase init hosting
   ```
   - Select your Firebase project
   - Set public directory to `dist`
   - Configure as single-page app: **Yes**
   - Don't overwrite `index.html`

4. **Build and deploy**:
   ```bash
   npm run build
   firebase deploy
   ```

Your app will be live at `https://your-project-id.web.app`

### Deploy to Other Platforms

The app is a standard Vite/React application and can be deployed to:
- **Vercel**: Connect your GitHub repo
- **Netlify**: Drag and drop the `dist/` folder
- **GitHub Pages**: Use `gh-pages` package
- **Any static hosting**: Upload the `dist/` folder

**Important**: Set environment variables in your hosting platform's dashboard.

---

## 🤝 Contributing

This is a research project. If you'd like to contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

[Add your license here - e.g., MIT, Apache 2.0, GPL, etc.]

---

## 🆘 Troubleshooting

### "Firebase: Missing API Key" Error

- Make sure you've copied `.env.example` to `.env.local`
- Verify all Firebase config values are filled in
- Restart the dev server after changing `.env.local`

### "Cannot find module" Errors

```bash
rm -rf node_modules package-lock.json
npm install
```

### Cognitive Assets Not Loading

- Check that images are in `public/CognitiveAssets/`
- Verify filenames match exactly: `fig11061.png` through `fig11066.png`
- Check browser console for 404 errors

### Firestore Permission Denied

- Verify Firestore security rules are published
- Check that Anonymous authentication is enabled
- Ensure user is authenticated (check browser console)

### Build Fails

- Check TypeScript errors: `npm run build`
- Verify all dependencies are installed: `npm install`
- Clear cache: `rm -rf dist node_modules && npm install`

---

## 📞 Support

For questions or issues:
- Check existing documentation in subdirectories
- Review Firebase Console for configuration issues
- Open an issue on GitHub

---

## 🙏 Acknowledgments

- **ICAR Project** - Cognitive ability test materials ([icar-project.com](https://icar-project.com/))
- **Firebase** - Backend infrastructure
- **React** - UI framework
- **Vite** - Build tool

---

**Built with ❤️ for research**
