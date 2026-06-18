import React, { useState, useMemo } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import classnames from 'classnames'
import styles from './index.module.scss'
import SectionHeader from '@/components/SectionHeader'
import PlatformCard from '@/components/PlatformCard'
import { useEventsStore } from '@/store/events'
import type { SpreadPlatform, EventItem } from '@/types'

const filters = [
  { key: 'all', name: '全部平台' },
  { key: 'shortvideo', name: '短视频' },
  { key: 'weibo', name: '微博' },
  { key: 'forum', name: '论坛社区' },
  { key: 'news', name: '新闻客户端' }
]

const SpreadPage: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState('all')

  const initEvents = useEventsStore((s) => s.initEvents)
  const events = useEventsStore((s) => s.events)
  const activeEventId = useEventsStore((s) => s.activeEventId)
  const setActiveEvent = useEventsStore((s) => s.setActiveEvent)
  const getSpread = useEventsStore((s) => s.getSpread)

  useDidShow(() => {
    initEvents()
  })

  React.useEffect(() => {
    initEvents()
  }, [initEvents])

  const activeEvent: EventItem | undefined = useMemo(() => {
    if (activeEventId) {
      const found = events.find((e) => e.id === activeEventId)
      if (found) return found
    }
    return events[0]
  }, [activeEventId, events])

  const spreadPlatforms: SpreadPlatform[] = useMemo(() => {
    if (!activeEvent) return []
    return getSpread(activeEvent.id)
  }, [activeEvent, getSpread])

  const filteredPlatforms: SpreadPlatform[] = useMemo(() => {
    return activeFilter === 'all'
      ? spreadPlatforms
      : spreadPlatforms.filter((p) => p.type === activeFilter)
  }, [activeFilter, spreadPlatforms])

  const totalEntries = spreadPlatforms.reduce((sum, p) => sum + p.entryCount, 0)
  const totalTrending = spreadPlatforms.reduce((sum, p) => sum + p.trendingCount, 0)
  const avgSentiment =
    spreadPlatforms.length > 0
      ? Math.round(
          spreadPlatforms.reduce((sum, p) => sum + p.sentimentScore, 0) / spreadPlatforms.length
        )
      : 0

  const worstPlatform = useMemo(() => {
    if (spreadPlatforms.length === 0) return null
    return spreadPlatforms.reduce((prev, cur) =>
      cur.sentimentScore < prev.sentimentScore ? cur : prev
    )
  }, [spreadPlatforms])

  const handleRefresh = () => {
    console.log('[SpreadPage] pull down refresh')
    setTimeout(() => {
      Taro.stopPullDownRefresh()
    }, 1000)
  }

  React.useEffect(() => {
    Taro.onPullDownRefresh(handleRefresh)
    return () => {
      Taro.offPullDownRefresh(handleRefresh)
    }
  }, [])

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.hero}>
        <Text className={styles.heroTitle}>扩散态势总览</Text>
        <Text className={styles.heroDesc}>按平台分组查看传播入口和情绪推手</Text>
      </View>

      <View className={styles.eventSelector}>
        <View className={styles.eventSelectorLabel}>
          <Text className={styles.eventSelectorLabelText}>当前追踪事件</Text>
          {events.length > 1 && (
            <Text className={styles.eventCount}>{events.length} 条可切换</Text>
          )}
        </View>
        {events.length === 0 ? (
          <View className={styles.eventEmpty}>
            <Text className={styles.eventEmptyText}>暂无追踪事件，请到新增事件页录入</Text>
          </View>
        ) : (
          <ScrollView scrollX className={styles.eventTabs}>
            {events.map((ev) => {
              const isActive = activeEvent?.id === ev.id
              const riskCls =
                ev.riskLevel === 'high'
                  ? styles.eventRiskHigh
                  : ev.riskLevel === 'medium'
                  ? styles.eventRiskMedium
                  : styles.eventRiskLow
              return (
                <View
                  key={ev.id}
                  className={classnames(styles.eventTab, isActive && styles.eventTabActive)}
                  onClick={() => setActiveEvent(ev.id)}
                >
                  <View className={classnames(styles.eventRiskDot, riskCls)} />
                  <View className={styles.eventTabInfo}>
                    <Text className={styles.eventTabTitle}>
                      {ev.title.length > 12 ? ev.title.slice(0, 12) + '…' : ev.title}
                    </Text>
                    <Text className={styles.eventTabSub}>
                      {ev.brandLine} · {ev.region}
                    </Text>
                  </View>
                  {isActive && <View className={styles.eventTabCheck}>✓</View>}
                </View>
              )
            })}
          </ScrollView>
        )}
      </View>

      {activeEvent && (
        <View className={styles.eventBrief}>
          <View className={styles.eventBriefMain}>
            <Text className={styles.eventBriefTitle}>{activeEvent.title}</Text>
            <View className={styles.eventBriefMeta}>
              <Text className={styles.eventBriefTag}>话题：{activeEvent.keyword}</Text>
            </View>
          </View>
          <View className={styles.eventBriefTime}>
            <Text className={styles.eventBriefTimeText}>录入 {activeEvent.createdAt}</Text>
          </View>
        </View>
      )}

      <View className={styles.overviewCard}>
        <Text className={styles.overviewTitle}>24小时内传播入口总数</Text>
        <Text className={styles.overviewValue}>{totalEntries}</Text>
        <View className={styles.overviewTrend}>
          <Text>较昨日 </Text>
          <Text className={styles.trendUp}>↑ 42%</Text>
        </View>
        <View className={styles.overviewStats}>
          <View className={styles.overviewStat}>
            <Text className={styles.statNum}>{totalTrending}</Text>
            <Text className={styles.statLabel}>热门内容</Text>
          </View>
          <View className={styles.overviewStat}>
            <Text
              className={classnames(
                styles.statNum,
                avgSentiment < 35 && styles.statDanger,
                avgSentiment >= 35 && avgSentiment < 55 && styles.statWarning
              )}
            >
              {avgSentiment}
            </Text>
            <Text className={styles.statLabel}>情绪指数</Text>
          </View>
          <View className={styles.overviewStat}>
            <Text className={styles.statNum}>{spreadPlatforms.length}</Text>
            <Text className={styles.statLabel}>涉及平台</Text>
          </View>
        </View>
      </View>

      {worstPlatform && worstPlatform.sentimentScore < 50 && (
        <View className={styles.tipCard}>
          <Text className={styles.tipText}>
            ⚠️ 检测到 <Text className={styles.tipHighlight}>{worstPlatform.name}</Text> 情绪指数偏低（{worstPlatform.sentimentScore}分），
            主要由{' '}
            {worstPlatform.drivingUsers.slice(0, 2).map((u, i) => (
              <Text key={i} className={styles.tipHighlight}>
                {u}
                {i < Math.min(worstPlatform.drivingUsers.length, 2) - 1 ? '、' : ''}
              </Text>
            ))}
            推动情绪升级，建议重点关注。
          </Text>
        </View>
      )}

      <ScrollView scrollX className={styles.filterRow}>
        {filters.map((filter) => (
          <View
            key={filter.key}
            className={classnames(styles.filterItem, activeFilter === filter.key && styles.filterActive)}
            onClick={() => setActiveFilter(filter.key)}
          >
            <Text>{filter.name}</Text>
          </View>
        ))}
      </ScrollView>

      <SectionHeader title="传播入口分布" desc={`${filteredPlatforms.length} 个平台`} />

      {filteredPlatforms.length > 0 ? (
        filteredPlatforms.map((platform) => <PlatformCard key={platform.type} platform={platform} />)
      ) : (
        <View className={styles.emptyState}>
          <View className={styles.emptyIcon}>
            <Text>📊</Text>
          </View>
          <Text className={styles.emptyTitle}>
            {activeEvent ? '该事件暂无相关平台数据' : '暂无追踪事件'}
          </Text>
          <Text className={styles.emptyDesc}>
            {activeEvent ? '切换其他筛选条件查看更多内容' : '先到新增事件页录入一条追踪事件'}
          </Text>
        </View>
      )}
    </ScrollView>
  )
}

export default SpreadPage
