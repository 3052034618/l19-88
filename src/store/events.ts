import { create } from 'zustand'
import Taro from '@tarojs/taro'
import type {
  EventItem,
  EventAnalysisResult,
  SpreadPlatform,
  SourceInfo,
  KeyAccount,
  ProgressLogEntry,
  EventProgressStatus
} from '@/types'
import { mockSourceInfos, mockKeyAccounts } from '@/data/events'

const EVENTS_KEY = 'pr_events_v2'
const ANALYSIS_KEY = 'pr_analysis_v2'
const SPREAD_KEY = 'pr_spread_v2'
const ACTIVE_KEY = 'pr_active_event_v2'
const LOGS_KEY = 'pr_progress_logs_v2'

interface EventsState {
  events: EventItem[]
  analysisMap: Record<string, EventAnalysisResult>
  spreadMap: Record<string, SpreadPlatform[]>
  progressLogMap: Record<string, ProgressLogEntry[]>
  activeEventId: string | null
  initialized: boolean
  initEvents: () => void
  addTrackedEvent: (data: {
    keyword: string
    description?: string
    brandLine: string
    region: string
    screenshot?: string
  }) => { eventId: string; analysis: EventAnalysisResult }
  setActiveEvent: (id: string | null) => void
  getAnalysis: (id: string) => EventAnalysisResult | null
  getSpread: (id: string) => SpreadPlatform[]
  getProgressLogs: (id: string) => ProgressLogEntry[]
  addProgressEntry: (id: string, status: EventProgressStatus, note: string) => void
  updateEventProgress: (id: string, status: EventProgressStatus) => void
  getAllTracked: () => EventItem[]
}

const genId = (prefix = 'x') =>
  prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 6)

const nowStr = () => {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const offsetTimeStr = (minutesAgo: number) => {
  const d = new Date(Date.now() - minutesAgo * 60 * 1000)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const loadJSON = <T,>(key: string, fallback: T): T => {
  try {
    const raw = Taro.getStorageSync(key)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed !== null && parsed !== undefined) return parsed as T
    }
  } catch (e) {
    console.error(`[EventsStore] load ${key} error:`, e)
  }
  return fallback
}

const saveJSON = (key: string, val: unknown) => {
  try {
    Taro.setStorageSync(key, JSON.stringify(val))
  } catch (e) {
    console.error(`[EventsStore] save ${key} error:`, e)
  }
}

// =========================================================
// 为 4 个预置历史事件定制差异化数据（一眼能看出是哪类事件）
// =========================================================

// --- e001: 华东门店服务态度投诉事件 ---
const buildE001 = (): {
  event: EventItem
  analysis: EventAnalysisResult
  spread: SpreadPlatform[]
  logs: ProgressLogEntry[]
} => {
  const analysis: EventAnalysisResult = {
    firstSources: [
      {
        platform: '抖音',
        platformType: 'shortvideo',
        title: 'XX品牌上海旗舰店：店员当众呵斥消费者，监控视频曝光',
        author: '消费者维权日记',
        publishTime: '2024-06-19 08:15',
        isFirstSource: true,
        viewCount: 428000,
        likeCount: 31200,
        shareCount: 6800
      },
      {
        platform: '大众点评',
        platformType: 'forum',
        title: '实名投诉上海南京西路店，店长态度恶劣拒绝道歉',
        author: '匿名用户 #3829',
        publishTime: '2024-06-19 08:40',
        isFirstSource: false,
        viewCount: 86000,
        likeCount: 4200,
        shareCount: 1200
      },
      {
        platform: '微博',
        platformType: 'weibo',
        title: '避雷！XX品牌门店态度真的差 #服务投诉#',
        author: '@城市生活观察员',
        publishTime: '2024-06-19 09:02',
        isFirstSource: false,
        viewCount: 256000,
        likeCount: 15400,
        shareCount: 3800
      },
      {
        platform: '今日头条',
        platformType: 'news',
        title: '知名品牌门店服务态度遭集中投诉，华东区域多店上榜',
        author: '本地消费观察',
        publishTime: '2024-06-19 10:30',
        isFirstSource: false,
        viewCount: 132000,
        likeCount: 6100,
        shareCount: 1900
      }
    ],
    keyAccounts: [
      { ...mockKeyAccounts[0], name: '消费者维权日记', followers: '128万', influence: 'high', sentiment: 'negative' },
      { ...mockKeyAccounts[1], name: '城市生活观察员', followers: '56万', influence: 'high', sentiment: 'negative' },
      { ...mockKeyAccounts[2], name: '上海本地探店', followers: '41万', influence: 'medium', sentiment: 'negative' },
      { ...mockKeyAccounts[3], name: '本地消费观察', followers: '15万', influence: 'medium', sentiment: 'neutral' },
      { ...mockKeyAccounts[4], name: '投诉受理平台', followers: '8.6万', influence: 'low', sentiment: 'negative' }
    ],
    peakWarning: {
      isPeak: true,
      estimatedPeakTime: '今日 14:00-16:00',
      currentVolume: 8240,
      trend: '快速上升，较1小时前 +178%'
    }
  }

  const spread: SpreadPlatform[] = [
    {
      type: 'shortvideo',
      name: '短视频平台',
      icon: 'video',
      entryCount: 41,
      trendingCount: 14,
      sentimentScore: 28,
      entries: [
        { id: 'v1', title: 'XX门店态度恶劣监控录像完整版', author: '消费者维权日记', publishTime: offsetTimeStr(360), engagement: 465900, trend: 'rising' },
        { id: 'v2', title: '消费者现场对峙视频流出', author: '@上海小阿姨', publishTime: offsetTimeStr(310), engagement: 198000, trend: 'rising' },
        { id: 'v3', title: '遇到服务态度差怎么办？', author: '生活维权小百科', publishTime: offsetTimeStr(250), engagement: 72000, trend: 'rising' }
      ],
      drivingUsers: ['维权博主', '本地探店号', '消费者自发转发']
    },
    {
      type: 'weibo',
      name: '微博',
      icon: 'weibo',
      entryCount: 27,
      trendingCount: 9,
      sentimentScore: 33,
      entries: [
        { id: 'w1', title: '避雷！这家店服务态度真的差 #XX品牌投诉#', author: '@城市生活观察员', publishTime: offsetTimeStr(320), engagement: 275200, trend: 'rising' },
        { id: 'w2', title: '#XX品牌门店态度# 上热搜了', author: '@热点追踪君', publishTime: offsetTimeStr(230), engagement: 88400, trend: 'rising' }
      ],
      drivingUsers: ['城市生活博主', '本地资讯号', '网友自发讨论']
    },
    {
      type: 'forum',
      name: '论坛社区',
      icon: 'forum',
      entryCount: 15,
      trendingCount: 4,
      sentimentScore: 42,
      entries: [
        { id: 'f1', title: '实名投诉南京西路店店长', author: '匿名用户 #3829', publishTime: offsetTimeStr(340), engagement: 91300, trend: 'stable' },
        { id: 'f2', title: '大家遇到的最差服务是哪家？', author: '热心市民王女士', publishTime: offsetTimeStr(210), engagement: 22300, trend: 'rising' }
      ],
      drivingUsers: ['大众点评老用户', '小红书对比帖']
    },
    {
      type: 'news',
      name: '新闻客户端',
      icon: 'news',
      entryCount: 6,
      trendingCount: 2,
      sentimentScore: 52,
      entries: [
        { id: 'n1', title: '知名品牌华东门店被集中投诉服务态度', author: '本地消费观察', publishTime: offsetTimeStr(210), engagement: 139200, trend: 'rising' }
      ],
      drivingUsers: ['本地自媒体', '消费资讯号']
    }
  ]

  const event: EventItem = {
    id: 'e001',
    title: '华东门店服务态度投诉事件',
    keyword: 'XX品牌 门店 态度差',
    brandLine: '全品类',
    region: '华东区',
    status: 'tracked',
    progressStatus: 'handling',
    createdAt: '2024-06-19 09:32',
    sourceCount: 89,
    peakTime: '预计 14:00-16:00',
    riskLevel: 'high'
  }

  const logs: ProgressLogEntry[] = [
    { id: 'p001-1', status: 'pending_review', note: '首次检测到门店投诉话题，舆情系统自动录入', createdAt: '2024-06-19 09:32', author: '系统' },
    { id: 'p001-2', status: 'handling', note: '华东区客服负责人已介入，联系涉事门店店长核实', createdAt: '2024-06-19 10:15', author: '张主管' },
    { id: 'p001-3', status: 'handling', note: '已调取门店监控录像，准备与涉事消费者接洽', createdAt: '2024-06-19 11:08', author: '张主管' }
  ]

  return { event, analysis, spread, logs }
}

// --- e002: 新品成分虚假宣传争议 ---
const buildE002 = (): {
  event: EventItem
  analysis: EventAnalysisResult
  spread: SpreadPlatform[]
  logs: ProgressLogEntry[]
} => {
  const analysis: EventAnalysisResult = {
    firstSources: [
      {
        platform: '小红书',
        platformType: 'forum',
        title: '扒一扒XX新品成分表：宣传的专利成分排第20位？',
        author: '成分党研究室',
        publishTime: '2024-06-19 10:02',
        isFirstSource: true,
        viewCount: 312000,
        likeCount: 28600,
        shareCount: 9400
      },
      {
        platform: '抖音',
        platformType: 'shortvideo',
        title: '实测XX新品：成分党揭穿宣传谎言',
        author: '美妆测评阿May',
        publishTime: '2024-06-19 10:28',
        isFirstSource: false,
        viewCount: 289000,
        likeCount: 21800,
        shareCount: 5600
      },
      {
        platform: '微博',
        platformType: 'weibo',
        title: 'XX新品成分造假 #美妆避坑#',
        author: '@美妆红黑榜',
        publishTime: '2024-06-19 11:15',
        isFirstSource: false,
        viewCount: 178000,
        likeCount: 9200,
        shareCount: 2100
      }
    ],
    keyAccounts: [
      { ...mockKeyAccounts[2], name: '成分党研究室', followers: '82万', influence: 'high', sentiment: 'negative' },
      { ...mockKeyAccounts[0], name: '美妆测评阿May', followers: '145万', influence: 'high', sentiment: 'negative' },
      { ...mockKeyAccounts[1], name: '美妆红黑榜', followers: '67万', influence: 'high', sentiment: 'negative' },
      { ...mockKeyAccounts[3], name: '配方师老李', followers: '38万', influence: 'medium', sentiment: 'neutral' },
      { ...mockKeyAccounts[4], name: '理性护肤bot', followers: '12万', influence: 'low', sentiment: 'neutral' }
    ],
    peakWarning: {
      isPeak: true,
      estimatedPeakTime: '今日 16:00-18:00',
      currentVolume: 5430,
      trend: '平稳上升，较1小时前 +92%'
    }
  }

  const spread: SpreadPlatform[] = [
    {
      type: 'forum',
      name: '论坛社区',
      icon: 'forum',
      entryCount: 36,
      trendingCount: 11,
      sentimentScore: 26,
      entries: [
        { id: 'e2-f1', title: 'XX新品成分扒皮：你买的是智商税吗', author: '成分党研究室', publishTime: offsetTimeStr(270), engagement: 350200, trend: 'rising' },
        { id: 'e2-f2', title: '对比10款同类产品，XX性价比倒数', author: '护肤品清单', publishTime: offsetTimeStr(200), engagement: 76500, trend: 'rising' }
      ],
      drivingUsers: ['成分党博主', '美妆测评账号', '对比帖主']
    },
    {
      type: 'shortvideo',
      name: '短视频平台',
      icon: 'video',
      entryCount: 29,
      trendingCount: 8,
      sentimentScore: 31,
      entries: [
        { id: 'e2-v1', title: '实测XX新品30天，成分党揭露真相', author: '美妆测评阿May', publishTime: offsetTimeStr(250), engagement: 315800, trend: 'rising' },
        { id: 'e2-v2', title: '配方师现场解读成分表', author: '@配方师老李', publishTime: offsetTimeStr(180), engagement: 92000, trend: 'rising' }
      ],
      drivingUsers: ['美妆测评号', '配方师KOL', '短视频二创']
    },
    {
      type: 'weibo',
      name: '微博',
      icon: 'weibo',
      entryCount: 19,
      trendingCount: 6,
      sentimentScore: 38,
      entries: [
        { id: 'e2-w1', title: 'XX新品成分造假 #美妆避坑#', author: '@美妆红黑榜', publishTime: offsetTimeStr(210), engagement: 189300, trend: 'rising' }
      ],
      drivingUsers: ['美妆话题号', '粉丝自来水']
    },
    {
      type: 'news',
      name: '新闻客户端',
      icon: 'news',
      entryCount: 3,
      trendingCount: 0,
      sentimentScore: 58,
      entries: [
        { id: 'e2-n1', title: '美妆行业新规下月实施，成分标注乱象将被监管', author: '行业资讯', publishTime: offsetTimeStr(150), engagement: 28000, trend: 'stable' }
      ],
      drivingUsers: ['行业媒体']
    }
  ]

  const event: EventItem = {
    id: 'e002',
    title: '新品成分虚假宣传争议',
    keyword: 'XX新品 成分 造假',
    brandLine: '护肤线',
    region: '全国',
    status: 'analyzing',
    progressStatus: 'pending_review',
    createdAt: '2024-06-19 10:15',
    sourceCount: 87,
    peakTime: '预计 16:00-18:00',
    riskLevel: 'medium'
  }

  const logs: ProgressLogEntry[] = [
    { id: 'p002-1', status: 'pending_review', note: '小红书成分帖触发预警，需要法务和研发双验证', createdAt: '2024-06-19 10:15', author: '系统' }
  ]

  return { event, analysis, spread, logs }
}

// --- e003: 代言人旧言论被挖 ---
const buildE003 = (): {
  event: EventItem
  analysis: EventAnalysisResult
  spread: SpreadPlatform[]
  logs: ProgressLogEntry[]
} => {
  const analysis: EventAnalysisResult = {
    firstSources: [
      {
        platform: '微博',
        platformType: 'weibo',
        title: 'XX代言人5年前微博言论被扒，网友：这也能代言？',
        author: '@娱乐扒婆',
        publishTime: '2024-06-18 22:48',
        isFirstSource: true,
        viewCount: 892000,
        likeCount: 58400,
        shareCount: 14200
      },
      {
        platform: '抖音',
        platformType: 'shortvideo',
        title: 'XX代言人旧言论合集，看完心情复杂',
        author: '娱乐八卦小队长',
        publishTime: '2024-06-18 23:15',
        isFirstSource: false,
        viewCount: 567000,
        likeCount: 39200,
        shareCount: 8900
      },
      {
        platform: '豆瓣',
        platformType: 'forum',
        title: '理性讨论：代言人5年前言论算翻车吗？',
        author: '吃瓜前线',
        publishTime: '2024-06-18 23:40',
        isFirstSource: false,
        viewCount: 178000,
        likeCount: 7800,
        shareCount: 1400
      }
    ],
    keyAccounts: [
      { ...mockKeyAccounts[1], name: '娱乐扒婆', followers: '298万', influence: 'high', sentiment: 'negative' },
      { ...mockKeyAccounts[0], name: '娱乐八卦小队长', followers: '186万', influence: 'high', sentiment: 'negative' },
      { ...mockKeyAccounts[2], name: '饭圈搬运工', followers: '52万', influence: 'medium', sentiment: 'negative' },
      { ...mockKeyAccounts[3], name: '时尚博主AMY', followers: '45万', influence: 'medium', sentiment: 'neutral' },
      { ...mockKeyAccounts[4], name: '营销号观察', followers: '6.8万', influence: 'low', sentiment: 'neutral' }
    ],
    peakWarning: {
      isPeak: false,
      estimatedPeakTime: '已过峰',
      currentVolume: 12480,
      trend: '高位震荡，较1小时前 -12%'
    }
  }

  const spread: SpreadPlatform[] = [
    {
      type: 'weibo',
      name: '微博',
      icon: 'weibo',
      entryCount: 58,
      trendingCount: 19,
      sentimentScore: 36,
      entries: [
        { id: 'e3-w1', title: '#XX代言人翻车# 被刷上热搜第3位', author: '@娱乐扒婆', publishTime: offsetTimeStr(1450), engagement: 964600, trend: 'falling' },
        { id: 'e3-w2', title: '粉丝洗地翻车现场合集', author: '@反黑站bot', publishTime: offsetTimeStr(1380), engagement: 234000, trend: 'falling' }
      ],
      drivingUsers: ['娱乐八卦号', '饭圈反黑组', '话题营销号']
    },
    {
      type: 'shortvideo',
      name: '短视频平台',
      icon: 'video',
      entryCount: 42,
      trendingCount: 12,
      sentimentScore: 41,
      entries: [
        { id: 'e3-v1', title: '代言人旧言论合集｜时间线整理', author: '娱乐八卦小队长', publishTime: offsetTimeStr(1420), engagement: 615400, trend: 'falling' },
        { id: 'e3-v2', title: '品牌是否该解约？评论区投票', author: '娱乐圈那些事', publishTime: offsetTimeStr(1280), engagement: 182000, trend: 'stable' }
      ],
      drivingUsers: ['娱乐剪辑号', '吃瓜搬运号']
    },
    {
      type: 'forum',
      name: '论坛社区',
      icon: 'forum',
      entryCount: 24,
      trendingCount: 5,
      sentimentScore: 48,
      entries: [
        { id: 'e3-f1', title: '理性讨论：这算翻车型言论吗？', author: '吃瓜前线', publishTime: offsetTimeStr(1400), engagement: 187200, trend: 'stable' }
      ],
      drivingUsers: ['豆瓣鹅组', '瓜友讨论楼']
    },
    {
      type: 'news',
      name: '新闻客户端',
      icon: 'news',
      entryCount: 7,
      trendingCount: 1,
      sentimentScore: 62,
      entries: [
        { id: 'e3-n1', title: '明星代言风险再引关注，品牌方应建立言论审查机制', author: '商业周刊', publishTime: offsetTimeStr(1200), engagement: 52000, trend: 'falling' }
      ],
      drivingUsers: ['商业媒体', '行业观察']
    }
  ]

  const event: EventItem = {
    id: 'e003',
    title: '代言人旧言论被挖',
    keyword: 'XX代言人 言论 争议',
    brandLine: '时尚线',
    region: '全国',
    status: 'pending',
    progressStatus: 'responded',
    createdAt: '2024-06-18 22:48',
    sourceCount: 131,
    peakTime: '已过峰',
    riskLevel: 'medium'
  }

  const logs: ProgressLogEntry[] = [
    { id: 'p003-1', status: 'pending_review', note: '深夜娱乐号集中发布，自动报警触发', createdAt: '2024-06-18 22:48', author: '系统' },
    { id: 'p003-2', status: 'handling', note: '品牌总代连夜开会，评估解约风险与成本', createdAt: '2024-06-19 01:20', author: '李总监' },
    { id: 'p003-3', status: 'responded', note: '凌晨5点已发布声明：与代言人终止合作，对过往事件深表歉意', createdAt: '2024-06-19 05:02', author: '公关部' }
  ]

  return { event, analysis, spread, logs }
}

// --- e004: 物流损毁投诉集中爆发 ---
const buildE004 = (): {
  event: EventItem
  analysis: EventAnalysisResult
  spread: SpreadPlatform[]
  logs: ProgressLogEntry[]
} => {
  const analysis: EventAnalysisResult = {
    firstSources: [
      {
        platform: '黑猫投诉',
        platformType: 'forum',
        title: 'XX快递618大促期间大量包裹破损，拒绝理赔',
        author: '集体投诉 #2819',
        publishTime: '2024-06-18 16:20',
        isFirstSource: true,
        viewCount: 112000,
        likeCount: 5400,
        shareCount: 1800
      },
      {
        platform: '微博',
        platformType: 'weibo',
        title: '#XX快递破损# 你们的包裹还好吗',
        author: '@消费日报',
        publishTime: '2024-06-18 18:32',
        isFirstSource: false,
        viewCount: 146000,
        likeCount: 7200,
        shareCount: 2400
      },
      {
        platform: '抖音',
        platformType: 'shortvideo',
        title: '开箱现场：一箱碎了一半，快递说易碎不保',
        author: '618拆箱小哥',
        publishTime: '2024-06-18 19:45',
        isFirstSource: false,
        viewCount: 78000,
        likeCount: 3900,
        shareCount: 1100
      }
    ],
    keyAccounts: [
      { ...mockKeyAccounts[3], name: '消费日报', followers: '62万', influence: 'high', sentiment: 'neutral' },
      { ...mockKeyAccounts[0], name: '黑猫投诉平台', followers: '45万', influence: 'medium', sentiment: 'negative' },
      { ...mockKeyAccounts[4], name: '618拆箱小哥', followers: '12万', influence: 'low', sentiment: 'negative' },
      { ...mockKeyAccounts[2], name: '电商行业观察', followers: '28万', influence: 'medium', sentiment: 'neutral' },
      { ...mockKeyAccounts[1], name: '物流小百科', followers: '9.3万', influence: 'low', sentiment: 'positive' }
    ],
    peakWarning: {
      isPeak: false,
      estimatedPeakTime: '今日11点小高峰',
      currentVolume: 1820,
      trend: '略有回落，较1小时前 -8%'
    }
  }

  const spread: SpreadPlatform[] = [
    {
      type: 'news',
      name: '新闻客户端',
      icon: 'news',
      entryCount: 12,
      trendingCount: 3,
      sentimentScore: 48,
      entries: [
        { id: 'e4-n1', title: '618后快递破损投诉激增，XX回应：高峰期增加人力', author: '消费日报', publishTime: offsetTimeStr(1080), engagement: 158500, trend: 'stable' }
      ],
      drivingUsers: ['消费维权媒体', '行业观察']
    },
    {
      type: 'forum',
      name: '论坛社区',
      icon: 'forum',
      entryCount: 18,
      trendingCount: 4,
      sentimentScore: 44,
      entries: [
        { id: 'e4-f1', title: '集体投诉 #2819：XX快递拒绝理赔', author: '黑猫投诉', publishTime: offsetTimeStr(1100), engagement: 120300, trend: 'stable' },
        { id: 'e4-f2', title: '大家618快递都到了吗？', author: '剁手党互助群', publishTime: offsetTimeStr(980), engagement: 34200, trend: 'falling' }
      ],
      drivingUsers: ['投诉平台用户', '电商用户讨论']
    },
    {
      type: 'weibo',
      name: '微博',
      icon: 'weibo',
      entryCount: 14,
      trendingCount: 3,
      sentimentScore: 51,
      entries: [
        { id: 'e4-w1', title: '#XX快递破损# 集体维权', author: '@消费日报', publishTime: offsetTimeStr(960), engagement: 155600, trend: 'falling' }
      ],
      drivingUsers: ['媒体官微', '网友转发']
    },
    {
      type: 'shortvideo',
      name: '短视频平台',
      icon: 'video',
      entryCount: 9,
      trendingCount: 1,
      sentimentScore: 54,
      entries: [
        { id: 'e4-v1', title: '618拆箱翻车合集', author: '618拆箱小哥', publishTime: offsetTimeStr(900), engagement: 83000, trend: 'falling' }
      ],
      drivingUsers: ['开箱博主', '普通消费者']
    }
  ]

  const event: EventItem = {
    id: 'e004',
    title: '物流损毁投诉集中爆发',
    keyword: 'XX快递 破损 不赔',
    brandLine: '电商线',
    region: '华南区',
    status: 'tracked',
    progressStatus: 'reviewed',
    createdAt: '2024-06-18 16:20',
    sourceCount: 53,
    peakTime: '11点小高峰',
    riskLevel: 'low'
  }

  const logs: ProgressLogEntry[] = [
    { id: 'p004-1', status: 'pending_review', note: '黑猫集体投诉平台录入，投诉件数>20触发预警', createdAt: '2024-06-18 16:20', author: '系统' },
    { id: 'p004-2', status: 'handling', note: '物流负责人与XX快递负责人电话会议', createdAt: '2024-06-18 17:50', author: '王经理' },
    { id: 'p004-3', status: 'responded', note: '快递公司承诺48小时内完成赔付', createdAt: '2024-06-18 20:10', author: '王经理' },
    { id: 'p004-4', status: 'reviewed', note: '赔付率97%，复盘：618大促前应增加易碎品外包抽检', createdAt: '2024-06-19 08:40', author: '复盘小组' }
  ]

  return { event, analysis, spread, logs }
}

// =========================================================
// 泛化构建（用户新录入事件使用）
// =========================================================

const variant = (base: string, i: number) => base + (i % 2 === 0 ? ' (相关)' : ' (延伸)')

const buildAnalysisForKeyword = (keyword: string): EventAnalysisResult => {
  const seed = Math.abs(
    keyword.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 7)
  )
  const sources: SourceInfo[] = mockSourceInfos.map((s, i) => ({
    ...s,
    title: i === 0 ? `${keyword} 首发曝光` : variant(s.title, seed + i),
    viewCount: Math.round(s.viewCount * (0.7 + ((seed + i * 31) % 60) / 100)),
    likeCount: Math.round(s.likeCount * (0.6 + ((seed + i * 17) % 50) / 100)),
    shareCount: Math.round(s.shareCount * (0.5 + ((seed + i * 11) % 70) / 100))
  }))
  const accounts: KeyAccount[] = mockKeyAccounts.map((a, i) => ({
    ...a,
    followers: a.followers + ((seed + i * 7) % 5 === 0 ? '+' : '')
  }))
  const volume = 1200 + (seed % 8000)
  const peakHour = 12 + (seed % 6)
  return {
    firstSources: sources,
    keyAccounts: accounts,
    peakWarning: {
      isPeak: (seed % 3) !== 0,
      estimatedPeakTime: `今日 ${peakHour}:00-${peakHour + 2}:00`,
      currentVolume: volume,
      trend:
        (seed % 4 === 0 ? '快速上升' : seed % 4 === 1 ? '平稳上升' : seed % 4 === 2 ? '高位震荡' : '略有回落') +
        `，较1小时前 +${50 + (seed % 120)}%`
    }
  }
}

const buildSpreadForKeyword = (keyword: string): SpreadPlatform[] => {
  const seed = Math.abs(
    keyword.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 11)
  )
  const bases: SpreadPlatform[] = [
    {
      type: 'shortvideo', name: '短视频平台', icon: 'video', entryCount: 23, trendingCount: 8, sentimentScore: 32,
      entries: [
        { id: 's1', title: `${keyword} 现场实录`, author: '消费者维权日记', publishTime: '08:15', engagement: 234500, trend: 'rising' },
        { id: 's2', title: '围观群众视角', author: '路人甲', publishTime: '09:30', engagement: 89000, trend: 'rising' },
        { id: 's3', title: '热点知识科普', author: '生活小百科', publishTime: '10:12', engagement: 45000, trend: 'rising' }
      ],
      drivingUsers: ['维权博主', '本地生活号', '普通消费者']
    },
    {
      type: 'weibo', name: '微博', icon: 'weibo', entryCount: 15, trendingCount: 5, sentimentScore: 41,
      entries: [
        { id: 'w1', title: `${keyword} #热门话题#`, author: '@城市生活观察员', publishTime: '09:02', engagement: 156000, trend: 'rising' },
        { id: 'w2', title: '当事人回应', author: '@消费者小张', publishTime: '09:45', engagement: 23000, trend: 'stable' }
      ],
      drivingUsers: ['城市生活博主', 'KOL转发', '娱乐八卦号']
    },
    {
      type: 'forum', name: '论坛社区', icon: 'forum', entryCount: 9, trendingCount: 2, sentimentScore: 48,
      entries: [
        { id: 'f1', title: `${keyword} 讨论贴`, author: '匿名用户', publishTime: '08:45', engagement: 45000, trend: 'stable' },
        { id: 'f2', title: '大家来评评理', author: '热心市民', publishTime: '10:20', engagement: 12000, trend: 'rising' }
      ],
      drivingUsers: ['老用户讨论', '对比帖发布者']
    },
    {
      type: 'news', name: '新闻客户端', icon: 'news', entryCount: 4, trendingCount: 1, sentimentScore: 55,
      entries: [
        { id: 'n1', title: `${keyword} 引关注`, author: '本地消费观察', publishTime: '10:30', engagement: 89000, trend: 'rising' }
      ],
      drivingUsers: ['本地自媒体', '消费资讯号']
    }
  ]
  return bases.map((p, idx) => {
    const entryCount = Math.max(3, p.entryCount + (seed + idx * 13) % 15 - 7)
    const trendingCount = Math.max(
      1,
      Math.round(entryCount * (0.3 + ((seed + idx) % 20) / 100))
    )
    const sentimentScore = Math.max(
      20,
      Math.min(80, p.sentimentScore + (seed + idx * 7) % 20 - 10)
    )
    return {
      ...p,
      entryCount,
      trendingCount,
      sentimentScore,
      entries: p.entries.map((e, i) => ({
        ...e,
        title: i === 0 ? e.title : variant(e.title, seed + idx + i),
        engagement: Math.round(e.engagement * (0.6 + ((seed + idx * 5 + i * 3) % 80) / 100)),
        trend:
          (seed + idx + i) % 3 === 0 ? 'rising' : (seed + idx + i) % 3 === 1 ? 'stable' : 'falling'
      }))
    }
  })
}

const riskFromKeyword = (keyword: string): 'low' | 'medium' | 'high' => {
  const seed = keyword.length + keyword.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return seed % 3 === 0 ? 'low' : seed % 3 === 1 ? 'medium' : 'high'
}

// =========================================================
// Zustand Store
// =========================================================

export const useEventsStore = create<EventsState>((set, get) => ({
  events: [],
  analysisMap: {},
  spreadMap: {},
  progressLogMap: {},
  activeEventId: null,
  initialized: false,

  initEvents: () => {
    if (get().initialized) return
    const storedEvents = loadJSON<EventItem[]>(EVENTS_KEY, [])
    const storedAnalysis = loadJSON<Record<string, EventAnalysisResult>>(ANALYSIS_KEY, {})
    const storedSpread = loadJSON<Record<string, SpreadPlatform[]>>(SPREAD_KEY, {})
    const storedActive = loadJSON<string | null>(ACTIVE_KEY, null)
    const storedLogs = loadJSON<Record<string, ProgressLogEntry[]>>(LOGS_KEY, {})

    if (storedEvents.length > 0 && Object.keys(storedAnalysis).length > 0) {
      set({
        events: storedEvents,
        analysisMap: storedAnalysis,
        spreadMap: storedSpread,
        progressLogMap: storedLogs,
        activeEventId: storedActive,
        initialized: true
      })
      console.log('[EventsStore] loaded from storage, events:', storedEvents.length)
      return
    }

    const e001 = buildE001()
    const e002 = buildE002()
    const e003 = buildE003()
    const e004 = buildE004()

    const initialEvents = [e001.event, e002.event, e003.event, e004.event]
    const initialAnalysis: Record<string, EventAnalysisResult> = {
      [e001.event.id]: e001.analysis,
      [e002.event.id]: e002.analysis,
      [e003.event.id]: e003.analysis,
      [e004.event.id]: e004.analysis
    }
    const initialSpread: Record<string, SpreadPlatform[]> = {
      [e001.event.id]: e001.spread,
      [e002.event.id]: e002.spread,
      [e003.event.id]: e003.spread,
      [e004.event.id]: e004.spread
    }
    const initialLogs: Record<string, ProgressLogEntry[]> = {
      [e001.event.id]: e001.logs,
      [e002.event.id]: e002.logs,
      [e003.event.id]: e003.logs,
      [e004.event.id]: e004.logs
    }

    set({
      events: initialEvents,
      analysisMap: initialAnalysis,
      spreadMap: initialSpread,
      progressLogMap: initialLogs,
      activeEventId: e001.event.id,
      initialized: true
    })
    saveJSON(EVENTS_KEY, initialEvents)
    saveJSON(ANALYSIS_KEY, initialAnalysis)
    saveJSON(SPREAD_KEY, initialSpread)
    saveJSON(ACTIVE_KEY, e001.event.id)
    saveJSON(LOGS_KEY, initialLogs)
    console.log('[EventsStore] initialized with 4 preset events')
  },

  addTrackedEvent: (data) => {
    const id = genId('e')
    const risk = riskFromKeyword(data.keyword)
    const analysis = buildAnalysisForKeyword(data.keyword)
    const spread = buildSpreadForKeyword(data.keyword)

    const now = nowStr()
    const newEvent: EventItem = {
      id,
      title: data.description?.trim()
        ? data.description.trim().slice(0, 18) + (data.description.trim().length > 18 ? '…' : '')
        : data.keyword.slice(0, 18) + (data.keyword.length > 18 ? '…' : ''),
      keyword: data.keyword,
      brandLine: data.brandLine,
      region: data.region,
      screenshot: data.screenshot,
      status: 'tracked',
      progressStatus: 'pending_review',
      createdAt: now,
      sourceCount: analysis.firstSources.length,
      peakTime: analysis.peakWarning.isPeak ? analysis.peakWarning.estimatedPeakTime : '暂无明显高峰',
      riskLevel: risk
    }

    const firstLog: ProgressLogEntry = {
      id: genId('p'),
      status: 'pending_review',
      note: '用户录入新事件，等待研判',
      createdAt: now,
      author: '当前用户'
    }

    const { events, analysisMap, spreadMap, progressLogMap } = get()
    const nextEvents = [newEvent, ...events]
    const nextAnalysis = { ...analysisMap, [id]: analysis }
    const nextSpread = { ...spreadMap, [id]: spread }
    const nextLogs = { ...progressLogMap, [id]: [firstLog] }

    set({
      events: nextEvents,
      analysisMap: nextAnalysis,
      spreadMap: nextSpread,
      progressLogMap: nextLogs,
      activeEventId: id
    })
    saveJSON(EVENTS_KEY, nextEvents)
    saveJSON(ANALYSIS_KEY, nextAnalysis)
    saveJSON(SPREAD_KEY, nextSpread)
    saveJSON(LOGS_KEY, nextLogs)
    saveJSON(ACTIVE_KEY, id)
    console.log('[EventsStore] addTrackedEvent:', id)
    return { eventId: id, analysis }
  },

  setActiveEvent: (id) => {
    set({ activeEventId: id })
    saveJSON(ACTIVE_KEY, id)
    console.log('[EventsStore] setActiveEvent:', id)
  },

  getAnalysis: (id) => {
    return get().analysisMap[id] ?? null
  },

  getSpread: (id) => {
    return get().spreadMap[id] ?? []
  },

  getProgressLogs: (id) => {
    return get().progressLogMap[id] ?? []
  },

  addProgressEntry: (id, status, note) => {
    const { progressLogMap, events } = get()
    const entry: ProgressLogEntry = {
      id: genId('p'),
      status,
      note: note.trim() || statusToDefaultNote(status),
      createdAt: nowStr(),
      author: '当前用户'
    }
    const prev = progressLogMap[id] ?? []
    const nextLogs = { ...progressLogMap, [id]: [entry, ...prev] }
    const nextEvents = events.map((e) =>
      e.id === id ? { ...e, progressStatus: status } : e
    )
    set({ progressLogMap: nextLogs, events: nextEvents })
    saveJSON(LOGS_KEY, nextLogs)
    saveJSON(EVENTS_KEY, nextEvents)
    console.log('[EventsStore] addProgressEntry:', id, status)
  },

  updateEventProgress: (id, status) => {
    const { events } = get()
    const nextEvents = events.map((e) =>
      e.id === id ? { ...e, progressStatus: status } : e
    )
    set({ events: nextEvents })
    saveJSON(EVENTS_KEY, nextEvents)
  },

  getAllTracked: () => {
    return get().events
  }
}))

const statusToDefaultNote = (s: EventProgressStatus) => {
  switch (s) {
    case 'pending_review': return '状态更新为待研判'
    case 'handling': return '状态更新为处理中'
    case 'responded': return '状态更新为已回应'
    case 'reviewed': return '状态更新为已复盘'
  }
}
