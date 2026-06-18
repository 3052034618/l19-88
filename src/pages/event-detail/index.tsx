import React from 'react'
import { View, Text } from '@tarojs/components'
import styles from './index.module.scss'

const EventDetailPage: React.FC = () => {
  return (
    <View className={styles.page}>
      <View className={styles.iconWrapper}>
        <Text className={styles.icon}>📋</Text>
      </View>
      <Text className={styles.title}>事件详情</Text>
      <Text className={styles.desc}>功能正在开发中...</Text>
    </View>
  )
}

export default EventDetailPage
