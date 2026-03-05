import { ShieldCheck, Handshake, Clock, AlertTriangle } from 'lucide-react';

export default function MiddlemanRules() {
    return (
        <div className="pt-24 pb-16 min-h-screen bg-gaming-900">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-heading font-extrabold text-white mb-4">
                        Middleman <span className="text-gaming-accent">Rules</span>
                    </h1>
                    <p className="text-xl text-gaming-muted max-w-2xl mx-auto">
                        Please read the following rules carefully before committing to a transaction.
                    </p>
                </div>

                <div className="space-y-8">
                    {/* Standard Deal Process */}
                    <div className="bg-gaming-800 border border-gaming-700 rounded-2xl p-8 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl" />
                        <div className="flex items-start gap-4 mb-6">
                            <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400 shrink-0">
                                <Handshake className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-2">Standard Deal Process</h2>
                                <p className="text-gaming-muted leading-relaxed">
                                    The main structure of a secured deal through FF MARKET BD:
                                </p>
                                <ol className="mt-4 space-y-3 text-gray-300 list-decimal list-inside marker:text-gaming-accent marker:font-bold">
                                    <li>The <strong className="text-white">Buyer</strong> sends the payment securely to the Admin.</li>
                                    <li>The <strong className="text-white">Seller</strong> transfers full ownership of the Free Fire account to the Admin/Buyer.</li>
                                    <li>Once the account is verified to match the listing, the Admin sends the funds directly to the <strong className="text-white">Seller</strong>.</li>
                                </ol>
                            </div>
                        </div>
                    </div>

                    {/* Middleman Fee */}
                    <div className="bg-gaming-800 border border-gaming-700 rounded-2xl p-8 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl" />
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-400 shrink-0">
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-2">Platform Fee (10%)</h2>
                                <p className="text-gray-300 leading-relaxed">
                                    To maintain the security of the platform and provide guaranteed safety for both parties, a <strong className="text-gaming-accent border-b border-gaming-accent">10% Middleman Fee</strong> applies to the total account price.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Hold Deal Policy */}
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-8 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl" />
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center text-amber-500 shrink-0">
                                <Clock className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-amber-500 mb-2">15-Day Hold Deal</h2>
                                <p className="text-amber-100/80 leading-relaxed mb-4">
                                    A "Hold Deal" is an alternate transaction method for maximum buyer security.
                                </p>
                                <ul className="space-y-2 text-amber-100/70 list-disc list-inside marker:text-amber-500">
                                    <li>If the buyer requests a Hold Deal, the seller must explicitly agree to this condition.</li>
                                    <li>The Admin will hold the money for exactly <strong className="text-white">15 Days</strong> before transferring it to the seller.</li>
                                    <li>This ensures the buyer has adequate time to verify account stability.</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-center gap-4 text-center sm:text-left mt-8">
                        <AlertTriangle className="w-8 h-8 text-red-500 shrink-0" />
                        <p className="text-red-200 text-sm font-bold tracking-wide uppercase">
                            Never conduct trades outside of MR. OPPY's verified Whatsapp number to avoid getting scammed.
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
}
