import React, { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { CONFIG } from '../../config';
import { useAuth } from '../../contexts/AuthContext';
import type { Demographics } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface DemographicsFormProps {
    onComplete: () => void;
}

export const DemographicsForm: React.FC<DemographicsFormProps> = ({ onComplete }) => {
    const { user } = useAuth();
    const [formData, setFormData] = useState<Partial<Demographics>>({
        gender: '',
        experienceLevel: ''
    });
    const [ageInput, setAgeInput] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !formData.gender || !formData.experienceLevel || !ageInput) return;

        setSubmitting(true);
        try {
            const demographics: Demographics = {
                age: parseInt(ageInput, 10),
                gender: formData.gender!,
                experienceLevel: formData.experienceLevel!
            };

            await setDoc(doc(db, CONFIG.COLLECTIONS.PARTICIPANTS, user.userID), {
                demographics
            }, { merge: true });

            onComplete();
        } catch (err) {
            console.error("Error saving demographics:", err);
            alert("Hiba történt a mentéskor.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <Card title="Demográfiai Adatok" className="max-w-lg w-full">
                <form onSubmit={handleSubmit} className="space-y-6">

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Életkor</label>
                        <input
                            type="number"
                            value={ageInput}
                            onChange={(e) => setAgeInput(e.target.value)}
                            className="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-lg"
                            required
                            min="18"
                            max="99"
                            disabled={submitting}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Nem</label>
                        <select
                            value={formData.gender}
                            onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                            className="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-lg bg-white"
                            required
                            disabled={submitting}
                        >
                            <option value="">-- Válasszon --</option>
                            <option value="male">Férfi</option>
                            <option value="female">Nő</option>
                            <option value="other">Egyéb</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Tapasztalat</label>
                        <select
                            value={formData.experienceLevel}
                            onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value })}
                            className="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-lg bg-white"
                            required
                            disabled={submitting}
                        >
                            <option value="">-- Válasszon --</option>
                            <option value="student_1-3">Orvostanhallgató (1-3. év)</option>
                            <option value="student_4-6">Orvostanhallgató (4-6. év)</option>
                            <option value="resident">Rezidens</option>
                            <option value="specialist">Szakorvos</option>
                            <option value="other">Egyéb eü. dolgozó</option>
                        </select>
                    </div>

                    <Button
                        type="submit"
                        className="w-full"
                        isLoading={submitting}
                    >
                        Tovább →
                    </Button>
                </form>
            </Card>
        </div>
    );
};
