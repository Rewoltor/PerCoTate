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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !formData.gender || !formData.school || !formData.residence || !formData.healthcareQualification || !ageInput) return;

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
                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Age */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Kor</label>
                        <input
                            type="number"
                            value={ageInput}
                            onChange={(e) => setAgeInput(e.target.value)}
                            className="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-lg"
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

                    {/* School - New Dropdown */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Iskolai végzettség vagy amibe jársz</label>
                        <select
                            value={formData.school}
                            onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                            className="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-lg bg-white"
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
                            className="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-lg bg-white"
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
                            className="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-lg bg-white"
                            required
                            disabled={submitting}
                        >
                            <option value="">-- Válasszon --</option>
                            <option value="none">Nincsen semmilyen</option>
                            <option value="student_1-3">Orvostanhallgató (1-3. év)</option>
                            <option value="student_4-6">Orvostanhallgató (4-6. év)</option>
                            <option value="resident">Rezidens</option>
                            <option value="specialist">Szakorvos</option>
                            <option value="other">Egyéb</option>
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
