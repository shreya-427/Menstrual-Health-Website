/**
 * useCycleData — React hook for cycle entry state.
 *
 * Loads all cycle entries from storageService on mount.
 * Exposes add, update, remove methods that keep state in sync with storage.
 */

import { useState, useEffect, useCallback } from 'react'
import {
  getCycleEntries,
  saveCycleEntry,
  updateCycleEntry,
  deleteCycleEntry,
} from '../services/storageService.js'

export function useCycleData() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)

  // Load on mount
  useEffect(() => {
    getCycleEntries()
      .then(data => setEntries(data))
      .finally(() => setLoading(false))
  }, [])

  const add = useCallback(async (entry) => {
    const saved = await saveCycleEntry(entry)
    setEntries(prev => [...prev, saved])
    return saved
  }, [])

  const update = useCallback(async (entry) => {
    await updateCycleEntry(entry)
    setEntries(prev => prev.map(e => e.id === entry.id ? { ...e, ...entry } : e))
  }, [])

  const remove = useCallback(async (id) => {
    await deleteCycleEntry(id)
    setEntries(prev => prev.filter(e => e.id !== id))
  }, [])

  return { entries, loading, add, update, remove }
}
