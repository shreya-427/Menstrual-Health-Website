/**
 * ChatDisclaimer — persistent, non-dismissable privacy reminder.
 * Always shown above the chat input when the chat is active.
 */
export default function ChatDisclaimer() {
  return (
    <div
      role="note"
      aria-label="Privacy reminder"
      className="rounded-xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200
                 dark:border-yellow-700/40 px-3 py-2 text-xs text-yellow-800 dark:text-yellow-300"
    >
      <strong>Privacy reminder:</strong> Do not enter personal identifying information.
      Your typed questions are sent to IBM AI services when the assistant is enabled.
      Your stored health data is never transmitted automatically.
    </div>
  )
}
