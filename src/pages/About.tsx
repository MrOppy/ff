import { ShieldCheck, Target, Users, Zap } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function About() {
    const { t } = useLanguage();

    return (
        <div className="pt-24 pb-16 min-h-screen bg-gaming-900">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-heading font-extrabold text-white mb-4">
                        {t['about_title_1']}<span className="text-gaming-accent">{t['about_title_2']}</span>
                    </h1>
                    <p className="text-xl text-gaming-muted max-w-2xl mx-auto">
                        {t['about_desc']}
                    </p>
                </div>

                <div className="bg-gaming-800 border border-gaming-700 rounded-2xl p-8 mb-12 shadow-2xl">
                    <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                        <Target className="text-emerald-500 w-6 h-6" /> {t['about_mission_title']}
                    </h2>
                    <p className="text-gray-300 leading-relaxed text-lg mb-6">
                        {t['about_mission_p1']}
                    </p>
                    <p className="text-gray-300 leading-relaxed text-lg mb-6">
                        {t['about_mission_p2']}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gaming-800/50 border border-gaming-700 rounded-xl p-6 text-center">
                        <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
                            <ShieldCheck className="w-8 h-8 text-emerald-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">{t['about_feat1_title']}</h3>
                        <p className="text-sm text-gaming-muted">{t['about_feat1_desc']}</p>
                    </div>

                    <div className="bg-gaming-800/50 border border-gaming-700 rounded-xl p-6 text-center">
                        <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/20">
                            <Users className="w-8 h-8 text-blue-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">{t['about_feat2_title']}</h3>
                        <p className="text-sm text-gaming-muted">{t['about_feat2_desc']}</p>
                    </div>

                    <div className="bg-gaming-800/50 border border-gaming-700 rounded-xl p-6 text-center">
                        <div className="w-16 h-16 bg-gaming-accent/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-gaming-accent/20">
                            <Zap className="w-8 h-8 text-gaming-accent" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">{t['about_feat3_title']}</h3>
                        <p className="text-sm text-gaming-muted">{t['about_feat3_desc']}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
