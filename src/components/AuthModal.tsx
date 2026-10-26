import React, { useState } from 'react';
import {
  X,
  LogIn,
  LogOut,
  User,
  ShieldCheck,
  Sparkles,
  Cloud,
  FileText,
  Calendar,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SupportedLanguage } from '../types';
import { UI_TRANSLATIONS } from '../data/translations';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: SupportedLanguage;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  language,
}) => {
  const {
    user,
    userProfile,
    loading,
    notes,
    signIn,
    signOut,
    updateProfile,
    authError,
    clearAuthError,
  } = useAuth();

  const [isSigningIn, setIsSigningIn] = useState<boolean>(false);
  const [isSavingProfile, setIsSavingProfile] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Local state for profile edits
  const [editRole, setEditRole] = useState<'mother' | 'postpartum' | 'adolescent' | 'chw'>(
    userProfile?.role || 'mother'
  );
  const [editWeeks, setEditWeeks] = useState<number>(userProfile?.gestationWeeks || 24);

  const t = UI_TRANSLATIONS[language] || UI_TRANSLATIONS.English;

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    clearAuthError();
    try {
      await signIn();
    } catch {
      // Handled in context
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      onClose();
    } catch {
      // Handled in context
    }
  };

  const handleSaveProfileChanges = async () => {
    setIsSavingProfile(true);
    setSaveSuccess(false);
    try {
      await updateProfile({
        role: editRole,
        gestationWeeks: editRole === 'mother' ? editWeeks : undefined,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSavingProfile(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-stone-900 border border-stone-800 text-stone-100 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-stone-800/80 px-5 py-4 border-b border-stone-700/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
              {user ? <User className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {user ? t.account : t.signIn}
              </h2>
              <p className="text-xs text-stone-400">
                {user ? user.email : 'Mama-G Maternal Health Account'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Banner */}
        {authError && (
          <div className="mx-5 mt-4 p-3 bg-rose-950/80 border border-rose-500/50 rounded-xl text-xs text-rose-200 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold block">Authentication Notice:</span>
              <span>{authError}</span>
            </div>
            <button
              onClick={clearAuthError}
              className="text-stone-400 hover:text-white text-xs font-bold ml-1"
            >
              ×
            </button>
          </div>
        )}

        {/* Content */}
        <div className="p-5 space-y-4">
          {!user ? (
            /* Signed Out View */
            <div className="space-y-4">
              <div className="bg-stone-800/50 border border-stone-700/70 p-4 rounded-xl space-y-3">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                  Why Sign In to Mama-G?
                </span>
                <div className="space-y-2 text-xs text-stone-300">
                  <div className="flex items-start gap-2.5">
                    <Cloud className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-white">Cloud & Local Sync:</strong> Safely back up your consultation notes, triage reports, and pregnancy kick records.
                    </span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Calendar className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-white">Personalized Pregnancy Timeline:</strong> Seamlessly track your current gestational week and receive tailored nutrition and danger signs.
                    </span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-white">Zero-Trust Privacy:</strong> Medical records are encrypted and tied strictly to your authenticated session.
                    </span>
                  </div>
                </div>
              </div>

              {/* Google Sign In Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isSigningIn || loading}
                className="w-full py-3 px-4 bg-white hover:bg-stone-100 text-stone-900 font-semibold rounded-xl text-sm flex items-center justify-center gap-3 transition-colors shadow-md disabled:opacity-60 cursor-pointer"
              >
                {isSigningIn ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-stone-900" />
                    <span>Signing in securely...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Continue with Google</span>
                  </>
                )}
              </button>

              <p className="text-[11px] text-stone-400 text-center">
                By continuing, you connect securely via Google Sign-In to sync your maternal care profile.
              </p>
            </div>
          ) : (
            /* Signed In View */
            <div className="space-y-4">
              {/* Profile Card */}
              <div className="bg-stone-800/60 border border-stone-700/80 rounded-xl p-4 flex items-center gap-3.5">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-12 h-12 rounded-full border border-amber-500/50 object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center justify-center font-bold text-lg">
                    {(user.displayName || user.email || 'M')[0].toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm truncate">
                      {user.displayName || 'Mama Care Recipient'}
                    </span>
                    <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-emerald-500/30">
                      Active
                    </span>
                  </div>
                  <span className="text-xs text-stone-400 block truncate">
                    {user.email}
                  </span>
                  <span className="text-[11px] text-amber-400 font-medium capitalize mt-0.5 block">
                    Role: {userProfile?.role || 'Expectant Mother'}
                  </span>
                </div>
              </div>

              {/* Profile Configuration Form */}
              <div className="bg-stone-800/40 border border-stone-700/60 rounded-xl p-3.5 space-y-3">
                <span className="text-xs font-bold text-stone-300 block">
                  Maternal Profile Settings
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-stone-400 block mb-1">Your Role:</label>
                    <select
                      value={editRole}
                      onChange={(e) => setEditRole(e.target.value as any)}
                      className="w-full bg-stone-900 border border-stone-700 rounded-lg p-2 text-stone-200 focus:outline-none focus:border-amber-500"
                    >
                      <option value="mother">Expectant Mother</option>
                      <option value="postpartum">New Mother (Postpartum)</option>
                      <option value="adolescent">Adolescent / Young Girl</option>
                      <option value="chw">Community Health Worker (CHW)</option>
                    </select>
                  </div>

                  {editRole === 'mother' && (
                    <div>
                      <label className="text-stone-400 block mb-1">Gestational Week:</label>
                      <select
                        value={editWeeks}
                        onChange={(e) => setEditWeeks(Number(e.target.value))}
                        className="w-full bg-stone-900 border border-stone-700 rounded-lg p-2 text-stone-200 focus:outline-none focus:border-amber-500"
                      >
                        {Array.from({ length: 42 }, (_, i) => i + 1).map((w) => (
                          <option key={w} value={w}>
                            Week {w} (Trimester {w <= 12 ? 1 : w <= 26 ? 2 : 3})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-stone-700/50">
                  {saveSuccess && (
                    <span className="text-xs text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Profile updated in cloud</span>
                    </span>
                  )}
                  {!saveSuccess && <span />}

                  <button
                    type="button"
                    onClick={handleSaveProfileChanges}
                    disabled={isSavingProfile}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-lg text-xs transition-colors disabled:opacity-50"
                  >
                    {isSavingProfile ? 'Saving...' : 'Save Profile'}
                  </button>
                </div>
              </div>

              {/* Saved Notes / Consultations Preview */}
              <div className="bg-stone-800/40 border border-stone-700/60 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-stone-300 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-amber-400" />
                    <span>Saved Cloud Consultations & Notes</span>
                  </span>
                  <span className="text-stone-400 bg-stone-700/50 px-2 py-0.5 rounded text-[11px]">
                    {notes.length} saved
                  </span>
                </div>

                {notes.length === 0 ? (
                  <p className="text-[11px] text-stone-400 italic">
                    No notes saved yet. Ask Mama-G a question or perform a triage check to save guidance.
                  </p>
                ) : (
                  <div className="space-y-1.5 max-h-36 overflow-y-auto no-scrollbar">
                    {notes.slice(0, 5).map((n) => (
                      <div
                        key={n.id}
                        className="bg-stone-900/80 p-2 rounded-lg border border-stone-800 text-xs flex items-center justify-between"
                      >
                        <span className="text-stone-200 truncate pr-2">{n.title}</span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                            n.severity === 'EMERGENCY'
                              ? 'bg-rose-500/20 text-rose-300'
                              : n.severity === 'URGENT'
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'bg-emerald-500/20 text-emerald-300'
                          }`}
                        >
                          {n.severity}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons: Sign Out & Close */}
              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="px-4 py-2 bg-rose-950/70 hover:bg-rose-900 border border-rose-700/60 text-rose-200 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-rose-400" />
                  <span>{t.signOut}</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
