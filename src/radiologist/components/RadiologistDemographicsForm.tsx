import React, { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { RADIO_CONFIG } from '../config';
import { useRadiologistAuth } from '../contexts/RadiologistAuthContext';
import type { RadiologistDemographics } from '../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

interface RadiologistDemographicsFormProps {
    onComplete: () => void;
}

const PROFESSION_OPTIONS = [
    'Radiológus',
    'Ortopéd szakorvos',
    'Reumatológus',
    'Gyermekgyógyász',
    'Belgyógyász',
    'Háziorvos',
    'Egyéb',
];

export const RadiologistDemographicsForm: React.FC<RadiologistDemographicsFormProps> = ({ onComplete }) => {
    const { user, refreshUser } = useRadiologistAuth();
    const [saving, setSaving] = useState(false);

    const [age, setAge] = useState<string>('');
    const [residence, setResidence] = useState('');
    const [yearsOfExperience, setYearsOfExperience] = useState<string>('');
    const [profession, setProfession] = useState('');
    const [customProfession, setCustomProfession] = useState('');

    const effectiveProfession = profession === 'Egyéb' ? customProfession : profession;
    const canSubmit = age && residence && yearsOfExperience && effectiveProfession;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !canSubmit) return;

        setSaving(true);
        try {
            const demographics: RadiologistDemographics = {
                age: parseInt(age),
                residence,
                yearsOfExperience: parseInt(yearsOfExperience),
                profession: effectiveProfession,
            };

            const userRef = doc(db, RADIO_CONFIG.COLLECTIONS.RADIO_PARTICIPANTS, user.radId);
            await setDoc(userRef, { demographics }, { merge: true });
            await refreshUser();
            onComplete();
        } catch (err) {
            console.error("[RadioDemographics] Error saving:", err);
            alert("Hiba történt a mentéskor.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-lg p-8 border-t-4 border-teal-500">
                <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">Szakmai Adatok</h1>
                <p className="text-gray-500 text-sm text-center mb-8">
                    Kérjük, adja meg az alábbi információkat a kutatás céljából.
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Age */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Kor</label>
                        <input
                            type="number"
                            value={age}
                            onChange={(e) => setAge(e.target.value)}
                            min="20"
                            max="80"
                            className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-all"
                            placeholder="pl. 35"
                            required
                        />
                    </div>

                    {/* Residence */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Lakhely</label>
                        <input
                            type="text"
                            value={residence}
                            onChange={(e) => setResidence(e.target.value)}
                            className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-all"
                            placeholder="pl. Budapest"
                            required
                        />
                    </div>

                    {/* Years of Experience */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Szakmai tapasztalat (év)</label>
                        <input
                            type="number"
                            value={yearsOfExperience}
                            onChange={(e) => setYearsOfExperience(e.target.value)}
                            min="0"
                            max="60"
                            className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-all"
                            placeholder="pl. 10"
                            required
                        />
                    </div>

                    {/* Profession */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Szakma</label>
                        <select
                            value={profession}
                            onChange={(e) => setProfession(e.target.value)}
                            className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-all bg-white"
                            required
                        >
                            <option value="" disabled>Válasszon...</option>
                            {PROFESSION_OPTIONS.map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                            ))}
                        </select>

                        {profession === 'Egyéb' && (
                            <input
                                type="text"
                                value={customProfession}
                                onChange={(e) => setCustomProfession(e.target.value)}
                                className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-all mt-3"
                                placeholder="Kérjük, adja meg a szakmáját"
                                required
                            />
                        )}
                    </div>

                    <Button
                        type="submit"
                        className="w-full bg-teal-600 hover:bg-teal-700"
                        isLoading={saving}
                        disabled={!canSubmit}
                    >
                        Tovább →
                    </Button>
                </form>
            </Card>
        </div>
    );
};
