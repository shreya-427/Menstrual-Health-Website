/**
 * EducationPage — Phase 4 will replace this with:
 *   TopicCard, TopicDetailView, ConsentGate, ChatPanel
 */
export default function EducationPage() {
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Education</h1>

      {/* Topic categories placeholder */}
      <div className="card space-y-3">
        <p className="section-heading">Health topics</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            'Menstrual cycle basics',
            'Cycle phases',
            'Common symptoms',
            'Cycle irregularities',
            'PCOS',
            'PMS & PMDD',
          ].map(topic => (
            <div
              key={topic}
              className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-white/5
                         border border-gray-100 dark:border-white/10 text-sm
                         text-gray-700 dark:text-gray-200"
            >
              <span className="text-brand-purple">📖</span>
              {topic}
            </div>
          ))}
        </div>
        <p className="text-xs text-brand-muted dark:text-brand-muted-dark">
          Full content will be added by the medical content teammate (Phase 4).
        </p>
      </div>

      {/* AI chat placeholder */}
      <div className="card space-y-3">
        <p className="section-heading">Ask a health question</p>
        <div className="rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 p-4 text-sm text-brand-muted dark:text-brand-muted-dark text-center">
          AI health assistant — available after enabling in Settings (Phase 4)
        </div>
        <p className="text-xs text-brand-muted dark:text-brand-muted-dark">
          The AI assistant will answer general menstrual health questions using medically reviewed sources.
          It does not provide medical diagnoses.
        </p>
      </div>
    </div>
  )
}
