export type EventProgressStatus = 'pending_review' | 'handling' | 'responded' | 'reviewed'

export interface ProgressLogEntry {
  id: string
  status: EventProgressStatus
  note: string
  createdAt: string
  author: string
}

export interface EventItem {
  id: string
  title: string
  keyword: string
  brandLine: string
  region: string
  screenshot?: string
  status: 'analyzing' | 'pending' | 'tracked'
  progressStatus: EventProgressStatus
  createdAt: string
  sourceCount?: number
  peakTime?: string
  riskLevel: 'low' | 'medium' | 'high'
}

export interface SourceInfo {
  platform: string
  platformType: 'shortvideo' | 'weibo' | 'forum' | 'news'
  title: string
  author: string
  publishTime: string
  isFirstSource: boolean
  viewCount: number
  likeCount: number
  shareCount: number
  link?: string
}

export interface KeyAccount {
  name: string
  avatar: string
  followers: string
  platform: string
  influence: 'high' | 'medium' | 'low'
  sentiment: 'negative' | 'neutral' | 'positive'
}

export interface SpreadPlatform {
  type: 'shortvideo' | 'weibo' | 'forum' | 'news'
  name: string
  icon: string
  entryCount: number
  trendingCount: number
  sentimentScore: number
  entries: SpreadEntry[]
  drivingUsers: string[]
}

export interface SpreadEntry {
  id: string
  title: string
  author: string
  publishTime: string
  engagement: number
  trend: 'rising' | 'stable' | 'falling'
}

export type MaterialPermission = 'public' | 'internal' | 'legal'
export type MaterialCategory = 'fact' | 'service' | 'store' | 'pending'

export interface MaterialItem {
  id: string
  category: MaterialCategory
  categoryName: string
  title: string
  content: string
  permission: MaterialPermission
  eventId?: string | null
  updatedAt: string
  author: string
  version: number
}

export interface EventAnalysisResult {
  firstSources: SourceInfo[]
  keyAccounts: KeyAccount[]
  peakWarning: {
    isPeak: boolean
    estimatedPeakTime: string
    currentVolume: number
    trend: string
  }
}
