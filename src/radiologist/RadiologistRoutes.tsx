// ============================================================
// RADIOLOGIST MODULE — SELF-CONTAINED ROUTING
// Wraps all radiologist pages in RadiologistAuthProvider.
// Does NOT use PrivateRoute, PhaseGuard, or AuthProvider from main app.
// ============================================================

import React from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { RadiologistAuthProvider, useRadiologistAuth } from './contexts/RadiologistAuthContext';
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

// Route guard — redirects to landing if no session exists
const RequireSession: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useRadiologistAuth();
    if (!user) return <Navigate to="/radiology" replace />;
    return <>{children}</>;
};

export const RadiologistRoutes: React.FC = () => {
    return (
        <RadiologistAuthProvider>
            <Routes>
                {/* Landing page — start session */}
                <Route path="/" element={<RadiologistLanding />} />

                {/* Demographics form */}
                <Route path="/demographics" element={
                    <RequireSession>
                        <StepWrapper component={RadiologistDemographicsForm} nextPath="/radiology/instructions" />
                    </RequireSession>
                } />

                {/* Instructions before annotation */}
                <Route path="/instructions" element={
                    <RequireSession>
                        <StepWrapper component={RadiologistInstructions} nextPath="/radiology/annotation" />
                    </RequireSession>
                } />

                {/* Annotation screen */}
                <Route path="/annotation" element={
                    <RequireSession>
                        <StepWrapper component={RadiologistAnnotation} nextPath="/radiology/complete" />
                    </RequireSession>
                } />

                {/* Completion screen */}
                <Route path="/complete" element={
                    <RequireSession>
                        <RadiologistCompletion />
                    </RequireSession>
                } />

                {/* Catch-all */}
                <Route path="*" element={<Navigate to="/radiology" replace />} />
            </Routes>
        </RadiologistAuthProvider>
    );
};

