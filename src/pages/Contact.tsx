import { Facebook, Instagram, Youtube, User } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function Contact() {
    const { t } = useLanguage();

    return (
        <div className="pt-24 pb-16 min-h-screen bg-gaming-900">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-gaming-800 border border-gaming-700 rounded-2xl p-8 md:p-12 text-center shadow-lg relative overflow-hidden">
                    <div className="w-20 h-20 mx-auto bg-gaming-900 border border-gaming-700 rounded-full flex items-center justify-center mb-6">
                        <User className="w-8 h-8 text-gaming-muted" />
                    </div>

                    <h1 className="text-3xl font-heading font-bold text-white mb-4">
                        {t['contact_title_1']}<span className="text-gaming-accent">{t['contact_title_2']}</span>
                    </h1>

                    <p className="text-xl text-gaming-muted max-w-xl mx-auto mb-10 leading-relaxed">
                        {t['contact_desc']}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <a
                            href="https://wa.me/8801764696964"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-4 bg-gaming-900 border border-gaming-700 p-4 rounded-lg hover:bg-gaming-700 transition-colors"
                        >
                            <div className="w-10 h-10 bg-emerald-500/10 rounded flex items-center justify-center text-emerald-400 flex-shrink-0">
                                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                            </div>
                            <div className="text-left">
                                <p className="text-sm text-emerald-400 font-bold mb-1 uppercase tracking-wide">{t['contact_wa']}</p>
                                <p className="text-white font-medium">+880 1764-696964</p>
                            </div>
                        </a>

                        <a
                            href="https://www.facebook.com/mroppy69"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-4 bg-gaming-900 border border-gaming-700 p-4 rounded-lg hover:bg-gaming-700 transition-colors"
                        >
                            <div className="w-10 h-10 bg-blue-500/10 rounded flex items-center justify-center text-blue-400 flex-shrink-0">
                                <Facebook className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                                <p className="text-sm text-blue-400 font-bold mb-1 uppercase tracking-wide">{t['contact_fb']}</p>
                                <p className="text-white font-medium">@mroppy69</p>
                            </div>
                        </a>

                        <a
                            href="https://www.instagram.com/mroppy21"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-4 bg-gaming-900 border border-gaming-700 p-4 rounded-lg hover:bg-gaming-700 transition-colors"
                        >
                            <div className="w-10 h-10 bg-pink-500/10 rounded flex items-center justify-center text-pink-400 flex-shrink-0">
                                <Instagram className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                                <p className="text-sm text-pink-400 font-bold mb-1 uppercase tracking-wide">{t['contact_ig']}</p>
                                <p className="text-white font-medium">@mroppy21</p>
                            </div>
                        </a>

                        <a
                            href="https://www.youtube.com/@mroppy"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-4 bg-gaming-900 border border-gaming-700 p-4 rounded-lg hover:bg-gaming-700 transition-colors"
                        >
                            <div className="w-10 h-10 bg-red-500/10 rounded flex items-center justify-center text-red-500 flex-shrink-0">
                                <Youtube className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                                <p className="text-sm text-red-400 font-bold mb-1 uppercase tracking-wide">{t['contact_yt']}</p>
                                <p className="text-white font-medium">@mroppy</p>
                            </div>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
