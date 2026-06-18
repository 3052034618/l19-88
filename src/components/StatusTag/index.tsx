import React from 'react'
import { View, Text } from '@tarojs/components'
import styles from './index.module.scss'

interface StatusTagProps {
  type: 'high' | 'medium' | 'low' | 'public' | 'internal' | 'legal' | 'analyzing' | 'pending' | 'tracked'
  text: string
  size?: 'sm' | 'md'
}

const tagStyles: Record<string, { bg: string; color: string }> = {
  high: { bg: 'rgba(239, 68, 68, 0.1)', color: '#EF4444' },
  medium: { bg: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B' },
  low: { bg: 'rgba(16, 185, 129, 0.1)', color: '#10B981' },
  public: { bg: '#D1FAE5', color: '#059669' },
  internal: { bg: '#DBEAFE', color: '#2563EB' },
  legal: { bg: '#FEF3C7', color: '#D97706' },
  analyzing: { bg: 'rgba(99, 102, 241, 0.1)', color: '#6366F1' },
  pending: { bg: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B' },
  tracked: { bg: 'rgba(16, 185, 129, 0.1)', color: '#10B981' }
}

const StatusTag: React.FC<StatusTagProps> = ({ type, text, size = 'sm' }) => {
  const style = tagStyles[type] || tagStyles.medium
  return (
    <View
      className={`${styles.tag} ${size === 'md' ? styles.tagMd : styles.tagSm}`}
      style={{ backgroundColor: style.bg, color: style.color }}
    >
      <Text>{text}</Text>
    </View>
  )
}

export default StatusTag
