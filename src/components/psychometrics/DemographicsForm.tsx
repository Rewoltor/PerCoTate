import React, { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { CONFIG } from '../../config';
import { useAuth } from '../../contexts/AuthContext';
import type { Demographics } from '../../types';

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
        <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
            <h2 className="text-2xl font-bold mb-6">Demográfiai Adatok</h2>
            <form onSubmit={handleSubmit} className="space-y-4">

                <div>
                    <label className="block mb-1 font-semibold">Életkor (Age)</label>
                    <input
                        type="number"
                        value={ageInput}
                        onChange={(e) => setAgeInput(e.target.value)}
                        className="w-full p-2 border rounded"
                        required
                        min="18"
                        max="99"
                    />
                </div>

                <div>
                    <label className="block mb-1 font-semibold">Nem (Gender)</label>
                    <select
                        value={formData.gender}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        className="w-full p-2 border rounded"
                        required
                    >
                        <option value="">-- Válasszon --</option>
                        <option value="male">Férfi</option>
                        <option value="female">Nő</option>
                        <option value="other">Egyéb</option>
                    </select>
                </div>

                <div>
                    <label className="block mb-1 font-semibold">Tapasztalat (Experience)</label>
                    <select
                        value={formData.experienceLevel}
                        onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value })}
                        className="w-full p-2 border rounded"
                        required
                    >
                        <option value="">-- Válasszon --</option>
                        <option value="student_1-3">Orvostanhallgató (1-3. év)</option>
                        <option value="student_4-6">Orvostanhallgató (4-6. év)</option>
                        <option value="resident">Rezidens</option>
                        <option value="specialist">Szakorvos</option>
                        <option value="other">Egyéb eü. dolgozó</option>
                    </select>
                </div>

                <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-blue-600 text-white py-2 rounded font-bold hover:bg-blue-700 disabled:opacity-50"
                >
                    {submitting ? 'Mentés...' : 'Tovább'}
                </button>
            </form>
        </div>
    );
};
