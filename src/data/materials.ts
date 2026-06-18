import type { MaterialItem } from '@/types'

export const mockMaterials: MaterialItem[] = [
  {
    id: 'm001',
    category: 'fact',
    categoryName: '已核实事实',
    title: '6.19 华东门店事件时间线',
    content: '8:02 顾客到店；8:15 因换货问题与店员发生争执；8:22 顾客拍摄视频离店；8:30 店长发函道歉；9:00 区域经理介入处理。',
    permission: 'internal',
    eventId: 'e001',
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
    eventId: 'e001',
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
    eventId: 'e001',
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
    eventId: 'e001',
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
    eventId: 'e001',
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
    eventId: 'e001',
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
    eventId: 'e001',
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
    eventId: 'e001',
    updatedAt: '2024-06-19 11:10',
    author: '周总监',
    version: 1
  },
  {
    id: 'm009',
    category: 'fact',
    categoryName: '已核实事实',
    title: '新品成分对照表（研发部）',
    content: '实际成分：水、甘油、丁二醇、烟酰胺、积雪草提取物...；宣传成分排名：烟酰胺位列第20位，占比0.03%；专利成分实际使用版本为低配版。',
    permission: 'legal',
    eventId: 'e002',
    updatedAt: '2024-06-19 11:45',
    author: '研发部',
    version: 1
  },
  {
    id: 'm010',
    category: 'service',
    categoryName: '客服口径',
    title: '新品咨询临时话术',
    content: '您好，关于您咨询的成分问题，每批产品成分均以包装标注为准，我司严格遵守相关法规，若有疑问可出示检测报告。',
    permission: 'internal',
    eventId: 'e002',
    updatedAt: '2024-06-19 12:00',
    author: '客服组',
    version: 1
  },
  {
    id: 'm011',
    category: 'pending',
    categoryName: '待确认问题',
    title: '是否对成分党博主发函要求删帖',
    content: '建议先发律师函警告，但法务评估胜诉率不高。备选方案：私下协商赔偿+删帖。',
    permission: 'legal',
    eventId: 'e002',
    updatedAt: '2024-06-19 12:30',
    author: '法务组',
    version: 1
  },
  {
    id: 'm012',
    category: 'store',
    categoryName: '门店说明',
    title: '品牌官方声明',
    content: '关于近期代言人相关事件，我司已与该代言人终止全部合作。对其过往言论造成的社会影响深表歉意，品牌始终坚持积极正向的价值观。',
    permission: 'public',
    eventId: 'e003',
    updatedAt: '2024-06-19 05:02',
    author: '公关部',
    version: 2
  },
  {
    id: 'm013',
    category: 'service',
    categoryName: '客服口径',
    title: '电商客服回应模板',
    content: '感谢您的关注，品牌已终止与该代言人的一切合作，后续会推出全新代言人系列，感谢您的理解和支持。',
    permission: 'public',
    eventId: 'e003',
    updatedAt: '2024-06-19 06:10',
    author: '电商组',
    version: 1
  },
  {
    id: 'm014',
    category: 'fact',
    categoryName: '已核实事实',
    title: '代言人代言条款摘要',
    content: '合同第7条：代言人需维护正面公众形象，如因过往言论造成品牌损失，品牌有权单方面解约并索赔。',
    permission: 'internal',
    eventId: 'e003',
    updatedAt: '2024-06-19 03:00',
    author: '法务组',
    version: 1
  },
  {
    id: 'm015',
    category: 'service',
    categoryName: '客服口径',
    title: '物流破损统一处理口径',
    content: '您好，非常抱歉包裹在运输途中破损。请拍摄外包装+内物照片，我们会在48小时内协调快递方完成赔付。',
    permission: 'public',
    eventId: 'e004',
    updatedAt: '2024-06-18 20:30',
    author: '客服组',
    version: 1
  },
  {
    id: 'm016',
    category: 'pending',
    categoryName: '待确认问题',
    title: '618大促是否暂停合作快递',
    content: '618大促期间暂停合作风险较高，建议采取"增加抽检+赔付准备金加倍"的折中方案。',
    permission: 'internal',
    eventId: 'e004',
    updatedAt: '2024-06-19 08:40',
    author: '复盘小组',
    version: 1
  },
  {
    id: 'm017',
    category: 'fact',
    categoryName: '已核实事实',
    title: '通用公关术语规范手册',
    content: '1. 不得使用"概不负责"，改用"我们深表歉意"；2. 不得承诺具体赔偿金额，改用"我们会合理解决"；3. 涉及法律问题请转法务。',
    permission: 'internal',
    eventId: null,
    updatedAt: '2024-06-15 10:00',
    author: '行政部',
    version: 1
  },
  {
    id: 'm018',
    category: 'service',
    categoryName: '客服口径',
    title: '7天无理由退货标准话术',
    content: '您好，自收到货之日起7日内，商品不影响二次销售的前提下可申请无理由退货，退货方式...',
    permission: 'public',
    eventId: null,
    updatedAt: '2024-06-10 09:00',
    author: '客服组',
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
