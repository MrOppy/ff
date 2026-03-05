import { AlertTriangle } from 'lucide-react';

export default function Refund() {
    return (
        <div className="pt-24 pb-16 min-h-screen bg-gaming-900">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-12">
                    <h1 className="text-4xl font-heading font-extrabold text-white mb-4">
                        Refund <span className="text-gaming-accent">Policy</span>
                    </h1>
                    <p className="text-gaming-muted">Last updated: {new Date().toLocaleDateString()}</p>
                </div>

                <div className="space-y-8 text-gray-300 leading-relaxed bg-gaming-800 p-8 rounded-2xl border border-gaming-700">
                    <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl flex items-start gap-4 mb-8">
                        <AlertTriangle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-1" />
                        <p className="text-sm text-amber-100/90">
                            Because we deal with digital game accounts, all sales are considered final once the account credentials have been verified and transferred to the buyer.
                        </p>
                    </div>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">1. Eligibility for Refunds</h2>
                        <p>
                            Refunds will **only** be issued under the following circumstances, prior to the finalization of the trade:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 mt-4">
                            <li>The seller fails to provide the account credentials to the Admin within the agreed timeframe.</li>
                            <li>The account provided by the seller does not match the description listed on the website (e.g., missing items, wrong level) and the buyer refuses the adjusted account.</li>
                            <li>The Admin determines the account is compromised, hacked, or unsafe to transfer.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">2. After Completion</h2>
                        <p>
                            Once the Admin has successfully secured the account, verified its contents, and handed the credentials over to the Buyer, **no refunds will be provided**. The buyer is responsible for securing the account immediately upon receipt (changing passwords, unlinking old bindings, etc.).
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">3. Requesting a Refund</h2>
                        <p>
                            If you believe you are eligible for a refund during an active transaction, you must notify the Admin directly in the active WhatsApp chat before the final handover is completed.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
