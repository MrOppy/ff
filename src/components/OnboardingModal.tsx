import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { userService } from '../services/userService';
import CountrySelect, { COUNTRY_CODES } from './CountrySelect';

export default function OnboardingModal() {
    const { profile, updateProfile, user } = useAuth();
    const { t } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [countryCode, setCountryCode] = useState('+880');
    const [whatsapp, setWhatsapp] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (profile && profile.hasCompletedOnboarding === false) {
            setIsOpen(true);
            setName(profile.displayName || '');
            setUsername(profile.username || '');
            // Try to split existing whatsapp number into country code and local number if possible
            if (profile.whatsappNumber) {
                let foundCode = '+880';
                let extractedNum = profile.whatsappNumber;
                
                // Sort by length descending to match longest prefix first (e.g., +977 before +9)
                const sortedCodes = [...COUNTRY_CODES].sort((a, b) => b.code.length - a.code.length);
                
                for (const cc of sortedCodes) {
                    if (profile.whatsappNumber.startsWith(cc.code)) {
                        foundCode = cc.code;
                        extractedNum = profile.whatsappNumber.substring(cc.code.length);
                        break;
                    }
                }
                
                setCountryCode(foundCode);
                setWhatsapp(extractedNum);
            } else {
                setWhatsapp('');
            }
        } else {
            setIsOpen(false);
        }
    }, [profile]);

    if (!isOpen || !profile) return null;

    const handleSave = async () => {
        if (!user) return;
        setError('');
        setSaving(true);
        
        try {
            if (!name.trim()) {
                throw new Error(t['ob_err_name'] || "Name is required.");
            }
            if (!username.trim()) {
                throw new Error(t['ob_err_user'] || "Username is required.");
            }
            if (!/^[a-zA-Z0-9_]+$/.test(username)) {
                throw new Error(t['ob_err_user_char'] || "Username can only contain letters, numbers, and underscores.");
            }

            // Check if username changed and is taken
            if (profile.username !== username) {
                const isTaken = await userService.isUsernameTaken(username, user.uid);
                if (isTaken) {
                    throw new Error(t['ob_err_user_taken'] || "Username is already taken. Please choose another.");
                }
            }

            let finalWhatsapp = null;
            if (whatsapp.trim()) {
                let localNum = whatsapp.trim();
                // If Bangladesh and starts with 01, remove the 0
                if (countryCode === '+880' && localNum.startsWith('01')) {
                    localNum = localNum.substring(1);
                }
                // Also remove any leading zeros if they typed country code then 0? 
                // Just stick to the requirement: if Bangladesh and starts with 01, ignore 0.
                finalWhatsapp = `${countryCode}${localNum}`;
            }

            await updateProfile({
                displayName: name.trim(),
                username: username.trim(),
                whatsappNumber: finalWhatsapp,
                hasCompletedOnboarding: true,
                ...(finalWhatsapp && profile.role === 'user' ? { role: 'seller' } : {})
            });
            
            setIsOpen(false);
        } catch (err: any) {
            setError(err.message || t['ob_err_save'] || "Failed to save profile.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-gaming-800/90 backdrop-blur-xl border border-white/10 rounded-2xl w-full max-w-md shadow-[0_0_40px_rgba(16,185,129,0.15)]">
                <div className="p-6">
                    <h2 className="text-2xl font-bold text-white mb-2">{t['ob_welcome_title'] || 'Welcome to the Platform!'}</h2>
                    <p className="text-gaming-muted mb-6 text-sm">{t['ob_welcome_desc'] || 'Please complete your profile to continue. Adding a WhatsApp number automatically grants you seller privileges.'}</p>

                    {error && (
                        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm text-gaming-muted mb-1">{t['ob_label_name'] || 'Display Name *'}</label>
                            <input
                                value={name} onChange={e => setName(e.target.value)}
                                className="glass-input w-full"
                                placeholder="Your Name"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm text-gaming-muted mb-1">{t['ob_label_user'] || 'Username *'}</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="text-gaming-muted">@</span>
                                </div>
                                <input
                                    value={username} onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                                    className="glass-input w-full pl-8"
                                    placeholder="unique_username"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm text-gaming-muted mb-1">{t['ob_label_wa'] || 'WhatsApp Number (Optional)'}</label>
                            <div className="flex gap-2">
                                <CountrySelect
                                    value={countryCode}
                                    onChange={setCountryCode}
                                />
                                <input
                                    value={whatsapp} onChange={e => setWhatsapp(e.target.value.replace(/[^0-9]/g, ''))}
                                    className="glass-input flex-1"
                                    placeholder="1764696964"
                                />
                            </div>
                            <p className="text-xs text-gaming-muted mt-1">{t['ob_wa_desc'] || 'If you want to sell items, you must provide a WhatsApp number so buyers can contact you.'}</p>
                        </div>
                    </div>

                    <button 
                        onClick={handleSave} 
                        disabled={saving}
                        className="btn-primary w-full mt-6 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                    >
                        {saving ? (t['ob_btn_saving'] || 'Saving...') : (t['ob_btn_complete'] || 'Complete Setup')}
                    </button>
                </div>
            </div>
        </div>
    );
}
