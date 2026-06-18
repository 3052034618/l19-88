import React from 'react'
import { View, Text } from '@tarojs/components'
import styles from './index.module.scss'

interface SectionHeaderProps {
  title: string
  desc?: string
  rightText?: string
  onRightClick?: () => void
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title, desc, rightText, onRightClick }) => {
  return (
    <View className={styles.sectionHeader}>
      <View className={styles.left}>
        <View className={styles.titleBar} />
        <Text className={styles.title}>{title}</Text>
      </View>
      {desc && <Text className={styles.desc}>{desc}</Text>}
      {rightText && (
        <Text className={styles.rightText} onClick={onRightClick}>
          {rightText}
        </Text>
      )}
    </View>
  )
}

export default SectionHeader
