import { Home, ShoppingBag, User, PlusCircle, ShieldAlert, MessageCircle } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function BottomNav() {
    const { pathname } = useLocation();
    const { user, isAdmin } = useAuth();
    const { t } = useLanguage();

    const navItems = [
        { path: '/', icon: Home, label: t['nav_home'] || 'Home' },
        { path: '/shop', icon: ShoppingBag, label: t['nav_shop'] || 'Shop' },
    ];

    navItems.push({ path: '/add-listing', icon: PlusCircle, label: t['nav_sell'] || 'Sell' });

    // Add Reviews button explicitly
    navItems.push({ path: '/reviews', icon: MessageCircle, label: t['nav_reviews'] || 'Reviews' });

    if (isAdmin) {
        navItems.push({ path: '/admin', icon: ShieldAlert, label: 'Admin' });
    }

    navItems.push({ path: '/profile', icon: User, label: user ? (t['nav_profile'] || 'Profile') : (t['nav_signin'] || 'Sign In') });

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-[100] bg-gaming-900/95 backdrop-blur-xl border-t border-white/5 pb-safe">
            <div className="flex items-center justify-around h-16 px-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    // Exact match for Home, startsWith for others (like /shop, /profile)
                    const isActive = item.path === '/' ? pathname === '/' : pathname.startsWith(item.path);

                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`group flex flex-col items-center justify-center w-full h-full transition-all duration-300 ${isActive ? 'scale-110' : 'hover:scale-105'}`}
                        >
                            <div className="relative flex flex-col items-center">
                                <div className={`p-1.5 rounded-xl transition-all duration-300 ${isActive ? 'bg-gaming-accent/20 text-gaming-accent shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-transparent text-gaming-muted'}`}>
                                    {item.path === '/profile' && user?.photoURL ? (
                                        <img src={user.photoURL} alt="Profile" referrerPolicy="no-referrer" className={`w-6 h-6 rounded-full object-cover border ${isActive ? 'border-gaming-accent shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'border-gaming-600'}`} />
                                    ) : (
                                        <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                                    )}
                                </div>
                            </div>
                            <span className={`text-[10px] tracking-wide mt-1 transition-all ${isActive ? 'font-bold text-gaming-accent' : 'font-medium text-gaming-muted group-hover:text-white'}`}>{item.label}</span>
                        </Link>
                    )
                })}
            </div>
        </div >
    )
}
