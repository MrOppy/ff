import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
    const { user, isAdmin, signInWithGoogle, logout } = useAuth();
    const [isScrolled, setIsScrolled] = useState(false);

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
                        <Link to="/" className="text-gray-300 hover:text-gaming-accent transition-colors font-medium">Home</Link>
                        <Link to="/shop" className="text-gray-300 hover:text-gaming-accent transition-colors font-medium">Shop</Link>
                        <Link to="/about" className="text-gray-300 hover:text-gaming-accent transition-colors font-medium">About</Link>
                    </div>

                    {/* Auth (Desktop) */}
                    <div className="hidden md:flex items-center space-x-4">

                        {user ? (
                            <div className="flex items-center gap-4">
                                <Link to="/add-listing" className="btn-secondary py-2 px-4 text-sm whitespace-nowrap">List Account</Link>
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
                            <button onClick={signInWithGoogle} className="btn-primary py-2 px-6 shadow-none">
                                Sign In
                            </button>
                        )}
                    </div>

                    {/* Mobile placeholder (rest handled by BottomNav) */}
                    <div className="md:hidden flex items-center gap-4">
                        {/* Currently empty since navigation and profile are handled in BottomNav */}
                    </div>
                </div>
            </div>
        </nav>
    );
}
