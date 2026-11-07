import React, { Suspense, lazy } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { UsernameSelection } from './components/UsernameSelection';

// Lazy-loaded route components for fast initial load and light bundle
const Landing = lazy(() => import('./pages/Landing').then(m => ({ default: m.Landing })));
const Home = lazy(() => import('./pages/Home').then(m => ({ default: m.Home })));
const Cemetery = lazy(() => import('./pages/Cemetery').then(m => ({ default: m.Cemetery })));
const SubmitGrave = lazy(() => import('./pages/SubmitGrave').then(m => ({ default: m.SubmitGrave })));
const Login = lazy(() => import('./pages/Login').then(m => ({ default: m.Login })));
const Profile = lazy(() => import('./pages/Profile').then(m => ({ default: m.Profile })));
const UserProfile = lazy(() => import('./pages/UserProfile').then(m => ({ default: m.UserProfile })));
const GraveView = lazy(() => import('./pages/GraveView').then(m => ({ default: m.GraveView })));
const Confessions = lazy(() => import('./pages/Confessions').then(m => ({ default: m.Confessions })));
const Chats = lazy(() => import('./pages/Chats').then(m => ({ default: m.Chats })));
const Leaderboard = lazy(() => import('./pages/Leaderboard').then(m => ({ default: m.Leaderboard })));
const Upcoming = lazy(() => import('./pages/Upcoming').then(m => ({ default: m.Upcoming })));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy').then(m => ({ default: m.PrivacyPolicy })));
const TermsOfService = lazy(() => import('./pages/TermsOfService').then(m => ({ default: m.TermsOfService })));

const PageLoader: React.FC = () => (
  <div className="min-h-[55vh] flex flex-col items-center justify-center space-y-4 animate-fade-in">
    <div className="relative flex items-center justify-center">
      <div className="w-12 h-12 rounded-full border-2 border-[#c53030]/20 border-t-[#c53030] animate-spin" />
      <span className="absolute text-sm select-none" role="img" aria-label="grave">🪦</span>
    </div>
    <div className="text-center space-y-1">
      <p className="font-mono text-xs uppercase tracking-widest text-zinc-400">Summoning from the crypt...</p>
    </div>
  </div>
);

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, userProfile, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user && !userProfile) return <UsernameSelection />;
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public Sanctuary Routes (No Auth Wall) */}
              <Route path="/" element={<Landing />} />
              <Route path="/cemetery" element={<Cemetery />} />
              <Route path="/grave/:id" element={<GraveView />} />
              <Route path="/confessions" element={<Confessions />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/upcoming" element={<Upcoming />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfService />} />
              
              {/* Auth Gateway */}
              <Route path="/login" element={<Login />} />

              {/* Protected Personal Actions */}
              <Route path="/home" element={<Home />} />
              <Route path="/submit" element={<ProtectedRoute><SubmitGrave /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/user/:username" element={<UserProfile />} />
              <Route path="/chats" element={<ProtectedRoute><Chats /></ProtectedRoute>} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </Layout>
      </Router>
    </AuthProvider>
  );
};

export default App;
