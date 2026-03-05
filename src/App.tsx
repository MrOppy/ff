import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import Shop from './pages/Shop';
import AccountDetails from './pages/AccountDetails';
import SellerProfile from './pages/SellerProfile';
import { AuthProvider } from './context/AuthContext';
import AddListing from './pages/AddListing';
import EditListing from './pages/EditListing';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
import Wishlist from './pages/Wishlist';

import About from './pages/About';
import Contact from './pages/Contact';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Refund from './pages/Refund';
import MiddlemanRules from './pages/MiddlemanRules';
import TrustedAdmins from './pages/TrustedAdmins';

function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <div className="min-h-screen flex flex-col font-sans">
          <Navbar />

          <main className="flex-grow flex flex-col pb-20 md:pb-0">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/account/:id" element={<AccountDetails />} />
              <Route path="/seller/:sellerName" element={<SellerProfile />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/refund" element={<Refund />} />
              <Route path="/middleman-rules" element={<MiddlemanRules />} />
              <Route path="/trusted-admins" element={<TrustedAdmins />} />
              <Route path="/add-listing" element={<AddListing />} />
              <Route path="/edit-listing/:id" element={<EditListing />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/wishlist" element={<Wishlist />} />
            </Routes>
          </main>

          <BottomNav />
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
