import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Feed from './pages/Feed.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Profile from './pages/Profile.jsx';
import PostDetail from './pages/PostDetail.jsx';
import Search from './pages/Search.jsx';
import { useAuth } from './context/AuthContext.jsx';

export default function App() {
  const { user } = useAuth();
  return (
    <div className="app-shell">
      {user && <Navbar />}
      <div className="page-transition">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<ProtectedRoute><Feed /></ProtectedRoute>} />
          <Route path="/profile/:username" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/post/:id" element={<ProtectedRoute><PostDetail /></ProtectedRoute>} />
          <Route path="/search" element={<ProtectedRoute><Search /></ProtectedRoute>} />
          <Route path="*" element={<div className="empty-state">Page not found</div>} />
        </Routes>
      </div>
    </div>
  );
}
