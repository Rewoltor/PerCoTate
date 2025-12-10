import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useEffect } from 'react';

export const useStudyNavigation = () => {
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (loading) return;

        if (!user) {
            navigate('/');
            return;
        }



        // Construct the base path: /phaseX/groupY/landing
        // Example: /phase1/group0/landing


        // We can add logic here to jump to specific steps if we tracked them granularly
        // For now, default to landing page of the current phase flow
        // navigate(`${basePath}/landing`); 
        // Note: Automatic navigation usually happens on Login/Home. 
        // If this hook is used on a protected route, it might cause loops if not careful.
        // Better usage: A function 'navigateToNextStep'

    }, [user, loading, navigate]);

    const navigateToNext = () => {
        if (!user) return;
        const { treatmentGroup, currentPhase } = user;
        // Logic to determine sub-step (Landing -> Test -> Annotation)
        // For now, let's just return the root of the phase for the router to handle?
        // Or hardcode the flow?
        // Flow is: Landing -> Demographics -> ... -> Annotation

        // Let's rely on manual navigation buttons in components for now, 
        // but provide the 'landing' target helper.
        return `/${currentPhase}/group${treatmentGroup}/landing`;
    };

    return { navigateToNext };
};
