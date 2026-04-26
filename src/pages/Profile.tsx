import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { ShieldCheck, User, Settings, Package, TriangleAlert as AlertTriangle, ShieldAlert, Heart, LogOut } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { listingService } from '../services/listingService';
import { userService } from '../services/userService';
import { commentService } from '../services/commentService';
import AccountCard, { type AccountData } from '../components/AccountCard';
import ImageUploader from '../components/ImageUploader';
import CountrySelect, { COUNTRY_CODES } from '../components/CountrySelect';

type Tab = 'overview' | 'settings' | 'listings';

export default function Profile() {
    const { user, profile, isSeller, logout, updateProfile, signInWithGoogle } = useAuth();
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [userListings, setUserListings] = useState<AccountData[]>([]);

    const [activeTab, setActiveTab] = useState<Tab>('overview');
    const [editName, setEditName] = useState('');
    const [editUsername, setEditUsername] = useState('');
    const [editPhoto, setEditPhoto] = useState('');
    const [editCountryCode, setEditCountryCode] = useState('+880');
    const [editWhatsapp, setEditWhatsapp] = useState('');
    const [savingProfile, setSavingProfile] = useState(false);

    const fetchListings = useCallback(async () => {
        if (isSeller && user?.uid) {
            const listings = await listingService.getListingsBySellerId(user.uid);
            setUserListings(listings || []);
        }
    }, [isSeller, user?.uid]);

    useEffect(() => {
        fetchListings();
        if (profile) {
            setEditName(profile.displayName || '');
            setEditUsername(profile.username || '');
            setEditPhoto(profile.photoURL || '');
            
            if (profile.whatsappNumber) {
                let foundCode = '+880';
                let extractedNum = profile.whatsappNumber;
                
                const sortedCodes = [...COUNTRY_CODES].sort((a, b) => b.code.length - a.code.length);
                
                for (const cc of sortedCodes) {
                    if (profile.whatsappNumber.startsWith(cc.code)) {
                        foundCode = cc.code;
                        extractedNum = profile.whatsappNumber.substring(cc.code.length);
                        break;
                    }
                }
                
                setEditCountryCode(foundCode);
                setEditWhatsapp(extractedNum);
            } else {
                setEditWhatsapp('');
            }
        }
    }, [profile, fetchListings]);

    const handleSaveProfile = async () => {
        if (!user || !profile) return;
        setSavingProfile(true);
        try {
            // Check username if it changed
            if (profile.username !== editUsername) {
                if (!/^[a-zA-Z0-9_]+$/.test(editUsername)) {
                    alert("Username can only contain letters, numbers, and underscores.");
                    setSavingProfile(false);
                    return;
                }
                const isTaken = await userService.isUsernameTaken(editUsername, user.uid);
                if (isTaken) {
                    alert("That username is already taken. Please choose another one.");
                    setSavingProfile(false);
                    return;
                }
                // Batch update listings if username changed
                await listingService.updateListingsUsername(user.uid, editUsername);
            }

            // Sync Display Name or Photo URL across listings and comments if they changed
            if (profile.displayName !== editName || profile.photoURL !== editPhoto) {
                await Promise.all([
                    listingService.updateListingsProfile(user.uid, editName, editPhoto),
                    commentService.updateCommentsProfile(user.uid, editName, editPhoto)
                ]);
            }

            let finalWhatsapp = null;
            if (editWhatsapp.trim()) {
                let localNum = editWhatsapp.trim();
                if (editCountryCode === '+880' && localNum.startsWith('01')) {
                    localNum = localNum.substring(1);
                }
                finalWhatsapp = `${editCountryCode}${localNum}`;
            }

            const newRole = finalWhatsapp
                ? (profile.role === 'user' ? 'seller' : profile.role)
                : (profile.role === 'seller' ? 'user' : profile.role);

            await updateProfile({
                displayName: editName,
                username: editUsername,
                photoURL: editPhoto,
                whatsappNumber: finalWhatsapp,
                role: newRole
            });
            alert("Profile updated successfully!");
        } catch (err) {
            console.error(err);
            alert("Failed to update profile.");
        } finally {
            setSavingProfile(false);
        }
    };

    const handleStatusChange = async (id: string, currentStatus: string, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            const newStatus = currentStatus === 'sold' ? 'active' : 'sold';
            await listingService.updateListingStatus(id, newStatus as 'active' | 'sold' | 'pending_review');
            await fetchListings();
        } catch (error) {
            console.error(error);
            alert("Failed to update listing status");
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!window.confirm("Are you sure you want to completely DELETE this listing?")) return;
        try {
            await listingService.deleteListing(id);
            await fetchListings();
        } catch (error) {
            console.error(error);
            alert("Failed to delete listing");
        }
    };

    const handleBump = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await listingService.bumpListing(id);
            alert("Listing bumped successfully!");
            await fetchListings();
        } catch (error) {
            console.error(error);
            alert("Failed to bump listing.");
        }
    };

    if (!user || !profile) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center px-4 pt-28 pb-12">
                <div className="bg-gaming-800/50 backdrop-blur-xl border border-white/10 p-8 rounded-3xl max-w-md w-full text-center shadow-2xl">
                    <div className="w-20 h-20 bg-gaming-900/80 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/5 shadow-inner">
                        <User className="w-10 h-10 text-gaming-accent" />
                    </div>
                    <h2 className="text-3xl font-heading font-bold text-white mb-3">{t['prof_signin_title'] || 'Sign In / Sign Up'}</h2>
                    <p className="text-gaming-muted mb-8 text-sm leading-relaxed">
                        {t['prof_signin_desc'] || 'Create an account or sign in to view your dashboard, manage your listings, and communicate with securely verified sellers.'}
                    </p>
                    <button
                        onClick={signInWithGoogle}
                        className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-3"
                    >
                        <svg className="w-6 h-6" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        {t['prof_btn_google'] || 'Continue with Google'}
                    </button>

                    <div className="mt-8 pt-6 border-t border-gaming-700 text-xs text-gaming-muted">
                        <p>{t['prof_terms_agree'] || 'By continuing, you agree to our'} <a href="/terms" className="text-gaming-accent hover:underline">Terms of Service</a> {t['prof_and'] || 'and'} <a href="/privacy" className="text-gaming-accent hover:underline">Privacy Policy</a>.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="pt-20 md:pt-24 pb-10 md:pb-16 min-h-screen">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Header Banner */}
                <div className="relative rounded-2xl md:rounded-3xl bg-gaming-900 border border-gaming-800 overflow-hidden mb-5 md:mb-8 shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-r from-gaming-accent/20 to-transparent opacity-20 pointer-events-none" />
                    <div className="p-5 md:p-8 flex flex-col md:flex-row items-center gap-3 md:gap-6 relative z-10">
                        <div className="relative w-20 h-20 md:w-28 md:h-28 rounded-full bg-gaming-800 border-2 md:border-4 border-gaming-800 overflow-hidden shadow-xl shrink-0">
                            {user.photoURL ? (
                                <img src={user.photoURL} alt={profile.displayName || ''} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-10 h-10 md:w-12 md:h-12 text-gaming-muted absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                            )}
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <h1 className="text-2xl md:text-3xl font-heading font-black text-white mb-1 md:mb-2">{profile.displayName || user.displayName}</h1>
                            <p className="text-gaming-accent font-mono mb-3 md:mb-4 text-xs md:text-sm">@{profile.username}</p>
                            <div className="flex flex-wrap justify-center md:justify-start items-center gap-3">
                                <span className="px-3 py-1 bg-gaming-800 border border-gaming-700 rounded-lg text-xs font-bold uppercase tracking-wider text-gray-300">
                                    Role: <span className="text-gaming-accent">{profile.role.replace('_', ' ')}</span>
                                </span>
                                {isSeller && (
                                    <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                                        <ShieldCheck className="w-3.5 h-3.5" /> Verified Seller
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-row md:flex-col gap-2 w-auto mt-1 md:mt-0 justify-center">
                            <button onClick={() => navigate('/wishlist')} className="btn-secondary py-1.5 md:py-2.5 px-4 md:px-6 border-pink-500/30 text-pink-400 hover:text-pink-300 hover:bg-pink-500/10 flex items-center justify-center gap-1.5 text-[11px] md:text-base rounded-lg md:rounded-xl shadow-none">
                                <Heart className="w-3.5 h-3.5 md:w-4 md:h-4 shrink-0" /> <span className="truncate whitespace-nowrap">{t['prof_btn_wishlist'] || 'Wishlist'}</span>
                            </button>
                            <button onClick={logout} className="btn-secondary py-1.5 md:py-2.5 px-4 md:px-6 border-red-500/30 text-red-400 hover:text-red-300 hover:bg-red-500/10 flex items-center justify-center gap-1.5 text-[11px] md:text-base rounded-lg md:rounded-xl shadow-none">
                                <LogOut className="w-3.5 h-3.5 md:w-4 md:h-4 shrink-0" /> <span className="truncate whitespace-nowrap">{t['prof_btn_signout'] || 'Sign Out'}</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Warnings */}
                {profile.isBanned && (
                    <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-xl mb-6 flex items-center gap-3 font-bold shadow-lg">
                        <ShieldAlert className="w-6 h-6 shrink-0" />
                        <div>
                            <p className="uppercase tracking-wider">Your account has been banned</p>
                            <p className="text-xs font-normal mt-1 text-red-400">You may no longer use this platform's services. Contact support for appeals.</p>
                        </div>
                    </div>
                )}
                {profile.isScammer && (
                    <div className="bg-amber-500/10 border border-amber-500 text-amber-500 p-4 rounded-xl mb-6 flex items-center gap-3 font-bold shadow-lg">
                        <AlertTriangle className="w-6 h-6 shrink-0" />
                        <div>
                            <p className="uppercase tracking-wider">Account Flagged as Scammer</p>
                            <p className="text-xs font-normal mt-1 text-amber-400">Your profile is publicly marked as a scammer to protect other users.</p>
                        </div>
                    </div>
                )}

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    
                    {/* Sidebar Tabs */}
                    <div className="lg:col-span-1 flex lg:flex-col justify-center lg:justify-start gap-1.5 md:gap-2 overflow-x-auto pb-2 lg:pb-0 hide-scrollbar snap-x">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`flex-none whitespace-nowrap flex-shrink-0 snap-center text-center lg:text-left px-3.5 py-2 md:px-5 md:py-4 text-xs lg:text-base rounded-lg md:rounded-xl font-bold transition-all flex items-center justify-center lg:justify-start gap-1.5 lg:gap-3 ${activeTab === 'overview' ? 'bg-gaming-accent text-gaming-950 shadow-md' : 'bg-gaming-800/40 text-gaming-muted hover:bg-gaming-800 hover:text-white border border-transparent hover:border-gaming-700'}`}
                        >
                            <User className="w-3.5 h-3.5 lg:w-5 lg:h-5 shrink-0" /> Overview
                        </button>
                        <button
                            onClick={() => setActiveTab('settings')}
                            className={`flex-none whitespace-nowrap flex-shrink-0 snap-center text-center lg:text-left px-3.5 py-2 md:px-5 md:py-4 text-xs lg:text-base rounded-lg md:rounded-xl font-bold transition-all flex items-center justify-center lg:justify-start gap-1.5 lg:gap-3 ${activeTab === 'settings' ? 'bg-gaming-accent text-gaming-950 shadow-md' : 'bg-gaming-800/40 text-gaming-muted hover:bg-gaming-800 hover:text-white border border-transparent hover:border-gaming-700'}`}
                        >
                            <Settings className="w-3.5 h-3.5 lg:w-5 lg:h-5 shrink-0" /> Settings
                        </button>
                        {isSeller && (
                            <button
                                onClick={() => setActiveTab('listings')}
                                className={`flex-none whitespace-nowrap flex-shrink-0 snap-center text-center lg:text-left px-3.5 py-2 md:px-5 md:py-4 text-xs lg:text-base rounded-lg md:rounded-xl font-bold transition-all flex items-center justify-center lg:justify-between gap-1.5 lg:gap-3 ${activeTab === 'listings' ? 'bg-gaming-accent text-gaming-950 shadow-md' : 'bg-gaming-800/40 text-gaming-muted hover:bg-gaming-800 hover:text-white border border-transparent hover:border-gaming-700'}`}
                            >
                                <span className="flex items-center gap-1.5 lg:gap-3"><Package className="w-3.5 h-3.5 lg:w-5 lg:h-5 shrink-0" /> My Listings</span>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black hidden lg:block ${activeTab === 'listings' ? 'bg-gaming-950 text-gaming-accent' : 'bg-gaming-700 text-white'}`}>{userListings.length}</span>
                            </button>
                        )}
                    </div>

                    {/* Tab Content */}
                    <div className="lg:col-span-3">
                        <AnimatePresence mode="wait">
                            
                            {/* OVERVIEW TAB */}
                            {activeTab === 'overview' && (
                                <motion.div
                                    key="overview"
                                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                    className="space-y-6"
                                >
                                    <div className="bg-gaming-800/40 border border-gaming-700/50 p-8 rounded-3xl backdrop-blur-sm">
                                        <h3 className="text-xl font-bold text-white mb-6">Account Details</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                            <div>
                                                <p className="text-sm text-gaming-muted mb-1">Email Address</p>
                                                <p className="text-white font-medium bg-gaming-900/50 py-2 px-4 rounded-lg border border-gaming-800">{profile.email}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gaming-muted mb-1">Member Since</p>
                                                <p className="text-white font-medium bg-gaming-900/50 py-2 px-4 rounded-lg border border-gaming-800">
                                                    {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'Unknown'}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gaming-muted mb-1">WhatsApp Contact</p>
                                                <p className="text-white font-medium bg-gaming-900/50 py-2 px-4 rounded-lg border border-gaming-800">
                                                    {profile.whatsappNumber || <span className="text-gaming-muted italic">Not provided</span>}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gaming-muted mb-1">Seller Status</p>
                                                <p className="text-white font-medium bg-gaming-900/50 py-2 px-4 rounded-lg border border-gaming-800">
                                                    {isSeller ? <span className="text-emerald-400 font-bold">Active</span> : <span className="text-amber-400 font-bold">Inactive</span>}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {!isSeller && (
                                        <div className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 rounded-3xl p-8 relative overflow-hidden">
                                            <AlertTriangle className="absolute -right-8 -bottom-8 w-48 h-48 text-amber-500/5" />
                                            <h3 className="text-2xl font-bold text-amber-500 mb-3 flex items-center gap-3">
                                                <ShieldCheck className="w-8 h-8" /> Become a Seller
                                            </h3>
                                            <p className="text-amber-100/70 mb-8 max-w-xl leading-relaxed relative z-10 text-sm">
                                                You currently have a standard user account. To create listings and sell accounts on this platform, you must add your WhatsApp number to your profile. This helps verify your identity and provides a secure contact method for buyers.
                                            </p>
                                            <div className="flex justify-center lg:justify-start">
                                                <button onClick={() => setActiveTab('settings')} className="btn-primary bg-amber-600 hover:bg-amber-500 shadow-none relative z-10 px-6 py-2.5 md:px-8 md:py-3 text-sm rounded-lg md:rounded-xl">
                                                    Set Up Profile
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {/* SETTINGS TAB */}
                            {activeTab === 'settings' && (
                                <motion.div
                                    key="settings"
                                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                >
                                    <div className="bg-gaming-800/40 border border-gaming-700/50 p-6 sm:p-8 rounded-3xl backdrop-blur-sm">
                                        <h3 className="text-2xl font-heading font-bold text-white mb-6 border-b border-gaming-700/50 pb-4">Edit Profile</h3>
                                        
                                        <div className="space-y-8">
                                            {/* Photo Upload Section */}
                                            <div>
                                                <h4 className="text-sm font-bold text-gray-300 mb-4 uppercase tracking-wider">Profile Picture</h4>
                                                <div className="flex flex-col sm:flex-row gap-6 items-start">
                                                    <div className="w-24 h-24 rounded-full bg-gaming-900 border-4 border-gaming-800 overflow-hidden shrink-0">
                                                        {editPhoto ? (
                                                            <img src={editPhoto} alt="Preview" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <User className="w-10 h-10 text-gaming-muted m-auto mt-6" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 w-full">
                                                        <ImageUploader
                                                            onImageUploaded={setEditPhoto}
                                                            label="Upload New Photo"
                                                            description="Click to select or drag and drop a new avatar image."
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Personal Info Section */}
                                            <div>
                                                <h4 className="text-sm font-bold text-gray-300 mb-4 uppercase tracking-wider">Personal Information</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div>
                                                        <label className="block text-sm text-gaming-muted mb-2 font-medium">Display Name</label>
                                                        <input
                                                            value={editName} onChange={e => setEditName(e.target.value)}
                                                            className="glass-input bg-gaming-900/50"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm text-gaming-muted mb-2 font-medium">Username (URL Path)</label>
                                                        <div className="relative">
                                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                                <span className="text-gaming-muted font-mono">@</span>
                                                            </div>
                                                            <input
                                                                value={editUsername} onChange={e => setEditUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                                                                className="glass-input bg-gaming-900/50 pl-9 font-mono text-sm"
                                                                placeholder="unique_username"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Contact Info Section */}
                                            <div>
                                                <h4 className="text-sm font-bold text-gray-300 mb-4 uppercase tracking-wider">Contact Information</h4>
                                                <div>
                                                    <label className="block text-sm text-gaming-muted mb-2 font-medium">WhatsApp Number <span className="text-emerald-500 ml-1 text-xs font-normal">(Required to sell)</span></label>
                                                    <div className="flex gap-3">
                                                        <div className="w-[120px]">
                                                            <CountrySelect
                                                                value={editCountryCode}
                                                                onChange={setEditCountryCode}
                                                            />
                                                        </div>
                                                        <input
                                                            value={editWhatsapp} onChange={e => setEditWhatsapp(e.target.value.replace(/[^0-9]/g, ''))}
                                                            className="glass-input bg-gaming-900/50 flex-1 font-mono tracking-wider"
                                                            placeholder="1764696964"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="pt-6 border-t border-gaming-700/50 flex justify-center lg:justify-end">
                                                <button 
                                                    onClick={handleSaveProfile} 
                                                    disabled={savingProfile} 
                                                    className="btn-primary py-2.5 px-6 md:py-3 md:px-8 text-xs md:text-sm rounded-lg md:rounded-xl disabled:opacity-50"
                                                >
                                                    {savingProfile ? 'Saving Changes...' : 'Save Profile Changes'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* LISTINGS TAB */}
                            {activeTab === 'listings' && isSeller && (
                                <motion.div
                                    key="listings"
                                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                >
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                                            <Package className="w-6 h-6 text-gaming-accent" /> Manage Listings
                                        </h3>
                                        <button onClick={() => navigate('/sell')} className="btn-primary py-1.5 px-3 md:py-2 md:px-4 text-[10px] md:text-xs font-bold rounded-lg md:rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                                            + New Listing
                                        </button>
                                    </div>

                                    {userListings.length > 0 ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                            {userListings.map((account, index) => (
                                                <AccountCard
                                                    key={account.id}
                                                    account={account}
                                                    index={index}
                                                    onDelete={handleDelete}
                                                    onStatusChange={handleStatusChange}
                                                    onEdit={() => navigate(`/edit-listing/${account.id}`)}
                                                    onBump={handleBump}
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-20 bg-gaming-800/40 rounded-3xl border border-dashed border-gaming-700/50">
                                            <Package className="w-16 h-16 text-gaming-muted mx-auto mb-4 opacity-50" />
                                            <h4 className="text-xl font-bold text-white mb-2">No active listings</h4>
                                            <p className="text-gaming-muted mb-6">You haven't created any account listings yet.</p>
                                            <button onClick={() => navigate('/sell')} className="btn-primary">
                                                Create Your First Listing
                                            </button>
                                        </div>
                                    )}
                                </motion.div>
                            )}

                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}
