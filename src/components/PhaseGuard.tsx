import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { Phase } from '../types';

interface PhaseGuardProps {
    children: React.ReactNode;
    requiredPhase: Phase;
}

export const PhaseGuard: React.FC<PhaseGuardProps> = ({ children, requiredPhase }) => {
    const { user, loading } = useAuth();

    if (loading) return <div>Loading...</div>;

    if (!user) {
        return <Navigate to="/" replace />;
    }

    // Strict Phase Checking
    if (user.currentPhase !== requiredPhase) {
        // Handle completed states explicitly
        if (user.currentPhase === 'phase1_completed' || user.currentPhase === 'phase2_completed') {
            return <Navigate to="/completion" replace />;
        }

        // Redirect to their actual phase
        // e.g., if accessing phase2 but in phase1, go to phase1 landing
        return <Navigate to={`/${user.currentPhase}/group${user.treatmentGroup}/landing`} replace />;
    }

    return <>{children}</>;
};
