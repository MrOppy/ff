export default function Privacy() {
    return (
        <div className="pt-24 pb-16 min-h-screen bg-gaming-900">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-12">
                    <h1 className="text-4xl font-heading font-extrabold text-white mb-4">
                        Privacy <span className="text-gaming-accent">Policy</span>
                    </h1>
                    <p className="text-gaming-muted">Last updated: {new Date().toLocaleDateString()}</p>
                </div>

                <div className="space-y-8 text-gray-300 leading-relaxed bg-gaming-800 p-8 rounded-2xl border border-gaming-700">
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">1. Information We Collect</h2>
                        <p>
                            We collect information that you provide directly to us, including but not limited to your display name, email address (via Google Sign-in), and profile pictures. We do not store sensitive payment information directly on our servers.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">2. How We Use Your Information</h2>
                        <p>
                            We use the information we collect to operate, maintain, and provide the features and functionality of the Service, to communicate with you, and to protect our users against fraudulent activities.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">3. Information Sharing</h2>
                        <p>
                            We do not sell your personal information. We may share information with third-party service providers (like Firebase) that perform services on our behalf, but only as necessary to provide the service.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
