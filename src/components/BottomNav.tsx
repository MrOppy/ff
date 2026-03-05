import { Home, ShoppingBag, User, PlusCircle, ShieldAlert } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function BottomNav() {
    const { pathname } = useLocation();
    const { user, isAdmin } = useAuth();

    const navItems = [
        { path: '/', icon: Home, label: 'Home' },
        { path: '/shop', icon: ShoppingBag, label: 'Shop' },
    ];

    navItems.push({ path: '/add-listing', icon: PlusCircle, label: 'Sell' });

    if (isAdmin) {
        navItems.push({ path: '/admin', icon: ShieldAlert, label: 'Admin' });
    }

    navItems.push({ path: '/profile', icon: User, label: user ? 'Profile' : 'Sign In' });

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
                            className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-all duration-300 ${isActive ? 'text-gaming-accent scale-110' : 'text-gaming-muted hover:text-white'}`}
                        >
                            <div className="relative">
                                {item.label === 'Profile' && user?.photoURL ? (
                                    <img src={user.photoURL} alt="Profile" referrerPolicy="no-referrer" className={`w-6 h-6 rounded-full object-cover border ${isActive ? 'border-gaming-accent' : 'border-gaming-600'}`} />
                                ) : (
                                    <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                                )}
                                {isActive && (
                                    <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-1 h-1 bg-gaming-accent rounded-full animate-pulse-glow" />
                                )}
                            </div>
                            <span className={`text-[10px] tracking-wide ${isActive ? 'font-bold' : 'font-medium'}`}>{item.label}</span>
                        </Link>
                    )
                })}
            </div>
        </div>
    )
}
