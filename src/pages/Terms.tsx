import { useLanguage } from '../context/LanguageContext';

export default function Terms() {
    const { t } = useLanguage();

    return (
        <div className="pt-24 pb-16 min-h-screen bg-gaming-900">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-12">
                    <h1 className="text-4xl font-heading font-extrabold text-white mb-4">
                        {t['terms_title']}<span className="text-gaming-accent">{t['terms_title_2']}</span>
                    </h1>
                    <p className="text-gaming-muted">{t['terms_last_updated']} {new Date().toLocaleDateString()}</p>
                </div>

                <div className="space-y-8 text-gray-300 leading-relaxed bg-gaming-800 p-8 rounded-2xl border border-gaming-700">
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">{t['terms_h1']}</h2>
                        <p>
                            {t['terms_p1']}
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">{t['terms_h2']}</h2>
                        <p>
                            {t['terms_p2']}
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">{t['terms_h3']}</h2>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>{t['terms_s_li1']}</li>
                            <li>{t['terms_s_li2']}</li>
                            <li>{t['terms_s_li3']}</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">{t['terms_h4']}</h2>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>{t['terms_b_li1']}</li>
                            <li>{t['terms_b_li2']}</li>
                        </ul>
                    </section>
                </div>
            </div>
        </div>
    );
}
