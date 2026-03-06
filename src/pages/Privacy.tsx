import { useLanguage } from '../context/LanguageContext';

export default function Privacy() {
    const { t } = useLanguage();

    return (
        <div className="pt-24 pb-16 min-h-screen bg-gaming-900">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-12">
                    <h1 className="text-4xl font-heading font-extrabold text-white mb-4">
                        {t['privacy_title_1']}<span className="text-gaming-accent">{t['privacy_title_2']}</span>
                    </h1>
                    <p className="text-gaming-muted">{t['privacy_last_updated']} {new Date().toLocaleDateString()}</p>
                </div>

                <div className="space-y-8 text-gray-300 leading-relaxed bg-gaming-800 p-8 rounded-2xl border border-gaming-700">
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">{t['privacy_h1']}</h2>
                        <p>
                            {t['privacy_p1']}
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">{t['privacy_h2']}</h2>
                        <p>
                            {t['privacy_p2']}
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">{t['privacy_h3']}</h2>
                        <p>
                            {t['privacy_p3']}
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
