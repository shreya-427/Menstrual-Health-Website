/**
 * PassphraseGate.jsx
 *
 * Full-screen overlay shown before the app renders.
 * Has three modes driven by `mode` prop:
 *   'setup'  — First-run: choose + confirm a passphrase.
 *   'unlock' — Returning user: enter passphrase to decrypt data.
 *   'change' — Change passphrase from Settings (modal style, calls onDone when finished).
 *
 * Props:
 *   mode          'setup' | 'unlock' | 'change'
 *   onUnlocked    (key: CryptoKey) => void   — called when key is ready
 *   onWipe        () => void                 — called after user confirms wipe (unlock mode only)
 */
import { useState } from 'react'
import { setupPassphrase, unlockWithPassphrase } from '../services/encryptionService.js'

// ── Shared styles ─────────────────────────────────────────────────────────────
const inputClass =
  'w-full rounded-xl border border-gray-200 dark:border-white/10 ' +
  'bg-white dark:bg-white/5 px-3 py-2.5 text-sm text-gray-800 dark:text-gray-100 ' +
  'placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-pink ' +
  'disabled:opacity-50'

// Minimum passphrase length
const MIN_LENGTH = 8

// ── Strength meter ─────────────────────────────────────────────────────────────
function strength(p) {
  if (!p) return { score: 0, label: '', color: '' }
  let s = 0
  if (p.length >= 8)  s++
  if (p.length >= 12) s++
  if (/[A-Z]/.test(p)) s++
  if (/[0-9]/.test(p)) s++
  if (/[^A-Za-z0-9]/.test(p)) s++
  if (s <= 1) return { score: s, label: 'Weak',   color: 'bg-red-400' }
  if (s <= 3) return { score: s, label: 'Fair',   color: 'bg-yellow-400' }
  if (s <= 4) return { score: s, label: 'Good',   color: 'bg-blue-400' }
  return          { score: s, label: 'Strong', color: 'bg-green-400' }
}

// ── Setup form ────────────────────────────────────────────────────────────────
function SetupForm({ onUnlocked }) {
  const [pass,    setPass]    = useState('')
  const [confirm, setConfirm] = useState('')
  const [error,   setError]   = useState('')
  const [working, setWorking] = useState(false)
  const [show,    setShow]    = useState(false)

  const str = strength(pass)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (pass.length < MIN_LENGTH) {
      setError(`Passphrase must be at least ${MIN_LENGTH} characters.`)
      return
    }
    if (pass !== confirm) {
      setError('Passphrases do not match.')
      return
    }
    setWorking(true)
    try {
      const key = await setupPassphrase(pass)
      onUnlocked(key)
    } catch (err) {
      setError('Could not set up encryption. Please try again.')
      console.error(err)
    } finally {
      setWorking(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
          Choose a passphrase
        </label>
        <div className="relative">
          <input
            type={show ? 'text' : 'password'}
            value={pass}
            onChange={e => setPass(e.target.value)}
            placeholder="At least 8 characters"
            autoComplete="new-password"
            disabled={working}
            className={inputClass + ' pr-16'}
          />
          <button
            type="button"
            onClick={() => setShow(v => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-brand-muted dark:text-brand-muted-dark px-1 py-0.5"
            tabIndex={-1}
          >
            {show ? 'Hide' : 'Show'}
          </button>
        </div>
        {/* Strength bar */}
        {pass.length > 0 && (
          <div className="mt-1.5 flex items-center gap-2">
            <div className="flex gap-0.5 flex-1">
              {[1,2,3,4,5].map(n => (
                <div
                  key={n}
                  className={`h-1 flex-1 rounded-full transition-colors ${
                    n <= str.score ? str.color : 'bg-gray-200 dark:bg-white/10'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-brand-muted dark:text-brand-muted-dark w-12 text-right">
              {str.label}
            </span>
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
          Confirm passphrase
        </label>
        <input
          type={show ? 'text' : 'password'}
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          placeholder="Re-enter passphrase"
          autoComplete="new-password"
          disabled={working}
          className={inputClass}
        />
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-500 dark:text-red-400">{error}</p>
      )}

      <button
        type="submit"
        disabled={working || pass.length < MIN_LENGTH || pass !== confirm}
        className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {working ? 'Setting up…' : 'Set passphrase & open app'}
      </button>
    </form>
  )
}

// ── Unlock form ───────────────────────────────────────────────────────────────
function UnlockForm({ onUnlocked, onWipe }) {
  const [pass,    setPass]    = useState('')
  const [error,   setError]   = useState('')
  const [working, setWorking] = useState(false)
  const [show,    setShow]    = useState(false)
  const [wipeStep,setWipeStep]= useState(false)  // two-step wipe confirmation

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setWorking(true)
    try {
      const key = await unlockWithPassphrase(pass)
      onUnlocked(key)
    } catch (err) {
      if (err.message === 'wrong_passphrase') {
        setError('Incorrect passphrase. Please try again.')
      } else {
        setError('Could not unlock. Please try again.')
        console.error(err)
      }
    } finally {
      setWorking(false)
    }
  }

  if (wipeStep) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/40 p-4 text-sm text-red-700 dark:text-red-300 space-y-2">
          <p className="font-semibold">This will permanently delete all your data.</p>
          <p>Your cycle records, symptom logs, and health profile will be erased from this device. This cannot be undone.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onWipe}
            className="flex-1 text-sm font-medium text-white bg-red-500 hover:bg-red-600 px-4 py-2.5 rounded-xl transition-colors"
          >
            Yes, delete everything
          </button>
          <button
            onClick={() => setWipeStep(false)}
            className="flex-1 btn-ghost text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
          Passphrase
        </label>
        <div className="relative">
          <input
            type={show ? 'text' : 'password'}
            value={pass}
            onChange={e => setPass(e.target.value)}
            placeholder="Enter your passphrase"
            autoComplete="current-password"
            disabled={working}
            autoFocus
            className={inputClass + ' pr-16'}
          />
          <button
            type="button"
            onClick={() => setShow(v => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-brand-muted dark:text-brand-muted-dark px-1 py-0.5"
            tabIndex={-1}
          >
            {show ? 'Hide' : 'Show'}
          </button>
        </div>
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-500 dark:text-red-400">{error}</p>
      )}

      <button
        type="submit"
        disabled={working || !pass}
        className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {working ? 'Unlocking…' : 'Unlock'}
      </button>

      <div className="pt-1 border-t border-gray-100 dark:border-white/10">
        <p className="text-xs text-brand-muted dark:text-brand-muted-dark mb-2">
          Forgot your passphrase? The only option is to wipe all stored data and start fresh.
        </p>
        <button
          type="button"
          onClick={() => setWipeStep(true)}
          className="text-xs text-red-400 hover:text-red-500 transition-colors"
        >
          Forgot passphrase — wipe data
        </button>
      </div>
    </form>
  )
}

// ── Change-passphrase form (used from Settings) ───────────────────────────────
export function ChangePassphraseForm({ onDone }) {
  const [current, setCurrent] = useState('')
  const [next,    setNext]    = useState('')
  const [confirm, setConfirm] = useState('')
  const [error,   setError]   = useState('')
  const [working, setWorking] = useState(false)
  const [success, setSuccess] = useState(false)
  const [show,    setShow]    = useState(false)

  const str = strength(next)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (next.length < MIN_LENGTH) {
      setError(`New passphrase must be at least ${MIN_LENGTH} characters.`)
      return
    }
    if (next !== confirm) {
      setError('New passphrases do not match.')
      return
    }
    setWorking(true)
    try {
      // Verify the current passphrase first
      await unlockWithPassphrase(current)
      // The EncryptionContext will handle the actual re-encryption via onDone
      onDone({ currentPassphrase: current, newPassphrase: next })
      setSuccess(true)
    } catch (err) {
      if (err.message === 'wrong_passphrase') {
        setError('Current passphrase is incorrect.')
      } else {
        setError('Could not change passphrase. Please try again.')
        console.error(err)
      }
    } finally {
      setWorking(false)
    }
  }

  if (success) {
    return (
      <p role="status" className="text-sm text-green-600 dark:text-green-400 py-2">
        ✓ Passphrase changed successfully.
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
          Current passphrase
        </label>
        <input
          type={show ? 'text' : 'password'}
          value={current}
          onChange={e => setCurrent(e.target.value)}
          autoComplete="current-password"
          disabled={working}
          className={inputClass}
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
          New passphrase
        </label>
        <input
          type={show ? 'text' : 'password'}
          value={next}
          onChange={e => setNext(e.target.value)}
          autoComplete="new-password"
          disabled={working}
          className={inputClass}
        />
        {next.length > 0 && (
          <div className="mt-1.5 flex items-center gap-2">
            <div className="flex gap-0.5 flex-1">
              {[1,2,3,4,5].map(n => (
                <div key={n} className={`h-1 flex-1 rounded-full transition-colors ${n <= str.score ? str.color : 'bg-gray-200 dark:bg-white/10'}`} />
              ))}
            </div>
            <span className="text-xs text-brand-muted dark:text-brand-muted-dark w-12 text-right">{str.label}</span>
          </div>
        )}
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
          Confirm new passphrase
        </label>
        <input
          type={show ? 'text' : 'password'}
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          autoComplete="new-password"
          disabled={working}
          className={inputClass}
        />
      </div>
      <label className="flex items-center gap-2 text-xs text-brand-muted dark:text-brand-muted-dark cursor-pointer select-none">
        <input type="checkbox" checked={show} onChange={e => setShow(e.target.checked)} className="rounded" />
        Show passphrases
      </label>
      {error && <p role="alert" className="text-sm text-red-500 dark:text-red-400">{error}</p>}
      <div className="flex gap-3 pt-1">
        <button
          type="submit"
          disabled={working || !current || next.length < MIN_LENGTH || next !== confirm}
          className="btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {working ? 'Changing…' : 'Change passphrase'}
        </button>
      </div>
    </form>
  )
}

// ── Main PassphraseGate component ─────────────────────────────────────────────
export default function PassphraseGate({ mode, onUnlocked, onWipe }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-light dark:bg-brand-dark">
      <div className="w-full max-w-sm">
        {/* Logo / branding */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🌸</div>
          <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">
            Menstrual Health
          </h1>
          <p className="text-sm text-brand-muted dark:text-brand-muted-dark mt-1">
            {mode === 'setup'
              ? 'Your data is encrypted and stored only on this device.'
              : 'Your data is encrypted. Enter your passphrase to continue.'}
          </p>
        </div>

        <div className="card space-y-5">
          <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100">
            {mode === 'setup' ? 'Set up encryption' : 'Unlock your data'}
          </h2>

          {mode === 'setup' && (
            <>
              <div className="rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700/40 p-3 text-xs text-blue-700 dark:text-blue-300 space-y-1">
                <p><strong>Your passphrase encrypts your data locally.</strong></p>
                <p>It is never sent anywhere. If you forget it, your data cannot be recovered — there is no reset.</p>
              </div>
              <SetupForm onUnlocked={onUnlocked} />
            </>
          )}

          {mode === 'unlock' && (
            <UnlockForm onUnlocked={onUnlocked} onWipe={onWipe} />
          )}
        </div>
      </div>
    </div>
  )
}
