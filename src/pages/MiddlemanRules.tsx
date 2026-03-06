import { ShieldCheck, Handshake, Clock, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function MiddlemanRules() {
    const { t } = useLanguage();

    return (
        <div className="pt-24 pb-16 min-h-screen bg-gaming-900">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-heading font-extrabold text-white mb-4">
                        {t['mm_title_1']}<span className="text-gaming-accent">{t['mm_title_2']}</span>
                    </h1>
                    <p className="text-xl text-gaming-muted max-w-2xl mx-auto">
                        {t['mm_desc']}
                    </p>
                </div>

                <div className="space-y-8">
                    {/* Standard Deal Process */}
                    <div className="bg-gaming-800 border border-gaming-700 rounded-2xl p-8 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl" />
                        <div className="flex items-start gap-4 mb-6">
                            <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400 shrink-0">
                                <Handshake className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-2">{t['mm_deal_title']}</h2>
                                <p className="text-gaming-muted leading-relaxed">
                                    {t['mm_deal_desc']}
                                </p>
                                <ol className="mt-4 space-y-3 text-gray-300 list-decimal list-inside marker:text-gaming-accent marker:font-bold">
                                    <li>{t['mm_deal_li1']}</li>
                                    <li>{t['mm_deal_li2']}</li>
                                    <li>{t['mm_deal_li3']}</li>
                                </ol>
                            </div>
                        </div>
                    </div>

                    {/* Middleman Fee */}
                    <div className="bg-gaming-800 border border-gaming-700 rounded-2xl p-8 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl" />
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-400 shrink-0">
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-2">{t['mm_fee_title']}</h2>
                                <p className="text-gray-300 leading-relaxed">
                                    {t['mm_fee_desc']}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Hold Deal Policy */}
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-8 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl" />
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center text-amber-500 shrink-0">
                                <Clock className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-amber-500 mb-2">{t['mm_hold_title']}</h2>
                                <p className="text-amber-100/80 leading-relaxed mb-4">
                                    {t['mm_hold_desc']}
                                </p>
                                <ul className="space-y-2 text-amber-100/70 list-disc list-inside marker:text-amber-500">
                                    <li>{t['mm_hold_li1']}</li>
                                    <li>{t['mm_hold_li2']}</li>
                                    <li>{t['mm_hold_li3']}</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-center gap-4 text-center sm:text-left mt-8">
                        <AlertTriangle className="w-8 h-8 text-red-500 shrink-0" />
                        <p className="text-red-200 text-sm font-bold tracking-wide uppercase">
                            {t['mm_warning']}
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
}
