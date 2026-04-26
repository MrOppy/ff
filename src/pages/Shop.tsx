import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, Loader2 } from 'lucide-react';
import AccountCard, { type AccountData } from '../components/AccountCard';
import { listingService } from '../services/listingService';
import { useLanguage } from '../context/LanguageContext';

// Mock Data (Fallback)
// eslint-disable-next-line react-refresh/only-export-components
export const MOCK_ACCOUNTS: AccountData[] = [
    {
        id: '1', title: 'LVL 75 | 4 MAX EVO | COBRA MP40', price: '1500 BDT', likes: 1200, level: 75,
        image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80', seller: 'ProSeller99', tags: ['Max Evo', 'Rare Skins'], featured: true
    },
    {
        id: '2', title: 'LVL 80 | ALL INCUBATOR | V BADGE', price: '3000 BDT', likes: 3400, level: 80,
        image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80', seller: 'FFKing', tags: ['V Badge', 'Old Account'], featured: true
    },
    {
        id: '3', title: 'LVL 65 | 2 MAX EVO | DRIFT BUNDLE', price: '750 BDT', likes: 850, level: 65,
        image: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&q=80', seller: 'CheapIds', tags: ['Budget', 'Evo Gun'], featured: false
    }
];

export default function Shop() {
    const { t } = useLanguage();
    const [searchParams] = useSearchParams();
    const initialQuery = searchParams.get('q') || '';
    const [searchQuery, setSearchQuery] = useState(initialQuery);
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        const queryFromUrl = searchParams.get('q');
        if (queryFromUrl !== null) {
            setSearchQuery(queryFromUrl);
        }
    }, [searchParams]);

    // Filter states
    const [priceRange, setPriceRange] = useState('All');
    const [minLevel, setMinLevel] = useState('Any');
    const [minEvos, setMinEvos] = useState('Any');

    // Sort state
    const [sortOrder, setSortOrder] = useState('Featured');

    const [accounts, setAccounts] = useState<AccountData[]>([]);
    const [loading, setLoading] = useState(true);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12;

    // Reset page to 1 whenever filters/search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, priceRange, minLevel, minEvos, sortOrder]);

    useEffect(() => {
        async function fetchListings() {
            try {
                const data = await listingService.getActiveListings();
                if (data.length > 0) {
                    setAccounts(data);
                } else {
                    setAccounts(MOCK_ACCOUNTS); // fallback for dev preview
                }
            } catch (err) {
                console.error("Error fetching listings", err);
                setAccounts(MOCK_ACCOUNTS);
            } finally {
                setLoading(false);
            }
        }
        fetchListings();
    }, []);

    const filteredAndSortedAccounts = useMemo(() => {
        let result = [...accounts];

        // 1. Keyword Scoring Algorithm for Search
        const query = searchQuery.trim().toLowerCase();
        if (query) {
            const keywords = query.split(/\s+/).filter(k => k.length > 0);

            result = result.map(account => {
                let score = 0;
                const title = (account.title || '').toLowerCase();
                const desc = (account.description || '').toLowerCase();
                const tags = account.tags ? account.tags.map((t: string) => t.toLowerCase()) : [];

                keywords.forEach(kw => {
                    // Exact match in title = +5
                    if (title.includes(kw)) score += 5;
                    // Exact match in tags = +4
                    if (tags.some((t: string) => t.includes(kw))) score += 4;
                    // Exact match in description = +2
                    if (desc.includes(kw)) score += 2;
                });

                return { ...account, _searchScore: score };
            }).filter(account => account._searchScore > 0);

            // Sort by search score first (best matches at top)
            result.sort((a, b) => (b._searchScore || 0) - (a._searchScore || 0));
        }

        // 2. Apply Filters
        result = result.filter(account => {
            // Price Filter
            if (priceRange !== 'All') {
                const numericPrice = parseInt((account.price || '0').replace(/[^0-9]/g, ''));
                if (priceRange === 'Under 500' && numericPrice >= 500) return false;
                if (priceRange === '500-1500' && (numericPrice < 500 || numericPrice > 1500)) return false;
                if (priceRange === '1500-3000' && (numericPrice < 1500 || numericPrice > 3000)) return false;
                if (priceRange === 'Over 3000' && numericPrice <= 3000) return false;
            }

            // Level Filter
            if (minLevel !== 'Any') {
                const lvl = account.level || 0;
                if (minLevel === '60+' && lvl < 60) return false;
                if (minLevel === '70+' && lvl < 70) return false;
                if (minLevel === '80+' && lvl < 80) return false;
            }

            // Evos Filter
            if (minEvos !== 'Any') {
                const evos = account.maxEvosCount || 0;
                if (minEvos === '1+' && evos < 1) return false;
                if (minEvos === '3+' && evos < 3) return false;
                if (minEvos === '5+' && evos < 5) return false;
            }

            return true;
        });

        // 3. Apply Sorting Option (only if we aren't heavily prioritizing a search score)
        // If there's a search score, we typically want score to win, but if scores tie, apply sort.
        result.sort((a, b) => {
            // If searching, and scores are different, respect score
            if (query && a._searchScore !== b._searchScore) {
                return (b._searchScore || 0) - (a._searchScore || 0);
            }

            const timeA = (a.createdAt as { toMillis?: () => number })?.toMillis?.() || 0;
            const timeB = (b.createdAt as { toMillis?: () => number })?.toMillis?.() || 0;
            
            const bumpA = (a.lastBumpedAt as { toMillis?: () => number })?.toMillis?.() || (a.lastBumpedAt as any)?.seconds * 1000 || 0;
            const bumpB = (b.lastBumpedAt as { toMillis?: () => number })?.toMillis?.() || (b.lastBumpedAt as any)?.seconds * 1000 || 0;
            
            const effectiveTimeA = Math.max(timeA, bumpA);
            const effectiveTimeB = Math.max(timeB, bumpB);

            // Featured sort (Featured items first, oldest featured first)
            if (sortOrder === 'Featured') {
                const isAFeatured = a.isFeatured || a.featured;
                const isBFeatured = b.isFeatured || b.featured;

                if (isAFeatured && !isBFeatured) return -1;
                if (!isAFeatured && isBFeatured) return 1;

                // If both are featured, sort oldest first
                if (isAFeatured && isBFeatured) {
                    return timeA - timeB;
                }

                // If both are NOT featured, sort newest first (bumped counts as newer)
                return effectiveTimeB - effectiveTimeA;
            }

            // Otherwise, sort according to selected option
            if (sortOrder === 'Newest') {
                return effectiveTimeB - effectiveTimeA;
            }
            if (sortOrder === 'Price: Low to High') {
                const priceA = parseInt((a.price || '0').replace(/[^0-9]/g, ''));
                const priceB = parseInt((b.price || '0').replace(/[^0-9]/g, ''));
                return priceA - priceB;
            }
            if (sortOrder === 'Price: High to Low') {
                const priceA = parseInt((a.price || '0').replace(/[^0-9]/g, ''));
                const priceB = parseInt((b.price || '0').replace(/[^0-9]/g, ''));
                return priceB - priceA;
            }

            return 0; // fallback tie
        });

        return result;
    }, [accounts, searchQuery, priceRange, minLevel, minEvos, sortOrder]);

    // Apply Pagination
    const totalPages = Math.ceil(filteredAndSortedAccounts.length / itemsPerPage);
    const paginatedAccounts = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredAndSortedAccounts.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredAndSortedAccounts, currentPage]);

    return (
        <div className="pt-24 pb-16 min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Shop Header */}
                <div className="pb-4 pt-4 -mx-4 px-4 sm:mx-0 sm:px-0 mb-8 max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div>
                            <h1 className="text-4xl font-heading font-extrabold text-white mb-2">{t['shop_title_1']} <span className="text-gaming-accent">{t['shop_title_2']}</span></h1>
                            <p className="text-gaming-muted">{t['shop_subtitle']}</p>
                        </div>

                        <div className="w-full md:w-auto flex flex-col sm:flex-row gap-4">
                            <div className="relative flex-grow">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gaming-muted" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder={t['shop_search_placeholder']}
                                    className="w-full bg-gaming-800/80 backdrop-blur-md border border-white/10 text-white pl-10 pr-4 py-3.5 rounded-xl focus:outline-none focus:border-gaming-accent focus:ring-1 focus:ring-gaming-accent transition-all shadow-inner"
                                />
                            </div>
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="btn-secondary py-3 px-4 flex items-center justify-center gap-2"
                            >
                                <SlidersHorizontal className="w-5 h-5" />
                                <span className="sm:hidden">{t['shop_filters']}</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Filters Panel */}
                {showFilters && (
                    <motion.div
                        initial={{ opacity: 0, height: 0, y: -20 }}
                        animate={{ opacity: 1, height: 'auto', y: 0 }}
                        className="bg-gaming-800/50 backdrop-blur-xl border border-white/5 p-6 rounded-2xl mb-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 shadow-2xl relative z-30"
                    >
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">{t['shop_filter_price']}</label>
                            <select value={priceRange} onChange={(e) => setPriceRange(e.target.value)} className="glass-input">
                                <option value="All" className="bg-gaming-900">{t['shop_filter_price_all']}</option>
                                <option value="Under 500" className="bg-gaming-900">{t['shop_filter_price_under_500']}</option>
                                <option value="500-1500" className="bg-gaming-900">{t['shop_filter_price_500_1500']}</option>
                                <option value="1500-3000" className="bg-gaming-900">{t['shop_filter_price_1500_3000']}</option>
                                <option value="Over 3000" className="bg-gaming-900">{t['shop_filter_price_over_3000']}</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">{t['shop_filter_level']}</label>
                            <select value={minLevel} onChange={(e) => setMinLevel(e.target.value)} className="glass-input">
                                <option value="Any" className="bg-gaming-900">{t['shop_filter_level_any']}</option>
                                <option value="60+" className="bg-gaming-900">{t['shop_filter_level_60']}</option>
                                <option value="70+" className="bg-gaming-900">{t['shop_filter_level_70']}</option>
                                <option value="80+" className="bg-gaming-900">{t['shop_filter_level_80']}</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">{t['shop_filter_evos']}</label>
                            <select value={minEvos} onChange={(e) => setMinEvos(e.target.value)} className="glass-input">
                                <option value="Any" className="bg-gaming-900">{t['shop_filter_evos_any']}</option>
                                <option value="1+" className="bg-gaming-900">{t['shop_filter_evos_1']}</option>
                                <option value="3+" className="bg-gaming-900">{t['shop_filter_evos_3']}</option>
                                <option value="5+" className="bg-gaming-900">{t['shop_filter_evos_5']}</option>
                            </select>
                        </div>
                        <div className="flex items-end">
                            <button onClick={() => setShowFilters(false)} className="btn-primary w-full py-2.5 justify-center">{t['shop_done']}</button>
                        </div>
                    </motion.div>
                )}

                {/* Results Info */}
                <div className="mb-6 flex items-center justify-between text-sm text-gaming-muted">
                    <p>{t['shop_showing']} <span className="text-white font-bold">{filteredAndSortedAccounts.length}</span> {t['shop_results']}</p>
                    <div className="flex items-center gap-2 relative">
                        <span>{t['shop_sort_by']}</span>
                        <select
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value)}
                            className="bg-transparent border-none text-white focus:ring-0 cursor-pointer font-medium outline-none"
                        >
                            <option value="Featured" className="bg-gaming-800">{t['shop_sort_featured']}</option>
                            <option value="Newest" className="bg-gaming-800">{t['shop_sort_newest']}</option>
                            <option value="Price: Low to High" className="bg-gaming-800">{t['shop_sort_price_asc']}</option>
                            <option value="Price: High to Low" className="bg-gaming-800">{t['shop_sort_price_desc']}</option>
                        </select>
                    </div>
                </div>

                {/* Account Grid */}
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader2 className="w-12 h-12 text-gaming-accent animate-spin" />
                    </div>
                ) : paginatedAccounts.length > 0 ? (
                    <div className="flex flex-col min-h-[500px] justify-between">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
                            {paginatedAccounts.map((account, index) => (
                                <AccountCard key={account.id} account={account} index={index} />
                            ))}
                        </div>

                        {/* Pagination UI */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center flex-wrap gap-2 mt-8 mb-4">
                                <button
                                    onClick={() => {
                                        setCurrentPage(prev => Math.max(prev - 1, 1));
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 rounded-xl bg-gaming-800 border border-gaming-700 text-white disabled:opacity-50 hover:border-emerald-500 hover:text-emerald-400 transition-colors disabled:hover:border-gaming-700 disabled:hover:text-white"
                                >
                                    {t['shop_prev']}
                                </button>

                                {Array.from({ length: totalPages }).map((_, index) => {
                                    const pageNumber = index + 1;
                                    // Limit visible buttons if there are many pages
                                    if (totalPages > 7) {
                                        if (pageNumber !== 1 && pageNumber !== totalPages && Math.abs(pageNumber - currentPage) > 1) {
                                            if (pageNumber === 2 || pageNumber === totalPages - 1) {
                                                return <span key={`ellipsis-${pageNumber}`} className="text-gaming-muted px-1 sm:px-2">...</span>;
                                            }
                                            return null;
                                        }
                                    }

                                    return (
                                        <button
                                            key={pageNumber}
                                            onClick={() => {
                                                setCurrentPage(pageNumber);
                                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                            }}
                                            className={`w-10 h-10 rounded-xl font-bold transition-all duration-300 flex items-center justify-center ${currentPage === pageNumber
                                                ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)] scale-110 border-transparent'
                                                : 'bg-gaming-800 border border-gaming-700 text-gray-400 hover:text-emerald-400 hover:border-emerald-500/50'
                                                }`}
                                        >
                                            {pageNumber}
                                        </button>
                                    );
                                })}

                                <button
                                    onClick={() => {
                                        setCurrentPage(prev => Math.min(prev + 1, totalPages));
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                    disabled={currentPage === totalPages}
                                    className="px-4 py-2 rounded-xl bg-gaming-800 border border-gaming-700 text-white disabled:opacity-50 hover:border-emerald-500 hover:text-emerald-400 transition-colors disabled:hover:border-gaming-700 disabled:hover:text-white"
                                >
                                    {t['shop_next']}
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-gaming-800/50 rounded-2xl border border-gaming-700">
                        <Search className="w-16 h-16 text-gaming-muted mx-auto mb-4 opacity-50" />
                        <h3 className="text-2xl font-heading font-bold text-white mb-2">{t['shop_no_accounts']}</h3>
                        <p className="text-gaming-muted">{t['shop_no_accounts_desc']}</p>
                    </div>
                )}

            </div>
        </div>
    );
}
