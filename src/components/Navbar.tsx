import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, LogOut, Globe } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function Navbar() {
    const { user, isAdmin, signInWithGoogle, logout } = useAuth();
    const { language, setLanguage, t } = useLanguage();
    const [isScrolled, setIsScrolled] = useState(false);
    const { pathname } = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 20) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={`fixed top-0 left-0 right-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-gaming-900/95 backdrop-blur-lg border-b border-gaming-700 shadow-lg' : 'bg-transparent border-transparent pt-2'}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className={`flex justify-between items-center transition-all duration-300 ${isScrolled ? 'h-20' : 'h-24'}`}>

                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 group">
                        <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                        <span className="font-heading font-bold text-2xl tracking-wider uppercase">
                            <span className="text-white">FF</span><span className="text-gaming-accent">MARKET</span><span className="text-white">BD</span>
                        </span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link to="/" className={`transition-colors font-bold ${pathname === '/' ? 'text-gaming-accent' : 'text-gray-300 hover:text-white'}`}>{t['nav_home']}</Link>
                        <Link to="/shop" className={`transition-colors font-bold ${pathname.startsWith('/shop') ? 'text-gaming-accent' : 'text-gray-300 hover:text-white'}`}>{t['nav_shop']}</Link>
                        <Link to="/reviews" className={`transition-colors font-bold ${pathname.startsWith('/reviews') ? 'text-gaming-accent' : 'text-gray-300 hover:text-white'}`}>{t['nav_reviews']}</Link>
                        <Link to="/trusted-admins" className={`transition-colors font-bold ${pathname.startsWith('/trusted-admins') ? 'text-gaming-accent' : 'text-gray-300 hover:text-white'}`}>{t['nav_middleman']}</Link>
                        <Link to="/about" className={`transition-colors font-bold ${pathname.startsWith('/about') ? 'text-gaming-accent' : 'text-gray-300 hover:text-white'}`}>{t['nav_about']}</Link>
                    </div>

                    {/* Auth (Desktop) */}
                    <div className="hidden md:flex items-center space-x-4">
                        <button onClick={() => setLanguage(language === 'en' ? 'bn' : 'en')} className="px-3 py-1.5 bg-gaming-800/80 border border-gaming-700/50 rounded-lg text-sm text-gaming-accent font-bold hover:bg-gaming-700 transition-colors shadow-sm ml-2 flex items-center gap-1.5">
                            <Globe className="w-4 h-4" /> {language === 'en' ? 'বাংলা' : 'ENG'}
                        </button>

                        {user ? (
                            <div className="flex items-center gap-4">
                                <Link to="/add-listing" className="btn-secondary py-2 px-4 text-sm whitespace-nowrap">{t['nav_sell_account']}</Link>
                                {isAdmin && (
                                    <Link to="/admin" className="text-pink-500 hover:text-pink-400 font-bold text-sm tracking-wide">ADMIN</Link>
                                )}
                                <div className="flex items-center gap-2 border-l border-gaming-700 pl-4">
                                    <Link to="/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                                        {user.photoURL ? (
                                            <img src={user.photoURL} alt="Profile" referrerPolicy="no-referrer" className="w-9 h-9 rounded-full border border-gaming-accent" />
                                        ) : (
                                            <div className="w-9 h-9 rounded-full bg-gaming-800 border border-gaming-accent flex items-center justify-center">
                                                <User className="w-4 h-4 text-gray-300" />
                                            </div>
                                        )}
                                    </Link>
                                    <button onClick={logout} className="text-gaming-muted hover:text-red-400 p-2" title="Logout">
                                        <LogOut className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button onClick={signInWithGoogle} className="btn-primary py-2 px-6 shadow-none flex items-center gap-2">
                                <svg className="w-4 h-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                {t['nav_signin']}
                            </button>
                        )}
                    </div>

                    {/* Mobile placeholder (rest handled by BottomNav) */}
                    <div className="md:hidden flex items-center gap-4">
                        <button onClick={() => setLanguage(language === 'en' ? 'bn' : 'en')} className="px-3 py-1 bg-gaming-800/80 border border-gaming-700/50 rounded-lg text-sm text-gaming-accent font-bold hover:bg-gaming-700 transition-colors shadow-sm flex items-center gap-1.5">
                            <Globe className="w-4 h-4" /> {language === 'en' ? 'বাংলা' : 'ENG'}
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
