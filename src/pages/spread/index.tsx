import React, { useState } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import styles from './index.module.scss'
import SectionHeader from '@/components/SectionHeader'
import PlatformCard from '@/components/PlatformCard'
import { mockSpreadPlatforms } from '@/data/spread'
import type { SpreadPlatform } from '@/types'

const filters = [
  { key: 'all', name: '全部平台' },
  { key: 'shortvideo', name: '短视频' },
  { key: 'weibo', name: '微博' },
  { key: 'forum', name: '论坛社区' },
  { key: 'news', name: '新闻客户端' }
]

const SpreadPage: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState('all')

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

  const filteredPlatforms: SpreadPlatform[] =
    activeFilter === 'all'
      ? mockSpreadPlatforms
      : mockSpreadPlatforms.filter((p) => p.type === activeFilter)

  const totalEntries = mockSpreadPlatforms.reduce((sum, p) => sum + p.entryCount, 0)
  const totalTrending = mockSpreadPlatforms.reduce((sum, p) => sum + p.trendingCount, 0)
  const avgSentiment = Math.round(
    mockSpreadPlatforms.reduce((sum, p) => sum + p.sentimentScore, 0) / mockSpreadPlatforms.length
  )

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.hero}>
        <Text className={styles.heroTitle}>扩散态势总览</Text>
        <Text className={styles.heroDesc}>按平台分组查看传播入口和情绪推手</Text>
      </View>

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
            <Text className={styles.statNum}>{avgSentiment}</Text>
            <Text className={styles.statLabel}>情绪指数</Text>
          </View>
          <View className={styles.overviewStat}>
            <Text className={styles.statNum}>{mockSpreadPlatforms.length}</Text>
            <Text className={styles.statLabel}>涉及平台</Text>
          </View>
        </View>
      </View>

      <View className={styles.tipCard}>
        <Text className={styles.tipText}>
          ⚠️ 检测到 <Text className={styles.tipHighlight}>短视频平台</Text> 情绪指数偏低（32分），
          主要由 <Text className={styles.tipHighlight}>维权博主</Text> 和{' '}
          <Text className={styles.tipHighlight}>本地生活号</Text> 推动情绪升级，建议重点关注。
        </Text>
      </View>

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
          <Text className={styles.emptyTitle}>暂无相关平台数据</Text>
          <Text className={styles.emptyDesc}>切换其他筛选条件查看更多内容</Text>
        </View>
      )}
    </ScrollView>
  )
}

export default SpreadPage
