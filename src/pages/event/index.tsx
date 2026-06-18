import React, { useState, useCallback } from 'react'
import { View, Text, Input, Textarea, Button, Image, ScrollView } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import classnames from 'classnames'
import styles from './index.module.scss'
import SectionHeader from '@/components/SectionHeader'
import EventCard from '@/components/EventCard'
import type { EventAnalysisResult, EventItem } from '@/types'
import { brandLines, regions } from '@/data/events'
import { useEventsStore } from '@/store/events'

const EventPage: React.FC = () => {
  const [keyword, setKeyword] = useState('')
  const [description, setDescription] = useState('')
  const [selectedBrand, setSelectedBrand] = useState('')
  const [selectedRegion, setSelectedRegion] = useState('')
  const [screenshot, setScreenshot] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<EventAnalysisResult | null>(null)
  const [trackedList, setTrackedList] = useState<EventItem[]>([])

  const initEvents = useEventsStore((s) => s.initEvents)
  const addTrackedEvent = useEventsStore((s) => s.addTrackedEvent)
  const getAllTracked = useEventsStore((s) => s.getAllTracked)
  const setActiveEvent = useEventsStore((s) => s.setActiveEvent)

  const refreshTracked = useCallback(() => {
    setTrackedList(getAllTracked())
  }, [getAllTracked])

  useDidShow(() => {
    initEvents()
    refreshTracked()
  })

  React.useEffect(() => {
    initEvents()
    refreshTracked()
  }, [initEvents, refreshTracked])

  const formatNumber = (num: number) => {
    if (num >= 10000) {
      return (num / 10000).toFixed(1) + '万'
    }
    return num.toLocaleString()
  }

  const handleChooseImage = useCallback(() => {
    Taro.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        if (res.tempFilePaths && res.tempFilePaths.length > 0) {
          setScreenshot(res.tempFilePaths[0])
        }
      },
      fail: (err) => {
        console.error('[EventPage] chooseImage failed:', err)
      }
    })
  }, [])

  const handleSubmit = useCallback(() => {
    if (!keyword.trim()) {
      Taro.showToast({
        title: '请输入话题词',
        icon: 'none'
      })
      return
    }
    if (!selectedBrand) {
      Taro.showToast({
        title: '请选择品牌线',
        icon: 'none'
      })
      return
    }
    if (!selectedRegion) {
      Taro.showToast({
        title: '请选择区域',
        icon: 'none'
      })
      return
    }

    setIsAnalyzing(true)
    setAnalysisResult(null)

    console.log('[EventPage] submit event:', { keyword, selectedBrand, selectedRegion })

    setTimeout(() => {
      const { eventId, analysis } = addTrackedEvent({
        keyword: keyword.trim(),
        description: description.trim(),
        brandLine: selectedBrand,
        region: selectedRegion,
        screenshot
      })
      setIsAnalyzing(false)
      setAnalysisResult(analysis)
      setActiveEvent(eventId)
      refreshTracked()
      Taro.showToast({ title: '已加入追踪事件', icon: 'success' })
    }, 2000)
  }, [keyword, description, selectedBrand, selectedRegion, screenshot, addTrackedEvent, setActiveEvent, refreshTracked])

  const handleEventClick = (event: EventItem) => {
    setActiveEvent(event.id)
    Taro.navigateTo({
      url: `/pages/event-detail/index?id=${event.id}`
    })
  }

  const handleRefresh = () => {
    console.log('[EventPage] pull down refresh')
    setTimeout(() => {
      Taro.stopPullDownRefresh()
      refreshTracked()
    }, 1000)
  }

  React.useEffect(() => {
    Taro.onPullDownRefresh(handleRefresh)
    return () => {
      Taro.offPullDownRefresh(handleRefresh)
    }
  }, [])

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.hero}>
        <Text className={styles.heroTitle}>快速录入事件</Text>
        <Text className={styles.heroDesc}>粘贴话题词，上传截图，一键识别源头与推手</Text>
      </View>

      <View className={styles.formCard}>
        <View className={styles.formItem}>
          <Text className={styles.formLabel}>
            <Text className={styles.required}>*</Text>话题词
          </Text>
          <View className={styles.inputWrapper}>
            <Input
              className={styles.input}
              placeholder="粘贴或输入关键词，如：XX品牌 门店 态度差"
              placeholderClass="placeholder"
              value={keyword}
              onInput={(e) => setKeyword(e.detail.value)}
            />
          </View>
        </View>

        <View className={styles.formItem}>
          <Text className={styles.formLabel}>事件描述</Text>
          <View className={styles.textareaWrapper}>
            <Textarea
              className={styles.textarea}
              placeholder="简要描述事件经过、您看到的讨论内容"
              placeholderClass="placeholder"
              value={description}
              onInput={(e) => setDescription(e.detail.value)}
            />
          </View>
        </View>

        <View className={styles.formItem}>
          <Text className={styles.formLabel}>上传截图</Text>
          <View className={styles.uploadArea} onClick={handleChooseImage}>
            {screenshot ? (
              <Image src={screenshot} style={{ width: '200rpx', height: '200rpx', borderRadius: '12rpx' }} mode="aspectFill" />
            ) : (
              <>
                <View className={styles.uploadIcon}>
                  <Text>+</Text>
                </View>
                <Text className={styles.uploadText}>点击上传截图</Text>
                <Text className={styles.uploadHint}>支持从相册选择或拍照</Text>
              </>
            )}
          </View>
        </View>

        <View className={styles.formItem}>
          <Text className={styles.formLabel}>
            <Text className={styles.required}>*</Text>品牌线
          </Text>
          <View className={styles.optionRow}>
            {brandLines.map((brand) => (
              <View
                key={brand}
                className={classnames(styles.optionItem, selectedBrand === brand && styles.optionActive)}
                onClick={() => setSelectedBrand(brand)}
              >
                <Text>{brand}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className={styles.formItem}>
          <Text className={styles.formLabel}>
            <Text className={styles.required}>*</Text>涉及区域
          </Text>
          <View className={styles.optionRow}>
            {regions.map((region) => (
              <View
                key={region}
                className={classnames(styles.optionItem, selectedRegion === region && styles.optionActive)}
                onClick={() => setSelectedRegion(region)}
              >
                <Text>{region}</Text>
              </View>
            ))}
          </View>
        </View>

        <Button className={styles.submitBtn} onClick={handleSubmit}>
          开始溯源分析
        </Button>
      </View>

      {(isAnalyzing || analysisResult) && (
        <View className={styles.resultSection}>
          <SectionHeader title="分析结果" desc={isAnalyzing ? '分析中...' : '已完成'} />

          {isAnalyzing && (
            <View className={styles.loadingState}>
              <View className={styles.loadingSpinner} />
              <Text className={styles.loadingText}>正在全网检索，识别源头与传播路径...</Text>
            </View>
          )}

          {analysisResult && !isAnalyzing && (
            <>
              {analysisResult.peakWarning.isPeak && (
                <View className={styles.warningCard}>
                  <View className={styles.warningHeader}>
                    <View className={styles.warningIcon}>
                      <Text>!</Text>
                    </View>
                    <Text className={styles.warningTitle}>讨论高峰预警</Text>
                  </View>
                  <View className={styles.warningContent}>
                    <View className={styles.warningRow}>
                      <Text className={styles.warningLabel}>预计高峰时段</Text>
                      <Text className={styles.warningValue}>{analysisResult.peakWarning.estimatedPeakTime}</Text>
                    </View>
                    <View className={styles.warningRow}>
                      <Text className={styles.warningLabel}>当前讨论量</Text>
                      <Text className={styles.warningValue}>{analysisResult.peakWarning.currentVolume.toLocaleString()} 条</Text>
                    </View>
                    <View className={styles.warningRow}>
                      <Text className={styles.warningLabel}>热度趋势</Text>
                      <Text className={classnames(styles.warningValue, styles.trendValue)}>{analysisResult.peakWarning.trend}</Text>
                    </View>
                  </View>
                </View>
              )}

              <SectionHeader title="疑似首发内容" />
              {analysisResult.firstSources.map((source, idx) => (
                <View key={idx} className={styles.sourceCard}>
                  {source.isFirstSource && (
                    <View className={styles.firstSourceBadge}>
                      <Text>疑似首发</Text>
                    </View>
                  )}
                  <View className={styles.sourcePlatform}>
                    <Text>{source.platform}</Text>
                  </View>
                  <Text className={styles.sourceTitle}>{source.title}</Text>
                  <Text className={styles.sourceAuthor}>
                    {source.author} · {source.publishTime}
                  </Text>
                  <View className={styles.sourceStats}>
                    <Text className={styles.sourceStat}>
                      浏览 <Text className={styles.statNum}>{formatNumber(source.viewCount)}</Text>
                    </Text>
                    <Text className={styles.sourceStat}>
                      点赞 <Text className={styles.statNum}>{formatNumber(source.likeCount)}</Text>
                    </Text>
                    <Text className={styles.sourceStat}>
                      转发 <Text className={styles.statNum}>{formatNumber(source.shareCount)}</Text>
                    </Text>
                  </View>
                </View>
              ))}

              <SectionHeader title="关键转发账号" />
              {analysisResult.keyAccounts.map((account, idx) => (
                <View key={idx} className={styles.accountCard}>
                  <View className={styles.accountAvatar}>
                    <Image className={styles.avatarImg} src={account.avatar} mode="aspectFill" />
                  </View>
                  <View className={styles.accountInfo}>
                    <Text className={styles.accountName}>{account.name}</Text>
                    <View className={styles.accountMeta}>
                      <Text className={styles.accountPlatform}>{account.platform}</Text>
                      <Text className={styles.accountFollowers}>粉丝 {account.followers}</Text>
                    </View>
                  </View>
                  <View
                    className={classnames(
                      styles.influenceBadge,
                      account.influence === 'high' && styles.influenceHigh,
                      account.influence === 'medium' && styles.influenceMedium,
                      account.influence === 'low' && styles.influenceLow
                    )}
                  >
                    <Text>
                      {account.influence === 'high' ? '高影响' : account.influence === 'medium' ? '中影响' : '低影响'}
                    </Text>
                  </View>
                </View>
              ))}
            </>
          )}
        </View>
      )}

      <View className={styles.eventList}>
        <SectionHeader title="最近追踪事件" desc={`共 ${trackedList.length} 条`} rightText={trackedList.length > 3 ? '查看全部' : undefined} />
        {(trackedList.length > 0 ? trackedList.slice(0, 5) : []).map((event) => (
          <View key={event.id} onClick={() => handleEventClick(event)}>
            <EventCard event={event} />
          </View>
        ))}
      </View>
    </ScrollView>
  )
}

export default EventPage
