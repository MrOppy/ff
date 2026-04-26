import { Link } from 'react-router-dom';
import { Facebook, Instagram, Youtube } from 'lucide-react';
import WhatsAppIcon from './WhatsAppIcon';
import { useLanguage } from '../context/LanguageContext';

export default function Footer() {
    const { t } = useLanguage();

    return (
        <footer className="bg-gaming-900 border-t border-gaming-700 pt-16 pb-24 md:pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-1">
                        <Link to="/" className="flex items-center gap-2 mb-4">
                            <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                            <span className="font-heading font-bold text-2xl tracking-wider uppercase">
                                <span className="text-white">FF</span><span className="text-gaming-accent">MARKET</span><span className="text-white">BD</span>
                            </span>
                        </Link>
                        <p className="text-gaming-muted text-sm leading-relaxed mb-6">
                            {t['footer_brand_desc']}
                        </p>
                        <div className="flex space-x-4">
                            <a href="https://wa.me/8801764696964" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gaming-800 flex items-center justify-center text-emerald-500 hover:text-emerald-400 hover:bg-gaming-700 transition-all shadow-[0_0_10px_rgba(16,185,129,0.1)] hover:shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                                <WhatsAppIcon className="w-5 h-5" />
                            </a>
                            <a href="https://www.facebook.com/mroppy69" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gaming-800 flex items-center justify-center text-blue-500 hover:text-blue-400 hover:bg-gaming-700 transition-all shadow-[0_0_10px_rgba(59,130,246,0.1)] hover:shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                                <Facebook className="w-5 h-5" />
                            </a>
                            <a href="https://www.instagram.com/mroppy21" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gaming-800 flex items-center justify-center text-pink-500 hover:text-pink-400 hover:bg-gaming-700 transition-all shadow-[0_0_10px_rgba(236,72,153,0.1)] hover:shadow-[0_0_15px_rgba(236,72,153,0.3)]">
                                <Instagram className="w-5 h-5" />
                            </a>
                            <a href="https://www.youtube.com/@mroppy" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gaming-800 flex items-center justify-center text-red-500 hover:text-red-400 hover:bg-gaming-700 transition-all shadow-[0_0_10px_rgba(239,68,68,0.1)] hover:shadow-[0_0_15px_rgba(239,68,68,0.3)]">
                                <Youtube className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-white font-heading font-bold text-lg mb-4 uppercase tracking-wide">{t['footer_quick_links']}</h3>
                        <ul className="space-y-3">
                            <li><Link to="/shop" className="text-gaming-muted hover:text-gaming-accent transition-colors text-sm">{t['footer_shop']}</Link></li>
                            <li><Link to="/trusted-admins" className="text-gaming-muted hover:text-gaming-accent transition-colors text-sm">{t['footer_trusted']}</Link></li>
                            <li><Link to="/about" className="text-gaming-muted hover:text-gaming-accent transition-colors text-sm">{t['footer_about']}</Link></li>
                            <li><Link to="/contact" className="text-gaming-muted hover:text-gaming-accent transition-colors text-sm">{t['footer_contact']}</Link></li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h3 className="text-white font-heading font-bold text-lg mb-4 uppercase tracking-wide">{t['footer_legal']}</h3>
                        <ul className="space-y-3">
                            <li><Link to="/terms" className="text-gaming-muted hover:text-gaming-accent transition-colors text-sm">{t['footer_terms']}</Link></li>
                            <li><Link to="/privacy" className="text-gaming-muted hover:text-gaming-accent transition-colors text-sm">{t['footer_privacy']}</Link></li>
                            <li><Link to="/refund" className="text-gaming-muted hover:text-gaming-accent transition-colors text-sm">{t['footer_refund']}</Link></li>
                            <li><Link to="/middleman-rules" className="text-gaming-muted hover:text-gaming-accent transition-colors text-sm">{t['footer_middleman']}</Link></li>
                        </ul>
                    </div>

                </div>
            </div>

            <div className="pt-8 border-t border-gaming-700 text-center flex flex-col md:flex-row justify-between items-center text-sm text-gaming-muted">
                <p>&copy; {new Date().getFullYear()} FF MARKET BD. All rights reserved.</p>
                <p className="mt-2 md:mt-0">Developed by <a href="https://www.facebook.com/mroppy69" target="_blank" rel="noopener noreferrer" className="text-gaming-accent hover:underline font-bold">MR. OPPY</a></p>
            </div>
        </footer>
    );
}
