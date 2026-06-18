import React from 'react'
import { View, Text } from '@tarojs/components'
import styles from './index.module.scss'
import StatusTag from '../StatusTag'
import type { MaterialItem, MaterialPermission } from '@/types'
import { permissionConfig } from '@/data/materials'

interface MaterialCardProps {
  material: MaterialItem
}

const permissionTextMap: Record<MaterialPermission, string> = {
  public: '可公开',
  internal: '仅内部',
  legal: '需法务确认'
}

const MaterialCard: React.FC<MaterialCardProps> = ({ material }) => {
  return (
    <View className={styles.card}>
      <View className={styles.header}>
        <View className={styles.categoryBadge}>
          <Text>{material.categoryName}</Text>
        </View>
        <StatusTag
          type={material.permission}
          text={permissionTextMap[material.permission]}
          size="sm"
        />
      </View>
      <Text className={styles.title}>{material.title}</Text>
      <Text className={styles.content}>{material.content}</Text>
      <View className={styles.footer}>
        <View className={styles.meta}>
          <Text className={styles.author}>{material.author}</Text>
          <Text className={styles.dot}>·</Text>
          <Text className={styles.version}>v{material.version}</Text>
        </View>
        <Text className={styles.time}>{material.updatedAt}</Text>
      </View>
    </View>
  )
}

export default MaterialCard
