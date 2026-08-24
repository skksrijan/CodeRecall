'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { updatePassword, updateProfile, deleteUser, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { Save, Lock, Trash2, Bell, ShieldAlert, Loader2 } from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [token, setToken] = useState('');
  
  // Profile Form
  const [name, setName] = useState('');
  const [notifications, setNotifications] = useState(false);
  const [dailyNewLimit, setDailyNewLimit] = useState<number>(5);
  const [defaultLanguage, setDefaultLanguage] = useState<string>('javascript');
  
  // Security Form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Danger Zone
  const [deleteEmail, setDeleteEmail] = useState('');

  useEffect(() => {
    if (user) {
      user.getIdToken().then(t => {
        setToken(t);
        fetchSettings(t);
      });
      setName(user.displayName || '');
    }
  }, [user]);

  const fetchSettings = async (t: string) => {
    try {
      const res = await fetch('/api/user/settings', { headers: { Authorization: `Bearer ${t}` } });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notificationsEnabled);
        if (data.name) setName(data.name);
        if (data.dailyNewLimit !== undefined) setDailyNewLimit(data.dailyNewLimit);
        if (data.defaultLanguage) setDefaultLanguage(data.defaultLanguage);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await fetch('/api/user/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name, notificationsEnabled: notifications, dailyNewLimit, defaultLanguage })
      });

      if (user && name !== user.displayName) {
        await updateProfile(user, { displayName: name });
      }

      toast.success('Profile updated successfully');
    } catch (e) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (!user || !user.email) return;

    setSaving(true);
    try {
      // Re-authenticate first
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      
      // Update password
      await updatePassword(user, newPassword);
      
      toast.success('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (e: any) {
      toast.error(e.message || 'Failed to update password');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user || deleteEmail !== user.email) return;

    try {
      // Prompt for password to re-authenticate
      const pass = window.prompt("Please enter your password to confirm account deletion:");
      if (!pass) return;

      const credential = EmailAuthProvider.credential(user.email, pass);
      await reauthenticateWithCredential(user, credential);

      // 1. Delete Prisma Data
      const res = await fetch('/api/user/settings', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Failed to delete database records');

      // 2. Delete Firebase User
      await deleteUser(user);
      
      toast.success('Account deleted successfully');
      router.push('/');
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || 'Failed to delete account');
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-8 animate-pulse">
        <div className="h-8 w-48 bg-surface rounded"></div>
        <div className="h-64 w-full bg-surface rounded-xl"></div>
        <div className="h-64 w-full bg-surface rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-8 mb-20">
      <h1 className="text-3xl font-bold text-text">Settings</h1>

      {/* Profile Settings */}
      <section className="bg-surface rounded-2xl p-6 md:p-8 shadow-xl shadow-black/5 border border-border">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            <Save className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold">Profile</h2>
        </div>
        
        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-muted-text mb-2">Display Name</label>
            <input 
              type="text" 
              value={name} 
              onChange={e => setName(e.target.value)}
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-text focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              placeholder="How should we call you?"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-muted-text mb-2">Email</label>
            <input 
              type="email" 
              value={user?.email || ''} 
              disabled
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-muted-text opacity-70 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-muted-text mb-2">Daily New Problems Limit</label>
            <p className="text-xs text-muted-text mb-2">
              Each day, you&apos;ll first review all problems that are due, then receive up to this many NEW problems from your imported decks. Set to 0 to pause learning new problems while catching up on reviews.
            </p>
            <input 
              type="number" 
              min={0}
              max={100}
              value={dailyNewLimit} 
              onChange={e => {
                const val = parseInt(e.target.value, 10);
                setDailyNewLimit(isNaN(val) ? 0 : Math.max(0, Math.min(100, val)));
              }}
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-text focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-muted-text mb-2">Default Code Language</label>
            <p className="text-xs text-muted-text mb-2">Your preferred programming language for the study scratchpad.</p>
            <select
              value={defaultLanguage}
              onChange={e => setDefaultLanguage(e.target.value)}
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-text focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all appearance-none"
            >
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
              <option value="csharp">C#</option>
              <option value="go">Go</option>
              <option value="rust">Rust</option>
            </select>
          </div>

          <div className="flex items-center justify-between p-4 bg-background border border-border rounded-xl">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-muted-text" />
              <div>
                <p className="font-semibold text-sm">Daily Reminders</p>
                <p className="text-xs text-muted-text">Receive an email when you have cards due for review.</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={notifications} onChange={(e) => setNotifications(e.target.checked)} />
              <div className="w-11 h-6 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <button 
            type="submit" 
            disabled={saving}
            className="bg-primary text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-primary/90 transition shadow-lg shadow-primary/25 disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Save Changes
          </button>
        </form>
      </section>

      {/* Security Settings */}
      <section className="bg-surface rounded-2xl p-6 md:p-8 shadow-xl shadow-black/5 border border-border">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-warning/10 rounded-lg text-warning">
            <Lock className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold">Security</h2>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-muted-text mb-2">Current Password</label>
            <input 
              type="password" 
              required
              value={currentPassword} 
              onChange={e => setCurrentPassword(e.target.value)}
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-text focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-muted-text mb-2">New Password</label>
            <input 
              type="password"
              required 
              minLength={6}
              value={newPassword} 
              onChange={e => setNewPassword(e.target.value)}
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-text focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-muted-text mb-2">Confirm New Password</label>
            <input 
              type="password" 
              required
              minLength={6}
              value={confirmPassword} 
              onChange={e => setConfirmPassword(e.target.value)}
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-text focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
          </div>

          <button 
            type="submit" 
            disabled={saving}
            className="bg-background text-text border border-border px-6 py-2.5 rounded-lg font-semibold hover:bg-surface transition disabled:opacity-50 mt-2"
          >
            Update Password
          </button>
        </form>
      </section>

      {/* Danger Zone */}
      <section className="bg-surface rounded-2xl p-6 md:p-8 shadow-xl shadow-black/5 border border-danger/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-danger/5 rounded-bl-full -z-0"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-danger/10 rounded-lg text-danger">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-danger">Danger Zone</h2>
          </div>
          
          <p className="text-sm text-muted-text mb-6 max-w-xl">
            Once you delete your account, there is no going back. Please be certain. 
            All of your decks, problems, and review history will be permanently wiped.
          </p>

          <div className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-semibold text-muted-text mb-2">
                Type <span className="text-text font-bold font-mono bg-background px-1 rounded">{user?.email}</span> to confirm
              </label>
              <input 
                type="text" 
                value={deleteEmail} 
                onChange={e => setDeleteEmail(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-text focus:outline-none focus:border-danger focus:ring-1 focus:ring-danger transition-all"
                placeholder={user?.email || ''}
              />
            </div>

            <button 
              onClick={handleDeleteAccount}
              disabled={deleteEmail !== user?.email}
              className="w-full bg-danger text-white px-6 py-3 rounded-xl font-bold hover:bg-danger/90 transition shadow-lg shadow-danger/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Permanently Delete Account
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
