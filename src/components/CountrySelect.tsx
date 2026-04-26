import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X } from 'lucide-react';

export const COUNTRY_CODES = [
    { code: '+880', iso: 'bd', label: '+880 (Bangladesh)' },
    { code: '+91', iso: 'in', label: '+91 (India)' },
    { code: '+92', iso: 'pk', label: '+92 (Pakistan)' },
    { code: '+977', iso: 'np', label: '+977 (Nepal)' },
    { code: '+62', iso: 'id', label: '+62 (Indonesia)' },
    { code: '+84', iso: 'vn', label: '+84 (Vietnam)' },
    { code: '+66', iso: 'th', label: '+66 (Thailand)' },
    { code: '+60', iso: 'my', label: '+60 (Malaysia)' },
    { code: '+63', iso: 'ph', label: '+63 (Philippines)' },
    { code: '+65', iso: 'sg', label: '+65 (Singapore)' },
    { code: '+55', iso: 'br', label: '+55 (Brazil)' },
    { code: '+52', iso: 'mx', label: '+52 (Mexico)' },
    { code: '+57', iso: 'co', label: '+57 (Colombia)' },
    { code: '+20', iso: 'eg', label: '+20 (Egypt)' },
    { code: '+1', iso: 'us', label: '+1 (USA)' }
];

interface CountrySelectProps {
    value: string;
    onChange: (code: string) => void;
}

export default function CountrySelect({ value, onChange }: CountrySelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const selectedCountry = COUNTRY_CODES.find(c => c.code === value) || COUNTRY_CODES[0];

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="glass-input h-full flex items-center justify-between gap-2 bg-gaming-900 border-white/5 focus:border-gaming-accent hover:border-gaming-accent/50 transition-colors w-[140px] px-3 shadow-inner"
            >
                <div className="flex items-center gap-2 overflow-hidden">
                    <img 
                        src={`https://flagcdn.com/w20/${selectedCountry.iso}.png`} 
                        alt={selectedCountry.iso}
                        className="w-5 h-auto rounded-[2px]"
                    />
                    <span className="text-sm text-white truncate">{selectedCountry.code}</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-gaming-muted transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <>
                    {/* Mobile Backdrop */}
                    <div 
                        className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm sm:hidden" 
                        onClick={() => setIsOpen(false)}
                    />
                    
                    {/* Dropdown Container */}
                    <div className="fixed inset-x-0 bottom-0 z-[110] sm:absolute sm:inset-x-auto sm:bottom-auto sm:top-full sm:left-0 sm:mt-2 w-full sm:w-[220px] max-h-[60vh] sm:max-h-[280px] overflow-y-auto overscroll-contain custom-scrollbar bg-gaming-800/95 backdrop-blur-xl border-t sm:border border-white/10 rounded-t-3xl sm:rounded-xl shadow-[0_-10px_50px_rgba(0,0,0,0.8)] sm:shadow-[0_10px_40px_rgba(16,185,129,0.15)] pb-safe sm:pb-0 ring-1 ring-white/5 sm:ring-0">
                        {/* Mobile Header */}
                        <div className="sticky top-0 bg-gaming-800/95 backdrop-blur-xl px-5 py-4 border-b border-white/5 sm:hidden z-10 flex justify-between items-center rounded-t-3xl">
                            <span className="text-white font-bold text-sm">Select Country</span>
                            <button type="button" onClick={() => setIsOpen(false)} className="text-gaming-muted hover:text-white p-1">
                               <X className="w-5 h-5"/>
                            </button>
                        </div>
                        
                        <div className="py-2 pb-12 sm:pb-0 sm:py-0">
                            {COUNTRY_CODES.map((country) => (
                                <button
                                    key={country.code}
                                    type="button"
                                    onClick={() => {
                                        onChange(country.code);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full flex items-center gap-3 px-4 sm:px-3 py-3.5 sm:py-2.5 text-left text-sm hover:bg-gaming-700 transition-colors ${
                                        value === country.code ? 'bg-gaming-700/50 text-gaming-accent font-bold' : 'text-gray-300'
                                    }`}
                                >
                                    <img 
                                        src={`https://flagcdn.com/w20/${country.iso}.png`} 
                                        alt={country.iso}
                                        className="w-5 h-auto rounded-[2px] shadow-sm"
                                    />
                                    <span>{country.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
