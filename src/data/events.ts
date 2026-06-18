import type { EventItem, EventAnalysisResult, SourceInfo, KeyAccount } from '@/types'

export const mockEvents: EventItem[] = [
  {
    id: 'e001',
    title: '华东门店服务态度投诉事件',
    keyword: 'XX品牌 门店 态度差',
    brandLine: '全品类',
    region: '华东区',
    status: 'tracked',
    createdAt: '2024-06-19 09:32',
    sourceCount: 47,
    peakTime: '预计 14:00-16:00',
    riskLevel: 'high'
  },
  {
    id: 'e002',
    title: '新品成分虚假宣传争议',
    keyword: 'XX新品 成分 造假',
    brandLine: '护肤线',
    region: '全国',
    status: 'analyzing',
    createdAt: '2024-06-19 10:15',
    riskLevel: 'medium'
  },
  {
    id: 'e003',
    title: '代言人旧言论被挖',
    keyword: 'XX代言人 言论 争议',
    brandLine: '时尚线',
    region: '全国',
    status: 'pending',
    createdAt: '2024-06-18 22:48',
    sourceCount: 128,
    peakTime: '已过峰',
    riskLevel: 'medium'
  },
  {
    id: 'e004',
    title: '物流损毁投诉集中爆发',
    keyword: 'XX快递 破损 不赔',
    brandLine: '电商线',
    region: '华南区',
    status: 'tracked',
    createdAt: '2024-06-18 16:20',
    sourceCount: 23,
    riskLevel: 'low'
  }
]

export const mockSourceInfos: SourceInfo[] = [
  {
    platform: '抖音',
    platformType: 'shortvideo',
    title: 'XX品牌门店态度恶劣，投诉无门',
    author: '消费者维权日记',
    publishTime: '2024-06-19 08:15',
    isFirstSource: true,
    viewCount: 230000,
    likeCount: 18000,
    shareCount: 3200
  },
  {
    platform: '微博',
    platformType: 'weibo',
    title: '避雷！这家店服务态度真的差',
    author: '@城市生活观察员',
    publishTime: '2024-06-19 09:02',
    isFirstSource: false,
    viewCount: 156000,
    likeCount: 8900,
    shareCount: 2100
  },
  {
    platform: '小红书',
    platformType: 'forum',
    title: '第一次遇到这么嚣张的店员',
    author: '匿名用户',
    publishTime: '2024-06-19 08:45',
    isFirstSource: false,
    viewCount: 45000,
    likeCount: 2300,
    shareCount: 890
  },
  {
    platform: '今日头条',
    platformType: 'news',
    title: '知名品牌门店被指服务态度问题',
    author: '本地消费观察',
    publishTime: '2024-06-19 10:30',
    isFirstSource: false,
    viewCount: 89000,
    likeCount: 4500,
    shareCount: 1200
  }
]

export const mockKeyAccounts: KeyAccount[] = [
  {
    name: '消费者维权日记',
    avatar: 'https://picsum.photos/id/64/200/200',
    followers: '128万',
    platform: '抖音',
    influence: 'high',
    sentiment: 'negative'
  },
  {
    name: '城市生活观察员',
    avatar: 'https://picsum.photos/id/91/200/200',
    followers: '56万',
    platform: '微博',
    influence: 'high',
    sentiment: 'negative'
  },
  {
    name: '打假小能手',
    avatar: 'https://picsum.photos/id/177/200/200',
    followers: '32万',
    platform: '小红书',
    influence: 'medium',
    sentiment: 'negative'
  },
  {
    name: '本地消费观察',
    avatar: 'https://picsum.photos/id/338/200/200',
    followers: '15万',
    platform: '今日头条',
    influence: 'medium',
    sentiment: 'neutral'
  },
  {
    name: '路人甲',
    avatar: 'https://picsum.photos/id/1027/200/200',
    followers: '2.3万',
    platform: '抖音',
    influence: 'low',
    sentiment: 'negative'
  }
]

export const mockAnalysisResult: EventAnalysisResult = {
  firstSources: mockSourceInfos,
  keyAccounts: mockKeyAccounts,
  peakWarning: {
    isPeak: true,
    estimatedPeakTime: '今日 14:00-16:00',
    currentVolume: 4720,
    trend: '上升中，较1小时前 +156%'
  }
}

export const brandLines = ['全品类', '护肤线', '彩妆线', '时尚线', '食品线', '家电线', '电商线']
export const regions = ['全国', '华北区', '华东区', '华南区', '华中区', '西南区', '西北区', '东北区']
