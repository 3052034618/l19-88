import React from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import styles from './index.module.scss'
import type { MaterialItem, MaterialPermission } from '@/types'
import { permissionConfig } from '@/data/materials'
import { useMaterialsStore } from '@/store/materials'

interface MaterialCardProps {
  material: MaterialItem
}

const permissionOrder: MaterialPermission[] = ['public', 'internal', 'legal']
const permissionTextMap: Record<MaterialPermission, string> = {
  public: '可公开',
  internal: '仅内部',
  legal: '需法务确认'
}

const MaterialCard: React.FC<MaterialCardProps> = ({ material }) => {
  const updatePermission = useMaterialsStore((s) => s.updatePermission)

  const cyclePermission = (e: React.MouseEvent) => {
    e.stopPropagation()
    const currentIdx = permissionOrder.indexOf(material.permission)
    const nextIdx = (currentIdx + 1) % permissionOrder.length
    const nextPerm = permissionOrder[nextIdx]
    Taro.showActionSheet({
      itemList: [
        '切换到「可公开」',
        '切换到「仅内部」',
        '切换到「需法务确认」'
      ],
      success: (res) => {
        const target = permissionOrder[res.tapIndex]
        updatePermission(material.id, target)
        Taro.showToast({
          title: `已切换为${permissionTextMap[target]}`,
          icon: 'none'
        })
      },
      fail: (err) => {
        if (err && (err as any).errMsg && !(err as any).errMsg.includes('cancel')) {
          console.error('[MaterialCard] actionSheet failed:', err)
        }
      }
    })
  }

  const permConfig = permissionConfig.find((p) => p.key === material.permission)!

  return (
    <View className={styles.card}>
      <View className={styles.header}>
        <View className={styles.categoryBadge}>
          <Text>{material.categoryName}</Text>
        </View>
        <View
          className={styles.tagClickable}
          onClick={cyclePermission}
          style={{ backgroundColor: permConfig.bgColor, color: permConfig.textColor }}
        >
          <Text className={styles.tagText}>{permissionTextMap[material.permission]}</Text>
          <Text className={styles.tagArrow}>▾</Text>
        </View>
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
