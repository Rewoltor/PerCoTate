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
    const [submitting, setSubmitting] = useState(false);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [showErrors, setShowErrors] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setShowErrors(true);

        const isValid = user &&
            formData.gender &&
            formData.school &&
            formData.residence &&
            formData.healthcareQualification &&
            ageInput &&
            termsAccepted;

        if (!isValid) return;

        setSubmitting(true);
        try {
            const demographics: Demographics = {
                age: parseInt(ageInput, 10),
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
    // ... rest of component

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
                            onChange={(e) => setAgeInput(e.target.value)}
                            className={`w-full p-4 rounded-xl border-2 outline-none transition-all text-lg ${showErrors && !ageInput
                                ? 'border-red-500 bg-red-50 ring-1 ring-red-500'
                                : 'border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                                }`}
                            placeholder="pl. 24"
                            required
                            min="18"
                            max="99"
                            disabled={submitting}
                        />
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
                        <label className="block text-sm font-bold text-gray-700 mb-2">Iskolai végzettség vagy amibe jársz</label>
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
                            <option value="none">Nincsen semmilyen</option>
                            <option value="student_4-6">Orvostanhallgató</option>
                            <option value="resident">Rezidens</option>
                            <option value="specialist">Szakorvos</option>
                            <option value="other">Egyéb egészségügyi végzettség</option>
                        </select>
                    </div>

                    {/* Terms Checkbox */}
                    <div className={`flex items-start gap-4 p-4 rounded-xl border-2 transition-all ${showErrors && !termsAccepted
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-200 hover:border-blue-200'
                        }`}>
                        <div className="flex items-start pt-1">
                            <input
                                type="checkbox"
                                id="terms"
                                checked={termsAccepted}
                                onChange={(e) => setTermsAccepted(e.target.checked)}
                                className="w-5 h-5 accent-blue-600 cursor-pointer"
                            />
                        </div>
                        <label htmlFor="terms" className="text-sm text-gray-700 cursor-pointer select-none leading-relaxed">
                            Megismertem és elfogadom a <a href="/terms.pdf" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline font-semibold hover:text-blue-800" onClick={(e) => e.stopPropagation()}>kutatási feltételeket</a>, valamint hozzájárulok az adataim névtelen, kutatási célú felhasználásához.
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
        </div>
    );
};
