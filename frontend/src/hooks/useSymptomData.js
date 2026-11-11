/**
 * useSymptomData — React hook for symptom log state.
 *
 * Loads all symptom logs from storageService on mount.
 * Exposes add, update, remove methods that keep state in sync with storage.
 */

import { useState, useEffect, useCallback } from 'react'
import {
  getSymptomLogs,
  saveSymptomLog,
  updateSymptomLog,
  deleteSymptomLog,
} from '../services/storageService.js'

export function useSymptomData() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getSymptomLogs()
      .then(data => setLogs(data))
      .finally(() => setLoading(false))
  }, [])

  const add = useCallback(async (log) => {
    const saved = await saveSymptomLog(log)
    setLogs(prev => [...prev, saved])
    return saved
  }, [])

  const update = useCallback(async (log) => {
    await updateSymptomLog(log)
    setLogs(prev => prev.map(l => l.id === log.id ? { ...l, ...log } : l))
  }, [])

  const remove = useCallback(async (id) => {
    await deleteSymptomLog(id)
    setLogs(prev => prev.filter(l => l.id !== id))
  }, [])

  return { logs, loading, add, update, remove }
}
