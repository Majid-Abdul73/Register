import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { useState, useEffect, lazy, Suspense } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './config/firebase'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { LazyMotion, domAnimation } from 'framer-motion'
import Settings from './pages/campaigns/Settings';

// Lazy load components
const pages = {
  Landing: lazy(() => import('./pages/LandingPage')),
  Login: lazy(() => import('./pages/LoginPage')),
  Register: lazy(() => import('./pages/RegisterPage')),
  Dashboard: lazy(() => import('./pages/campaigns/DashboardPage')),
  Donation: lazy(() => import('./pages/DonationPage')),
  CreateCampaign: lazy(() => import('./pages/campaigns/CreateCampaignPage')),
  CampaignsList: lazy(() => import('./pages/campaigns/CampaignsListPage')),
  CampaignDetails: lazy(() => import('./pages/campaigns/CampaignDetailsPage')),
  Challenge: lazy(() => import('./pages/ChallengePage')),
  Donate: lazy(() => import('./pages/DonatePage'))
}

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="w-16 h-16 border-4 border-register-green border-t-transparent rounded-full animate-spin" />
  </div>
)

const AuthWrapper = ({ user, type }: { user: any, type: 'protected' | 'public' }) => {
  if (type === 'protected' && !user) return <Navigate to="/login" />
  if (type === 'public' && user) return <Navigate to="/dashboard" />
  return <Outlet />
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 30,
    },
  },
})

export default function App() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  if (loading) return <LoadingFallback />

  return (
    <QueryClientProvider client={queryClient}>
      <LazyMotion features={domAnimation}>
        <Router>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<pages.Landing />} />
              <Route path="/donation/:id" element={<pages.Donation />} />
              
              <Route path="/challenge/:id" element={<pages.Challenge />} />
              <Route path="/donate" element={<pages.Donate />} />

              {/* Auth Routes */}
              <Route element={<AuthWrapper user={user} type="public" />}>
                <Route path="/login" element={<pages.Login />} />
                <Route path="/register" element={<pages.Register />} />
              </Route>

              {/* Protected Routes */}
              <Route element={<AuthWrapper user={user} type="protected" />}>
                <Route path="/dashboard" element={<pages.Dashboard />} />
                <Route path="/campaigns/new" element={<pages.CreateCampaign />} />

                <Route path="/campaigns" element={<pages.CampaignsList />} />
              <Route path="/campaigns/:id" element={<pages.CampaignDetails />} />
              <Route path="/settings" element={<Settings />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </Router>
      </LazyMotion>
    </QueryClientProvider>
  )
}