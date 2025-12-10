import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { PrivateRoute } from './components/PrivateRoute';
import { PhaseGuard } from './components/PhaseGuard';

// Pages
import { LoginPage } from './pages/LoginPage';
import { LandingPage } from './pages/LandingPage';

// Components
import { DemographicsForm } from './components/psychometrics/DemographicsForm';
import { Big5Test } from './components/psychometrics/Big5Test';
import { IQTest } from './components/psychometrics/IQTest';
import { VideoModule } from './components/training/VideoModule';
import { NoAITrial } from './components/annotation/NoAITrial';
import { AITrial } from './components/annotation/AITrial';

import { FinalCompletion } from './pages/FinalCompletion';

// Wrappers to handle navigation on completion
const StepWrapper = ({ component: Component, nextPath }: { component: React.FC<{ onComplete: () => void }>, nextPath: string }) => {
  const navigate = useNavigate();
  return <Component onComplete={() => navigate(`../${nextPath}`)} />;
};

const FinalStepWrapper = ({ component: Component }: { component: React.FC<{ onComplete: () => void }> }) => {
  const navigate = useNavigate();
  return <Component onComplete={() => {
    navigate('/completion'); // Go to dedicated completion page
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

            {/* Group 0: Demo -> Big5 -> IQ -> Video -> NoAI */}
            <Route path="group0">
              <Route path="landing" element={<LandingPage />} />
              <Route path="demographics" element={<StepWrapper component={DemographicsForm} nextPath="big5" />} />
              <Route path="big5" element={<StepWrapper component={Big5Test} nextPath="iq" />} />
              <Route path="iq" element={<StepWrapper component={IQTest} nextPath="video" />} />
              <Route path="video" element={<StepWrapper component={(props) => <VideoModule {...props} videoSrc="/videos/video0.1.mp4" />} nextPath="annotation" />} />
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
              <Route path="landing" element={<LandingPage />} />
              <Route path="video" element={<StepWrapper component={(props) => <VideoModule {...props} videoSrc="/videos/video0.2.mp4" />} nextPath="annotation" />} />
              <Route path="annotation" element={<FinalStepWrapper component={AITrial} />} />
            </Route>

            {/* Group 1 (was AI, now Control + Psych): Big5 -> IQ -> Video -> NoAI */}
            <Route path="group1">
              <Route path="landing" element={<LandingPage />} />
              <Route path="big5" element={<StepWrapper component={Big5Test} nextPath="iq" />} />
              <Route path="iq" element={<StepWrapper component={IQTest} nextPath="video" />} />
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
