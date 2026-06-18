import React, { useState, useMemo } from 'react'
import { View, Text, ScrollView, Image } from '@tarojs/components'
import Taro, { useDidShow, useRouter } from '@tarojs/taro'
import classnames from 'classnames'
import styles from './index.module.scss'
import SectionHeader from '@/components/SectionHeader'
import { useEventsStore } from '@/store/events'
import type { EventAnalysisResult, EventItem } from '@/types'

const EventDetailPage: React.FC = () => {
  const router = useRouter()
  const initEvents = useEventsStore((s) => s.initEvents)
  const getAnalysis = useEventsStore((s) => s.getAnalysis)
  const events = useEventsStore((s) => s.events)

  const [pageReady, setPageReady] = useState(false)

  useDidShow(() => {
    initEvents()
    setPageReady(true)
  })

  React.useEffect(() => {
    initEvents()
    setPageReady(true)
  }, [initEvents])

  const id = router.params?.id || events[0]?.id

  const event: EventItem | undefined = useMemo(() => {
    if (!id) return undefined
    return events.find((e) => e.id === id)
  }, [id, events])

  const analysis: EventAnalysisResult | null = useMemo(() => {
    if (!id) return null
    return getAnalysis(id)
  }, [id, getAnalysis])

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
            <Text className={styles.icon}>�</Text>
          </View>
          <Text className={styles.title}>事件不存在或已归档</Text>
          <Text className={styles.desc}>请返回新增事件页选择其他追踪事件</Text>
        </View>
      </ScrollView>
    )
  }

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
    </ScrollView>
  )
}

export default EventDetailPage
