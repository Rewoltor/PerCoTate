import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { CONFIG } from '../../config';

export const DebugChip: React.FC = () => {
    const { user } = useAuth();

    // Don't render if debug mode is disabled or no user
    if (!CONFIG.IS_DEBUG_MODE || !user) {
        return null;
    }

    return (
        <div
            style={{
                position: 'fixed',
                top: '12px',
                left: '12px',
                zIndex: 9999,
                padding: '8px 12px',
                backgroundColor: 'rgba(59, 130, 246, 0.9)',
                color: 'white',
                borderRadius: '8px',
                fontSize: '12px',
                fontFamily: 'monospace',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
            }}
        >
            <div style={{ fontWeight: 'bold', fontSize: '10px', opacity: 0.8 }}>DEBUG MODE</div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span>Phase:</span>
                <span style={{ fontWeight: 'bold' }}>{user.currentPhase}</span>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span>ID:</span>
                <span style={{ fontWeight: 'bold' }}>{user.userID}</span>
            </div>
        </div>
    );
};
