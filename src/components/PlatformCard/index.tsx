import React, { useState } from 'react'
import { View, Text } from '@tarojs/components'
import styles from './index.module.scss'
import type { SpreadPlatform } from '@/types'

interface PlatformCardProps {
  platform: SpreadPlatform
}

const iconMap: Record<string, string> = {
  video: '▶',
  weibo: '微',
  forum: '论',
  news: '新'
}

const typeBgMap: Record<string, string> = {
  shortvideo: 'linear-gradient(135deg, #F43F5E 0%, #EC4899 100%)',
  weibo: 'linear-gradient(135deg, #F97316 0%, #EF4444 100%)',
  forum: 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)',
  news: 'linear-gradient(135deg, #0EA5E9 0%, #3B82F6 100%)'
}

const PlatformCard: React.FC<PlatformCardProps> = ({ platform }) => {
  const [expanded, setExpanded] = useState(false)

  const getSentimentLabel = (score: number) => {
    if (score < 40) return { text: '偏负面', color: '#EF4444' }
    if (score < 60) return { text: '中性', color: '#F59E0B' }
    return { text: '偏正面', color: '#10B981' }
  }

  const sentiment = getSentimentLabel(platform.sentimentScore)

  return (
    <View className={styles.card}>
      <View className={styles.header} onClick={() => setExpanded(!expanded)}>
        <View className={styles.left}>
          <View className={styles.icon} style={{ background: typeBgMap[platform.type] }}>
            <Text className={styles.iconText}>{iconMap[platform.icon] || '●'}</Text>
          </View>
          <View className={styles.info}>
            <Text className={styles.name}>{platform.name}</Text>
            <View className={styles.stats}>
              <Text className={styles.stat}>{platform.entryCount} 个入口</Text>
              <Text className={styles.dot}>·</Text>
              <Text className={styles.stat}>{platform.trendingCount} 条在热</Text>
            </View>
          </View>
        </View>
        <View className={styles.right}>
          <View className={styles.sentiment} style={{ color: sentiment.color }}>
            <Text>{sentiment.text}</Text>
          </View>
          <Text className={styles.arrow}>{expanded ? '▲' : '▼'}</Text>
        </View>
      </View>

      {expanded && (
        <View className={styles.expanded}>
          <View className={styles.drivingSection}>
            <Text className={styles.drivingTitle}>情绪推手</Text>
            <View className={styles.drivingTags}>
              {platform.drivingUsers.map((user, idx) => (
                <View key={idx} className={styles.drivingTag}>
                  <Text>{user}</Text>
                </View>
              ))}
            </View>
          </View>
          <View className={styles.entries}>
            {platform.entries.map((entry) => (
              <View key={entry.id} className={styles.entry}>
                <View className={styles.entryHeader}>
                  <Text className={styles.entryTitle}>{entry.title}</Text>
                  <View
                    className={`${styles.trend} ${
                      entry.trend === 'rising'
                        ? styles.trendRising
                        : entry.trend === 'falling'
                        ? styles.trendFalling
                        : styles.trendStable
                    }`}
                  >
                    <Text>
                      {entry.trend === 'rising' ? '↑' : entry.trend === 'falling' ? '↓' : '→'}
                    </Text>
                  </View>
                </View>
                <View className={styles.entryMeta}>
                  <Text className={styles.entryAuthor}>{entry.author}</Text>
                  <Text className={styles.entryTime}>{entry.publishTime}</Text>
                  <Text className={styles.entryEngagement}>互动 {entry.engagement.toLocaleString()}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  )
}

export default PlatformCard
