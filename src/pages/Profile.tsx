import { useAuth } from '../context/AuthContext';
import { ShieldCheck, User, Settings, Package, AlertTriangle, ShieldAlert, Heart } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { listingService } from '../services/listingService';
import AccountCard, { type AccountData } from '../components/AccountCard';

export default function Profile() {
    const { user, profile, isSeller, logout, updateProfile, signInWithGoogle } = useAuth();
    const navigate = useNavigate();
    const [userListings, setUserListings] = useState<AccountData[]>([]);

    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [editName, setEditName] = useState('');
    const [editPhoto, setEditPhoto] = useState('');
    const [editWhatsapp, setEditWhatsapp] = useState('');
    const [savingProfile, setSavingProfile] = useState(false);

    const fetchListings = useCallback(async () => {
        if (isSeller && user?.displayName) {
            const listings = await listingService.getListingsBySeller(user.displayName);
            setUserListings(listings || []);
        }
    }, [isSeller, user?.displayName]);

    useEffect(() => {
        fetchListings();
        if (profile) {
            setEditName(profile.displayName || '');
            setEditPhoto(profile.photoURL || '');
            setEditWhatsapp(profile.whatsappNumber || '');
        }
    }, [profile, fetchListings]);

    const handleSaveProfile = async () => {
        setSavingProfile(true);
        try {
            await updateProfile({
                displayName: editName,
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
            <div className="pt-32 pb-16 min-h-[80vh] flex flex-col items-center justify-center px-4 -mt-20">
                <div className="bg-gaming-800/50 backdrop-blur-xl border border-white/10 p-8 rounded-3xl max-w-md w-full text-center shadow-2xl">
                    <div className="w-20 h-20 bg-gaming-900/80 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/5 shadow-inner">
                        <User className="w-10 h-10 text-gaming-accent" />
                    </div>
                    <h2 className="text-3xl font-heading font-bold text-white mb-3">Sign In / Sign Up</h2>
                    <p className="text-gaming-muted mb-8 text-sm leading-relaxed">
                        Create an account or sign in to view your dashboard, manage your listings, and communicate with securely verified sellers.
                    </p>
                    <button
                        onClick={signInWithGoogle}
                        className="btn-primary w-full py-4 text-lg"
                    >
                        Continue with Google
                    </button>

                    <div className="mt-8 pt-6 border-t border-gaming-700 text-xs text-gaming-muted">
                        <p>By continuing, you agree to our <a href="/terms" className="text-gaming-accent hover:underline">Terms of Service</a> and <a href="/privacy" className="text-gaming-accent hover:underline">Privacy Policy</a>.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="pt-24 pb-16 min-h-screen">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-heading font-extrabold text-white mb-8 border-b border-gaming-700 pb-4">
                    My <span className="text-gaming-accent">Dashboard</span>
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
                            <div className="w-24 h-24 rounded-full mx-auto mb-4 bg-gaming-700 border-2 border-gaming-500 overflow-hidden flex items-center justify-center">
                                {user.photoURL ? (
                                    <img src={user.photoURL} alt={user.displayName || 'User'} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-10 h-10 text-gaming-muted" />
                                )}
                            </div>
                            <h2 className="text-xl font-bold text-white mb-1">{profile.displayName || user.displayName}</h2>
                            <p className="text-sm text-gaming-muted mb-4">{profile.email}</p>



                            <div className="inline-block px-3 py-1 bg-gaming-900 border border-gaming-600 rounded-full text-xs font-bold uppercase tracking-wider text-gaming-accent mb-6">
                                Role: {profile.role}
                            </div>

                            <button onClick={logout} className="w-full btn-secondary text-red-400 hover:text-red-300 border-red-900 hover:bg-red-900/20">
                                Sign Out
                            </button>
                        </div>
                    </div>

                    {/* Right Col - Details & Listings */}
                    <div className="col-span-1 md:col-span-2 space-y-8">

                        <div className="bg-gaming-800/50 p-6 rounded-2xl border border-gaming-700">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Settings className="w-5 h-5 text-gaming-accent" /> Profile Settings
                                </h3>
                                <div className="flex items-center gap-3">
                                    <button onClick={() => navigate('/wishlist')} className="text-pink-400 hover:text-pink-300 text-sm font-bold transition-colors flex items-center gap-1.5 bg-pink-500/10 px-3 py-1.5 rounded-lg border border-pink-500/20">
                                        <Heart className="w-4 h-4" /> My Wishlist
                                    </button>
                                    {!isEditingProfile && (
                                        <button onClick={() => setIsEditingProfile(true)} className="text-gaming-accent hover:text-white text-sm font-bold transition-colors">
                                            Edit Profile
                                        </button>
                                    )}
                                </div>
                            </div>

                            {isEditingProfile ? (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm text-gaming-muted mb-1">Display Name</label>
                                        <input
                                            value={editName} onChange={e => setEditName(e.target.value)}
                                            className="glass-input"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm text-gaming-muted mb-1">Profile Photo URL (Catbox.moe)</label>
                                        <input
                                            value={editPhoto} onChange={e => setEditPhoto(e.target.value)} placeholder="https://files.catbox.moe/..."
                                            className="glass-input"
                                        />
                                    </div>
                                    <div className="flex gap-2 pt-2">
                                        <button onClick={handleSaveProfile} disabled={savingProfile} className="btn-primary flex-1">
                                            {savingProfile ? 'Saving...' : 'Save Changes'}
                                        </button>
                                        <button onClick={() => setIsEditingProfile(false)} className="btn-secondary flex-1">
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-gaming-muted">
                                    Your profile details represent you on the marketplace. Keep them updated to build trust.
                                </p>
                            )}
                        </div>

                        {!isSeller && (
                            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6 relative overflow-hidden">
                                <AlertTriangle className="absolute -right-4 -bottom-4 w-32 h-32 text-amber-500/10" />
                                <h3 className="text-xl font-bold text-amber-500 mb-2 flex items-center gap-2">
                                    <ShieldCheck className="w-6 h-6" /> Seller Verification Required
                                </h3>
                                <p className="text-amber-100/70 mb-6 text-sm leading-relaxed relative z-10">
                                    You currently have a standard user account. To create listings and sell accounts on this platform, you must be manually verified by the administrator.
                                </p>
                                <button onClick={() => window.open('https://wa.me/8801764696964', '_blank')} className="btn-primary bg-amber-600 hover:bg-amber-500 shadow-none text-sm relative z-10">
                                    Contact Admin via WhatsApp
                                </button>
                            </div>
                        )}

                        {isSeller && (
                            <div>
                                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                    <Package className="w-5 h-5 text-gaming-accent" /> All My Listings
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
                                        <p className="text-gaming-muted">You haven't created any listings yet.</p>
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
