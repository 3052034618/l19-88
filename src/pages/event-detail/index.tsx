import React, { useState, useMemo } from 'react'
import { View, Text, ScrollView, Image, Textarea, Button } from '@tarojs/components'
import Taro, { useDidShow, useRouter } from '@tarojs/taro'
import classnames from 'classnames'
import styles from './index.module.scss'
import SectionHeader from '@/components/SectionHeader'
import MaterialCard from '@/components/MaterialCard'
import { useEventsStore } from '@/store/events'
import { useMaterialsStore } from '@/store/materials'
import { permissionConfig, categoryConfig } from '@/data/materials'
import type { EventAnalysisResult, EventItem, EventProgressStatus, ProgressLogEntry, MaterialItem } from '@/types'

const progressStatusConfig: { key: EventProgressStatus; name: string; color: string; bg: string }[] = [
  { key: 'pending_review', name: '待研判', color: '#6366F1', bg: 'rgba(99, 102, 241, 0.12)' },
  { key: 'handling', name: '处理中', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.12)' },
  { key: 'responded', name: '已回应', color: '#10B981', bg: 'rgba(16, 185, 129, 0.12)' },
  { key: 'reviewed', name: '已复盘', color: '#94A3B8', bg: 'rgba(148, 163, 184, 0.12)' }
]

const statusNameMap = progressStatusConfig.reduce<Record<string, { name: string; color: string; bg: string }>>((acc, cur) => {
  acc[cur.key] = { name: cur.name, color: cur.color, bg: cur.bg }
  return acc
}, {})

const EventDetailPage: React.FC = () => {
  const router = useRouter()
  const initEvents = useEventsStore((s) => s.initEvents)
  const getAnalysis = useEventsStore((s) => s.getAnalysis)
  const events = useEventsStore((s) => s.events)
  const getProgressLogs = useEventsStore((s) => s.getProgressLogs)
  const addProgressEntry = useEventsStore((s) => s.addProgressEntry)
  const setActiveEvent = useEventsStore((s) => s.setActiveEvent)

  const initMaterials = useMaterialsStore((s) => s.initMaterials)
  const materials = useMaterialsStore((s) => s.materials)

  const [pageReady, setPageReady] = useState(false)
  const [showProgressModal, setShowProgressModal] = useState(false)
  const [progressStatus, setProgressStatus] = useState<EventProgressStatus>('handling')
  const [progressNote, setProgressNote] = useState('')

  useDidShow(() => {
    initEvents()
    initMaterials()
    setPageReady(true)
  })

  React.useEffect(() => {
    initEvents()
    initMaterials()
    setPageReady(true)
  }, [initEvents, initMaterials])

  const id = router.params?.id || events[0]?.id

  const event: EventItem | undefined = useMemo(() => {
    if (!id) return undefined
    return events.find((e) => e.id === id)
  }, [id, events])

  const analysis: EventAnalysisResult | null = useMemo(() => {
    if (!id) return null
    return getAnalysis(id)
  }, [id, getAnalysis])

  const progressLogs: ProgressLogEntry[] = useMemo(() => {
    if (!id) return []
    return getProgressLogs(id)
  }, [id, getProgressLogs])

  const eventMaterials: MaterialItem[] = useMemo(() => {
    if (!id) return []
    return materials.filter((m) => m.eventId === id)
  }, [id, materials])

  const formatNumber = (num: number) => {
    if (num >= 10000) {
      return (num / 10000).toFixed(1) + '万'
    }
    return num.toLocaleString()
  }

  const riskMap = {
    low: { text: '低风险', cls: styles.riskLow },
    medium: { text: '中风险', cls: styles.riskMedium },
    high: { text: '高风险', cls: styles.riskHigh }
  }

  const handleAddProgress = () => {
    setProgressStatus(event?.progressStatus ?? 'handling')
    setProgressNote('')
    setShowProgressModal(true)
  }

  const handleProgressSubmit = () => {
    if (!id) return
    addProgressEntry(id, progressStatus, progressNote)
    setShowProgressModal(false)
    Taro.showToast({ title: '进展已记录', icon: 'success' })
  }

  const jumpToMaterials = (perm: 'all' | 'public' | 'internal' | 'legal' = 'all') => {
    if (id) setActiveEvent(id)
    const params = new URLSearchParams()
    if (id) params.set('eventId', id)
    if (perm !== 'all') params.set('permission', perm)
    Taro.switchTab({
      url: '/pages/materials/index',
      success: () => {
        const fullUrl = `/pages/materials/index${params.toString() ? '?' + params.toString() : ''}`
        console.log('[EventDetail] redirect with params:', fullUrl)
        Taro.eventCenter.trigger('materials:applyParams', { eventId: id, permission: perm })
      },
      fail: (err) => {
        console.warn('[EventDetail] switchTab fail:', err)
        Taro.eventCenter.trigger('materials:applyParams', { eventId: id, permission: perm })
      }
    })
  }

  const handleAddMaterialHere = () => {
    if (id) setActiveEvent(id)
    Taro.switchTab({
      url: '/pages/materials/index',
      success: () => {
        Taro.eventCenter.trigger('materials:openAdd', { eventId: id })
      },
      fail: () => {
        Taro.eventCenter.trigger('materials:openAdd', { eventId: id })
      }
    })
  }

  if (!pageReady) {
    return (
      <ScrollView scrollY className={styles.page}>
        <View className={styles.loadingWrap}>
          <Text>加载中...</Text>
        </View>
      </ScrollView>
    )
  }

  if (!event || !analysis) {
    return (
      <ScrollView scrollY className={styles.page}>
        <View className={styles.emptyWrap}>
          <View className={styles.iconWrapper}>
            <Text className={styles.icon}>😶</Text>
          </View>
          <Text className={styles.title}>事件不存在或已归档</Text>
          <Text className={styles.desc}>请返回新增事件页选择其他追踪事件</Text>
        </View>
      </ScrollView>
    )
  }

  const currentProgressName = statusNameMap[event.progressStatus]
  const factList = eventMaterials.filter((m) => m.category === 'fact')
  const serviceList = eventMaterials.filter((m) => m.category === 'service')
  const storeList = eventMaterials.filter((m) => m.category === 'store')
  const pendingList = eventMaterials.filter((m) => m.category === 'pending')
  const publicCount = eventMaterials.filter((m) => m.permission === 'public').length

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.backBtn} onClick={() => Taro.navigateBack({ delta: 1 })}>←</Text>
        <View className={styles.headerContent}>
          <Text className={styles.eventTitle}>{event.title}</Text>
          <View className={styles.metaRow}>
            <View className={classnames(styles.riskTag, riskMap[event.riskLevel].cls)}>
              <Text>{riskMap[event.riskLevel].text}</Text>
            </View>
            <Text className={styles.metaText}>{event.brandLine} · {event.region}</Text>
          </View>
          <View className={styles.metaRow2}>
            <Text className={styles.metaSub}>话题词：{event.keyword}</Text>
            <Text className={styles.metaSub}>录入：{event.createdAt}</Text>
          </View>
        </View>
      </View>

      <View className={styles.progressSection}>
        <View className={styles.progressRow}>
          <Text className={styles.progressLabel}>当前状态：</Text>
          <View
            className={styles.progressBadge}
            style={{ backgroundColor: currentProgressName.bg, color: currentProgressName.color }}
          >
            <Text>{currentProgressName.name}</Text>
          </View>
          <View className={styles.progressSpacer} />
          <View className={styles.progressBtn} onClick={handleAddProgress}>
            <Text className={styles.progressBtnText}>+ 记录进展</Text>
          </View>
        </View>

        {progressLogs.length > 0 && (
          <View className={styles.timeline}>
            {progressLogs.map((log, idx) => {
              const cfg = statusNameMap[log.status]
              return (
                <View key={log.id} className={styles.timelineItem}>
                  <View className={styles.timelineLeft}>
                    <View className={styles.timelineDot} style={{ backgroundColor: cfg.color }} />
                    {idx < progressLogs.length - 1 && <View className={styles.timelineLine} />}
                  </View>
                  <View className={styles.timelineRight}>
                    <View className={styles.timelineHead}>
                      <View className={styles.timelineBadge} style={{ backgroundColor: cfg.bg, color: cfg.color }}>
                        <Text>{cfg.name}</Text>
                      </View>
                      <Text className={styles.timelineTime}>{log.createdAt}</Text>
                    </View>
                    <Text className={styles.timelineNote}>{log.note}</Text>
                    <Text className={styles.timelineAuthor}>— {log.author}</Text>
                  </View>
                </View>
              )
            })}
          </View>
        )}
      </View>

      <View className={styles.peakCard}>
        <View className={styles.peakLeft}>
          <Text className={styles.peakNum}>{analysis.peakWarning.currentVolume.toLocaleString()}</Text>
          <Text className={styles.peakLabel}>当前讨论量</Text>
        </View>
        <View className={styles.peakDivider} />
        <View className={styles.peakRight}>
          <View className={styles.peakRow}>
            <Text className={styles.peakRowLabel}>预计高峰</Text>
            <Text className={styles.peakRowValue}>{analysis.peakWarning.estimatedPeakTime}</Text>
          </View>
          <View className={styles.peakRow}>
            <Text className={styles.peakRowLabel}>热度趋势</Text>
            <Text className={classnames(styles.peakRowValue, styles.trendText)}>{analysis.peakWarning.trend}</Text>
          </View>
        </View>
      </View>

      <View className={styles.materialSection}>
        <SectionHeader
          title={`该事件回应材料 (${eventMaterials.length})`}
          desc="已关联的事实/口径/法务内容"
        />
        <View className={styles.materialQuickRow}>
          <View className={styles.materialQuickBtn} onClick={() => jumpToMaterials('public')}>
            <Text className={styles.materialQuickIcon}>📣</Text>
            <Text className={styles.materialQuickText}>可公开口径</Text>
            <Text className={styles.materialQuickCount}>{publicCount} 条</Text>
          </View>
          <View className={styles.materialQuickBtn} onClick={() => jumpToMaterials('all')}>
            <Text className={styles.materialQuickIcon}>📚</Text>
            <Text className={styles.materialQuickText}>全部材料</Text>
            <Text className={styles.materialQuickCount}>{eventMaterials.length} 条</Text>
          </View>
          <View className={styles.materialQuickBtn} onClick={handleAddMaterialHere}>
            <Text className={styles.materialQuickIcon}>➕</Text>
            <Text className={styles.materialQuickText}>新增材料</Text>
            <Text className={styles.materialQuickCount}>关联本事件</Text>
          </View>
        </View>

        {eventMaterials.length > 0 ? (
          <View className={styles.eventMaterialsList}>
            {factList.length > 0 && (
              <>
                <Text className={styles.groupTitle}>
                  已核实事实 <Text className={styles.groupCount}>({factList.length})</Text>
                </Text>
                {factList.map((m) => (
                  <MaterialCard key={m.id} material={m} />
                ))}
              </>
            )}
            {serviceList.length > 0 && (
              <>
                <Text className={styles.groupTitle}>
                  客服口径 <Text className={styles.groupCount}>({serviceList.length})</Text>
                </Text>
                {serviceList.map((m) => (
                  <MaterialCard key={m.id} material={m} />
                ))}
              </>
            )}
            {storeList.length > 0 && (
              <>
                <Text className={styles.groupTitle}>
                  门店说明 <Text className={styles.groupCount}>({storeList.length})</Text>
                </Text>
                {storeList.map((m) => (
                  <MaterialCard key={m.id} material={m} />
                ))}
              </>
            )}
            {pendingList.length > 0 && (
              <>
                <Text className={styles.groupTitle}>
                  待确认问题 <Text className={styles.groupCount}>({pendingList.length})</Text>
                </Text>
                {pendingList.map((m) => (
                  <MaterialCard key={m.id} material={m} />
                ))}
              </>
            )}
          </View>
        ) : (
          <View className={styles.materialEmpty}>
            <Text className={styles.materialEmptyText}>尚未给该事件关联材料，点击"新增材料"快速录入</Text>
          </View>
        )}
      </View>

      <SectionHeader title="疑似首发内容" desc={`共 ${analysis.firstSources.length} 条疑似来源`} />
      {analysis.firstSources.map((source, idx) => (
        <View key={idx} className={styles.sourceCard}>
          {source.isFirstSource && (
            <View className={styles.firstBadge}>
              <Text>疑似首发</Text>
            </View>
          )}
          <View className={styles.sourceHead}>
            <Text className={styles.sourcePlatform}>{source.platform}</Text>
            <Text className={styles.sourceTime}>{source.publishTime}</Text>
          </View>
          <Text className={styles.sourceTitle}>{source.title}</Text>
          <Text className={styles.sourceAuthor}>@ {source.author}</Text>
          <View className={styles.sourceStats}>
            <View className={styles.sourceStat}>
              <Text className={styles.sourceStatLabel}>浏览</Text>
              <Text className={styles.sourceStatValue}>{formatNumber(source.viewCount)}</Text>
            </View>
            <View className={styles.sourceStat}>
              <Text className={styles.sourceStatLabel}>点赞</Text>
              <Text className={styles.sourceStatValue}>{formatNumber(source.likeCount)}</Text>
            </View>
            <View className={styles.sourceStat}>
              <Text className={styles.sourceStatLabel}>转发</Text>
              <Text className={styles.sourceStatValue}>{formatNumber(source.shareCount)}</Text>
            </View>
          </View>
        </View>
      ))}

      <SectionHeader title="关键转发账号" desc="按影响力排序，高影响账号需重点关注" />
      {analysis.keyAccounts.map((account, idx) => (
        <View key={idx} className={styles.accountCard}>
          <View className={styles.accountRank}>
            <Text>#{idx + 1}</Text>
          </View>
          <View className={styles.accountAvatar}>
            <Image className={styles.avatarImg} src={account.avatar} mode="aspectFill" />
          </View>
          <View className={styles.accountInfo}>
            <View className={styles.accountNameRow}>
              <Text className={styles.accountName}>{account.name}</Text>
              <View
                className={classnames(
                  styles.influenceBadge,
                  account.influence === 'high' && styles.influenceHigh,
                  account.influence === 'medium' && styles.influenceMedium,
                  account.influence === 'low' && styles.influenceLow
                )}
              >
                <Text>
                  {account.influence === 'high' ? '高影响' : account.influence === 'medium' ? '中影响' : '低影响'}
                </Text>
              </View>
            </View>
            <View className={styles.accountMeta}>
              <Text className={styles.accountPlatform}>{account.platform}</Text>
              <Text className={styles.accountDot}>·</Text>
              <Text className={styles.accountFollowers}>粉丝 {account.followers}</Text>
            </View>
            <View className={styles.sentimentRow}>
              <Text className={styles.sentimentLabel}>情绪倾向：</Text>
              <View
                className={classnames(
                  styles.sentimentDot,
                  account.sentiment === 'negative' && styles.sentimentNeg,
                  account.sentiment === 'neutral' && styles.sentimentNeu,
                  account.sentiment === 'positive' && styles.sentimentPos
                )}
              />
              <Text
                className={classnames(
                  styles.sentimentText,
                  account.sentiment === 'negative' && styles.sentimentNegText,
                  account.sentiment === 'neutral' && styles.sentimentNeuText,
                  account.sentiment === 'positive' && styles.sentimentPosText
                )}
              >
                {account.sentiment === 'negative' ? '负面推动' : account.sentiment === 'neutral' ? '中性转述' : '正向发声'}
              </Text>
            </View>
          </View>
        </View>
      ))}

      {showProgressModal && (
        <View className={styles.modalMask} onClick={() => setShowProgressModal(false)}>
          <View className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <View className={styles.modalHeader}>
              <Text className={styles.modalTitle}>记录处理进展</Text>
              <Text className={styles.modalClose} onClick={() => setShowProgressModal(false)}>✕</Text>
            </View>
            <View className={styles.modalBody}>
              <View className={styles.formItem}>
                <Text className={styles.formLabel}>最新状态</Text>
                <View className={styles.formOptions}>
                  {progressStatusConfig.map((cfg) => (
                    <View
                      key={cfg.key}
                      className={classnames(
                        styles.formOption,
                        progressStatus === cfg.key && styles.formOptionActive
                      )}
                      style={
                        progressStatus === cfg.key
                          ? { backgroundColor: cfg.bg, borderColor: cfg.color, color: cfg.color }
                          : {}
                      }
                      onClick={() => setProgressStatus(cfg.key)}
                    >
                      <Text>{cfg.name}</Text>
                    </View>
                  ))}
                </View>
              </View>
              <View className={styles.formItem}>
                <Text className={styles.formLabel}>简短说明</Text>
                <View className={styles.formTextareaWrap}>
                  <Textarea
                    className={styles.formTextarea}
                    placeholder="记录本次更新的具体动作，例如：已与法务确认声明草稿..."
                    placeholderClass="placeholder"
                    value={progressNote}
                    onInput={(e) => setProgressNote(e.detail.value)}
                    maxlength={200}
                  />
                </View>
              </View>
            </View>
            <View className={styles.modalFooter}>
              <Button className={styles.cancelBtn} onClick={() => setShowProgressModal(false)}>取消</Button>
              <Button className={styles.confirmBtn} onClick={handleProgressSubmit}>保存进展</Button>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  )
}

export default EventDetailPage
