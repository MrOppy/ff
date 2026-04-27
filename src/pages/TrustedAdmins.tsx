import { useState, useEffect } from 'react';
import { adminService, type TrustedAdmin } from '../services/adminService';
import { ShieldCheck, Facebook, Info, CheckCircle2, Shield, Lock, Zap } from 'lucide-react';
import WhatsAppIcon from '../components/WhatsAppIcon';
import { useLanguage } from '../context/LanguageContext';

export default function TrustedAdmins() {
    const { t } = useLanguage();
    const [admins, setAdmins] = useState<TrustedAdmin[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchAdmins() {
            try {
                const data = await adminService.getTrustedAdmins();
                setAdmins(data);
            } catch (error) {
                console.error("Error fetching trusted admins:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchAdmins();
    }, []);

    // Gradient backgrounds for variety
    const gradients = [
        'from-blue-500 to-indigo-600',
        'from-emerald-400 to-teal-600',
        'from-purple-500 to-pink-600',
        'from-orange-400 to-rose-600',
        'from-cyan-400 to-blue-600',
    ];

    return (
        <div className="pt-24 pb-16 min-h-screen bg-gaming-950 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-indigo-500/10 rounded-[100%] blur-[120px] pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

                {/* Header */}
                <div className="text-center mb-16 mt-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 mb-8 shadow-[0_0_40px_rgba(99,102,241,0.2)] rotate-3">
                        <ShieldCheck className="w-10 h-10 text-indigo-400 -rotate-3" />
                    </div>
                    <h1 className="text-4xl md:text-6xl font-heading font-black text-white mb-6 tracking-tight drop-shadow-lg">
                        {t['trusted_title_1'] || 'Verified'} <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">{t['trusted_title_2'] || 'Middlemen'}</span>
                    </h1>
                    <p className="text-lg md:text-xl text-gaming-muted max-w-3xl mx-auto leading-relaxed">
                        {t['trusted_desc'] || 'Trade with absolute peace of mind. Our verified middlemen ensure your high-value transactions are 100% secure, scam-free, and transparent.'}
                    </p>
                </div>



                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 gap-y-16 mt-12">
                        {admins.map((admin, index) => {
                            const bgGradient = gradients[index % gradients.length];
                            return (
                                <div
                                    key={admin.id}
                                    className="bg-gaming-800/80 backdrop-blur-md border border-gaming-700/80 rounded-3xl relative group transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] hover:border-indigo-500/50 flex flex-col"
                                >
                                    {/* Cover Banner */}
                                    <div className={`h-24 w-full rounded-t-3xl bg-gradient-to-r ${bgGradient} opacity-80`} />
                                    
                                    {/* Floating Avatar */}
                                    <div className="absolute top-8 left-1/2 -translate-x-1/2">
                                        <div className="relative">
                                            <div className="w-28 h-28 rounded-full border-4 border-gaming-800 shadow-xl overflow-hidden bg-gaming-900 ring-4 ring-indigo-500/30 group-hover:ring-indigo-400 transition-all duration-500">
                                                <img src={admin.photoUrl} alt={admin.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                                            </div>
                                            <div className="absolute -bottom-1 -right-1 bg-gaming-900 rounded-full p-1 border-2 border-gaming-800">
                                                <div className="bg-blue-500 rounded-full w-6 h-6 flex items-center justify-center">
                                                    <CheckCircle2 className="w-4 h-4 text-white" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="pt-16 pb-8 px-6 flex-grow flex flex-col items-center text-center">
                                        <div className="inline-flex items-center justify-center px-3 py-1 bg-gaming-900/80 border border-gaming-700 rounded-full mb-4 shadow-inner">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">
                                                Admin Rank #{index + 1}
                                            </span>
                                        </div>
                                        
                                        <h3 className="text-2xl font-black text-white mb-1 flex items-center justify-center gap-2">
                                            {admin.name}
                                        </h3>
                                        
                                        <p className="text-gaming-muted font-medium mb-6 uppercase tracking-wider text-xs">
                                            {admin.position}
                                        </p>

                                        <div className="w-full grid grid-cols-2 gap-3 mt-auto pt-4 border-t border-gaming-700/50">
                                            <a
                                                href={`https://wa.me/${admin.whatsapp.replace(/\D/g, '')}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="flex items-center justify-center gap-2 p-3 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white border border-emerald-500/20 hover:border-emerald-500 rounded-xl transition-all duration-300 font-bold uppercase tracking-wider text-[11px]"
                                            >
                                                <WhatsAppIcon className="w-4 h-4" />
                                                {t['trusted_btn_wa'] || 'WhatsApp'}
                                            </a>
                                            <a
                                                href={admin.facebook}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="flex items-center justify-center gap-2 p-3 bg-blue-500/10 hover:bg-blue-500 text-blue-400 hover:text-white border border-blue-500/20 hover:border-blue-500 rounded-xl transition-all duration-300 font-bold uppercase tracking-wider text-[11px]"
                                            >
                                                <Facebook className="w-4 h-4" />
                                                {t['trusted_btn_fb'] || 'Facebook'}
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {!loading && admins.length === 0 && (
                    <div className="text-center py-24 bg-gaming-900/50 border-2 border-dashed border-gaming-800 rounded-3xl max-w-2xl mx-auto backdrop-blur-sm">
                        <div className="w-20 h-20 bg-gaming-800 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Info className="w-10 h-10 text-gaming-muted" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-3">{t['trusted_no_admins'] || 'No Trusted Admins Found'}</h3>
                        <p className="text-gaming-muted max-w-md mx-auto">{t['trusted_no_admins_desc'] || 'There are currently no verified middlemen available. Please check back later.'}</p>
                    </div>
                )}

                {/* Features / Why use middleman (Compact Bottom) */}
                <div className="mt-20 pt-10 border-t border-gaming-800/80">
                    <p className="text-center text-gaming-muted text-sm font-bold uppercase tracking-widest mb-6">Why use our Middleman Service?</p>
                    <div className="flex flex-wrap justify-center gap-3 md:gap-5">
                        <div className="flex items-center gap-3 bg-gaming-900/60 border border-gaming-800/80 rounded-xl py-3 px-5 backdrop-blur-sm hover:border-emerald-500/30 transition-colors">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                                <Lock className="w-4 h-4 text-emerald-400" />
                            </div>
                            <div>
                                <h4 className="text-white font-bold text-[13px]">100% Secure</h4>
                                <p className="text-[11px] text-gaming-muted max-w-[160px] leading-tight mt-0.5">Funds held safely until both sides fulfill the deal.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 bg-gaming-900/60 border border-gaming-800/80 rounded-xl py-3 px-5 backdrop-blur-sm hover:border-blue-500/30 transition-colors">
                            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                                <Shield className="w-4 h-4 text-blue-400" />
                            </div>
                            <div>
                                <h4 className="text-white font-bold text-[13px]">Zero Scams</h4>
                                <p className="text-[11px] text-gaming-muted max-w-[160px] leading-tight mt-0.5">Strict verification stops scammers instantly.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 bg-gaming-900/60 border border-gaming-800/80 rounded-xl py-3 px-5 backdrop-blur-sm hover:border-purple-500/30 transition-colors">
                            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
                                <Zap className="w-4 h-4 text-purple-400" />
                            </div>
                            <div>
                                <h4 className="text-white font-bold text-[13px]">Fast Resolution</h4>
                                <p className="text-[11px] text-gaming-muted max-w-[160px] leading-tight mt-0.5">Highly active admins for lightning-fast trades.</p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
