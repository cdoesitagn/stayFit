import { useState, useEffect } from 'react';
import { Home, Flame, Droplet, User, LogOut, Dumbbell } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { LogCalories } from './components/LogCalories';
import { LogWater } from './components/LogWater';
import { WorkoutPlan } from './components/WorkoutPlan';
import { LoginPage } from './components/LoginPage';
import { SignupPage } from './components/SignupPage';
import { ProfileSetup } from './components/ProfileSetup';
import { TargetSetup } from './components/TargetSetup';
import { ProfileView } from './components/ProfileView';
import { EditProfile } from './components/EditProfile';
import { Toaster, toast } from 'sonner';

type Tab = 'dashboard' | 'calories' | 'water' | 'workout' | 'profile';
type AuthState = 'login' | 'signup' | 'profile-setup' | 'target-setup' | 'main';

export default function App() {
  const [authState, setAuthState] = useState<AuthState>('login');
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [userName, setUserName] = useState('');
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  useEffect(() => {
    // Check authentication and setup status
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const hasProfile = localStorage.getItem('userProfile');
    const hasTarget = localStorage.getItem('userTarget');

    if (!isLoggedIn) {
      setAuthState('login');
    } else if (!hasProfile) {
      setAuthState('profile-setup');
    } else if (!hasTarget) {
      setAuthState('target-setup');
    } else {
      setAuthState('main');
      const profile = JSON.parse(hasProfile);
      setUserName(profile.name);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userProfile');
    localStorage.removeItem('userTarget');
    setAuthState('login');
    toast.success('Đã đăng xuất');
  };

  // Auth screens
  if (authState === 'login') {
    return (
      <>
        <Toaster position="top-center" richColors />
        <LoginPage
          onLoginSuccess={() => {
            const hasProfile = localStorage.getItem('userProfile');
            const hasTarget = localStorage.getItem('userTarget');
            
            if (!hasProfile) {
              setAuthState('profile-setup');
            } else if (!hasTarget) {
              setAuthState('target-setup');
            } else {
              setAuthState('main');
              const profile = JSON.parse(hasProfile);
              setUserName(profile.name);
            }
          }}
          onSwitchToSignup={() => setAuthState('signup')}
        />
      </>
    );
  }

  if (authState === 'signup') {
    return (
      <>
        <Toaster position="top-center" richColors />
        <SignupPage
          onSignupSuccess={() => setAuthState('profile-setup')}
          onSwitchToLogin={() => setAuthState('login')}
        />
      </>
    );
  }

  if (authState === 'profile-setup') {
    return (
      <>
        <Toaster position="top-center" richColors />
        <ProfileSetup onComplete={() => setAuthState('target-setup')} />
      </>
    );
  }

  if (authState === 'target-setup') {
    return (
      <>
        <Toaster position="top-center" richColors />
        <TargetSetup
          onComplete={() => {
            setAuthState('main');
            const profile = JSON.parse(localStorage.getItem('userProfile') || '{}');
            setUserName(profile.name);
          }}
        />
      </>
    );
  }

  // Main app
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <Toaster position="top-center" richColors />
      
      {/* Mobile Container */}
      <div className="max-w-md mx-auto min-h-screen bg-white shadow-2xl relative">
        {/* Header - Hidden when editing profile */}
        {!isEditingProfile && (
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-6 pb-8 rounded-b-[2rem] shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">HealthTracker</h1>
                <p className="text-blue-100 text-sm mt-1">Xin chào, {userName}!</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-sm transition-all ${
                    activeTab === 'profile'
                      ? 'bg-white text-blue-600'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  <User className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content with padding for fixed nav */}
        <div className={`overflow-y-auto ${!isEditingProfile ? 'pb-24' : ''}`} style={{ minHeight: 'calc(100vh - 140px)' }}>
          {activeTab === 'dashboard' && (
            <div className="p-6">
              <Dashboard />
            </div>
          )}
          {activeTab === 'calories' && (
            <div className="p-6">
              <LogCalories />
            </div>
          )}
          {activeTab === 'water' && (
            <div className="p-6">
              <LogWater />
            </div>
          )}
          {activeTab === 'workout' && (
            <div className="p-6">
              <WorkoutPlan />
            </div>
          )}
          {activeTab === 'profile' && (
            <>
              {isEditingProfile ? (
                <EditProfile
                  onSave={() => {
                    setIsEditingProfile(false);
                    const profile = JSON.parse(localStorage.getItem('userProfile') || '{}');
                    setUserName(profile.name);
                  }}
                  onCancel={() => setIsEditingProfile(false)}
                />
              ) : (
                <ProfileView 
                  onEdit={() => setIsEditingProfile(true)}
                  onLogout={handleLogout}
                />
              )}
            </>
          )}
        </div>

        {/* Bottom Navigation - Fixed at bottom - Hidden when editing profile */}
        {!isEditingProfile && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
            <div className="max-w-md mx-auto p-4">
              <div className="flex items-center justify-around">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-gradient-to-br from-blue-100 to-cyan-100 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Home className={`w-6 h-6 ${activeTab === 'dashboard' ? 'stroke-[2.5]' : ''}`} />
              <span className="text-xs font-medium">Home</span>
            </button>

            <button
              onClick={() => setActiveTab('calories')}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all ${
                activeTab === 'calories'
                  ? 'bg-gradient-to-br from-orange-100 to-red-100 text-orange-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Flame className={`w-6 h-6 ${activeTab === 'calories' ? 'stroke-[2.5]' : ''}`} />
              <span className="text-xs font-medium">Calories</span>
            </button>

            <button
              onClick={() => setActiveTab('workout')}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all ${
                activeTab === 'workout'
                  ? 'bg-gradient-to-br from-purple-100 to-pink-100 text-purple-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Dumbbell className={`w-6 h-6 ${activeTab === 'workout' ? 'stroke-[2.5]' : ''}`} />
              <span className="text-xs font-medium">Workout</span>
            </button>

            <button
              onClick={() => setActiveTab('water')}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all ${
                activeTab === 'water'
                  ? 'bg-gradient-to-br from-blue-100 to-cyan-100 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Droplet className={`w-6 h-6 ${activeTab === 'water' ? 'stroke-[2.5]' : ''}`} />
              <span className="text-xs font-medium">Nước</span>
            </button>
          </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
