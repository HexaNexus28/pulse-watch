import React, { useState } from 'react';
import { User, Settings, Shield, Bell, Moon, Sun, LogOut, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  // const { updateProfile, changePassword } = useAuth(); // À implémenter dans le contexte
  
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'preferences' | 'notifications'>('profile');
  const [editMode, setEditMode] = useState(false);
  // const [showPasswordModal, setShowPasswordModal] = useState(false);
  // const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Profile form state
  const [profileForm, setProfileForm] = useState({
    username: user?.username || '',
    email: user?.email || '',
    bio: '',
    avatar: ''
  });

  // Password form state
  /*
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  */

  // Preferences state
  const [preferences, setPreferences] = useState({
    theme: 'light',
    language: 'en',
    notifications: {
      email: true,
      push: false,
      desktop: true,
      weeklyDigest: true
    },
    privacy: {
      profileVisibility: 'public',
      activityTracking: true,
      analytics: true
    }
  });

  const [darkMode, setDarkMode] = useState(false);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // await updateProfile({
      //   username: profileForm.username,
      //   bio: profileForm.bio,
      //   avatar: profileForm.avatar
      // });
      // Profile updated successfully
      setEditMode(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  /*
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    
    if (passwordForm.newPassword.length < 8) {
      alert('Password must be at least 8 characters long');
      return;
    }
    
    try {
      // await changePassword({
      //   currentPassword: passwordForm.currentPassword,
      //   newPassword: passwordForm.newPassword
      // });
      // Password changed successfully
      setShowPasswordModal(false);
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Failed to change password:', error);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      // This would call a delete account API
      // Account deletion functionality would be implemented here
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Failed to delete account:', error);
    }
  };
  */

  const toggleTheme = () => {
    const newTheme = darkMode ? 'light' : 'dark';
    setDarkMode(!darkMode);
    setPreferences(prev => ({
      ...prev,
      theme: newTheme
    }));
    
    // Apply theme to document
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleNotificationChange = (type: string, enabled: boolean) => {
    setPreferences(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [type]: enabled
      }
    }));
  };

  const handlePrivacyChange = (setting: string, value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [setting]: value
      }
    }));
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {user.username}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {user.email}
                </p>
              </div>
            </div>
            <button
              onClick={logout}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-t border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8">
            {[
              { id: 'profile', label: 'Profile', icon: User },
              { id: 'security', label: 'Security', icon: Shield },
              { id: 'preferences', label: 'Preferences', icon: Settings },
              { id: 'notifications', label: 'Notifications', icon: Bell }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center px-1 py-4 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Profile Information
            </h3>
            <button
              onClick={() => setEditMode(!editMode)}
              className={`px-4 py-2 rounded-lg ${
                editMode
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {editMode ? 'Save Changes' : 'Edit Profile'}
            </button>
          </div>

          {editMode ? (
            <form onSubmit={handleProfileUpdate}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    value={profileForm.username}
                    onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Bio
                  </label>
                  <textarea
                    value={profileForm.bio}
                    onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                    rows={4}
                    placeholder="Tell us about yourself..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Avatar URL
                  </label>
                  <input
                    type="url"
                    value={profileForm.avatar}
                    onChange={(e) => setProfileForm({ ...profileForm, avatar: e.target.value })}
                    placeholder="https://example.com/avatar.jpg"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setEditMode(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Username
                </label>
                <p className="text-gray-900 dark:text-white">{user.username}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <p className="text-gray-900 dark:text-white">{user.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Bio
                </label>
                <p className="text-gray-600 dark:text-gray-400">
                  {user.bio || 'No bio provided'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Member Since
                </label>
                <p className="text-gray-600 dark:text-gray-400">
                  {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Change Password
              </h3>
              {/* <button
                onClick={() => setShowPasswordModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Change Password
              </button> */}
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Two-Factor Authentication
              </h3>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <div className="flex items-center">
                  <Shield className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-3" />
                  <div>
                    <p className="text-yellow-800 dark:text-yellow-200 font-medium">2FA Not Enabled</p>
                    <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Active Sessions
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Current Session</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Started {new Date().toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <button className="text-red-600 dark:text-red-400 hover:text-red-700 text-sm">
                    Logout
                  </button>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Delete Account
              </h3>
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                  <div>
                    <p className="text-red-800 dark:text-red-200 font-medium">Warning</p>
                    <p className="text-red-700 dark:text-red-300 text-sm">
                      This action cannot be undone. All your data will be permanently deleted.
                    </p>
                  </div>
                </div>
                {/* <button
                  onClick={() => setShowDeleteModal(true)}
                  className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete Account
                </button> */}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preferences Tab */}
      {activeTab === 'preferences' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Appearance
              </h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Theme</span>
                  <button
                    onClick={toggleTheme}
                    className="relative inline-flex h-6 w-11 items-center rounded-full border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800"
                  >
                    <div className={`absolute inset-0 rounded-full transition-colors ${
                      darkMode ? 'bg-blue-600' : 'bg-gray-200'
                    }`}></div>
                    <span className="relative z-10 flex items-center justify-center">
                      {darkMode ? <Moon className="w-4 h-4 text-yellow-400" /> : <Sun className="w-4 h-4 text-gray-600" />}
                    </span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Language
                </label>
                <select
                  value={preferences.language}
                  onChange={(e) => setPreferences(prev => ({ ...prev, language: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="en">English</option>
                  <option value="fr">Français</option>
                  <option value="es">Español</option>
                  <option value="de">Deutsch</option>
                </select>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Notifications
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Email Notifications</span>
                  <button
                    onClick={() => handleNotificationChange('email', !preferences.notifications.email)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 ${
                      preferences.notifications.email ? 'bg-blue-600' : 'bg-gray-200'
                    }`}>
                    <div className={`absolute inset-0 rounded-full transition-colors ${
                      preferences.notifications.email ? 'bg-blue-600' : 'bg-gray-200'
                    }`}></div>
                    <span className="relative z-10 flex items-center justify-center">
                      {preferences.notifications.email ? 'Enabled' : 'Disabled'}
                    </span>
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Push Notifications</span>
                  <button
                    onClick={() => handleNotificationChange('push', !preferences.notifications.push)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 ${
                      preferences.notifications.push ? 'bg-blue-600' : 'bg-gray-200'
                    }`}>
                    <div className={`absolute inset-0 rounded-full transition-colors ${
                      preferences.notifications.push ? 'bg-blue-600' : 'bg-gray-200'
                    }`}></div>
                    <span className="relative z-10 flex items-center justify-center">
                      {preferences.notifications.push ? 'Enabled' : 'Disabled'}
                    </span>
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Desktop Notifications</span>
                  <button
                    onClick={() => handleNotificationChange('desktop', !preferences.notifications.desktop)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 ${
                      preferences.notifications.desktop ? 'bg-blue-600' : 'bg-gray-200'
                    }`}>
                    <div className={`absolute inset-0 rounded-full transition-colors ${
                      preferences.notifications.desktop ? 'bg-blue-600' : 'bg-gray-200'
                    }`}></div>
                    <span className="relative z-10 flex items-center justify-center">
                      {preferences.notifications.desktop ? 'Enabled' : 'Disabled'}
                    </span>
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Weekly Digest</span>
                  <button
                    onClick={() => handleNotificationChange('weeklyDigest', !preferences.notifications.weeklyDigest)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 ${
                      preferences.notifications.weeklyDigest ? 'bg-blue-600' : 'bg-gray-200'
                    }`}>
                    <div className={`absolute inset-0 rounded-full transition-colors ${
                      preferences.notifications.weeklyDigest ? 'bg-blue-600' : 'bg-gray-200'
                    }`}></div>
                    <span className="relative z-10 flex items-center justify-center">
                      {preferences.notifications.weeklyDigest ? 'Enabled' : 'Disabled'}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Privacy
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Profile Visibility</span>
                  <select
                    value={preferences.privacy.profileVisibility}
                    onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value as any)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                    <option value="unlisted">Unlisted</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Activity Tracking</span>
                  <button
                    onClick={() => handlePrivacyChange('activityTracking', !preferences.privacy.activityTracking)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 ${
                      preferences.privacy.activityTracking ? 'bg-blue-600' : 'bg-gray-200'
                    }`}>
                    <div className={`absolute inset-0 rounded-full transition-colors ${
                      preferences.privacy.activityTracking ? 'bg-blue-600' : 'bg-gray-200'
                    }`}></div>
                    <span className="relative z-10 flex items-center justify-center">
                      {preferences.privacy.activityTracking ? 'Enabled' : 'Disabled'}
                    </span>
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Analytics</span>
                  <button
                    onClick={() => handlePrivacyChange('analytics', !preferences.privacy.analytics)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 ${
                      preferences.privacy.analytics ? 'bg-blue-600' : 'bg-gray-200'
                    }`}>
                    <div className={`absolute inset-0 rounded-full transition-colors ${
                      preferences.privacy.analytics ? 'bg-blue-600' : 'bg-gray-200'
                    }`}></div>
                    <span className="relative z-10 flex items-center justify-center">
                      {preferences.privacy.analytics ? 'Enabled' : 'Disabled'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Notification History
              </h3>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Your recent notifications will appear here
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Bell className="w-5 h-5 text-gray-400" />
                <p className="text-gray-600 dark:text-gray-400">No notifications yet</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
