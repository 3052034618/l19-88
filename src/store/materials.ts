import { create } from 'zustand'
import Taro from '@tarojs/taro'
import type { MaterialItem, MaterialPermission, MaterialCategory } from '@/types'
import { mockMaterials, categoryConfig } from '@/data/materials'

const STORAGE_KEY = 'pr_materials_v2'

interface MaterialsState {
  materials: MaterialItem[]
  initialized: boolean
  initMaterials: () => void
  addMaterial: (data: {
    category: MaterialCategory
    title: string
    content: string
    permission: MaterialPermission
    eventId?: string | null
  }) => string
  updatePermission: (id: string, permission: MaterialPermission) => void
  deleteMaterial: (id: string) => void
  getMaterialsByEvent: (eventId: string) => MaterialItem[]
}

const categoryNameMap = categoryConfig.reduce<Record<string, string>>((acc, cur) => {
  acc[cur.key] = cur.name
  return acc
}, {})

const loadFromStorage = (): MaterialItem[] | null => {
  try {
    const raw = Taro.getStorageSync(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return parsed
    }
  } catch (e) {
    console.error('[MaterialsStore] loadFromStorage error:', e)
  }
  return null
}

const saveToStorage = (materials: MaterialItem[]) => {
  try {
    Taro.setStorageSync(STORAGE_KEY, JSON.stringify(materials))
  } catch (e) {
    console.error('[MaterialsStore] saveToStorage error:', e)
  }
}

const genId = () =>
  'm' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6)

const nowStr = () => {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export const useMaterialsStore = create<MaterialsState>((set, get) => ({
  materials: [],
  initialized: false,

  initMaterials: () => {
    if (get().initialized) return
    const stored = loadFromStorage()
    if (stored && stored.length > 0) {
      set({ materials: stored, initialized: true })
      console.log('[MaterialsStore] loaded from storage, count:', stored.length)
    } else {
      set({ materials: mockMaterials, initialized: true })
      saveToStorage(mockMaterials)
      console.log('[MaterialsStore] use default mock data (v2)')
    }
  },

  addMaterial: (data) => {
    const { materials } = get()
    const id = genId()
    const newItem: MaterialItem = {
      id,
      category: data.category,
      categoryName: categoryNameMap[data.category] || '未分类',
      title: data.title,
      content: data.content,
      permission: data.permission,
      eventId: data.eventId ?? null,
      updatedAt: nowStr(),
      author: '当前用户',
      version: 1
    }
    const next = [newItem, ...materials]
    set({ materials: next })
    saveToStorage(next)
    console.log('[MaterialsStore] added new material:', id, 'eventId:', data.eventId)
    return id
  },

  updatePermission: (id, permission) => {
    const { materials } = get()
    const next = materials.map((m) =>
      m.id === id
        ? { ...m, permission, updatedAt: nowStr(), version: m.version + 1 }
        : m
    )
    set({ materials: next })
    saveToStorage(next)
    console.log('[MaterialsStore] updated permission:', id, '->', permission)
  },

  deleteMaterial: (id) => {
    const { materials } = get()
    const next = materials.filter((m) => m.id !== id)
    set({ materials: next })
    saveToStorage(next)
    console.log('[MaterialsStore] deleted:', id)
  },

  getMaterialsByEvent: (eventId) => {
    return get().materials.filter((m) => m.eventId === eventId)
  }
}))
