import { useState, useEffect } from 'react';
import { adminService, type TrustedAdmin } from '../services/adminService';
import { ShieldCheck, MessageCircle, Facebook, Info } from 'lucide-react';

export default function TrustedAdmins() {
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

    return (
        <div className="pt-24 pb-16 min-h-screen bg-gaming-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-500/20 mb-6 shadow-[0_0_30px_rgba(99,102,241,0.2)]">
                        <ShieldCheck className="w-8 h-8 text-indigo-400" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-heading font-extrabold text-white mb-4 tracking-tight">
                        Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Trusted Admins</span>
                    </h1>
                    <p className="text-xl text-gaming-muted max-w-2xl mx-auto leading-relaxed">
                        These are the official and verified admins of FF MARKET BD. Always verify their details here before making any transactions.
                    </p>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {admins.map((admin, index) => (
                            <div
                                key={admin.id}
                                className="bg-gaming-800 border-2 border-gaming-700/50 rounded-2xl p-6 relative group overflow-hidden hover:border-indigo-500/50 transition-all duration-300 shadow-xl"
                            >
                                {/* Background glow effect */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all" />

                                <div className="flex flex-col items-center text-center">
                                    <div className="relative mb-6">
                                        <div className="w-24 h-24 rounded-full border-4 border-gaming-800 shadow-lg z-10 relative overflow-hidden ring-4 ring-indigo-500/20">
                                            <img src={admin.photoUrl} alt={admin.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                                        </div>
                                        {/* Rank Badge */}
                                        <div className="absolute -bottom-3 -right-3 bg-gaming-900 border-2 border-gaming-700 w-10 h-10 rounded-full flex items-center justify-center z-20 shadow-lg text-indigo-400 font-bold text-sm">
                                            #{index + 1}
                                        </div>
                                    </div>

                                    <h3 className="text-2xl font-bold text-white mb-1">{admin.name}</h3>
                                    <p className="text-indigo-400 font-medium mb-6 uppercase tracking-wider text-sm">{admin.position}</p>

                                    <div className="w-full grid grid-cols-2 gap-3 mt-auto">
                                        <a
                                            href={`https://wa.me/${admin.whatsapp.replace(/\D/g, '')}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex flex-col items-center justify-center p-3 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-xl transition-colors group/wa"
                                        >
                                            <MessageCircle className="w-5 h-5 text-emerald-400 mb-1 group-hover/wa:scale-110 transition-transform" />
                                            <span className="text-xs text-emerald-400 font-bold uppercase">WhatsApp</span>
                                        </a>
                                        <a
                                            href={admin.facebook}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex flex-col items-center justify-center p-3 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-xl transition-colors group/fb"
                                        >
                                            <Facebook className="w-5 h-5 text-blue-400 mb-1 group-hover/fb:scale-110 transition-transform" />
                                            <span className="text-xs text-blue-400 font-bold uppercase">Facebook</span>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!loading && admins.length === 0 && (
                    <div className="text-center py-20 border-2 border-dashed border-gaming-700 rounded-2xl max-w-2xl mx-auto">
                        <Info className="w-12 h-12 text-gaming-muted mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">No Admins Revealed Yet</h3>
                        <p className="text-gaming-muted">The directory is currently empty. Please check back later.</p>
                    </div>
                )}

            </div>
        </div>
    );
}
