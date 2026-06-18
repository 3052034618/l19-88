import type { MaterialItem } from '@/types'

export const mockMaterials: MaterialItem[] = [
  {
    id: 'm001',
    category: 'fact',
    categoryName: '已核实事实',
    title: '6.19 华东门店事件时间线',
    content: '8:02 顾客到店；8:15 因换货问题与店员发生争执；8:22 顾客拍摄视频离店；8:30 店长发函道歉；9:00 区域经理介入处理。',
    permission: 'internal',
    updatedAt: '2024-06-19 11:20',
    author: '张经理',
    version: 2
  },
  {
    id: 'm002',
    category: 'fact',
    categoryName: '已核实事实',
    title: '涉事门店背景信息',
    content: '该门店为品牌直营店，开业于2023年5月，店长从业3年，近6个月客诉记录0次。涉事店员为新入职员工，入职1个月。',
    permission: 'legal',
    updatedAt: '2024-06-19 10:45',
    author: '李主管',
    version: 1
  },
  {
    id: 'm003',
    category: 'service',
    categoryName: '客服口径',
    title: '客服统一回复话术（初版）',
    content: '尊敬的顾客您好，非常抱歉给您带来不愉快的购物体验。我们高度重视您的反馈，已安排专人跟进此事，将在24小时内给您回复。',
    permission: 'public',
    updatedAt: '2024-06-19 09:30',
    author: '王主管',
    version: 1
  },
  {
    id: 'm004',
    category: 'service',
    categoryName: '客服口径',
    title: '私信/评论区回复模板',
    content: '感谢您的关注，此事我们正在紧急调查核实中，稍后会发布官方说明，请您耐心等待。',
    permission: 'internal',
    updatedAt: '2024-06-19 10:00',
    author: '王主管',
    version: 1
  },
  {
    id: 'm005',
    category: 'store',
    categoryName: '门店说明',
    title: '门店官方声明（草稿）',
    content: '关于今日网传我司某门店服务态度问题，我司高度重视，第一时间成立专项小组进行调查。经初步核实，涉事店员确实存在服务不当行为...',
    permission: 'legal',
    updatedAt: '2024-06-19 11:00',
    author: '赵经理',
    version: 3
  },
  {
    id: 'm006',
    category: 'store',
    categoryName: '门店说明',
    title: '店长手写道歉信',
    content: '本人作为该门店店长，对今日发生的事件深感抱歉。我已第一时间对涉事员工进行了批评教育，并向当事顾客当面道歉...',
    permission: 'internal',
    updatedAt: '2024-06-19 08:45',
    author: '钱店长',
    version: 1
  },
  {
    id: 'm007',
    category: 'pending',
    categoryName: '待确认问题',
    title: '顾客要求赔偿金额待确认',
    content: '顾客提出5000元赔偿要求，是否同意？需法务和财务共同确认。',
    permission: 'internal',
    updatedAt: '2024-06-19 10:30',
    author: '孙经理',
    version: 1
  },
  {
    id: 'm008',
    category: 'pending',
    categoryName: '待确认问题',
    title: '是否需要公开致歉',
    content: '目前传播量已超过30万，讨论热度持续上升，需要高层决策是否发布公开致歉声明。',
    permission: 'legal',
    updatedAt: '2024-06-19 11:10',
    author: '周总监',
    version: 1
  }
]

export const categoryConfig = [
  { key: 'fact', name: '已核实事实', color: '#10B981' },
  { key: 'service', name: '客服口径', color: '#3B82F6' },
  { key: 'store', name: '门店说明', color: '#6366F1' },
  { key: 'pending', name: '待确认问题', color: '#F59E0B' }
]

export const permissionConfig = [
  { key: 'public', name: '可公开', bgColor: '#D1FAE5', textColor: '#059669' },
  { key: 'internal', name: '仅内部', bgColor: '#DBEAFE', textColor: '#2563EB' },
  { key: 'legal', name: '需法务确认', bgColor: '#FEF3C7', textColor: '#D97706' }
]
