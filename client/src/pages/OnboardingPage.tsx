import { useNavigate } from 'react-router-dom'
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard'
import { useAuthStore } from '@/store/authStore'

export function OnboardingPage() {
  const navigate = useNavigate()
  const { organization } = useAuthStore()

  return (
    <div className="min-h-screen bg-[#07080B] flex flex-col justify-center items-center p-4">
      <OnboardingWizard
        initialOrgName={organization?.name || 'My Sales Workspace'}
        onComplete={() => navigate('/today')}
      />
    </div>
  )
}

export default OnboardingPage
