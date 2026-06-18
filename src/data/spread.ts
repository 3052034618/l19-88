import type { SpreadPlatform } from '@/types'

export const mockSpreadPlatforms: SpreadPlatform[] = [
  {
    type: 'shortvideo',
    name: '短视频平台',
    icon: 'video',
    entryCount: 23,
    trendingCount: 8,
    sentimentScore: 32,
    entries: [
      {
        id: 's1',
        title: 'XX品牌门店态度恶劣实录',
        author: '消费者维权日记',
        publishTime: '08:15',
        engagement: 234500,
        trend: 'rising'
      },
      {
        id: 's2',
        title: '服务行业还能这样？',
        author: '路人甲',
        publishTime: '09:30',
        engagement: 89000,
        trend: 'rising'
      },
      {
        id: 's3',
        title: '遇到服务态度差怎么办',
        author: '生活小百科',
        publishTime: '10:12',
        engagement: 45000,
        trend: 'rising'
      }
    ],
    drivingUsers: ['维权博主', '本地生活号', '普通消费者']
  },
  {
    type: 'weibo',
    name: '微博',
    icon: 'weibo',
    entryCount: 15,
    trendingCount: 5,
    sentimentScore: 41,
    entries: [
      {
        id: 'w1',
        title: '避雷！这家店服务态度真的差 #XX品牌#',
        author: '@城市生活观察员',
        publishTime: '09:02',
        engagement: 156000,
        trend: 'rising'
      },
      {
        id: 'w2',
        title: '遇到这种情况真的很生气',
        author: '@消费者小张',
        publishTime: '09:45',
        engagement: 23000,
        trend: 'stable'
      }
    ],
    drivingUsers: ['城市生活博主', 'KOL转发', '娱乐八卦号']
  },
  {
    type: 'forum',
    name: '论坛社区',
    icon: 'forum',
    entryCount: 9,
    trendingCount: 2,
    sentimentScore: 48,
    entries: [
      {
        id: 'f1',
        title: '第一次遇到这么嚣张的店员',
        author: '匿名用户',
        publishTime: '08:45',
        engagement: 45000,
        trend: 'stable'
      },
      {
        id: 'f2',
        title: '大家来评评理',
        author: '热心市民',
        publishTime: '10:20',
        engagement: 12000,
        trend: 'rising'
      }
    ],
    drivingUsers: ['老用户讨论', '对比帖发布者']
  },
  {
    type: 'news',
    name: '新闻客户端',
    icon: 'news',
    entryCount: 4,
    trendingCount: 1,
    sentimentScore: 55,
    entries: [
      {
        id: 'n1',
        title: '知名品牌门店被指服务态度问题',
        author: '本地消费观察',
        publishTime: '10:30',
        engagement: 89000,
        trend: 'rising'
      }
    ],
    drivingUsers: ['本地自媒体', '消费资讯号']
  }
]
