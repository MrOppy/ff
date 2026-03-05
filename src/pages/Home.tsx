import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, Search, Users, Zap, HeadphonesIcon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import type { AccountData } from '../components/AccountCard';
import { listingService } from '../services/listingService';
import AccountCard from '../components/AccountCard';

export default function Home() {
    const [searchQuery, setSearchQuery] = useState('');
    const [featuredAccounts, setFeaturedAccounts] = useState<AccountData[]>([]);
    const [loadingFeatured, setLoadingFeatured] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        async function loadFeatured() {
            try {
                const accounts = await listingService.getFeaturedListings();
                setFeaturedAccounts(accounts.slice(0, 6)); // limit to 6 on homepage
            } catch (err) {
                console.error("Failed to load featured accounts", err);
            } finally {
                setLoadingFeatured(false);
            }
        }
        loadFeatured();
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/shop?q=${encodeURIComponent(searchQuery)}`);
        }
    };

    return (
        <div className="w-full relative">
            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-32 pb-32">
                {/* Background Elements */}
                <div className="absolute inset-0 bg-gaming-900 z-0">
                    <div className="absolute inset-0 bg-[url('/images/hero-bg.jpg')] bg-cover bg-center opacity-30" />
                    <div className="absolute inset-0 bg-gradient-to-t from-gaming-900 via-gaming-900/80 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-gaming-900 via-transparent to-gaming-900" />
                </div>

                {/* Floating elements animation */}
                <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                    <motion.div
                        animate={{ y: [-20, 20, -20], x: [-10, 10, -10], rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute top-1/4 left-1/4 w-64 h-64 bg-gaming-accent/20 rounded-full blur-[100px]"
                    />
                    <motion.div
                        animate={{ y: [20, -20, 20], x: [10, -10, 10], rotate: [0, -5, 5, 0] }}
                        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-[120px]"
                    />
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col md:flex-row items-center gap-12">

                    <div className="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gaming-800/80 border border-gaming-accent/30 text-gaming-accent text-sm font-bold mb-6 backdrop-blur-sm"
                        >
                            <span>#1 Free Fire Account Marketplace</span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="text-5xl md:text-7xl font-heading font-extrabold text-white leading-tight mb-6 tracking-tight"
                        >
                            FREE FIRE <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gaming-accent via-emerald-400 to-teal-300 animate-shimmer" style={{ backgroundSize: '200% auto' }}>
                                MARKET BD
                            </span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="text-lg md:text-xl text-gaming-muted mb-10 max-w-xl font-medium"
                        >
                            Buy and Sell Free Fire accounts safely and securely. Bangladesh's biggest Free Fire Marketplace.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
                        >
                            <Link to="/shop" className="btn-primary text-lg">
                                Explore Accounts <ArrowRight className="w-5 h-5 ml-1" />
                            </Link>
                            <Link to="/add-listing" className="btn-secondary text-lg">
                                Sell Your Account
                            </Link>
                        </motion.div>

                        {/* Quick Search */}
                        <motion.form
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                            onSubmit={handleSearch}
                            className="mt-12 w-full max-w-md relative"
                        >
                            <div className="relative flex items-center w-full">
                                <Search className="absolute left-4 w-5 h-5 text-gaming-muted" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search 'Purple Shade' or 'Level 70'"
                                    className="w-full bg-gaming-800/80 backdrop-blur-md border border-gaming-700 text-white pl-12 pr-24 py-4 rounded-xl focus:outline-none focus:border-gaming-accent focus:ring-1 focus:ring-gaming-accent transition-all text-sm md:text-base shadow-lg"
                                />
                                <button type="submit" className="absolute right-2 top-2 bottom-2 bg-gaming-accent hover:bg-gaming-accentHover text-white px-4 rounded-lg font-bold transition-colors text-sm">
                                    Search
                                </button>
                            </div>
                        </motion.form>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.7, delay: 0.2 }}
                        className="w-full md:w-1/2 relative hidden md:block"
                    >
                        {/* 3D or floating character representation */}
                        <div className="relative w-full aspect-square max-w-[500px] mx-auto animate-float">
                            <div className="absolute inset-0 bg-gradient-to-tr from-gaming-accent/20 to-transparent rounded-full blur-2xl z-0" />
                            <img
                                src="/images/hero-right.jpg"
                                alt="Gaming Hero"
                                className="relative z-10 w-full h-full object-cover rounded-[2rem] border border-white/10 shadow-[0_0_50px_rgba(16,185,129,0.3)] mask-image-hero animate-tilt"
                                style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 80%, 90% 100%, 0 100%, 0 20%)' }}
                            />

                            {/* Floating badges */}
                            <motion.div
                                animate={{ y: [-10, 10, -10] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute -right-6 top-20 bg-gaming-800/90 backdrop-blur-md border border-gaming-700 p-4 rounded-xl shadow-2xl z-20 flex items-center gap-3"
                            >
                                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                                </div>
                                <div>
                                    <p className="text-white font-bold text-sm">100% Safe</p>
                                    <p className="text-gaming-muted text-xs">Verified Sellers</p>
                                </div>
                            </motion.div>

                            <motion.div
                                animate={{ y: [10, -10, 10] }}
                                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                                className="absolute -left-8 bottom-32 bg-gaming-800/90 backdrop-blur-md border border-gaming-700 p-4 rounded-xl shadow-2xl z-20 flex items-center gap-3"
                            >
                                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                                    <Users className="w-5 h-5 text-purple-400" />
                                </div>
                                <div>
                                    <p className="text-white font-bold text-sm">Verified Admins</p>
                                    <p className="text-gaming-muted text-xs">Trusted Middlemans</p>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>

                </div>
            </section>

            {/* Featured Accounts Section */}
            <section className="py-24 bg-gaming-900 border-t border-gaming-800 relative z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-end mb-12">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-heading font-bold text-white">Featured Accounts</h2>
                        </div>
                        <Link to="/shop" className="hidden sm:flex items-center text-gaming-accent hover:text-white transition-colors gap-1 font-medium pb-2 border-b border-transparent hover:border-gaming-accent">
                            View all <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {loadingFeatured ? (
                            <div className="text-gray-400 p-8 w-full text-center col-span-full">Loading featured accounts...</div>
                        ) : featuredAccounts.length === 0 ? (
                            <div className="text-gray-400 p-8 w-full text-center col-span-full">No featured accounts at the moment.</div>
                        ) : (
                            featuredAccounts.map((account, index) => (
                                <AccountCard key={account.id} account={account} index={index} />
                            ))
                        )}
                    </div>

                    <div className="mt-10 text-center sm:hidden">
                        <Link to="/shop" className="btn-secondary w-full justify-center">
                            View All Accounts
                        </Link>
                    </div>
                </div>
            </section>

            {/* Why Choose Us Section */}
            <section className="py-24 bg-gaming-900 border-t border-gaming-800 relative z-10">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gaming-accent/10 via-gaming-900 to-gaming-900 pointer-events-none" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center mb-16">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                            className="text-3xl md:text-5xl font-heading font-bold text-white mb-4"
                        >
                            Why Choose <span className="text-gaming-accent">Us?</span>
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="text-gaming-muted text-lg max-w-2xl mx-auto"
                        >
                            We provide the safest, fastest, and most reliable Free Fire account trading experience in Bangladesh.
                        </motion.p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            {
                                icon: ShieldCheck,
                                title: "100% Secure",
                                desc: "Every transaction is heavily monitored and secured by our trusted middleman system.",
                                color: "text-emerald-400",
                                bg: "bg-emerald-500/10",
                                border: "border-emerald-500/20"
                            },
                            {
                                icon: Zap,
                                title: "Instant Delivery",
                                desc: "Get your account credentials instantly after the payment is verified by our admins.",
                                color: "text-amber-400",
                                bg: "bg-amber-500/10",
                                border: "border-amber-500/20"
                            },
                            {
                                icon: Users,
                                title: "Verified Admins",
                                desc: "All our admins & middlemen go through strict KYC and verification processes to ensure secure trading.",
                                color: "text-purple-400",
                                bg: "bg-purple-500/10",
                                border: "border-purple-500/20"
                            },
                            {
                                icon: HeadphonesIcon,
                                title: "24/7 Support",
                                desc: "Our dedicated admin team is always active to assist you with any queries or issues.",
                                color: "text-blue-400",
                                bg: "bg-blue-500/10",
                                border: "border-blue-500/20"
                            }
                        ].map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="bg-gaming-800/50 backdrop-blur-sm border border-gaming-700 p-8 rounded-2xl hover:-translate-y-2 transition-transform duration-300 relative overflow-hidden group"
                            >
                                <div className={`absolute top-0 right-0 w-32 h-32 ${feature.bg} rounded-full blur-3xl -mr-10 -mt-10 transition-opacity group-hover:opacity-100 opacity-50`} />

                                <div className={`w-14 h-14 rounded-xl ${feature.bg} ${feature.border} border flex items-center justify-center mb-6 relative z-10`}>
                                    <feature.icon className={`w-7 h-7 ${feature.color}`} />
                                </div>

                                <h3 className="text-xl font-bold text-white mb-3 relative z-10">{feature.title}</h3>
                                <p className="text-gaming-muted leading-relaxed relative z-10">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
