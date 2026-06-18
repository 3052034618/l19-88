import React from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import styles from './index.module.scss'
import StatusTag from '../StatusTag'
import type { EventItem } from '@/types'

interface EventCardProps {
  event: EventItem
  onClick?: () => void
}

const riskTextMap = {
  high: '高风险',
  medium: '中风险',
  low: '低风险'
}

const statusTextMap = {
  analyzing: '分析中',
  pending: '待处理',
  tracked: '已追踪'
}

const EventCard: React.FC<EventCardProps> = ({ event, onClick }) => {
  const handleClick = () => {
    if (onClick) {
      onClick()
    } else {
      Taro.navigateTo({
        url: `/pages/event-detail/index?id=${event.id}`
      })
    }
  }

  return (
    <View className={styles.card} onClick={handleClick}>
      <View className={styles.header}>
        <Text className={styles.title}>{event.title}</Text>
        <StatusTag type={event.riskLevel} text={riskTextMap[event.riskLevel]} size="sm" />
      </View>
      <View className={styles.meta}>
        <Text className={styles.keyword}>#{event.keyword}</Text>
      </View>
      <View className={styles.infoRow}>
        <View className={styles.infoItem}>
          <Text className={styles.infoLabel}>品牌线</Text>
          <Text className={styles.infoValue}>{event.brandLine}</Text>
        </View>
        <View className={styles.infoItem}>
          <Text className={styles.infoLabel}>区域</Text>
          <Text className={styles.infoValue}>{event.region}</Text>
        </View>
      </View>
      <View className={styles.footer}>
        <View className={styles.footerLeft}>
          <StatusTag type={event.status} text={statusTextMap[event.status]} size="sm" />
          {event.sourceCount && (
            <Text className={styles.sourceCount}>
              {event.sourceCount} 条相关讨论
            </Text>
          )}
        </View>
        <Text className={styles.time}>{event.createdAt}</Text>
      </View>
    </View>
  )
}

export default EventCard
