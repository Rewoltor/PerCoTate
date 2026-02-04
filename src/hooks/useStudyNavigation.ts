import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useEffect } from 'react';
import { getNextStep } from '../utils/navigation';

export const useStudyNavigation = () => {
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (loading) return;

        if (!user) {
            navigate('/');
            return;
        }

        // No automatic navigation in useEffect to avoid redirect loops
        // Navigation should be triggered explicitly via navigateToNext()

    }, [user, loading, navigate]);

    const navigateToNext = () => {
        if (!user) return;

        const nextStep = getNextStep(user);
        return `/${user.currentPhase}/group${user.treatmentGroup}/${nextStep}`;
    };

    return { navigateToNext };
};
