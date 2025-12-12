import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { PrivateRoute } from './components/PrivateRoute';
import { PhaseGuard } from './components/PhaseGuard';

// Pages
import { LoginPage } from './pages/LoginPage';
import { LandingPage } from './pages/LandingPage';

import { Phase2LandingPage } from './pages/Phase2LandingPage';

// Components
import { DemographicsForm } from './components/psychometrics/DemographicsForm';
import { Big5Test } from './components/psychometrics/Big5Test';
import { IQTest } from './components/psychometrics/IQTest';
import { VideoModule } from './components/training/VideoModule';
import { NoAITrial } from './components/annotation/NoAITrial';
import { AITrial } from './components/annotation/AITrial';

import { FinalCompletion } from './pages/FinalCompletion';
import { IntroPage } from './pages/IntroPage';

// Wrappers to handle navigation on completion
const StepWrapper = ({ component: Component, nextPath }: { component: React.FC<{ onComplete: () => void }>, nextPath: string }) => {
  const navigate = useNavigate();
  return <Component onComplete={() => navigate(`../${nextPath}`)} />;
};

const FinalStepWrapper = ({ component: Component }: { component: React.FC<{ onComplete: () => void }> }) => {
  const navigate = useNavigate();
  return <Component onComplete={() => {
    navigate('/completion', { state: { justFinished: true } }); // Go to dedicated completion page with flag
  }} />;
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/completion" element={<FinalCompletion />} />

          {/* Phase 1 Routes */}
          <Route path="/phase1" element={<PrivateRoute><PhaseGuard requiredPhase="phase1"><Outlet /></PhaseGuard></PrivateRoute>}>

            {/* Group 0: Demo -> IntroBig5 -> Big5 -> IntroIQ -> IQ -> IntroVideo -> Video -> IntroAnnotation -> Annotation */}
            <Route path="group0">
              <Route path="landing" element={<LandingPage />} />

              <Route path="demographics" element={<StepWrapper component={DemographicsForm} nextPath="intro-big5" />} />

              <Route path="intro-big5" element={<StepWrapper component={(props) => <IntroPage {...props} title="Személyiségteszt" description="Az alábbiakban állításokat fog olvasni. Kérjük, jelölje meg, mennyire jellemzőek Önre." buttonText="Teszt Kitöltése" />} nextPath="big5" />} />
              <Route path="big5" element={<StepWrapper component={Big5Test} nextPath="intro-iq" />} />

              <Route path="intro-iq" element={<StepWrapper component={(props) => <IntroPage {...props} title="Logikai Teszt" description="A következő feladatban logikai sorozatokat kell kiegészítenie." buttonText="Teszt Indítása" />} nextPath="iq" />} />
              <Route path="iq" element={<StepWrapper component={IQTest} nextPath="intro-video" />} />

              <Route path="intro-video" element={<StepWrapper component={(props) => <IntroPage {...props} title="Oktatóvideó" description="A következő lépésben egy rövid videót fog látni, amely bemutatja a feladatot." buttonText="Videó Indítása" />} nextPath="video" />} />
              <Route path="video" element={<StepWrapper component={(props) => <VideoModule {...props} videoSrc="/videos/video0.1.mp4" saveProgressKey="phase1VideoWatched" />} nextPath="landing" />} />

              <Route path="intro-annotation" element={<StepWrapper component={(props) => <IntroPage {...props} title="Gyakorlás és Annotáció" description="Most következik a képek annotálása. Kérjük, alkalmazza a videóban látottakat." buttonText="Annotáció Indítása" />} nextPath="annotation" />} />
              <Route path="annotation" element={<FinalStepWrapper component={NoAITrial} />} />
            </Route>

            {/* Group 1: Demo -> Video -> AI */}
            <Route path="group1">
              <Route path="landing" element={<LandingPage />} />
              <Route path="demographics" element={<StepWrapper component={DemographicsForm} nextPath="video" />} />
              <Route path="video" element={<StepWrapper component={(props) => <VideoModule {...props} videoSrc="/videos/video1.1.mp4" />} nextPath="annotation" />} />
              <Route path="annotation" element={<FinalStepWrapper component={AITrial} />} />
            </Route>

          </Route>

          {/* Phase 2 Routes */}
          <Route path="/phase2" element={<PrivateRoute><PhaseGuard requiredPhase="phase2"><Outlet /></PhaseGuard></PrivateRoute>}>

            {/* Group 0 (was Control, now AI): Video -> AI */}
            <Route path="group0">
              <Route path="landing" element={<Phase2LandingPage />} />
              <Route path="intro-video" element={<StepWrapper component={(props) => <IntroPage {...props} title="Oktatóvideó" description="A következő lépésben egy rövid videót fog látni, amely bemutatja az AI asszisztens használatát." buttonText="Videó Indítása" />} nextPath="video" />} />
              <Route path="video" element={<StepWrapper component={(props) => <VideoModule {...props} videoSrc="/videos/video0.2.mp4" />} nextPath="annotation" />} />
              <Route path="annotation" element={<FinalStepWrapper component={AITrial} />} />
            </Route>

            {/* Group 1 (was AI, now Control + Psych): Big5 -> IQ -> Video -> NoAI */}
            <Route path="group1">
              <Route path="landing" element={<Phase2LandingPage />} />

              <Route path="intro-big5" element={<StepWrapper component={(props) => <IntroPage {...props} title="Személyiségteszt" description="Az alábbiakban állításokat fog olvasni. Kérjük, jelölje meg, mennyire jellemzőek Önre." buttonText="Teszt Kitöltése" />} nextPath="big5" />} />
              <Route path="big5" element={<StepWrapper component={Big5Test} nextPath="intro-iq" />} />

              <Route path="intro-iq" element={<StepWrapper component={(props) => <IntroPage {...props} title="Logikai Teszt" description="A következő feladatban logikai sorozatokat kell kiegészítenie." buttonText="Teszt Indítása" />} nextPath="iq" />} />
              <Route path="iq" element={<StepWrapper component={IQTest} nextPath="intro-video" />} />

              <Route path="intro-video" element={<StepWrapper component={(props) => <IntroPage {...props} title="Felkészülés a 2. Fázisra" description="Ebben a fázisban önállóan fog dolgozni. Kérjük, tekintse meg az emlékeztető videót." buttonText="Videó Megtekintése" />} nextPath="video" />} />
              <Route path="video" element={<StepWrapper component={(props) => <VideoModule {...props} videoSrc="/videos/video1.2.mp4" />} nextPath="annotation" />} />

              <Route path="annotation" element={<FinalStepWrapper component={NoAITrial} />} />
            </Route>

          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
