import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { useState, useEffect, lazy, Suspense } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './config/firebase'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LazyMotion, domAnimation } from 'framer-motion';

// Lazy load components
const LoginPage = lazy(() => import('./pages/LoginPage'))
const RegisterPage = lazy(() => import('./pages/RegisterPage'))
const DashboardPage = lazy(() => import('./pages/campaigns/DashboardPage'))
const LandingPage = lazy(() => import('./pages/LandingPage'))
const DonatePage = lazy(() => import('./pages/DonatePage'))
const CreateCampaignPage = lazy(() => import('./pages/campaigns/CreateCampaignPage'))
const CampaignsListPage = lazy(() => import('./pages/campaigns/CampaignsListPage'))
const CampaignDetailsPage = lazy(() => import('./pages/campaigns/CampaignDetailsPage'))
const ChallengePage = lazy(() => import('./pages/ChallengePage'))

// Loading fallback
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-register-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
);

// Route wrappers
const ProtectedRoute = ({ user }: { user: any }) => {
  if (!user) return <Navigate to="/login" />;
  return <Outlet />;
};

const PublicRoute = ({ user }: { user: any }) => {
  if (user) return <Navigate to="/dashboard" />;
  return <Outlet />;
};

// Route configuration
const routes = [
  {
    path: '/',
    element: <LandingPage />,
    public: true
  },
  {
    path: '/donate',
    element: <DonatePage />,
    public: true
  },
  {
    path: '/login',
    element: <LoginPage />,
    authRoute: true
  },
  {
    path: '/register',
    element: <RegisterPage />,
    authRoute: true
  },
  {
    path: '/dashboard',
    element: <DashboardPage />,
    protected: true
  },
  {
    path: '/campaigns/new',
    element: <CreateCampaignPage />,
    protected: true
  },
  {
    path: '/campaigns',
    element: <CampaignsListPage />,
    public: true
  },
  {
    path: '/campaigns/:id',
    element: <CampaignDetailsPage />,
    public: true
  },
  {
    path: '/challenge/:id',
    element: <ChallengePage />,
    public: true
  }
];

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
    },
  },
});

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const criticalRoutes = [DashboardPage, LandingPage];
    criticalRoutes.forEach(route => {
      (route as any)._payload?._result?.preload?.();
    });

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <LoadingFallback />;

  return (
    <QueryClientProvider client={queryClient}>
      <LazyMotion features={domAnimation}>
        <Router>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              {routes.map(route => {
                if (route.protected) {
                  return (
                    <Route key={route.path} element={<ProtectedRoute user={user} />}>
                      <Route path={route.path} element={route.element} />
                    </Route>
                  );
                }
                if (route.authRoute) {
                  return (
                    <Route key={route.path} element={<PublicRoute user={user} />}>
                      <Route path={route.path} element={route.element} />
                    </Route>
                  );
                }
                return (
                  <Route
                    key={route.path}
                    path={route.path}
                    element={<Suspense fallback={<LoadingFallback />}>{route.element}</Suspense>}
                  />
                );
              })}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </Router>
      </LazyMotion>
    </QueryClientProvider>
  );
}