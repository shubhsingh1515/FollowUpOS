import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import AppLayout from '@/layouts/AppLayout'
import {
  LandingPage,
  LoginPage,
  RegisterPage,
  DashboardPage,
  LeadsPage,
  LeadDetailPage,
  PipelinePage,
  FollowUpsPage,
  ContactsPage,
  InboxPage,
  AutomationsPage,
  IntegrationsPage,
  TeamPage,
  SettingsPage,
  BillingPage,
  TodayPage,
  CopilotPage,
  AnalyticsPage,
  ServicesPage,
  HowItWorksPage,
  PricingPage,
  IntegrationsShowcasePage,
} from '@/pages'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <AppLayout>{children}</AppLayout>
}

function PublicAuthRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

export default function App() {
  return (
    <Routes>
      {/* Public Marketing Landing & Feature Pages */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/services" element={<ServicesPage />} />
      <Route path="/how-it-works" element={<HowItWorksPage />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/integrations-showcase" element={<IntegrationsShowcasePage />} />

      {/* Auth Routes */}
      <Route
        path="/login"
        element={
          <PublicAuthRoute>
            <LoginPage />
          </PublicAuthRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicAuthRoute>
            <RegisterPage />
          </PublicAuthRoute>
        }
      />

      {/* Protected App Routes */}
      <Route
        path="/today"
        element={
          <ProtectedRoute>
            <TodayPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/copilot"
        element={
          <ProtectedRoute>
            <CopilotPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/leads"
        element={
          <ProtectedRoute>
            <LeadsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/leads/:id"
        element={
          <ProtectedRoute>
            <LeadDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pipeline"
        element={
          <ProtectedRoute>
            <PipelinePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/followups"
        element={
          <ProtectedRoute>
            <FollowUpsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/contacts"
        element={
          <ProtectedRoute>
            <ContactsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/inbox"
        element={
          <ProtectedRoute>
            <InboxPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/conversations"
        element={
          <ProtectedRoute>
            <InboxPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            <AnalyticsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/automations"
        element={
          <ProtectedRoute>
            <AutomationsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/integrations"
        element={
          <ProtectedRoute>
            <IntegrationsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/team"
        element={
          <ProtectedRoute>
            <TeamPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/billing"
        element={
          <ProtectedRoute>
            <BillingPage />
          </ProtectedRoute>
        }
      />

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
