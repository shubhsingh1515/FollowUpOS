import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface User {
  _id: string
  name: string
  email: string
  role: string
  avatar?: string
  organizationId: string
  onboardingCompleted: boolean
}

export interface Organization {
  _id: string
  name: string
  slug: string
  industry?: string
  description?: string
  services?: string[]
  currency: string
  timezone: string
  settings?: {
    defaultTone?: string
    aiEnabled?: boolean
    autoFollowUpEnabled?: boolean
    requireHumanApproval?: boolean
    language?: string
  }
  subscription?: {
    plan: string
    status: string
  }
  onboardingCompleted: boolean
  onboardingStep?: number
  isDemo?: boolean
}

interface AuthState {
  user: User | null
  organization: Organization | null
  accessToken: string | null
  isAuthenticated: boolean
  setAuth: (user: User, organization: Organization, token: string) => void
  updateOrganization: (org: Partial<Organization>) => void
  updateUser: (user: Partial<User>) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      organization: null,
      accessToken: null,
      isAuthenticated: false,

      setAuth: (user, organization, accessToken) => {
        localStorage.setItem('accessToken', accessToken)
        set({ user, organization, accessToken, isAuthenticated: true })
      },

      updateOrganization: (org) =>
        set((state) => ({
          organization: state.organization ? { ...state.organization, ...org } : null,
        })),

      updateUser: (user) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...user } : null,
        })),

      logout: () => {
        localStorage.removeItem('accessToken')
        set({ user: null, organization: null, accessToken: null, isAuthenticated: false })
      },
    }),
    {
      name: 'followupos-auth',
      partialize: (state) => ({
        user: state.user,
        organization: state.organization,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
