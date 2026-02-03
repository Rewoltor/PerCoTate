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

// ... imports
// ... interface

export const DemographicsForm: React.FC<DemographicsFormProps> = ({ onComplete }) => {
    const { user, refreshUser } = useAuth();
    const [formData, setFormData] = useState<Partial<Demographics>>({
        gender: '',
        school: '',
        residence: '',
        healthcareQualification: '',
    });
    const [ageInput, setAgeInput] = useState('');
    const [ageTouched, setAgeTouched] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [showErrors, setShowErrors] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setShowErrors(true);

        const ageNum = parseInt(ageInput, 10);
        const isAgeValid = !isNaN(ageNum) && ageNum >= 12 && ageNum <= 99;

        const isValid = user &&
            formData.gender &&
            formData.school &&
            formData.residence &&
            formData.healthcareQualification &&
            isAgeValid &&
            termsAccepted;

        if (!isValid) return;

        setSubmitting(true);
        try {
            const demographics: Demographics = {
                age: ageNum,
                gender: formData.gender!,
                school: formData.school!,
                residence: formData.residence!,
                healthcareQualification: formData.healthcareQualification!,
                experienceLevel: formData.healthcareQualification // duplicate for compat
            };

            await setDoc(doc(db, CONFIG.COLLECTIONS.PARTICIPANTS, user.userID), {
                demographics
            }, { merge: true });

            await refreshUser();
            onComplete();
        } catch (err) {
            console.error("Error saving demographics:", err);
            alert("Hiba történt a mentéskor.");
        } finally {
            setSubmitting(false);
        }
    };

    // Helper for render logic
    const isAgeValid = !isNaN(parseInt(ageInput, 10)) && parseInt(ageInput, 10) >= 12 && parseInt(ageInput, 10) <= 99;

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <Card title="Demográfiai Adatok" className="max-w-lg w-full">
                <form onSubmit={handleSubmit} className="space-y-6" noValidate>

                    {/* Age */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Kor</label>
                        <input
                            type="number"
                            value={ageInput}
                            onChange={(e) => {
                                const val = e.target.value;
                                if (val.length > 2) return;
                                setAgeInput(val);
                            }}
                            onBlur={() => setAgeTouched(true)}
                            className={`w-full p-4 rounded-xl border-2 outline-none transition-all text-lg ${(showErrors || ageTouched) && ageInput !== '' && !isAgeValid
                                ? 'border-red-500 bg-red-50 ring-1 ring-red-500'
                                : 'border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                                }`}
                            placeholder="pl. 24"
                            required
                            min="12"
                            max="99"
                            disabled={submitting}
                        />
                        {(showErrors || ageTouched) && ageInput !== '' && !isAgeValid && (
                            <p className="text-red-600 text-sm mt-2 animate-in slide-in-from-top-1 font-medium">
                                ⚠️ Kérjük, adjon meg egy 12 és 99 év közötti értéket.
                            </p>
                        )}
                    </div>

                    {/* Gender */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Nem</label>
                        <select
                            value={formData.gender}
                            onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                            className={`w-full p-4 rounded-xl border-2 outline-none transition-all text-lg bg-white ${showErrors && !formData.gender
                                ? 'border-red-500 bg-red-50 ring-1 ring-red-500'
                                : 'border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                                }`}
                            required
                            disabled={submitting}
                        >
                            <option value="">-- Válasszon --</option>
                            <option value="male">Férfi</option>
                            <option value="female">Nő</option>
                        </select>
                    </div>

                    {/* School - New Dropdown */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Legmagasabb iskolai végzettség vagy amibe jársz</label>
                        <select
                            value={formData.school}
                            onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                            className={`w-full p-4 rounded-xl border-2 outline-none transition-all text-lg bg-white ${showErrors && !formData.school
                                ? 'border-red-500 bg-red-50 ring-1 ring-red-500'
                                : 'border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                                }`}
                            required
                            disabled={submitting}
                        >
                            <option value="">-- Válasszon --</option>
                            <option value="primary">Általános iskola</option>
                            <option value="secondary">Középiskola</option>
                            <option value="university">Egyetem</option>
                        </select>
                    </div>

                    {/* Residence - New Field */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Lakhely</label>
                        <select
                            value={formData.residence}
                            onChange={(e) => setFormData({ ...formData, residence: e.target.value })}
                            className={`w-full p-4 rounded-xl border-2 outline-none transition-all text-lg bg-white ${showErrors && !formData.residence
                                ? 'border-red-500 bg-red-50 ring-1 ring-red-500'
                                : 'border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                                }`}
                            required
                            disabled={submitting}
                        >
                            <option value="">-- Válasszon --</option>
                            <option value="budapest">Budapest</option>
                            <option value="city">Város</option>
                            <option value="village">Falu</option>
                        </select>
                    </div>

                    {/* Healthcare Qualification - Updated Order */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Egészségügyi Végzettség</label>
                        <select
                            value={formData.healthcareQualification}
                            onChange={(e) => setFormData({ ...formData, healthcareQualification: e.target.value })}
                            className={`w-full p-4 rounded-xl border-2 outline-none transition-all text-lg bg-white ${showErrors && !formData.healthcareQualification
                                ? 'border-red-500 bg-red-50 ring-1 ring-red-500'
                                : 'border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                                }`}
                            required
                            disabled={submitting}
                        >
                            <option value="">-- Válasszon --</option>
                            <option value="none">Nincsen</option>
                            <option value="yes">Van</option>
                        </select>
                    </div>

                    {/* Terms Checkbox */}
                    <div className={`flex items-center gap-3 p-4 rounded-xl transition-all ${showErrors && !termsAccepted
                        ? 'border-2 border-red-500 bg-red-50'
                        : ''
                        }`}>
                        <input
                            type="checkbox"
                            id="terms"
                            checked={termsAccepted}
                            onChange={(e) => setTermsAccepted(e.target.checked)}
                            className="w-5 h-5 accent-blue-600 cursor-pointer shrink-0"
                        />
                        <label htmlFor="terms" className="text-sm text-gray-700 cursor-pointer select-none font-medium">
                            Megismertem és elfogadom az <a href="/DataProtection.pdf" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline font-semibold hover:text-blue-800" onClick={(e) => e.stopPropagation()}>adatkezelési tájékoztatót</a>.
                        </label>
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
        </div >
    );
};
