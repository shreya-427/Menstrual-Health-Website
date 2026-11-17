/**
 * ConsentGate — renders ChatPanel only when aiConsentGranted is true.
 * Otherwise renders a disabled stub with a link to Settings.
 *
 * Props:
 *   consentGranted  boolean
 */
import { Link } from 'react-router-dom'
import ChatPanel from './ChatPanel.jsx'

export default function ConsentGate({ consentGranted }) {
  if (consentGranted) {
    return <ChatPanel />
  }

  return (
    <div className="rounded-2xl border border-dashed border-gray-200 dark:border-white/10
                    bg-gray-50 dark:bg-white/5 p-6 text-center space-y-3">
      <p className="text-brand-muted dark:text-brand-muted-dark text-sm">
        The AI assistant is not enabled.
      </p>
      <p className="text-xs text-brand-muted dark:text-brand-muted-dark">
        Enable it in Settings to ask general menstrual health questions or about how we protect your data.
        You will be shown what information is transmitted before it is activated.
      </p>
      <Link to="/settings" className="btn-ghost text-sm inline-block">
        Go to Settings →
      </Link>
    </div>
  )
}
