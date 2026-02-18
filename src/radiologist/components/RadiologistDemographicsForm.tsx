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

const WORKPLACE_OPTIONS = [
    'Magán',
    'Állami',
    'Egyetemi klinika',
];

const PROFESSION_OPTIONS = [
    'Radiológus',
    'Rezidens',
    'Ortopéd szakorvos',
    'Reumatológus',
    'Gyermekgyógyász',
    'Belgyógyász',
    'Háziorvos',
    'Nem vagyok orvos',
    'Egyéb',
];

export const RadiologistDemographicsForm: React.FC<RadiologistDemographicsFormProps> = ({ onComplete }) => {
    const { user, refreshUser } = useRadiologistAuth();
    const [saving, setSaving] = useState(false);

    const [age, setAge] = useState<string>('');
    const [workplaceType, setWorkplaceType] = useState('');
    const [yearsOfExperience, setYearsOfExperience] = useState<string>('');
    const [profession, setProfession] = useState('');
    const [customProfession, setCustomProfession] = useState('');
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [ageTouched, setAgeTouched] = useState(false);
    const [expTouched, setExpTouched] = useState(false);

    const effectiveProfession = profession === 'Egyéb' ? customProfession : profession;

    const ageNum = age ? parseInt(age) : null;
    const expNum = yearsOfExperience ? parseInt(yearsOfExperience) : null;
    const ageValid = ageNum !== null && ageNum >= 25 && ageNum <= 99;
    const expValid = expNum !== null && expNum >= 0 && expNum <= 60;

    const canSubmit = ageValid && workplaceType && expValid && effectiveProfession && acceptedTerms;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !canSubmit) return;

        setSaving(true);
        try {
            const demographics: RadiologistDemographics = {
                age: parseInt(age),
                workplaceType,
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
                            onChange={(e) => {
                                setAge(e.target.value);
                                if (ageTouched) setAgeTouched(false); // Reset touched on change to clear error immediately while typing
                            }}
                            onBlur={() => setAgeTouched(true)}
                            min="25"
                            max="99"
                            className={`w-full p-3 rounded-xl border-2 outline-none transition-all ${ageTouched && age && !ageValid
                                ? 'border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                                : 'border-gray-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500'
                                }`}
                            placeholder="pl. 35"
                            required
                        />
                        {ageTouched && age && !ageValid && (
                            <p className="text-red-500 text-xs mt-1">Kérjük, 25 és 99 közötti értéket adjon meg.</p>
                        )}
                    </div>

                    {/* Workplace Type */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Munkahely típusa</label>
                        <select
                            value={workplaceType}
                            onChange={(e) => setWorkplaceType(e.target.value)}
                            className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-all bg-white"
                            required
                        >
                            <option value="" disabled>Válasszon...</option>
                            {WORKPLACE_OPTIONS.map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                            ))}
                        </select>
                    </div>

                    {/* Years of Experience */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Szakmai tapasztalat (év)</label>
                        <input
                            type="number"
                            value={yearsOfExperience}
                            onChange={(e) => setYearsOfExperience(e.target.value)}
                            onBlur={() => setExpTouched(true)}
                            min="0"
                            max="60"
                            className={`w-full p-3 rounded-xl border-2 outline-none transition-all ${expTouched && yearsOfExperience && !expValid
                                ? 'border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                                : 'border-gray-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500'
                                }`}
                            placeholder="pl. 10"
                            required
                        />
                        {expTouched && yearsOfExperience && !expValid && (
                            <p className="text-red-500 text-xs mt-1">Kérjük, 0 és 60 közötti értéket adjon meg.</p>
                        )}
                    </div>

                    {/* Profession */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Szakterület</label>
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

                    {/* Terms & Data Protection */}
                    <div className="flex items-start gap-3">
                        <input
                            type="checkbox"
                            id="acceptTerms"
                            checked={acceptedTerms}
                            onChange={(e) => setAcceptedTerms(e.target.checked)}
                            className="mt-1 h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                        />
                        <label htmlFor="acceptTerms" className="text-sm text-gray-600 cursor-pointer">
                            Elolvastam és elfogadom az{' '}
                            <a
                                href="/radiologydataprotection.pdf"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-teal-600 hover:text-teal-800 underline underline-offset-2 font-medium"
                            >
                                adatvédelmi tájékoztatót
                            </a>.
                        </label>
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
