// ============================================================
// RADIOLOGIST MODULE — SELF-CONTAINED ROUTING
// Wraps all radiologist pages in RadiologistAuthProvider.
// Does NOT use PrivateRoute, PhaseGuard, or AuthProvider from main app.
// ============================================================

import React from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { RadiologistAuthProvider } from './contexts/RadiologistAuthContext';
import { RadiologistLanding } from './pages/RadiologistLanding';
import { RadiologistDemographicsForm } from './components/RadiologistDemographicsForm';
import { RadiologistInstructions } from './pages/RadiologistInstructions';
import { RadiologistAnnotation } from './components/RadiologistAnnotation';
import { RadiologistCompletion } from './pages/RadiologistCompletion';

// Step wrapper — navigates to next path on completion
const StepWrapper = ({ component: Component, nextPath }: { component: React.FC<{ onComplete: () => void }>, nextPath: string }) => {
    const navigate = useNavigate();
    return <Component onComplete={() => navigate(nextPath)} />;
};

export const RadiologistRoutes: React.FC = () => {
    return (
        <RadiologistAuthProvider>
            <Routes>
                {/* Landing page with login/register */}
                <Route path="/" element={<RadiologistLanding />} />

                {/* Demographics form */}
                <Route path="/demographics" element={
                    <StepWrapper component={RadiologistDemographicsForm} nextPath="/radiology/instructions" />
                } />

                {/* Instructions before annotation */}
                <Route path="/instructions" element={
                    <StepWrapper component={RadiologistInstructions} nextPath="/radiology/annotation" />
                } />

                {/* Annotation screen */}
                <Route path="/annotation" element={
                    <StepWrapper component={RadiologistAnnotation} nextPath="/radiology/complete" />
                } />

                {/* Completion screen */}
                <Route path="/complete" element={<RadiologistCompletion />} />

                {/* Catch-all */}
                <Route path="*" element={<Navigate to="/radiology" replace />} />
            </Routes>
        </RadiologistAuthProvider>
    );
};
