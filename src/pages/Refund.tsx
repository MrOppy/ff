import { AlertTriangle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function Refund() {
    const { t } = useLanguage();

    return (
        <div className="pt-24 pb-16 min-h-screen bg-gaming-900">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-12">
                    <h1 className="text-4xl font-heading font-extrabold text-white mb-4">
                        {t['refund_title_1']}<span className="text-gaming-accent">{t['refund_title_2']}</span>
                    </h1>
                    <p className="text-gaming-muted">{t['refund_last_updated']} {new Date().toLocaleDateString()}</p>
                </div>

                <div className="space-y-8 text-gray-300 leading-relaxed bg-gaming-800 p-8 rounded-2xl border border-gaming-700">
                    <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl flex items-start gap-4 mb-8">
                        <AlertTriangle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-1" />
                        <p className="text-sm text-amber-100/90">
                            {t['refund_warning']}
                        </p>
                    </div>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">{t['refund_h1']}</h2>
                        <p>
                            {t['refund_p1']}
                        </p>
                        <ul className="list-disc pl-6 space-y-2 mt-4">
                            <li>{t['refund_li1']}</li>
                            <li>{t['refund_li2']}</li>
                            <li>{t['refund_li3']}</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">{t['refund_h2']}</h2>
                        <p>
                            {t['refund_p2']}
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">{t['refund_h3']}</h2>
                        <p>
                            {t['refund_p3']}
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
