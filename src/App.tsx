import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { SubmitGrave } from './pages/SubmitGrave';
import { Login } from './pages/Login';
import { Profile } from './pages/Profile';
import { UserProfile } from './pages/UserProfile';
import { GraveView } from './pages/GraveView';
import { Confessions } from './pages/Confessions';
import { Chats } from "./pages/Chats";
import { Leaderboard } from "./pages/Leaderboard";
import { Upcoming } from "./pages/Upcoming";
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { UsernameSelection } from './components/UsernameSelection';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, userProfile, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/" replace />;
  if (user && !userProfile) return <UsernameSelection />;
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/submit" element={<ProtectedRoute><SubmitGrave /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/user/:username" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
            <Route path="/grave/:id" element={<GraveView />} />
            <Route path="/confessions" element={<Confessions />} />
            <Route path="/chats" element={<ProtectedRoute><Chats /></ProtectedRoute>} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/upcoming" element={<Upcoming />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
};

export default App;