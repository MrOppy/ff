import { ShieldCheck, Target, Users, Zap } from 'lucide-react';

export default function About() {
    return (
        <div className="pt-24 pb-16 min-h-screen bg-gaming-900">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-heading font-extrabold text-white mb-4">
                        About <span className="text-gaming-accent">Us</span>
                    </h1>
                    <p className="text-xl text-gaming-muted max-w-2xl mx-auto">
                        Your trusted marketplace for premium Free Fire accounts in Bangladesh.
                    </p>
                </div>

                <div className="bg-gaming-800 border border-gaming-700 rounded-2xl p-8 mb-12 shadow-2xl">
                    <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                        <Target className="text-emerald-500 w-6 h-6" /> Our Mission
                    </h2>
                    <p className="text-gray-300 leading-relaxed text-lg mb-6">
                        We built this platform to solve a major problem in the gaming community: scams and unsafe trades. Our goal is to provide a 100% secure, transparent, and user-friendly environment where players can buy and sell their beloved Free Fire accounts without fear.
                    </p>
                    <p className="text-gray-300 leading-relaxed text-lg mb-6">
                        Every transaction on our site goes through our dedicated Admin team. We act as a trusted middleman, ensuring the buyer gets the exact account they paid for, and the seller receives their money safely.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gaming-800/50 border border-gaming-700 rounded-xl p-6 text-center">
                        <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
                            <ShieldCheck className="w-8 h-8 text-emerald-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">100% Secure</h3>
                        <p className="text-sm text-gaming-muted">All deals are mediated by admins to ensure zero scams.</p>
                    </div>

                    <div className="bg-gaming-800/50 border border-gaming-700 rounded-xl p-6 text-center">
                        <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/20">
                            <Users className="w-8 h-8 text-blue-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Verified Sellers</h3>
                        <p className="text-sm text-gaming-muted">We vet our top sellers to bring you the best premium accounts.</p>
                    </div>

                    <div className="bg-gaming-800/50 border border-gaming-700 rounded-xl p-6 text-center">
                        <div className="w-16 h-16 bg-gaming-accent/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-gaming-accent/20">
                            <Zap className="w-8 h-8 text-gaming-accent" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Fast Delivery</h3>
                        <p className="text-sm text-gaming-muted">Quick communication via WhatsApp ensures rapid handovers.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
