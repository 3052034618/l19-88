import React, { useState } from 'react'
import { View, Text, Button, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import styles from './index.module.scss'
import MaterialCard from '@/components/MaterialCard'
import { mockMaterials, categoryConfig, permissionConfig } from '@/data/materials'
import type { MaterialCategory, MaterialItem } from '@/types'

const allCategory = { key: 'all', name: '全部', color: '#1E3A8A' }
const categories = [allCategory, ...categoryConfig]

const MaterialsPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('all')

  const handleRefresh = () => {
    console.log('[MaterialsPage] pull down refresh')
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

  const filteredMaterials: MaterialItem[] =
    activeCategory === 'all'
      ? mockMaterials
      : mockMaterials.filter((m) => m.category === activeCategory)

  const stats = {
    total: mockMaterials.length,
    public: mockMaterials.filter((m) => m.permission === 'public').length,
    internal: mockMaterials.filter((m) => m.permission === 'internal').length,
    legal: mockMaterials.filter((m) => m.permission === 'legal').length
  }

  const handleAdd = () => {
    Taro.showToast({
      title: '新增材料功能开发中',
      icon: 'none'
    })
  }

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.hero}>
        <Text className={styles.heroTitle}>回应材料夹</Text>
        <Text className={styles.heroDesc}>统一管理核实事实、口径说明，标记公开级别</Text>
      </View>

      <View className={styles.statsRow}>
        <View className={styles.statCard}>
          <Text className={styles.statValue}>{stats.total}</Text>
          <Text className={styles.statName}>材料总数</Text>
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
      </View>

      <ScrollView scrollX className={styles.categoryTabs}>
        {categories.map((cat) => (
          <View
            key={cat.key}
            className={classnames(styles.categoryTab, activeCategory === cat.key && styles.categoryTabActive)}
            onClick={() => setActiveCategory(cat.key)}
          >
            <Text>{cat.name}</Text>
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
            <MaterialCard key={material.id} material={material} />
          ))
        ) : (
          <View className={styles.emptyState}>
            <View className={styles.emptyIcon}>
              <Text>📁</Text>
            </View>
            <Text className={styles.emptyTitle}>该分类暂无材料</Text>
            <Text className={styles.emptyDesc}>点击上方按钮新增回应材料</Text>
          </View>
        )}
      </View>
    </ScrollView>
  )
}

export default MaterialsPage
