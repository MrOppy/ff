import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { ShieldCheck, User, Settings, Package, TriangleAlert as AlertTriangle, ShieldAlert, Heart } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { listingService } from '../services/listingService';
import { userService } from '../services/userService';
import { commentService } from '../services/commentService';
import AccountCard, { type AccountData } from '../components/AccountCard';
import ImageUploader from '../components/ImageUploader';

export default function Profile() {
    const { user, profile, isSeller, logout, updateProfile, signInWithGoogle } = useAuth();
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [userListings, setUserListings] = useState<AccountData[]>([]);

    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [editName, setEditName] = useState('');
    const [editUsername, setEditUsername] = useState('');
    const [editPhoto, setEditPhoto] = useState('');
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
            setEditWhatsapp(profile.whatsappNumber || '');
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

            await updateProfile({
                displayName: editName,
                username: editUsername,
                photoURL: editPhoto,
                whatsappNumber: editWhatsapp
            });
            setIsEditingProfile(false);
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
        <div className="pt-24 pb-16 min-h-screen">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-heading font-extrabold text-white mb-8 border-b border-gaming-700 pb-4">
                    {t['prof_title_1'] || 'My '} <span className="text-gaming-accent">{t['prof_title_2'] || 'Dashboard'}</span>
                </h1>

                {profile.isBanned && (
                    <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-xl mb-6 flex items-center gap-3 font-bold">
                        <ShieldAlert className="w-6 h-6 shrink-0" />
                        <div>
                            <p className="uppercase tracking-wider">Your account has been banned</p>
                            <p className="text-xs font-normal mt-1 text-red-400">You may no longer use this platform's services. Contact support for appeals.</p>
                        </div>
                    </div>
                )}

                {profile.isScammer && (
                    <div className="bg-amber-500/10 border border-amber-500 text-amber-500 p-4 rounded-xl mb-6 flex items-center gap-3 font-bold">
                        <AlertTriangle className="w-6 h-6 shrink-0" />
                        <div>
                            <p className="uppercase tracking-wider">Account Flagged as Scammer</p>
                            <p className="text-xs font-normal mt-1 text-amber-400">Your profile is publicly marked as a scammer to protect other users.</p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Left Col - Profile Info */}
                    <div className="col-span-1 space-y-6">
                        <div className="bg-gaming-800/50 p-6 rounded-2xl border border-gaming-700 text-center">
                            <div className="relative w-24 h-24 rounded-full mx-auto mb-4 bg-gaming-700 border-2 border-gaming-500 overflow-hidden flex items-center justify-center">
                                {user.photoURL ? (
                                    <img src={user.photoURL || ''} alt={user.displayName || 'User'} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-10 h-10 text-gaming-muted" />
                                )}
                            </div>
                            <h2 className="text-xl font-bold text-white mb-1">{profile.displayName || user.displayName}</h2>
                            <p className="text-gaming-accent font-mono mb-2">@{profile.username}</p>
                            <p className="text-sm text-gaming-muted mb-4">{profile.email}</p>



                            <div className="inline-block px-3 py-1 bg-gaming-900 border border-gaming-600 rounded-full text-xs font-bold uppercase tracking-wider text-gaming-accent mb-6">
                                {t['prof_role'] || 'Role:'} {profile.role}
                            </div>

                            <button onClick={logout} className="w-full btn-secondary text-red-400 hover:text-red-300 border-red-900 hover:bg-red-900/20">
                                {t['prof_btn_signout'] || 'Sign Out'}
                            </button>
                        </div>
                    </div>

                    {/* Right Col - Details & Listings */}
                    <div className="col-span-1 md:col-span-2 space-y-8">

                        <div className="bg-gaming-800/50 p-6 rounded-2xl border border-gaming-700">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Settings className="w-5 h-5 text-gaming-accent" /> {t['prof_settings'] || 'Profile Settings'}
                                </h3>
                                <div className="flex items-center gap-3">
                                    <button onClick={() => navigate('/wishlist')} className="text-pink-400 hover:text-pink-300 text-sm font-bold transition-colors flex items-center gap-1.5 bg-pink-500/10 px-3 py-1.5 rounded-lg border border-pink-500/20">
                                        <Heart className="w-4 h-4" /> {t['prof_btn_wishlist'] || 'My Wishlist'}
                                    </button>
                                    {!isEditingProfile && (
                                        <button onClick={() => setIsEditingProfile(true)} className="text-gaming-accent hover:text-white text-sm font-bold transition-colors">
                                            {t['prof_btn_edit'] || 'Edit Profile'}
                                        </button>
                                    )}
                                </div>
                            </div>

                            {isEditingProfile ? (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm text-gaming-muted mb-1">{t['prof_label_name'] || 'Display Name'}</label>
                                            <input
                                                value={editName} onChange={e => setEditName(e.target.value)}
                                                className="glass-input"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gaming-muted mb-1">{t['prof_label_user'] || 'Username (URL Path)'}</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <span className="text-gaming-muted">@</span>
                                                </div>
                                                <input
                                                    value={editUsername} onChange={e => setEditUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                                                    className="glass-input pl-8"
                                                    placeholder="unique_username"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <ImageUploader
                                            onImageUploaded={setEditPhoto}
                                            label={t['prof_label_photo'] || 'Profile Photo'}
                                            description={t['prof_desc_photo'] || 'Click to upload a new avatar.'}
                                            className="mb-2"
                                        />
                                        {editPhoto && (
                                            <div className="mt-4 flex flex-col items-center p-4 bg-gaming-900/50 rounded-xl border border-gaming-700/50">
                                                <p className="text-xs text-gaming-muted mb-2 w-full text-left">{t['prof_preview_photo'] || 'New avatar preview:'}</p>
                                                <div className="w-20 h-20 rounded-full bg-gaming-800 border-2 border-gaming-accent overflow-hidden shadow-lg shadow-gaming-accent/20">
                                                    <img src={editPhoto} alt="Preview" className="w-full h-full object-cover" />
                                                </div>
                                                <p className="text-xs text-green-400 mt-3 flex items-center justify-center gap-1 w-full font-bold">
                                                    <ShieldCheck className="w-3 h-3" /> {t['prof_ready_photo'] || 'Photo ready to save'}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex gap-2 pt-2">
                                        <button onClick={handleSaveProfile} disabled={savingProfile} className="btn-primary flex-1">
                                            {savingProfile ? (t['prof_btn_saving'] || 'Saving...') : (t['prof_btn_save'] || 'Save Changes')}
                                        </button>
                                        <button onClick={() => setIsEditingProfile(false)} className="btn-secondary flex-1">
                                            {t['prof_btn_cancel'] || 'Cancel'}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-gaming-muted">
                                    {t['prof_msg_update'] || 'Your profile details represent you on the marketplace. Keep them updated to build trust.'}
                                </p>
                            )}
                        </div>

                        {!isSeller && (
                            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6 relative overflow-hidden">
                                <AlertTriangle className="absolute -right-4 -bottom-4 w-32 h-32 text-amber-500/10" />
                                <h3 className="text-xl font-bold text-amber-500 mb-2 flex items-center gap-2">
                                    <ShieldCheck className="w-6 h-6" /> {t['prof_req_title'] || 'Seller Verification Required'}
                                </h3>
                                <p className="text-amber-100/70 mb-6 text-sm leading-relaxed relative z-10">
                                    {t['prof_req_desc'] || 'You currently have a standard user account. To create listings and sell accounts on this platform, you must be manually verified by the administrator.'}
                                </p>
                                <button onClick={() => window.open('https://wa.me/8801764696964', '_blank')} className="btn-primary bg-amber-600 hover:bg-amber-500 shadow-none text-sm relative z-10">
                                    {t['prof_btn_wa'] || 'Contact Admin via WhatsApp'}
                                </button>
                            </div>
                        )}

                        {isSeller && (
                            <div>
                                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                    <Package className="w-5 h-5 text-gaming-accent" /> {t['prof_listings_title'] || 'All My Listings'}
                                </h3>
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
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 bg-gaming-800/50 rounded-2xl border border-dashed border-gaming-700">
                                        <Package className="w-12 h-12 text-gaming-muted mx-auto mb-3 opacity-50" />
                                        <p className="text-gaming-muted">{t['prof_no_listings'] || "You haven't created any listings yet."}</p>
                                    </div>
                                )}
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
}
