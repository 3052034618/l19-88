import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { View, Text, Button, ScrollView, Input, Textarea } from '@tarojs/components'
import Taro, { useDidShow, useRouter } from '@tarojs/taro'
import classnames from 'classnames'
import styles from './index.module.scss'
import MaterialCard from '@/components/MaterialCard'
import { categoryConfig, permissionConfig } from '@/data/materials'
import { useMaterialsStore } from '@/store/materials'
import { useEventsStore } from '@/store/events'
import type { MaterialCategory, MaterialPermission, MaterialItem, EventItem } from '@/types'

const allCategory = { key: 'all', name: '全部', color: '#1E3A8A' }
const categories = [allCategory, ...categoryConfig]
const allPermission = {
  key: 'all' as const,
  name: '全部级别',
  color: '#1E3A8A',
  bgColor: '#EEF2FF',
  textColor: '#1E3A8A'
}
const allEventOption = { id: 'all', title: '全部事件', brandLine: '', region: '', keyword: '' }
const permissionFilters = [allPermission, ...permissionConfig]

const MaterialsPage: React.FC = () => {
  const router = useRouter()

  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [activePermission, setActivePermission] = useState<string>('all')
  const [activeEventId, setActiveEventId] = useState<string>('all')
  const [showModal, setShowModal] = useState(false)
  const [highlightId, setHighlightId] = useState<string | null>(null)

  const materials = useMaterialsStore((s) => s.materials)
  const initMaterials = useMaterialsStore((s) => s.initMaterials)
  const addMaterial = useMaterialsStore((s) => s.addMaterial)

  const initEvents = useEventsStore((s) => s.initEvents)
  const events = useEventsStore((s) => s.events)
  const setActiveEvent = useEventsStore((s) => s.setActiveEvent)

  const [formCategory, setFormCategory] = useState<MaterialCategory>('fact')
  const [formTitle, setFormTitle] = useState('')
  const [formContent, setFormContent] = useState('')
  const [formPermission, setFormPermission] = useState<MaterialPermission>('internal')
  const [formEventId, setFormEventId] = useState<string>('none')

  useDidShow(() => {
    initMaterials()
    initEvents()
  })

  useEffect(() => {
    initMaterials()
    initEvents()
  }, [initMaterials, initEvents])

  const applyParams = useCallback((params: { eventId?: string; permission?: string }) => {
    console.log('[MaterialsPage] applyParams:', params)
    if (params.eventId) {
      setActiveEventId(params.eventId)
      setActiveEvent(params.eventId)
    }
    if (params.permission) {
      setActivePermission(params.permission)
    }
    setActiveCategory('all')
  }, [setActiveEvent])

  const openAdd = useCallback((opts: { eventId?: string }) => {
    console.log('[MaterialsPage] openAdd:', opts)
    setFormCategory('fact')
    setFormTitle('')
    setFormContent('')
    setFormPermission('internal')
    setFormEventId(opts.eventId || 'none')
    setShowModal(true)
  }, [])

  useEffect(() => {
    const onApplyParams = (p: any) => applyParams(p)
    const onOpenAdd = (p: any) => openAdd(p || {})
    Taro.eventCenter.on('materials:applyParams', onApplyParams)
    Taro.eventCenter.on('materials:openAdd', onOpenAdd)
    return () => {
      Taro.eventCenter.off('materials:applyParams', onApplyParams)
      Taro.eventCenter.off('materials:openAdd', onOpenAdd)
    }
  }, [applyParams, openAdd])

  useEffect(() => {
    const p = router.params
    if (p && typeof p === 'object') {
      if (p.eventId) {
        setActiveEventId(String(p.eventId))
        setActiveEvent(String(p.eventId))
      }
      if (p.permission) {
        setActivePermission(String(p.permission))
      }
    }
  }, [router.params, setActiveEvent])

  const handleRefresh = () => {
    console.log('[MaterialsPage] pull down refresh')
    setTimeout(() => {
      Taro.stopPullDownRefresh()
    }, 1000)
  }

  useEffect(() => {
    Taro.onPullDownRefresh(handleRefresh)
    return () => {
      Taro.offPullDownRefresh(handleRefresh)
    }
  }, [])

  const eventOptions = useMemo<Array<{ id: string; title: string }>>(() => {
    return [allEventOption, ...events.map((e) => ({
      id: e.id,
      title: e.title,
      brandLine: e.brandLine,
      region: e.region,
      keyword: e.keyword
    }))]
  }, [events])

  const activeEventTitle = useMemo(() => {
    if (activeEventId === 'all') return '全部事件'
    const ev = events.find((e) => e.id === activeEventId)
    return ev ? ev.title : '全部事件'
  }, [activeEventId, events])

  const filteredMaterials: MaterialItem[] = useMemo(() => {
    return materials.filter((m) => {
      const categoryMatch = activeCategory === 'all' || m.category === activeCategory
      const permissionMatch = activePermission === 'all' || m.permission === activePermission
      const eventMatch =
        activeEventId === 'all'
          ? true
          : activeEventId === 'none'
          ? !m.eventId
          : m.eventId === activeEventId
      return categoryMatch && permissionMatch && eventMatch
    })
  }, [materials, activeCategory, activePermission, activeEventId])

  const stats = useMemo(() => {
    const scope =
      activeEventId === 'all'
        ? materials
        : activeEventId === 'none'
        ? materials.filter((m) => !m.eventId)
        : materials.filter((m) => m.eventId === activeEventId)
    return {
      total: scope.length,
      public: scope.filter((m) => m.permission === 'public').length,
      internal: scope.filter((m) => m.permission === 'internal').length,
      legal: scope.filter((m) => m.permission === 'legal').length
    }
  }, [materials, activeEventId])

  const resetForm = () => {
    setFormCategory('fact')
    setFormTitle('')
    setFormContent('')
    setFormPermission('internal')
    setFormEventId('none')
  }

  const handleAdd = () => {
    resetForm()
    setFormEventId(activeEventId !== 'all' && activeEventId !== 'none' ? activeEventId : 'none')
    setShowModal(true)
  }

  const handleSubmit = () => {
    if (!formTitle.trim()) {
      Taro.showToast({ title: '请输入标题', icon: 'none' })
      return
    }
    if (!formContent.trim()) {
      Taro.showToast({ title: '请输入内容', icon: 'none' })
      return
    }

    const eventIdToSave = formEventId === 'none' ? null : formEventId
    const newId = addMaterial({
      category: formCategory,
      title: formTitle.trim(),
      content: formContent.trim(),
      permission: formPermission,
      eventId: eventIdToSave
    })
    Taro.showToast({ title: '已保存', icon: 'success' })
    setShowModal(false)

    if (eventIdToSave) {
      setActiveEventId(eventIdToSave)
      setActiveEvent(eventIdToSave)
    } else {
      setActiveEventId('all')
    }
    setActiveCategory('all')
    setActivePermission(formPermission)

    setTimeout(() => {
      setHighlightId(newId)
      setTimeout(() => setHighlightId(null), 2500)
    }, 50)

    resetForm()
  }

  const permissionCount = (key: string) => {
    const scope =
      activeEventId === 'all'
        ? materials
        : activeEventId === 'none'
        ? materials.filter((m) => !m.eventId)
        : materials.filter((m) => m.eventId === activeEventId)
    if (key === 'all') return scope.length
    return scope.filter((m) => m.permission === key).length
  }

  const categoryCount = (key: string) => {
    let base =
      activeEventId === 'all'
        ? materials
        : activeEventId === 'none'
        ? materials.filter((m) => !m.eventId)
        : materials.filter((m) => m.eventId === activeEventId)
    base = key === 'all' ? base : base.filter((m) => m.category === key)
    if (activePermission === 'all') return base.length
    return base.filter((m) => m.permission === activePermission).length
  }

  const eventCount = (id: string) => {
    if (id === 'all') return materials.length
    if (id === 'none') return materials.filter((m) => !m.eventId).length
    return materials.filter((m) => m.eventId === id).length
  }

  const handleClearEventFilter = () => {
    setActiveEventId('all')
  }

  return (
    <View className={styles.pageWrapper}>
      <ScrollView scrollY className={styles.page}>
        <View className={styles.hero}>
          <Text className={styles.heroTitle}>回应材料夹</Text>
          <Text className={styles.heroDesc}>统一管理核实事实、口径说明，标记公开级别</Text>
        </View>

        {activeEventId !== 'all' && (
          <View className={styles.eventFilterBar}>
            <View className={styles.eventFilterInfo}>
              <Text className={styles.eventFilterLabel}>当前事件：</Text>
              <Text className={styles.eventFilterName}>{activeEventTitle}</Text>
            </View>
            <Text className={styles.eventFilterClear} onClick={handleClearEventFilter}>清除筛选</Text>
          </View>
        )}

        <View className={styles.statsRow}>
          <View className={styles.statCard}>
            <Text className={styles.statValue}>{stats.total}</Text>
            <Text className={styles.statName}>{activeEventId === 'all' ? '材料总数' : '本事件材料'}</Text>
          </View>
          <View className={styles.statCard}>
            <Text className={styles.statValue} style={{ color: '#10B981' }}>{stats.public}</Text>
            <Text className={styles.statName}>可公开</Text>
          </View>
          <View className={styles.statCard}>
            <Text className={styles.statValue} style={{ color: '#3B82F6' }}>{stats.internal}</Text>
            <Text className={styles.statName}>仅内部</Text>
          </View>
          <View className={styles.statCard}>
            <Text className={styles.statValue} style={{ color: '#F59E0B' }}>{stats.legal}</Text>
            <Text className={styles.statName}>待法务</Text>
          </View>
        </View>

        <View className={styles.permissionLegend}>
          {permissionConfig.map((p) => {
            const dotClass =
              p.key === 'public'
                ? styles.legendDotPublic
                : p.key === 'internal'
                ? styles.legendDotInternal
                : styles.legendDotLegal
            return (
              <View key={p.key} className={styles.legendItem}>
                <View className={classnames(styles.legendDot, dotClass)} />
                <Text className={styles.legendText}>{p.name}</Text>
              </View>
            )
          })}
          <View className={styles.legendHint}>提示：点击卡片上的级别标签可直接修改公开级别</View>
        </View>

        <View className={styles.filterSectionTitle}>
          <Text className={styles.filterSectionLabel}>按事件</Text>
          <Text className={styles.filterSectionHint}>筛选指定追踪事件的回应材料</Text>
        </View>
        <ScrollView scrollX className={styles.categoryTabs}>
          {eventOptions.map((ev) => (
            <View
              key={'event_' + ev.id}
              className={classnames(styles.categoryTab, activeEventId === ev.id && styles.categoryTabActive)}
              onClick={() => setActiveEventId(ev.id)}
            >
              <Text numberOfLines={1} className={styles.eventTabText}>
                {ev.title.length > 10 ? ev.title.slice(0, 10) + '…' : ev.title}
              </Text>
              <Text className={styles.categoryCount}>{eventCount(ev.id)}</Text>
            </View>
          ))}
          <View
            key={'event_none'}
            className={classnames(styles.categoryTab, activeEventId === 'none' && styles.categoryTabActive)}
            onClick={() => setActiveEventId('none')}
          >
            <Text className={styles.eventTabText}>未关联事件</Text>
            <Text className={styles.categoryCount}>{eventCount('none')}</Text>
          </View>
        </ScrollView>

        <ScrollView scrollX className={styles.categoryTabs}>
          {permissionFilters.map((p) => (
            <View
              key={'perm_' + p.key}
              className={classnames(styles.categoryTab, activePermission === p.key && styles.categoryTabActive)}
              style={
                activePermission === p.key && p.key !== 'all'
                  ? {
                      background: `linear-gradient(135deg, ${p.textColor} 0%, ${p.color} 100%)`
                    }
                  : {}
              }
              onClick={() => setActivePermission(p.key)}
            >
              <Text>{p.name}</Text>
              <Text className={styles.categoryCount}>{permissionCount(p.key)}</Text>
            </View>
          ))}
        </ScrollView>

        <ScrollView scrollX className={styles.categoryTabs}>
          {categories.map((cat) => (
            <View
              key={cat.key}
              className={classnames(styles.categoryTab, activeCategory === cat.key && styles.categoryTabActive)}
              onClick={() => setActiveCategory(cat.key)}
            >
              <Text>{cat.name}</Text>
              <Text className={styles.categoryCount}>
                {categoryCount(cat.key)}
              </Text>
            </View>
          ))}
        </ScrollView>

        <Button className={styles.addBtn} onClick={handleAdd}>
          <View className={styles.addBtnText}>
            <Text className={styles.addIcon}>+</Text>
            <Text>新增回应材料</Text>
          </View>
        </Button>

        <View className={styles.materialList}>
          {filteredMaterials.length > 0 ? (
            filteredMaterials.map((material) => (
              <View
                key={material.id}
                className={classnames(highlightId === material.id && styles.highlightCard)}
              >
                <MaterialCard material={material} />
              </View>
            ))
          ) : (
            <View className={styles.emptyState}>
              <View className={styles.emptyIcon}>
                <Text>📁</Text>
              </View>
              <Text className={styles.emptyTitle}>该筛选条件下暂无材料</Text>
              <Text className={styles.emptyDesc}>点击上方按钮新增回应材料，或切换其他筛选条件</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {showModal && (
        <View className={styles.modalMask} onClick={() => setShowModal(false)}>
          <View className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <View className={styles.modalHeader}>
              <Text className={styles.modalTitle}>新增回应材料</Text>
              <Text className={styles.modalClose} onClick={() => setShowModal(false)}>
                ✕
              </Text>
            </View>

            <ScrollView scrollY className={styles.modalBody}>
              <View className={styles.formItem}>
                <Text className={styles.formLabel}>关联追踪事件</Text>
                <View className={styles.formOptions}>
                  <View
                    className={classnames(
                      styles.formOption,
                      formEventId === 'none' && styles.formOptionActive
                    )}
                    onClick={() => setFormEventId('none')}
                  >
                    <Text>不关联</Text>
                  </View>
                  {events.map((ev) => (
                    <View
                      key={ev.id}
                      className={classnames(
                        styles.formOption,
                        formEventId === ev.id && styles.formOptionActive
                      )}
                      onClick={() => setFormEventId(ev.id)}
                    >
                      <Text numberOfLines={1}>
                        {ev.title.length > 8 ? ev.title.slice(0, 8) + '…' : ev.title}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>

              <View className={styles.formItem}>
                <Text className={styles.formLabel}>分类</Text>
                <View className={styles.formOptions}>
                  {categoryConfig.map((cat) => (
                    <View
                      key={cat.key}
                      className={classnames(
                        styles.formOption,
                        formCategory === cat.key && styles.formOptionActive
                      )}
                      onClick={() => setFormCategory(cat.key as MaterialCategory)}
                    >
                      <View
                        className={styles.formOptionDot}
                        style={{ backgroundColor: cat.color }}
                      />
                      <Text>{cat.name}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View className={styles.formItem}>
                <Text className={styles.formLabel}>标题</Text>
                <View className={styles.formInputWrap}>
                  <Input
                    className={styles.formInput}
                    placeholder="如：客服统一回复话术"
                    placeholderClass="placeholder"
                    value={formTitle}
                    onInput={(e) => setFormTitle(e.detail.value)}
                  />
                </View>
              </View>

              <View className={styles.formItem}>
                <Text className={styles.formLabel}>内容</Text>
                <View className={styles.formTextareaWrap}>
                  <Textarea
                    className={styles.formTextarea}
                    placeholder="输入详细内容..."
                    placeholderClass="placeholder"
                    value={formContent}
                    onInput={(e) => setFormContent(e.detail.value)}
                  />
                </View>
              </View>

              <View className={styles.formItem}>
                <Text className={styles.formLabel}>公开级别</Text>
                <View className={styles.formOptions}>
                  {permissionConfig.map((p) => (
                    <View
                      key={p.key}
                      className={classnames(
                        styles.formOption,
                        formPermission === p.key && styles.formOptionActive
                      )}
                      style={
                        formPermission === p.key
                          ? { backgroundColor: p.bgColor, borderColor: p.textColor, color: p.textColor }
                          : {}
                      }
                      onClick={() => setFormPermission(p.key as MaterialPermission)}
                    >
                      <Text>{p.name}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </ScrollView>

            <View className={styles.modalFooter}>
              <Button className={styles.cancelBtn} onClick={() => setShowModal(false)}>
                取消
              </Button>
              <Button className={styles.confirmBtn} onClick={handleSubmit}>
                保存
              </Button>
            </View>
          </View>
        </View>
      )}
    </View>
  )
}

export default MaterialsPage
