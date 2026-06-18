import { create } from 'zustand'
import Taro from '@tarojs/taro'
import type {
  EventItem,
  EventAnalysisResult,
  SpreadPlatform,
  SourceInfo,
  KeyAccount
} from '@/types'
import { mockEvents, mockSourceInfos, mockKeyAccounts, mockAnalysisResult } from '@/data/events'
import { mockSpreadPlatforms } from '@/data/spread'

const EVENTS_KEY = 'pr_events_v1'
const ANALYSIS_KEY = 'pr_analysis_v1'
const SPREAD_KEY = 'pr_spread_v1'
const ACTIVE_KEY = 'pr_active_event_v1'

interface TrackedEvent {
  event: EventItem
  analysis: EventAnalysisResult
  spread: SpreadPlatform[]
  createdAt: string
}

interface EventsState {
  events: EventItem[]
  analysisMap: Record<string, EventAnalysisResult>
  spreadMap: Record<string, SpreadPlatform[]>
  activeEventId: string | null
  initialized: boolean
  initEvents: () => void
  addTrackedEvent: (data: {
    keyword: string
    description?: string
    brandLine: string
    region: string
    screenshot?: string
  }) => { eventId: string; analysis: EventAnalysisResult }
  setActiveEvent: (id: string | null) => void
  getAnalysis: (id: string) => EventAnalysisResult | null
  getSpread: (id: string) => SpreadPlatform[]
  getAllTracked: () => EventItem[]
}

const genId = () =>
  'e' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6)

const nowStr = () => {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const loadJSON = <T,>(key: string, fallback: T): T => {
  try {
    const raw = Taro.getStorageSync(key)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed !== null && parsed !== undefined) return parsed as T
    }
  } catch (e) {
    console.error(`[EventsStore] load ${key} error:`, e)
  }
  return fallback
}

const saveJSON = (key: string, val: unknown) => {
  try {
    Taro.setStorageSync(key, JSON.stringify(val))
  } catch (e) {
    console.error(`[EventsStore] save ${key} error:`, e)
  }
}

const variant = (base: string, i: number) => base + (i % 2 === 0 ? ' (相关)' : ' (延伸)')

const buildAnalysisForKeyword = (keyword: string): EventAnalysisResult => {
  const seed = Math.abs(
    keyword.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 7)
  )
  const sources: SourceInfo[] = mockSourceInfos.map((s, i) => ({
    ...s,
    title: i === 0 ? `${keyword} 首发曝光` : variant(s.title, seed + i),
    viewCount: Math.round(s.viewCount * (0.7 + ((seed + i * 31) % 60) / 100)),
    likeCount: Math.round(s.likeCount * (0.6 + ((seed + i * 17) % 50) / 100)),
    shareCount: Math.round(s.shareCount * (0.5 + ((seed + i * 11) % 70) / 100))
  }))
  const accounts: KeyAccount[] = mockKeyAccounts.map((a, i) => ({
    ...a,
    followers:
      a.followers +
      ((seed + i * 7) % 5 === 0 ? '+' : '')
  }))
  const volume = 1200 + (seed % 8000)
  const peakHour = 12 + (seed % 6)
  return {
    firstSources: sources,
    keyAccounts: accounts,
    peakWarning: {
      isPeak: (seed % 3) !== 0,
      estimatedPeakTime: `今日 ${peakHour}:00-${peakHour + 2}:00`,
      currentVolume: volume,
      trend:
        (seed % 4 === 0 ? '快速上升' : seed % 4 === 1 ? '平稳上升' : seed % 4 === 2 ? '高位震荡' : '略有回落') +
        `，较1小时前 +${50 + (seed % 120)}%`
    }
  }
}

const buildSpreadForKeyword = (keyword: string): SpreadPlatform[] => {
  const seed = Math.abs(
    keyword.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 11)
  )
  return mockSpreadPlatforms.map((p, idx) => {
    const entryCount = Math.max(3, p.entryCount + (seed + idx * 13) % 15 - 7)
    const trendingCount = Math.max(
      1,
      Math.round(entryCount * (0.3 + ((seed + idx) % 20) / 100))
    )
    const sentimentScore = Math.max(
      20,
      Math.min(80, p.sentimentScore + (seed + idx * 7) % 20 - 10)
    )
    return {
      ...p,
      entryCount,
      trendingCount,
      sentimentScore,
      entries: p.entries.map((e, i) => ({
        ...e,
        title: i === 0 ? `${keyword} 热议` : variant(e.title, seed + idx + i),
        engagement: Math.round(e.engagement * (0.6 + ((seed + idx * 5 + i * 3) % 80) / 100)),
        trend:
          (seed + idx + i) % 3 === 0 ? 'rising' : (seed + idx + i) % 3 === 1 ? 'stable' : 'falling'
      }))
    }
  })
}

const riskFromKeyword = (keyword: string): 'low' | 'medium' | 'high' => {
  const seed = keyword.length + keyword.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return seed % 3 === 0 ? 'low' : seed % 3 === 1 ? 'medium' : 'high'
}

export const useEventsStore = create<EventsState>((set, get) => ({
  events: [],
  analysisMap: {},
  spreadMap: {},
  activeEventId: null,
  initialized: false,

  initEvents: () => {
    if (get().initialized) return
    const storedEvents = loadJSON<EventItem[]>(EVENTS_KEY, [])
    const storedAnalysis = loadJSON<Record<string, EventAnalysisResult>>(ANALYSIS_KEY, {})
    const storedSpread = loadJSON<Record<string, SpreadPlatform[]>>(SPREAD_KEY, {})
    const storedActive = loadJSON<string | null>(ACTIVE_KEY, null)

    if (storedEvents.length > 0) {
      set({
        events: storedEvents,
        analysisMap: storedAnalysis,
        spreadMap: storedSpread,
        activeEventId: storedActive,
        initialized: true
      })
      console.log('[EventsStore] loaded from storage, events:', storedEvents.length)
      return
    }

    const analysisMap: Record<string, EventAnalysisResult> = {}
    const spreadMap: Record<string, SpreadPlatform[]> = {}
    mockEvents.forEach((ev) => {
      analysisMap[ev.id] = mockAnalysisResult
      spreadMap[ev.id] = mockSpreadPlatforms
    })

    set({
      events: mockEvents,
      analysisMap,
      spreadMap,
      activeEventId: mockEvents[0]?.id ?? null,
      initialized: true
    })
    saveJSON(EVENTS_KEY, mockEvents)
    saveJSON(ANALYSIS_KEY, analysisMap)
    saveJSON(SPREAD_KEY, spreadMap)
    saveJSON(ACTIVE_KEY, mockEvents[0]?.id ?? null)
    console.log('[EventsStore] initialized with mock data')
  },

  addTrackedEvent: (data) => {
    const id = genId()
    const risk = riskFromKeyword(data.keyword)
    const analysis = buildAnalysisForKeyword(data.keyword)
    const spread = buildSpreadForKeyword(data.keyword)

    const now = nowStr()
    const newEvent: EventItem = {
      id,
      title: data.description?.trim()
        ? data.description.trim().slice(0, 18) + (data.description.trim().length > 18 ? '…' : '')
        : data.keyword.slice(0, 18) + (data.keyword.length > 18 ? '…' : ''),
      keyword: data.keyword,
      brandLine: data.brandLine,
      region: data.region,
      screenshot: data.screenshot,
      status: 'tracked',
      createdAt: now,
      sourceCount: analysis.firstSources.length,
      peakTime: analysis.peakWarning.isPeak ? analysis.peakWarning.estimatedPeakTime : '暂无明显高峰',
      riskLevel: risk
    }

    const { events, analysisMap, spreadMap } = get()
    const nextEvents = [newEvent, ...events]
    const nextAnalysis = { ...analysisMap, [id]: analysis }
    const nextSpread = { ...spreadMap, [id]: spread }

    set({
      events: nextEvents,
      analysisMap: nextAnalysis,
      spreadMap: nextSpread,
      activeEventId: id
    })
    saveJSON(EVENTS_KEY, nextEvents)
    saveJSON(ANALYSIS_KEY, nextAnalysis)
    saveJSON(SPREAD_KEY, nextSpread)
    saveJSON(ACTIVE_KEY, id)
    console.log('[EventsStore] addTrackedEvent:', id)
    return { eventId: id, analysis }
  },

  setActiveEvent: (id) => {
    set({ activeEventId: id })
    saveJSON(ACTIVE_KEY, id)
    console.log('[EventsStore] setActiveEvent:', id)
  },

  getAnalysis: (id) => {
    return get().analysisMap[id] ?? null
  },

  getSpread: (id) => {
    return get().spreadMap[id] ?? []
  },

  getAllTracked: () => {
    return get().events
  }
}))
