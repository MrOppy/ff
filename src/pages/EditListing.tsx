import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, TriangleAlert as AlertTriangle, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { listingService } from '../services/listingService';
import type { NewListingData } from '../services/listingService';
import type { AccountData } from '../components/AccountCard';
import ImageUploader from '../components/ImageUploader';

export default function EditListing() {
    const { isSeller, isAdmin, user } = useAuth();
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();

    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [error, setError] = useState('');

    // Form State
    const [title, setTitle] = useState('');
    const [price, setPrice] = useState('');
    const [level, setLevel] = useState('60');
    const [likes, setLikes] = useState('0');
    const [description, setDescription] = useState('');

    // Stats
    const [server, setServer] = useState('Bangladesh');
    const [totalVault, setTotalVault] = useState('');
    const [accountAge, setAccountAge] = useState('');
    const [maxEvosCount, setMaxEvosCount] = useState<number>(0);
    const [primeLevel, setPrimeLevel] = useState<number>(0);
    const [videoUrl, setVideoUrl] = useState('');

    // Arrays
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');

    const [evoGuns, setEvoGuns] = useState<{ name: string, level: string }[]>([]);
    const [gunName, setGunName] = useState('');
    const [gunLevel, setGunLevel] = useState('MAX');

    const [images, setImages] = useState<string[]>([]);

    // Initial Fetch
    useEffect(() => {
        if (!id) return;

        async function fetchListing() {
            try {
                // Cast to AccountData to access all fields
                const data = await listingService.getListingById(id!) as AccountData;
                if (!data) {
                    setError("Listing not found.");
                    setInitialLoading(false);
                    return;
                }

                // Permission check
                if (!isAdmin && data.sellerId !== user?.uid) {
                    setError("You do not have permission to edit this listing.");
                    setInitialLoading(false);
                    return;
                }

                // Populate fields
                setTitle(data.title || '');
                setPrice(data.price ? data.price.replace(' BDT', '') : '');
                setLevel(data.level?.toString() || '60');
                setLikes(data.likes?.toString() || '0');
                setDescription(data.description || '');
                setServer(data.server || 'Bangladesh');
                setTotalVault(data.totalVault || '');
                setAccountAge(data.accountAge || '');
                setMaxEvosCount(data.maxEvosCount || 0);
                setPrimeLevel(data.primeLevel || 0);
                setVideoUrl(data.videoUrl || '');
                setTags(data.tags || []);
                setEvoGuns(data.evoGuns || []);

                // Combine main image and gallery if they were separate in older listings, or just use gallery
                const allImages = data.imageGallery || (data.image ? [data.image] : []);
                setImages(allImages);

            } catch (err) {
                console.error(err);
                setError("Failed to load listing details.");
            } finally {
                setInitialLoading(false);
            }
        }

        if (user && (isSeller || isAdmin)) {
            fetchListing();
        } else if (user) {
            setInitialLoading(false); // Let access control blocks handle it
        }
    }, [id, user, isSeller, isAdmin]);

    // Access control
    if (!user) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-4 pt-28 pb-12">
                <ShieldCheck className="w-16 h-16 text-emerald-500 mb-4" />
                <h1 className="text-4xl font-heading font-bold text-white mb-4">Sign In Required</h1>
                <p className="text-gaming-muted mb-8 max-w-md">You must be signed in to edit a listing.</p>
                <button onClick={() => navigate('/')} className="btn-secondary">Go Home</button>
            </div>
        );
    }

    if (!isSeller && !isAdmin) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-4 pt-28 pb-12">
                <AlertTriangle className="w-16 h-16 text-amber-500 mb-4" />
                <h1 className="text-4xl font-heading font-bold text-white mb-4">Access Denied</h1>
                <p className="text-gaming-muted mb-8 max-w-lg">
                    You do not have permission to access this page.
                </p>
                <button className="btn-primary" onClick={() => navigate('/')}>
                    Go Home
                </button>
            </div>
        );
    }

    if (initialLoading) {
        return <div className="min-h-screen pt-32 text-center text-white">Loading details...</div>;
    }

    if (error && !title) {
        // If there's an error and we haven't loaded data, show a full screen error
        return (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-4 pt-28 pb-12">
                <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
                <h1 className="text-4xl font-heading font-bold text-white mb-4">Error</h1>
                <p className="text-gaming-muted mb-8 max-w-lg">{error}</p>
                <button className="btn-primary" onClick={() => navigate('/')}>Return Home</button>
            </div>
        );
    }

    const addTag = () => {
        if (tagInput.trim() && !tags.includes(tagInput.trim()) && tags.length < 10) {
            setTags([...tags, tagInput.trim()]);
            setTagInput('');
        }
    };

    const addEvoGun = () => {
        if (gunName.trim()) {
            setEvoGuns([...evoGuns, { name: gunName.trim(), level: gunLevel }]);
            setGunName('');
        }
    };

    const handleImageUpload = (url: string) => {
        setImages([...images, url]);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (images.length === 0) {
            setError('Please add at least one main image.');
            return;
        }
        setError('');
        setLoading(true);

        try {
            if (!id) throw new Error("No listing ID specified");

            const updateData: Partial<NewListingData> = {
                title,
                price: price.toUpperCase().includes('BDT') ? price : `${price} BDT`,
                level: parseInt(level, 10),
                likes: parseInt(likes, 10),
                description,
                tags,
                evoGuns,
                image: images[0],
                imageGallery: images,
                server,
                totalVault,
                accountAge,
                maxEvosCount,
                primeLevel,
                videoUrl
            };

            await listingService.updateListingData(id, updateData);
            alert('Listing updated successfully!');
            navigate(`/account/${id}`);

        } catch (err) {
            console.error(err);
            setError('Failed to update listing. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="pt-24 pb-16 min-h-screen">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-4xl font-heading font-extrabold text-white mb-2">Edit <span className="text-gaming-accent">Listing</span></h1>
                    <p className="text-gaming-muted">Update your Free Fire account details.</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl mb-6 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                        <p>{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Basic Info */}
                    <div className="bg-gaming-800/50 p-6 rounded-2xl border border-gaming-700">
                        <h2 className="text-xl font-bold text-white mb-6 border-b border-gaming-700 pb-2">Basic Information</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Listing Title <span className="text-red-500">*</span></label>
                                <input
                                    required
                                    value={title} onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g. LVL 75 | 4 MAX EVO | COBRA MP40"
                                    className="glass-input"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Price (BDT) <span className="text-red-500">*</span></label>
                                <input
                                    required
                                    value={price} onChange={(e) => setPrice(e.target.value)}
                                    placeholder="1500" type="number"
                                    className="glass-input"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Account Level <span className="text-red-500">*</span></label>
                                <input
                                    required
                                    value={level} onChange={(e) => setLevel(e.target.value)}
                                    type="number"
                                    className="glass-input"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Server/Region <span className="text-red-500">*</span></label>
                                <select
                                    value={server} onChange={(e) => setServer(e.target.value)}
                                    className="w-full bg-gaming-900 border border-gaming-700 text-white p-3 rounded-lg focus:outline-none focus:border-gaming-accent"
                                >
                                    <option value="Bangladesh">Bangladesh</option>
                                    <option value="India">India</option>
                                    <option value="Pakistan">Pakistan</option>
                                    <option value="Singapore">Singapore</option>
                                    <option value="Indonesia">Indonesia</option>
                                    <option value="Mena">MENA</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Total Likes</label>
                                <input
                                    value={likes} onChange={(e) => setLikes(e.target.value)}
                                    type="number"
                                    className="glass-input"
                                />
                            </div>
                        </div>

                        <div className="mt-6">
                            <label className="block text-sm font-medium text-gray-300 mb-2">Description <span className="text-red-500">*</span></label>
                            <textarea
                                required
                                value={description} onChange={(e) => setDescription(e.target.value)}
                                rows={4}
                                placeholder="Describe your account, mentioning rare skins, bundles, past elite passes..."
                                className="glass-input resize-none"
                            />
                        </div>
                    </div>

                    {/* Tags */}
                    <div className="bg-gaming-800/50 p-6 rounded-2xl border border-gaming-700">
                        <h2 className="text-xl font-bold text-white mb-6 border-b border-gaming-700 pb-2">Highlight Tags (Max 10)</h2>
                        <div className="flex gap-2 mb-4">
                            <input
                                value={tagInput} onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                                placeholder="e.g. V Badge, Old Account"
                                className="flex-grow bg-gaming-900 border border-gaming-700 text-white p-3 rounded-lg focus:outline-none focus:border-gaming-accent"
                            />
                            <button type="button" onClick={addTag} className="btn-secondary px-6">Add</button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <AnimatePresence>
                                {tags.map(tag => (
                                    <motion.span
                                        initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                                        key={tag}
                                        className="flex items-center gap-1 px-3 py-1.5 bg-gaming-900 border border-gaming-accent/50 rounded-lg text-sm text-gaming-accent"
                                    >
                                        {tag} <button type="button" onClick={() => setTags(tags.filter(t => t !== tag))}><X className="w-3 h-3 hover:text-white" /></button>
                                    </motion.span>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Stats & Evo Guns */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-gaming-800/50 p-6 rounded-2xl border border-gaming-700">
                            <h2 className="text-xl font-bold text-white mb-6 border-b border-gaming-700 pb-2">Account Metrics</h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs text-gaming-muted mb-1">Total Vault Amount</label>
                                    <input placeholder="e.g. 50k Diamonds" value={totalVault} onChange={(e) => setTotalVault(e.target.value)} className="glass-input" />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs text-gaming-muted mb-1">Max Evos Count</label>
                                    <input placeholder="0" type="number" value={maxEvosCount} onChange={(e) => setMaxEvosCount(parseInt(e.target.value) || 0)} className="glass-input" />
                                </div>
                                <div>
                                    <label className="block text-xs text-gaming-muted mb-1">Account Age (Years)</label>
                                    <input placeholder="e.g. 4" type="number" value={accountAge} onChange={(e) => setAccountAge(e.target.value)} className="glass-input" />
                                </div>
                                <div>
                                    <label className="block text-xs text-gaming-muted mb-1">Prime Level (0-8)</label>
                                    <input placeholder="0" type="number" min="0" max="8" value={primeLevel} onChange={(e) => setPrimeLevel(parseInt(e.target.value) || 0)} className="glass-input" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-gaming-800/50 p-6 rounded-2xl border border-gaming-700">
                            <h2 className="text-xl font-bold text-white mb-6 border-b border-gaming-700 pb-2">Evo Guns</h2>
                            <div className="flex gap-2 mb-4">
                                <input value={gunName} onChange={e => setGunName(e.target.value)} placeholder="Gun Name" className="flex-grow bg-gaming-900 p-2 border-gaming-700 text-white rounded focus:border-gaming-accent" />
                                <select value={gunLevel} onChange={e => setGunLevel(e.target.value)} className="bg-gaming-900 p-2 border-gaming-700 text-white rounded focus:border-gaming-accent">
                                    <option>MAX</option>
                                    {[6, 5, 4, 3, 2, 1].map(lvl => <option key={lvl}>LVL {lvl}</option>)}
                                </select>
                                <button type="button" onClick={addEvoGun} className="bg-gaming-700 p-2 rounded hover:bg-gaming-600"><Plus className="w-5 h-5 text-white" /></button>
                            </div>
                            <ul className="space-y-2 max-h-40 overflow-y-auto pr-2">
                                {evoGuns.map((gun, idx) => (
                                    <li key={idx} className="flex justify-between p-2 bg-gaming-900 rounded border border-gaming-700 text-sm">
                                        <span className="text-white">{gun.name}</span>
                                        <span className="text-gaming-accent font-bold">{gun.level}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Media Links */}
                    <div className="bg-gaming-800/50 p-6 rounded-2xl border border-gaming-700">
                        <h2 className="text-xl font-bold text-white mb-2 border-b border-gaming-700 pb-2">Account Video</h2>

                        <div className="pt-2 pb-6 border-b border-gaming-700 mb-6">
                            <label className="block text-sm font-medium text-gray-300 mb-2">Video Link (YouTube or Streamable)</label>
                            <input
                                type="url"
                                value={videoUrl}
                                onChange={(e) => setVideoUrl(e.target.value)}
                                placeholder="https://youtu.be/... or https://streamable.com/..."
                                className="glass-input px-4"
                            />
                            <p className="text-xs text-gaming-muted mt-2">Optional. Embed gameplay footage directly on the listing.</p>
                        </div>

                        <h2 className="text-xl font-bold text-white mb-2 pb-2">Images</h2>
                        <div className="mb-6">
                            <ImageUploader
                                onImageUploaded={handleImageUpload}
                                onError={setError}
                                label="Upload New Images"
                                description="Click or drag and drop to upload directly. First image will be main."
                            />
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {images.map((img, idx) => (
                                <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border border-gaming-700 bg-gaming-900">
                                    <img src={img} alt={`Preview ${idx} `} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button type="button" onClick={() => setImages(images.filter((_, i) => i !== idx))} className="bg-red-500 text-white p-2 rounded-full">
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                    {idx === 0 && (
                                        <div className="absolute top-2 left-2 bg-gaming-accent text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded shadow">Main</div>
                                    )}
                                </div>
                            ))}
                            {images.length === 0 && (
                                <div className="aspect-square rounded-xl border border-dashed border-gaming-700 flex flex-col items-center justify-center text-gaming-muted col-span-2 sm:col-span-4 py-12">
                                    <p className="text-sm">No images added</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`btn - primary py - 4 px - 12 text - lg ${loading ? 'opacity-70 cursor-not-allowed' : ''} `}
                        >
                            {loading ? 'Saving Changes...' : 'Save Changes'}
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
}
