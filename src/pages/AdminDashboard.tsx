import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Users, ShoppingBag, TrendingUp, ShieldAlert, Search, UserCheck, Trash2, Plus } from 'lucide-react';
import { collection, query, getDocs, updateDoc, doc, deleteDoc, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { LISTINGS_COLLECTION } from '../services/listingService';
import { adminService, type TrustedAdmin } from '../services/adminService';
import type { AccountData } from '../components/AccountCard';

export default function AdminDashboard() {
    const { isAdmin } = useAuth();
    const navigate = useNavigate();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [users, setUsers] = useState<any[]>([]);
    const [listings, setListings] = useState<AccountData[]>([]);
    const [trustedAdmins, setTrustedAdmins] = useState<TrustedAdmin[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'users' | 'listings' | 'admins'>('users');
    const [userSearchTerm, setUserSearchTerm] = useState('');
    const [listingSearchTerm, setListingSearchTerm] = useState('');
    const [listingSort, setListingSort] = useState<'newest' | 'price_high' | 'price_low'>('newest');

    useEffect(() => {
        if (!isAdmin) {
            navigate('/');
            return;
        }

        async function fetchData() {
            try {
                // Fetch Users
                const usersSnapshot = await getDocs(query(collection(db, 'users'), orderBy('createdAt', 'desc')));
                const usersData = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setUsers(usersData);

                // Fetch all listings
                const listingsSnapshot = await getDocs(query(collection(db, LISTINGS_COLLECTION), orderBy('createdAt', 'desc')));
                const listingsData = listingsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AccountData));
                setListings(listingsData);

                // Fetch Trusted Admins
                const adminsData = await adminService.getTrustedAdmins();
                setTrustedAdmins(adminsData);

            } catch (err) {
                console.error("Admin fetch error:", err);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [isAdmin, navigate]);

    const updateUserRole = async (userId: string, newRole: string) => {
        try {
            await updateDoc(doc(db, 'users', userId), { role: newRole });
            setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
        } catch (err) {
            console.error(err);
            alert('Failed to update role');
        }
    };

    const toggleUserStatus = async (userId: string, field: 'isBanned' | 'isScammer', currentValue: boolean) => {
        try {
            const newValue = !currentValue;
            await updateDoc(doc(db, 'users', userId), { [field]: newValue });
            setUsers(users.map(u => u.id === userId ? { ...u, [field]: newValue } : u));
        } catch (err) {
            console.error(err);
            alert(`Failed to update ${field}`);
        }
    };

    const updateWhatsAppNumber = async (userId: string, currentNumber?: string) => {
        const newNumber = window.prompt("Enter WhatsApp number (leave blank to remove):", currentNumber || '');
        if (newNumber === null) return; // User cancelled
        try {
            const trimmed = newNumber.trim();
            await updateDoc(doc(db, 'users', userId), { whatsappNumber: trimmed });
            setUsers(users.map(u => u.id === userId ? { ...u, whatsappNumber: trimmed } : u));
        } catch (err) {
            console.error('Failed to update WhatsApp', err);
            alert('Failed to update WhatsApp number.');
        }
    };

    const deleteUser = async (userId: string) => {
        if (!window.confirm("Are you sure you want to completely DELETE this user from the database? This action is irreversible.")) return;
        try {
            await deleteDoc(doc(db, 'users', userId));
            setUsers(users.filter(u => u.id !== userId));
        } catch (err) {
            console.error(err);
            alert('Failed to delete user');
        }
    };

    const updateListingStatus = async (listingId: string, status: 'active' | 'sold' | 'pending_review') => {
        try {
            await updateDoc(doc(db, LISTINGS_COLLECTION, listingId), { status });
            setListings(listings.map(l => l.id === listingId ? { ...l, status } : l));
        } catch (err) {
            console.error(err);
            alert('Failed to update listing status');
        }
    };

    const toggleFeatured = async (listingId: string, currentStatus: boolean) => {
        try {
            await updateDoc(doc(db, LISTINGS_COLLECTION, listingId), { isFeatured: !currentStatus });
            setListings(listings.map(l => l.id === listingId ? { ...l, isFeatured: !currentStatus } : l));
        } catch (err) {
            console.error(err);
            alert('Failed to update featured status');
        }
    };

    const deleteListing = async (listingId: string) => {
        if (!window.confirm("Are you sure you want to completely delete this listing?")) return;
        try {
            await deleteDoc(doc(db, LISTINGS_COLLECTION, listingId));
            setListings(listings.filter(l => l.id !== listingId));
        } catch (err) {
            console.error(err);
            alert('Failed to delete listing');
        }
    };

    if (loading || !isAdmin) {
        return <div className="min-h-screen pt-32 text-center text-white">Loading Admin Data...</div>;
    }

    const filteredUsers = users.filter(u =>
        (u.displayName || '').toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        (u.username || '').toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        (u.email || '').toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        (u.whatsappNumber || '').includes(userSearchTerm)
    );

    const filteredListings = listings.filter(l =>
        (l.title || '').toLowerCase().includes(listingSearchTerm.toLowerCase()) ||
        (l.id || '').toLowerCase().includes(listingSearchTerm.toLowerCase())
    );

    if (listingSort === 'newest') {
        filteredListings.sort((a, b) => {
            const timeA = (a.createdAt as { toMillis?: () => number })?.toMillis?.() || 0;
            const timeB = (b.createdAt as { toMillis?: () => number })?.toMillis?.() || 0;
            return timeB - timeA;
        });
    } else if (listingSort === 'price_high') {
        filteredListings.sort((a, b) => Number(String(b.price).replace(/\D/g, '')) - Number(String(a.price).replace(/\D/g, '')));
    } else if (listingSort === 'price_low') {
        filteredListings.sort((a, b) => Number(String(a.price).replace(/\D/g, '')) - Number(String(b.price).replace(/\D/g, '')));
    }

    return (
        <div className="pt-24 pb-32 md:pb-16 min-h-screen bg-gaming-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="flex items-center gap-4 mb-8">
                    <ShieldAlert className="w-10 h-10 text-pink-500" />
                    <div>
                        <h1 className="text-3xl font-heading font-extrabold text-white">Admin Dashboard</h1>
                        <p className="text-gaming-muted">Manage marketplace users, sellers, and listings.</p>
                    </div>
                </div>

                {/* Stats Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gaming-800 border border-gaming-700 p-6 rounded-xl flex items-center justify-between">
                        <div>
                            <p className="text-gaming-muted text-sm font-medium mb-1">Total Users</p>
                            <h3 className="text-3xl text-white font-bold">{users.length}</h3>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                            <Users className="w-6 h-6 text-blue-500" />
                        </div>
                    </div>
                    <div className="bg-gaming-800 border border-gaming-700 p-6 rounded-xl flex items-center justify-between">
                        <div>
                            <p className="text-gaming-muted text-sm font-medium mb-1">Total Sellers</p>
                            <h3 className="text-3xl text-emerald-400 font-bold">{users.filter(u => u.role === 'seller' || u.role === 'trusted_seller' || u.role === 'admin').length}</h3>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                            <ShieldCheck className="w-6 h-6 text-emerald-500" />
                        </div>
                    </div>
                    <div className="bg-gaming-800 border border-gaming-700 p-6 rounded-xl flex items-center justify-between">
                        <div>
                            <p className="text-gaming-muted text-sm font-medium mb-1">Total Listings</p>
                            <h3 className="text-3xl text-white font-bold">{listings.length}</h3>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                            <ShoppingBag className="w-6 h-6 text-purple-500" />
                        </div>
                    </div>
                    <div className="bg-gaming-800 border border-gaming-700 p-6 rounded-xl flex items-center justify-between">
                        <div>
                            <p className="text-gaming-muted text-sm font-medium mb-1">Active Listings</p>
                            <h3 className="text-3xl text-gaming-accent font-bold">{listings.filter(l => l.status === 'active').length}</h3>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-gaming-accent/20 flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-gaming-accent" />
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex flex-wrap gap-2 md:gap-4 border-b border-gaming-700 mb-6 pb-2">
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`py-3 px-6 font-bold flex items-center gap-2 border-b-2 transition-all ${activeTab === 'users' ? 'border-gaming-accent text-gaming-accent bg-gaming-800/50' : 'border-transparent text-gray-400 hover:text-white'}`}
                    >
                        <Users className="w-5 h-5" /> Manage Users
                    </button>
                    <button
                        onClick={() => setActiveTab('listings')}
                        className={`py-3 px-6 font-bold flex items-center gap-2 border-b-2 transition-all ${activeTab === 'listings' ? 'border-gaming-accent text-gaming-accent bg-gaming-800/50' : 'border-transparent text-gray-400 hover:text-white'}`}
                    >
                        <ShoppingBag className="w-5 h-5" /> All Listings
                    </button>
                    <button
                        onClick={() => setActiveTab('admins')}
                        className={`py-3 px-6 font-bold flex items-center gap-2 border-b-2 transition-all ${activeTab === 'admins' ? 'border-gaming-accent text-gaming-accent bg-gaming-800/50' : 'border-transparent text-gray-400 hover:text-white'}`}
                    >
                        <UserCheck className="w-5 h-5" /> Manage Admins
                    </button>
                </div>

                {/* Main Content Area */}
                <div className="bg-gaming-800 border border-gaming-700 rounded-xl overflow-hidden">

                    {/* USERS TAB */}
                    {activeTab === 'users' && (
                        <div className="flex flex-col">
                            {/* Search Bar */}
                            <div className="p-4 border-b border-gaming-700 bg-gaming-800/80 flex items-center gap-3">
                                <Search className="w-5 h-5 text-gaming-muted" />
                                <input
                                    type="text"
                                    placeholder="Search users by name, username, or email..."
                                    value={userSearchTerm}
                                    onChange={(e) => setUserSearchTerm(e.target.value)}
                                    className="bg-transparent border-none text-white focus:outline-none w-full"
                                />
                            </div>
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full text-left text-sm text-gray-300">
                                    <thead className="bg-gaming-900 border-b border-gaming-700 text-gaming-muted uppercase text-xs">
                                        <tr>
                                            <th className="px-6 py-4">User</th>
                                            <th className="px-6 py-4">Contact</th>
                                            <th className="px-6 py-4">Role</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gaming-700 bg-gaming-800/50">
                                        {filteredUsers.map(u => (
                                            <tr key={u.id} className="hover:bg-gaming-700/30 transition-colors">
                                                <td className="px-6 py-4 flex items-center gap-3">
                                                    {u.photoURL ? <img src={u.photoURL} alt="" referrerPolicy="no-referrer" className="w-8 h-8 rounded-full object-cover" /> : <div className="w-8 h-8 bg-gaming-700 rounded-full shrink-0" />}
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-white">{u.displayName || 'Unnamed'}</span>
                                                        {u.username && <span className="text-xs text-gaming-accent font-mono">@{u.username}</span>}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div>{u.email}</div>
                                                    {u.whatsappNumber && <div className="text-xs text-gaming-accent mt-0.5">{u.whatsappNumber}</div>}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <select
                                                        value={u.role}
                                                        onChange={(e) => updateUserRole(u.id, e.target.value)}
                                                        className={`bg-gaming-900 border border-gaming-600 rounded text-xs p-1 font-medium ${u.role === 'admin' ? 'text-pink-500' : u.role === 'trusted_seller' ? 'text-blue-400' : u.role === 'seller' ? 'text-emerald-400' : 'text-gray-400'}`}
                                                        disabled={u.role === 'admin' && users.filter(user => user.role === 'admin').length === 1} // Prevent removing last admin
                                                    >
                                                        <option value="user">User</option>
                                                        <option value="seller">Seller</option>
                                                        <option value="trusted_seller">Trusted Seller</option>
                                                        <option value="admin">Admin</option>
                                                    </select>
                                                </td>
                                                <td className="px-6 py-4 flex flex-wrap gap-2">
                                                    {u.isBanned && <span className="text-red-500 font-bold bg-red-500/10 px-2 py-1 rounded text-xs">Banned</span>}
                                                    {u.isScammer && <span className="text-amber-500 font-bold bg-amber-500/10 px-2 py-1 rounded text-xs shrink-0">Scammer</span>}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-2 flex-wrap">
                                                        {u.displayName && (
                                                            <button
                                                                onClick={() => window.open(`/seller/${encodeURIComponent(u.username || u.displayName)}`, '_blank')}
                                                                className="text-gaming-accent hover:text-white p-1 px-2 font-bold transition-colors" title="View Profile"
                                                            >
                                                                Profile
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => updateWhatsAppNumber(u.id, u.whatsappNumber)}
                                                            className={`px-3 py-1.5 rounded font-bold text-xs ${u.whatsappNumber ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-gray-800 text-gray-400 border border-gaming-600'} hover:bg-gaming-700`}
                                                        >
                                                            {u.whatsappNumber ? 'Edit WA' : '+ Add WA'}
                                                        </button>
                                                        {u.role !== 'admin' && (
                                                            <>
                                                                <button
                                                                    onClick={() => toggleUserStatus(u.id, 'isBanned', !!u.isBanned)}
                                                                    className={`px-3 py-1.5 rounded font-bold text-xs ${u.isBanned ? 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30' : 'bg-red-500/20 text-red-500 hover:bg-red-500/30'}`}
                                                                >
                                                                    {u.isBanned ? 'Unban' : 'Ban'}
                                                                </button>
                                                                <button
                                                                    onClick={() => toggleUserStatus(u.id, 'isScammer', !!u.isScammer)}
                                                                    className={`px-3 py-1.5 rounded font-bold text-xs ${u.isScammer ? 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30' : 'bg-amber-500/20 text-amber-500 hover:bg-amber-500/30'}`}
                                                                >
                                                                    {u.isScammer ? 'Unmark Scammer' : 'Mark Scammer'}
                                                                </button>
                                                                <button
                                                                    onClick={() => deleteUser(u.id)}
                                                                    className="text-red-500 hover:text-red-400 p-1 px-2" title="Delete User"
                                                                >
                                                                    Delete
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {filteredUsers.length === 0 && (
                                            <tr><td colSpan={5} className="px-6 py-8 text-center text-gaming-muted">No users found.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile User Cards */}
                            <div className="md:hidden divide-y divide-gaming-700">
                                {filteredUsers.map(u => (
                                    <details key={u.id} className="group outline-none">
                                        <summary className="p-4 flex items-center justify-between cursor-pointer list-none hover:bg-gaming-800 transition-colors">
                                            <div className="flex items-center gap-3">
                                                {u.photoURL ? <img src={u.photoURL} alt="" referrerPolicy="no-referrer" className="w-10 h-10 rounded-full object-cover shrink-0" /> : <div className="w-10 h-10 bg-gaming-700 rounded-full shrink-0" />}
                                                <div>
                                                    <p className="font-bold text-white text-sm">{u.displayName || 'Unnamed'}</p>
                                                    {u.username && <p className="text-[10px] text-gaming-accent font-mono mb-0.5">@{u.username}</p>}
                                                    <p className="text-xs text-gaming-muted">{u.email}</p>
                                                    {u.whatsappNumber && <p className="text-xs text-gaming-accent mt-0.5">{u.whatsappNumber}</p>}
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-1">
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${u.role === 'admin' ? 'bg-pink-500/20 text-pink-400' : u.role === 'trusted_seller' ? 'bg-blue-500/20 text-blue-400' : u.role === 'seller' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-700 text-gray-300'}`}>
                                                    {u.role.replace('_', ' ')}
                                                </span>
                                                <div className="flex gap-1">
                                                    {u.isBanned && <span className="bg-red-500 text-white text-[9px] px-1 rounded">BANNED</span>}
                                                    {u.isScammer && <span className="bg-amber-500 text-white text-[9px] px-1 rounded">SCAMMER</span>}
                                                </div>
                                            </div>
                                        </summary>

                                        {/* Expanded Content */}
                                        <div className="p-4 pt-0 bg-gaming-800/30">
                                            <div className="mb-3">
                                                <label className="text-xs text-gaming-muted block mb-1">Change Role:</label>
                                                <select
                                                    value={u.role}
                                                    onChange={(e) => updateUserRole(u.id, e.target.value)}
                                                    className="w-full bg-gaming-900 border border-gaming-600 rounded text-sm p-2 text-white"
                                                    disabled={u.role === 'admin' && users.filter(user => user.role === 'admin').length === 1}
                                                >
                                                    <option value="user">User</option>
                                                    <option value="seller">Seller</option>
                                                    <option value="trusted_seller">Trusted Seller</option>
                                                    <option value="admin">Admin</option>
                                                </select>
                                            </div>

                                            <div className="mb-3">
                                                <button
                                                    onClick={() => updateWhatsAppNumber(u.id, u.whatsappNumber)}
                                                    className="w-full bg-gaming-900 border border-gaming-600 text-emerald-400 p-2 rounded font-bold text-xs hover:bg-gaming-800 transition-colors"
                                                >
                                                    {u.whatsappNumber ? 'Edit/Remove WhatsApp' : '+ Add WhatsApp Number'}
                                                </button>
                                            </div>

                                            {u.displayName && (
                                                <button
                                                    onClick={() => window.open(`/seller/${encodeURIComponent(u.username || u.displayName)}`, '_blank')}
                                                    className="w-full bg-gaming-900 border border-gaming-600 text-gaming-accent p-2 rounded font-bold text-xs mb-2 hover:bg-gaming-800 transition-colors"
                                                >
                                                    View Profile & Reviews
                                                </button>
                                            )}

                                            {u.role !== 'admin' && (
                                                <div className="grid grid-cols-2 gap-2">
                                                    <button
                                                        onClick={() => toggleUserStatus(u.id, 'isBanned', !!u.isBanned)}
                                                        className={`p-2 rounded font-bold text-xs ${u.isBanned ? 'bg-gray-600 text-white' : 'bg-red-500/20 text-red-500'}`}
                                                    >
                                                        {u.isBanned ? 'Unban User' : 'Ban User'}
                                                    </button>
                                                    <button
                                                        onClick={() => toggleUserStatus(u.id, 'isScammer', !!u.isScammer)}
                                                        className={`p-2 rounded font-bold text-xs ${u.isScammer ? 'bg-gray-600 text-white' : 'bg-amber-500/20 text-amber-500'}`}
                                                    >
                                                        {u.isScammer ? 'Unmark Scammer' : 'Mark Scammer'}
                                                    </button>
                                                    <button
                                                        onClick={() => deleteUser(u.id)}
                                                        className="col-span-2 p-2 rounded font-bold text-xs border border-red-500/30 text-red-500 hover:bg-red-500/10 mt-1"
                                                    >
                                                        Delete User
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </details>
                                ))}
                                {filteredUsers.length === 0 && (
                                    <p className="p-6 text-center text-gaming-muted text-sm">No users found.</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* LISTINGS TAB */}
                    {activeTab === 'listings' && (
                        <div className="flex flex-col">
                            {/* Search & Sort Bar */}
                            <div className="p-4 border-b border-gaming-700 bg-gaming-800/80 flex flex-col sm:flex-row gap-3">
                                <div className="flex-1 flex items-center gap-3 bg-transparent">
                                    <Search className="w-5 h-5 text-gaming-muted" />
                                    <input
                                        type="text"
                                        placeholder="Search by title or ID..."
                                        value={listingSearchTerm}
                                        onChange={(e) => setListingSearchTerm(e.target.value)}
                                        className="bg-transparent border-none text-white focus:outline-none w-full"
                                    />
                                </div>
                                <select
                                    value={listingSort}
                                    onChange={(e) => setListingSort(e.target.value as 'newest' | 'price_high' | 'price_low')}
                                    className="bg-gaming-900 border border-gaming-600 rounded text-sm p-2 text-white focus:border-gaming-accent/50 outline-none"
                                >
                                    <option value="newest">Newest First</option>
                                    <option value="price_high">Price: High to Low</option>
                                    <option value="price_low">Price: Low to High</option>
                                </select>
                            </div>

                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full text-left text-sm text-gray-300">
                                    <thead className="bg-gaming-900 border-b border-gaming-700 text-gaming-muted uppercase text-xs">
                                        <tr>
                                            <th className="px-6 py-4">Listing</th>
                                            <th className="px-6 py-4">Price</th>
                                            <th className="px-6 py-4">Seller</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4 text-right">Admin Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gaming-700 bg-gaming-800/50">
                                        {filteredListings.map(l => (
                                            <tr key={l.id} className="hover:bg-gaming-700/30 transition-colors">
                                                <td className="px-6 py-4 flex items-center gap-3">
                                                    <img src={l.image || l.imageGallery?.[0]} alt="" className="w-12 h-12 rounded object-cover border border-gaming-700" />
                                                    <div>
                                                        <p className="font-medium text-white max-w-[200px] truncate">{l.title}</p>
                                                        <p className="text-xs text-gaming-muted font-mono">{l.id.substring(0, 8)}...</p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 font-bold text-gaming-accent">{l.price}</td>
                                                <td className="px-6 py-4 text-xs">{l.seller}</td>
                                                <td className="px-6 py-4">
                                                    <select
                                                        value={l.status}
                                                        onChange={(e) => updateListingStatus(l.id, e.target.value as 'active' | 'sold' | 'pending_review')}
                                                        className="bg-gaming-900 border border-gaming-600 rounded text-xs p-1 text-white flex gap-1 items-center font-medium"
                                                    >
                                                        <option value="active">Active</option>
                                                        <option value="sold">Sold</option>
                                                        <option value="pending_review">Pending / Hidden</option>
                                                    </select>
                                                </td>
                                                <td className="px-6 py-4 flex justify-end gap-2 flex-wrap">
                                                    <button
                                                        onClick={() => toggleFeatured(l.id, !!l.isFeatured)}
                                                        className={`p-1 px-2 rounded font-bold text-xs ${l.isFeatured ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'text-gray-400 hover:text-white border border-transparent'}`}
                                                        title="Toggle Homepage Feature"
                                                    >
                                                        {l.isFeatured ? '★ Featured' : '☆ Feature'}
                                                    </button>
                                                    <button
                                                        onClick={() => window.open(`/account/${l.id}`, '_blank')}
                                                        className="text-blue-400 hover:text-blue-300 p-1" title="View Listing"
                                                    >
                                                        View
                                                    </button>
                                                    <button
                                                        onClick={() => navigate(`/edit-listing/${l.id}`)}
                                                        className="text-amber-400 hover:text-amber-300 p-1" title="Edit Listing"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => deleteListing(l.id)}
                                                        className="text-red-500 hover:text-red-400 p-1" title="Hard Delete"
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {filteredListings.length === 0 && (
                                            <tr><td colSpan={5} className="px-6 py-8 text-center text-gaming-muted">No listings found.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Listing Cards */}
                            <div className="md:hidden divide-y divide-gaming-700">
                                {filteredListings.map(l => (
                                    <details key={l.id} className="group outline-none">
                                        <summary className="p-4 flex items-center justify-between cursor-pointer list-none hover:bg-gaming-800 transition-colors">
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <img src={l.image || l.imageGallery?.[0]} alt="" className="w-12 h-12 rounded object-cover border border-gaming-700 shrink-0" />
                                                <div className="truncate pr-2">
                                                    <p className="font-bold text-white text-sm truncate">{l.title}</p>
                                                    <p className="text-xs text-gaming-accent font-bold mt-0.5">{l.price}</p>
                                                    <p className="text-[10px] text-gaming-muted">by {l.seller}</p>
                                                </div>
                                            </div>
                                            <div className="shrink-0 flex flex-col items-end gap-1">
                                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${l.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : l.status === 'sold' ? 'bg-amber-500/20 text-amber-500' : 'bg-gray-500/20 text-gray-400'}`}>
                                                    {l.status}
                                                </span>
                                                {l.isFeatured && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase bg-indigo-500/20 text-indigo-400">★ FEATURED</span>}
                                            </div>
                                        </summary>

                                        {/* Expanded Content */}
                                        <div className="p-4 pt-0 bg-gaming-800/30">
                                            <div className="mb-3">
                                                <label className="text-xs text-gaming-muted block mb-1">Status:</label>
                                                <select
                                                    value={l.status}
                                                    onChange={(e) => updateListingStatus(l.id, e.target.value as 'active' | 'sold' | 'pending_review')}
                                                    className="w-full bg-gaming-900 border border-gaming-600 rounded text-sm p-2 text-white"
                                                >
                                                    <option value="active">Active</option>
                                                    <option value="sold">Sold</option>
                                                    <option value="pending_review">Pending / Hidden</option>
                                                </select>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2 mt-4">
                                                <button
                                                    onClick={() => toggleFeatured(l.id, !!l.isFeatured)}
                                                    className={`col-span-2 p-2 rounded font-bold text-xs ${l.isFeatured ? 'bg-indigo-500/20 text-indigo-400' : 'bg-gray-700 text-white hover:bg-gray-600'} text-center`}
                                                >
                                                    {l.isFeatured ? '★ Remove from Homepage' : '☆ Feature on Homepage'}
                                                </button>
                                                <button
                                                    onClick={() => window.open(`/account/${l.id}`, '_blank')}
                                                    className="p-2 rounded font-bold text-xs bg-blue-500/20 text-blue-400 text-center"
                                                >
                                                    View Page
                                                </button>
                                                <button
                                                    onClick={() => navigate(`/edit-listing/${l.id}`)}
                                                    className="p-2 rounded font-bold text-xs bg-amber-500/20 text-amber-500 text-center"
                                                >
                                                    Edit Details
                                                </button>
                                                <button
                                                    onClick={() => deleteListing(l.id)}
                                                    className="col-span-2 p-2 rounded font-bold text-xs border border-red-500/30 text-red-500 hover:bg-red-500/10 mt-1"
                                                >
                                                    Delete Listing
                                                </button>
                                            </div>
                                        </div>
                                    </details>
                                ))}
                                {filteredListings.length === 0 && (
                                    <p className="p-6 text-center text-gaming-muted text-sm">No listings found.</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ADMINS TAB */}
                    {activeTab === 'admins' && (
                        <div className="p-6">
                            <div className="mb-8 bg-gaming-900 border border-gaming-700 p-6 rounded-xl">
                                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                    <Plus className="w-5 h-5 text-gaming-accent" /> Add Trusted Admin
                                </h3>
                                <form
                                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                                    onSubmit={async (e) => {
                                        e.preventDefault();
                                        const form = e.target as HTMLFormElement;
                                        const data = {
                                            name: (form.elements.namedItem('name') as HTMLInputElement).value,
                                            position: (form.elements.namedItem('position') as HTMLInputElement).value,
                                            whatsapp: (form.elements.namedItem('whatsapp') as HTMLInputElement).value,
                                            facebook: (form.elements.namedItem('facebook') as HTMLInputElement).value,
                                            photoUrl: (form.elements.namedItem('photoUrl') as HTMLInputElement).value,
                                        };
                                        try {
                                            await adminService.addAdmin(data);
                                            const updated = await adminService.getTrustedAdmins();
                                            setTrustedAdmins(updated);
                                            form.reset();
                                            alert("Admin added successfully!");
                                        } catch (err) {
                                            console.error(err);
                                            alert("Failed to add admin");
                                        }
                                    }}
                                >
                                    <input name="name" type="text" placeholder="Name" className="glass-input" required />
                                    <input name="position" type="text" placeholder="Position (e.g., Main Admin)" className="glass-input" required />
                                    <input name="whatsapp" type="text" placeholder="WhatsApp Number" className="glass-input" required />
                                    <input name="facebook" type="url" placeholder="Facebook Link" className="glass-input" required />
                                    <input name="photoUrl" type="url" placeholder="Photo URL (Catbox.moe)" className="glass-input" required />
                                    <button type="submit" className="btn-primary md:col-span-2">Add Admin to Directory</button>
                                </form>
                            </div>

                            <h3 className="text-xl font-bold text-white mb-4">Current Trusted Admins</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {trustedAdmins.map(admin => (
                                    <div key={admin.id} className="bg-gaming-800 border border-gaming-700 p-4 rounded-xl flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <img src={admin.photoUrl} alt={admin.name} referrerPolicy="no-referrer" className="w-12 h-12 rounded-full object-cover border border-gaming-accent" />
                                            <div>
                                                <p className="font-bold text-white">{admin.name}</p>
                                                <p className="text-xs text-gaming-accent">{admin.position}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={async () => {
                                                if (window.confirm("Delete this admin?")) {
                                                    await adminService.deleteAdmin(admin.id!);
                                                    setTrustedAdmins(trustedAdmins.filter(a => a.id !== admin.id));
                                                }
                                            }}
                                            className="text-red-500 hover:text-red-400 p-2 bg-red-500/10 rounded-lg hover:bg-red-500/20 transition-colors"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))}
                                {trustedAdmins.length === 0 && (
                                    <p className="text-gaming-muted col-span-full text-center py-4">No admins added yet.</p>
                                )}
                            </div>
                        </div>
                    )}

                </div>
                {/* Spacer for mobile bottom nav */}
                <div className="h-24 md:hidden"></div>
            </div>
        </div>
    );
}
