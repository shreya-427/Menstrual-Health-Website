/**
 * EducationPage — topic browser and AI chat assistant.
 */
import { useState, useEffect } from 'react'
import { HEALTH_TOPICS, CATEGORIES } from '../data/healthTopics.js'
import { getPreferences } from '../services/storageService.js'
import TopicCard from '../components/education/TopicCard.jsx'
import TopicDetailView from '../components/education/TopicDetailView.jsx'
import ConsentGate from '../components/education/ConsentGate.jsx'

export default function EducationPage() {
  const [selectedTopic,   setSelectedTopic]   = useState(null)
  const [activeCategory,  setActiveCategory]  = useState('All')
  const [consentGranted,  setConsentGranted]  = useState(false)

  // Load AI consent preference
  useEffect(() => {
    getPreferences().then(p => setConsentGranted(p.aiConsentGranted ?? false))
  }, [])

  const categories = ['All', ...CATEGORIES]

  const visibleTopics = activeCategory === 'All'
    ? HEALTH_TOPICS
    : HEALTH_TOPICS.filter(t => t.category === activeCategory)

  if (selectedTopic) {
    return (
      <div className="space-y-5">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Education</h1>
        <TopicDetailView topic={selectedTopic} onBack={() => setSelectedTopic(null)} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Education</h1>

      {/* Topic browser */}
      <div className="card space-y-4">
        <p className="section-heading">Health topics</p>

        {/* Category filter */}
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={[
                'px-3 py-1 rounded-xl text-xs font-medium transition-colors',
                activeCategory === cat
                  ? 'bg-brand-purple text-white'
                  : 'border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:border-brand-purple/40',
              ].join(' ')}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Topic grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {visibleTopics.map(topic => (
            <TopicCard
              key={topic.id}
              topic={topic}
              onClick={() => setSelectedTopic(topic)}
            />
          ))}
        </div>

        <p className="text-xs text-brand-muted dark:text-brand-muted-dark">
          Placeholder content — medically reviewed material will be added by the content teammate.
        </p>
      </div>

      {/* AI chat */}
      <div className="card space-y-4">
        <div>
          <p className="section-heading">Ask a health question</p>
          <p className="text-xs text-brand-muted dark:text-brand-muted-dark">
            General educational questions only. Not a substitute for professional medical advice.
          </p>
        </div>
        <ConsentGate consentGranted={consentGranted} />
      </div>
    </div>
  )
}
