import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar      from './components/Navbar';
import Home        from './pages/Home';
import Browse      from './pages/Browse';
import ListingDetail from './pages/ListingDetail';
import PostListing from './pages/PostListing';
import MyListings  from './pages/MyListings';
import Messages    from './pages/Messages';
import Profile     from './pages/Profile';
import Login       from './pages/Login';
import Register    from './pages/Register';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"/></div>;
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-center" />
        <Navbar />
        <main className="min-h-screen bg-gray-50 pt-16">
          <Routes>
            <Route path="/"           element={<Home />} />
            <Route path="/browse"     element={<Browse />} />
            <Route path="/listing/:id" element={<ListingDetail />} />
            <Route path="/login"      element={<Login />} />
            <Route path="/register"   element={<Register />} />
            <Route path="/post"       element={<PrivateRoute><PostListing /></PrivateRoute>} />
            <Route path="/my-listings" element={<PrivateRoute><MyListings /></PrivateRoute>} />
            <Route path="/messages"   element={<PrivateRoute><Messages /></PrivateRoute>} />
            <Route path="/profile/:id" element={<Profile />} />
          </Routes>
        </main>
      </BrowserRouter>
    </AuthProvider>
  );
}
