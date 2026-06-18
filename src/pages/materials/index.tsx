import React, { useState, useEffect } from 'react'
import { View, Text, Button, ScrollView, Input, Textarea } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import classnames from 'classnames'
import styles from './index.module.scss'
import MaterialCard from '@/components/MaterialCard'
import { categoryConfig, permissionConfig } from '@/data/materials'
import { useMaterialsStore } from '@/store/materials'
import type { MaterialCategory, MaterialPermission, MaterialItem } from '@/types'

const allCategory = { key: 'all', name: '全部', color: '#1E3A8A' }
const categories = [allCategory, ...categoryConfig]

const MaterialsPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [showModal, setShowModal] = useState(false)

  const materials = useMaterialsStore((s) => s.materials)
  const initMaterials = useMaterialsStore((s) => s.initMaterials)
  const addMaterial = useMaterialsStore((s) => s.addMaterial)

  const [formCategory, setFormCategory] = useState<MaterialCategory>('fact')
  const [formTitle, setFormTitle] = useState('')
  const [formContent, setFormContent] = useState('')
  const [formPermission, setFormPermission] = useState<MaterialPermission>('internal')

  useDidShow(() => {
    initMaterials()
  })

  useEffect(() => {
    initMaterials()
  }, [initMaterials])

  const handleRefresh = () => {
    console.log('[MaterialsPage] pull down refresh')
    setTimeout(() => {
      Taro.stopPullDownRefresh()
    }, 1000)
  }

  useEffect(() => {
    Taro.onPullDownRefresh(handleRefresh)
    return () => {
      Taro.offPullDownRefresh(handleRefresh)
    }
  }, [])

  const filteredMaterials: MaterialItem[] =
    activeCategory === 'all'
      ? materials
      : materials.filter((m) => m.category === activeCategory)

  const stats = {
    total: materials.length,
    public: materials.filter((m) => m.permission === 'public').length,
    internal: materials.filter((m) => m.permission === 'internal').length,
    legal: materials.filter((m) => m.permission === 'legal').length
  }

  const resetForm = () => {
    setFormCategory('fact')
    setFormTitle('')
    setFormContent('')
    setFormPermission('internal')
  }

  const handleAdd = () => {
    resetForm()
    setShowModal(true)
  }

  const handleSubmit = () => {
    if (!formTitle.trim()) {
      Taro.showToast({ title: '请输入标题', icon: 'none' })
      return
    }
    if (!formContent.trim()) {
      Taro.showToast({ title: '请输入内容', icon: 'none' })
      return
    }
    addMaterial({
      category: formCategory,
      title: formTitle.trim(),
      content: formContent.trim(),
      permission: formPermission
    })
    Taro.showToast({ title: '已保存', icon: 'success' })
    setShowModal(false)
    resetForm()
  }

  return (
    <View className={styles.pageWrapper}>
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
                <Text className={styles.legendText}>{p.name}（点击标签可直接修改）</Text>
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
              <Text className={styles.categoryCount}>
                {cat.key === 'all'
                  ? materials.length
                  : materials.filter((m) => m.category === cat.key).length}
              </Text>
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

      {showModal && (
        <View className={styles.modalMask} onClick={() => setShowModal(false)}>
          <View className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <View className={styles.modalHeader}>
              <Text className={styles.modalTitle}>新增回应材料</Text>
              <Text className={styles.modalClose} onClick={() => setShowModal(false)}>
                ✕
              </Text>
            </View>

            <ScrollView scrollY className={styles.modalBody}>
              <View className={styles.formItem}>
                <Text className={styles.formLabel}>分类</Text>
                <View className={styles.formOptions}>
                  {categoryConfig.map((cat) => (
                    <View
                      key={cat.key}
                      className={classnames(
                        styles.formOption,
                        formCategory === cat.key && styles.formOptionActive
                      )}
                      onClick={() => setFormCategory(cat.key as MaterialCategory)}
                    >
                      <View
                        className={styles.formOptionDot}
                        style={{ backgroundColor: cat.color }}
                      />
                      <Text>{cat.name}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View className={styles.formItem}>
                <Text className={styles.formLabel}>标题</Text>
                <View className={styles.formInputWrap}>
                  <Input
                    className={styles.formInput}
                    placeholder="如：客服统一回复话术"
                    placeholderClass="placeholder"
                    value={formTitle}
                    onInput={(e) => setFormTitle(e.detail.value)}
                  />
                </View>
              </View>

              <View className={styles.formItem}>
                <Text className={styles.formLabel}>内容</Text>
                <View className={styles.formTextareaWrap}>
                  <Textarea
                    className={styles.formTextarea}
                    placeholder="输入详细内容..."
                    placeholderClass="placeholder"
                    value={formContent}
                    onInput={(e) => setFormContent(e.detail.value)}
                  />
                </View>
              </View>

              <View className={styles.formItem}>
                <Text className={styles.formLabel}>公开级别</Text>
                <View className={styles.formOptions}>
                  {permissionConfig.map((p) => (
                    <View
                      key={p.key}
                      className={classnames(
                        styles.formOption,
                        formPermission === p.key && styles.formOptionActive
                      )}
                      style={
                        formPermission === p.key
                          ? { backgroundColor: p.bgColor, borderColor: p.textColor, color: p.textColor }
                          : {}
                      }
                      onClick={() => setFormPermission(p.key as MaterialPermission)}
                    >
                      <Text>{p.name}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </ScrollView>

            <View className={styles.modalFooter}>
              <Button className={styles.cancelBtn} onClick={() => setShowModal(false)}>
                取消
              </Button>
              <Button className={styles.confirmBtn} onClick={handleSubmit}>
                保存
              </Button>
            </View>
          </View>
        </View>
      )}
    </View>
  )
}

export default MaterialsPage
