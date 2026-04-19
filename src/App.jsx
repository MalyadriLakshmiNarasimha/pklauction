import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import AppLayout from './components/layout/AppLayout';
import Landing from './pages/Landing';
import Lobby from './pages/Lobby';
import RoomSetup from './pages/RoomSetup';
import AuctionRoom from './pages/AuctionRoom';
import Results from './pages/Results';
import PreviousAuctions from './pages/PreviousAuctions';
import { AuctionProvider } from './context/AuctionContext';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <AuctionProvider>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Landing />} />
          <Route path="/lobby" element={<Lobby />} />
          <Route path="/room/:roomCode" element={<RoomSetup />} />
          <Route path="/results/:roomCode" element={<Results />} />
          <Route path="/previous-auctions" element={<PreviousAuctions />} />
        </Route>
        <Route path="/auction/:roomCode" element={<AuctionRoom />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </AuctionProvider>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App