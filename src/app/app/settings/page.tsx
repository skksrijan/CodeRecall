'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { updatePassword, updateProfile, deleteUser, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

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

      toast.success('Configuration saved');
    } catch (e) {
      toast.error('Failed to save configuration');
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
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 font-mono">
        <div className="h-8 w-48 bg-surface rounded animate-pulse" />
        <div className="h-64 bg-surface rounded-xl border border-border animate-pulse" />
        <div className="h-64 bg-surface rounded-xl border border-border animate-pulse" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Bar */}
      <div className="pb-6 border-b border-border">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text">
          Account Settings
        </h1>
        <p className="text-xs text-muted-text mt-1">
          Manage your daily practice limits, defaults, and account credentials.
        </p>
      </div>

      {/* Profile & Pacing Configuration */}
      <section className="bg-surface rounded-xl border border-border p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <h2 className="text-sm font-bold text-text">
            Profile &amp; Daily Limits
          </h2>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-semibold text-text uppercase tracking-wider mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:border-primary font-medium"
                placeholder="Your name"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-semibold text-text uppercase tracking-wider mb-1">
                Registered Email
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full bg-background/50 border border-border rounded-lg px-3 py-2 text-sm text-muted-text cursor-not-allowed font-mono text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-semibold text-text uppercase tracking-wider mb-1">
              Daily New Question Limit
            </label>
            <p className="text-xs text-muted-text mb-2 leading-relaxed">
              Reviews always take priority. After completing due items, up to this many new problems are introduced from your catalog. Set to <code className="bg-background px-1 py-0.5 rounded font-mono">0</code> to pause new questions while clearing review backlogs.
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
              className="w-32 bg-background border border-border rounded-lg px-3 py-2 text-sm font-mono text-text focus:outline-none focus:border-primary tabular-nums"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-semibold text-text uppercase tracking-wider mb-1">
              Default Code Language
            </label>
            <p className="text-xs text-muted-text mb-2">Preferred programming syntax in the study scratchpad.</p>
            <select
              value={defaultLanguage}
              onChange={e => setDefaultLanguage(e.target.value)}
              className="w-full sm:w-64 bg-background border border-border rounded-lg px-3 py-2 text-sm font-mono text-text focus:outline-none focus:border-primary"
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

          <div className="flex items-center justify-between p-3.5 bg-background border border-border rounded-lg">
            <div>
              <p className="font-semibold text-xs text-text font-mono">[ DAILY REVIEW REMINDERS ]</p>
              <p className="text-[11px] text-muted-text">Send email notification when spaced reviews are due.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={notifications} onChange={(e) => setNotifications(e.target.checked)} />
              <div className="w-9 h-5 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary" />
            </label>
          </div>

          <div className="pt-2 font-mono">
            <button
              type="submit"
              disabled={saving}
              className="bg-text text-background px-5 py-2 rounded-lg text-xs font-semibold hover:opacity-90 transition-opacity uppercase tracking-wider shadow-sm"
            >
              {saving ? '[ SAVING... ]' : 'Save Configuration'}
            </button>
          </div>
        </form>
      </section>

      {/* Security Credentials */}
      <section className="bg-surface rounded-xl border border-border p-6 shadow-sm space-y-4">
        <div className="pb-3 border-b border-border">
          <h2 className="text-sm font-bold text-text">
            Security &amp; Password
          </h2>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md text-xs">
          <div>
            <label className="block text-xs font-semibold text-text mb-1">
              Current Password
            </label>
            <input 
              type="password" 
              required 
              value={currentPassword} 
              onChange={e => setCurrentPassword(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-text mb-1">
              New Password (min 6 chars)
            </label>
            <input 
              type="password" 
              required 
              minLength={6} 
              value={newPassword} 
              onChange={e => setNewPassword(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-text mb-1">
              Confirm New Password
            </label>
            <input 
              type="password" 
              required 
              minLength={6} 
              value={confirmPassword} 
              onChange={e => setConfirmPassword(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:border-primary"
            />
          </div>

          <button 
            type="submit" 
            disabled={saving}
            className="bg-surface border border-border px-5 py-2 rounded-lg text-xs font-semibold text-text hover:bg-background transition-colors disabled:opacity-50"
          >
            Update Password
          </button>
        </form>
      </section>

      {/* Danger Zone */}
      <section className="bg-surface rounded-xl border border-rose-500/30 p-6 shadow-sm space-y-4">
        <div className="pb-3 border-b border-rose-500/20">
          <h2 className="text-sm font-bold text-rose-500">
            Danger Zone
          </h2>
        </div>

        <p className="text-xs text-muted-text leading-relaxed font-sans">
          Deleting your account permanently purges all custom decks, problem notes, and SM-2 review history. This action cannot be undone.
        </p>

        <div className="space-y-3 max-w-md">
          <div>
            <label className="block text-xs font-semibold text-muted-text mb-1">
              Type <span className="text-text font-bold bg-background px-1 py-0.5 rounded border border-border">{user?.email}</span> to confirm
            </label>
            <input
              type="text"
              value={deleteEmail}
              onChange={e => setDeleteEmail(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-text focus:outline-none focus:border-rose-500"
              placeholder={user?.email || ''}
            />
          </div>

          <button
            onClick={handleDeleteAccount}
            disabled={deleteEmail !== user?.email}
            className="w-full bg-rose-600 text-white px-5 py-2.5 rounded-lg text-xs uppercase font-bold hover:bg-rose-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
          >
            Permanently Wipe Account &amp; Catalog
          </button>
        </div>
      </section>
    </div>
  );
}
