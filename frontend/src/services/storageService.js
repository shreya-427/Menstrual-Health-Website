/**
 * storageService.js
 *
 * Single access point for all local data storage.
 * UI components must never call localForage directly — use this module.
 *
 * ENCRYPTION INTEGRATION POINTS (security teammate):
 *   Each save method has a comment:  // ENCRYPT BEFORE WRITE
 *   Each get method has a comment:   // DECRYPT AFTER READ
 *   Steps to add encryption:
 *   1. Implement encryptionService.js with deriveKey(), encrypt(), decrypt().
 *   2. Add a passphrase prompt in App.jsx that calls deriveKey() once per
 *      session and stores the CryptoKey in a React context (EncryptionContext).
 *   3. Import the key from context and call encrypt(value, key) at each
 *      ENCRYPT BEFORE WRITE comment, decrypt(value, key) at each
 *      DECRYPT AFTER READ comment.
 *   No UI component changes are needed.
 *
 * DATA SCHEMAS:
 *
 * CycleEntry {
 *   id: string (crypto UUID),
 *   startDate: string (ISO date, e.g. "2024-03-01"),
 *   endDate: string | null,
 *   notes: string | null,        ← ENCRYPT THIS FIELD
 *   createdAt: string (ISO),
 *   modifiedAt: string (ISO)
 * }
 *
 * SymptomLog {
 *   id: string,
 *   date: string (ISO date),
 *   flowIntensity: number (1–5) | null,
 *   crampSeverity: number (0–5) | null,
 *   mood: number (0–5) | null,
 *   energyLevel: number (0–5) | null,
 *   headache: boolean,
 *   bloating: boolean,
 *   additionalSymptoms: string[],
 *   notes: string | null,        ← ENCRYPT THIS FIELD
 *   cycleEntryId: string | null
 * }
 *
 * UserPreferences {
 *   aiConsentGranted: boolean,
 *   themePreference: 'light' | 'dark'
 * }
 */

import localforage from 'localforage'

// ── Storage keys ──────────────────────────────────────────────────────────────
const KEYS = {
  CYCLE_ENTRIES:  'cycleEntries',
  SYMPTOM_LOGS:   'symptomLogs',
  PREFERENCES:    'userPreferences',
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function newId() {
  return crypto.randomUUID()
}

function nowISO() {
  return new Date().toISOString()
}

// ── Cycle entries ─────────────────────────────────────────────────────────────

export async function getCycleEntries() {
  const entries = await localforage.getItem(KEYS.CYCLE_ENTRIES)
  const list = entries ?? []
  // DECRYPT AFTER READ — decrypt `notes` field on each entry when encryption is active
  return list
}

export async function saveCycleEntry(entry) {
  const entries = await getCycleEntries()
  const now = nowISO()
  const newEntry = {
    id:         newId(),
    startDate:  entry.startDate,
    endDate:    entry.endDate ?? null,
    notes:      entry.notes ?? null,  // ENCRYPT BEFORE WRITE
    createdAt:  now,
    modifiedAt: now,
  }
  await localforage.setItem(KEYS.CYCLE_ENTRIES, [...entries, newEntry])
  return newEntry
}

export async function updateCycleEntry(updated) {
  const entries = await getCycleEntries()
  const next = entries.map(e =>
    e.id === updated.id
      ? { ...e, ...updated, notes: updated.notes ?? null, modifiedAt: nowISO() }  // ENCRYPT BEFORE WRITE
      : e
  )
  await localforage.setItem(KEYS.CYCLE_ENTRIES, next)
}

export async function deleteCycleEntry(id) {
  const entries = await getCycleEntries()
  await localforage.setItem(KEYS.CYCLE_ENTRIES, entries.filter(e => e.id !== id))
}

// ── Symptom logs ──────────────────────────────────────────────────────────────

export async function getSymptomLogs() {
  const logs = await localforage.getItem(KEYS.SYMPTOM_LOGS)
  const list = logs ?? []
  // DECRYPT AFTER READ — decrypt `notes` field on each log when encryption is active
  return list
}

export async function saveSymptomLog(log) {
  const logs = await getSymptomLogs()
  const now = nowISO()
  const newLog = {
    id:                newId(),
    date:              log.date,
    flowIntensity:     log.flowIntensity ?? null,
    crampSeverity:     log.crampSeverity ?? null,
    mood:              log.mood ?? null,
    energyLevel:       log.energyLevel ?? null,
    headache:          log.headache ?? false,
    bloating:          log.bloating ?? false,
    additionalSymptoms: log.additionalSymptoms ?? [],
    notes:             log.notes ?? null,  // ENCRYPT BEFORE WRITE
    cycleEntryId:      log.cycleEntryId ?? null,
    createdAt:         now,
    modifiedAt:        now,
  }
  await localforage.setItem(KEYS.SYMPTOM_LOGS, [...logs, newLog])
  return newLog
}

export async function updateSymptomLog(updated) {
  const logs = await getSymptomLogs()
  const next = logs.map(l =>
    l.id === updated.id
      ? { ...l, ...updated, notes: updated.notes ?? null, modifiedAt: nowISO() }  // ENCRYPT BEFORE WRITE
      : l
  )
  await localforage.setItem(KEYS.SYMPTOM_LOGS, next)
}

export async function deleteSymptomLog(id) {
  const logs = await getSymptomLogs()
  await localforage.setItem(KEYS.SYMPTOM_LOGS, logs.filter(l => l.id !== id))
}

// ── Preferences ───────────────────────────────────────────────────────────────

const DEFAULT_PREFERENCES = {
  aiConsentGranted: false,
  themePreference: 'light',
}

export async function getPreferences() {
  const prefs = await localforage.getItem(KEYS.PREFERENCES)
  return { ...DEFAULT_PREFERENCES, ...(prefs ?? {}) }
}

export async function savePreferences(partial) {
  const current = await getPreferences()
  await localforage.setItem(KEYS.PREFERENCES, { ...current, ...partial })
}

// ── Bulk operations ───────────────────────────────────────────────────────────

export async function getAllData() {
  const [cycleEntries, symptomLogs] = await Promise.all([
    getCycleEntries(),
    getSymptomLogs(),
  ])
  return { cycleEntries, symptomLogs }
}

export async function clearAllData() {
  await Promise.all([
    localforage.removeItem(KEYS.CYCLE_ENTRIES),
    localforage.removeItem(KEYS.SYMPTOM_LOGS),
    localforage.removeItem(KEYS.PREFERENCES),
  ])
}
