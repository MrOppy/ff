export default function Terms() {
    return (
        <div className="pt-24 pb-16 min-h-screen bg-gaming-900">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-12">
                    <h1 className="text-4xl font-heading font-extrabold text-white mb-4">
                        Terms of <span className="text-gaming-accent">Service</span>
                    </h1>
                    <p className="text-gaming-muted">Last updated: {new Date().toLocaleDateString()}</p>
                </div>

                <div className="space-y-8 text-gray-300 leading-relaxed bg-gaming-800 p-8 rounded-2xl border border-gaming-700">
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
                        <p>
                            By accessing or using our marketplace to buy or sell Free Fire accounts, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">2. Account Verification & Middleman Services</h2>
                        <p>
                            To ensure the safety of all users, all transactions must be conducted through our official Admin WhatsApp channel. Buyers and Sellers are prohibited from exchanging payment or account credentials directly. IdBuySell acts as a mandatory middleman to verify the account details before transferring funds to the seller.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">3. Seller Responsibilities</h2>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>You must own the account you are listing.</li>
                            <li>The information provided in the listing must be 100% accurate.</li>
                            <li>You agree to transfer the account credentials to the Admin promptly upon a successful buyer commitment.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">4. Buyer Responsibilities</h2>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>You agree to pay the agreed-upon amount to the Admin's verified payment methods.</li>
                            <li>Once the account is handed over securely, the transaction is considered final.</li>
                        </ul>
                    </section>
                </div>
            </div>
        </div>
    );
}
