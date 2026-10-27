import React, { useState } from 'react';
import { loginAdmin, logoutAdmin, getAdminToken } from '../services/api';

const KEY = 'zaytoun_admin_session';
const MAX_FAILS = 5;
const LOCK_MS = 3 * 60 * 1000;

export default function AdminGate({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return Boolean(sessionStorage.getItem(KEY) || getAdminToken());
  });
  const [passcode, setPasscode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = () => {
    logoutAdmin();
    setIsAuthenticated(false);
    setPasscode('');
  };

  if (isAuthenticated) {
    return (
      <div>
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-linen-300 dark:border-onyx-800 text-xs">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="font-mono text-onyx-700 dark:text-linen-300 font-semibold">
              Authenticated Session: <strong className="text-olive-800 dark:text-camel-400">shahroz (Admin)</strong>
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-linen-200 dark:bg-onyx-800 font-mono text-onyx-600 dark:text-linen-400">
              JWT Active (8h)
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-950 dark:text-red-300 rounded-md font-semibold transition text-[11px]"
          >
            Sign Out
          </button>
        </div>
        {children}
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const lockTime = Number(localStorage.getItem('zaytoun_admin_lock') || 0);
    if (Date.now() < lockTime) {
      const remainingSecs = Math.ceil((lockTime - Date.now()) / 1000);
      return setErrorMsg(`Security lockout active. Please wait ${remainingSecs} seconds.`);
    }

    if (!passcode) {
      return setErrorMsg('Please enter the admin passcode.');
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const res = await loginAdmin(passcode);
      if (res.success) {
        sessionStorage.setItem(KEY, 'authenticated');
        localStorage.removeItem('zaytoun_admin_fails');
        setIsAuthenticated(true);
      } else {
        const fails = Number(localStorage.getItem('zaytoun_admin_fails') || 0) + 1;
        localStorage.setItem('zaytoun_admin_fails', fails);
        if (fails >= MAX_FAILS) {
          localStorage.setItem('zaytoun_admin_lock', Date.now() + LOCK_MS);
          localStorage.setItem('zaytoun_admin_fails', 0);
          setErrorMsg('Too many failed attempts. Security lock activated for 3 minutes.');
        } else {
          setErrorMsg(`Incorrect admin passcode. (${MAX_FAILS - fails} attempts remaining)`);
        }
      }
    } catch {
      setErrorMsg('Authentication error. Please try again.');
    } finally {
      setIsLoading(false);
      setPasscode('');
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-6 p-8 rounded-3xl border border-linen-300 dark:border-onyx-800 bg-white dark:bg-onyx-900 shadow-xl"
      >
        <div className="space-y-1 text-center">
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-camel-600 dark:text-camel-400 font-bold">
            Atelier Studio Security
          </span>
          <h1 className="font-editorial text-3xl font-bold text-onyx-950 dark:text-linen-50">
            Studio Gate
          </h1>
          <p className="text-xs text-onyx-500 dark:text-linen-400">
            Enter admin passcode to generate secure session token
          </p>
        </div>

        <div className="space-y-2">
          <input
            type="password"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            autoFocus
            autoComplete="current-password"
            placeholder="Passcode"
            className="w-full px-4 py-3 rounded-xl bg-linen-50 dark:bg-onyx-800 border border-linen-300 dark:border-onyx-700 outline-none focus:border-olive-700 dark:focus:border-camel-500 text-sm font-mono text-center tracking-widest text-onyx-950 dark:text-linen-100 transition"
          />

          {errorMsg && (
            <p className="text-xs text-red-600 dark:text-red-400 text-center font-medium bg-red-50 dark:bg-red-950/50 py-2 px-3 rounded-lg" role="alert">
              {errorMsg}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 rounded-xl bg-olive-800 hover:bg-olive-900 dark:bg-camel-500 dark:hover:bg-camel-600 text-white dark:text-onyx-950 text-xs font-bold tracking-widest uppercase transition active:scale-95 disabled:opacity-50"
        >
          {isLoading ? 'Verifying...' : 'Authenticate & Enter'}
        </button>

        <div className="pt-2 text-center text-[10px] text-onyx-400 font-mono">
          Secured with Expiring JWT Tokens (8h) & Joi Schema Enforcement
        </div>
      </form>
    </div>
  );
}
