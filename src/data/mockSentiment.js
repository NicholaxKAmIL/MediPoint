// 平台舆情 + 关键词热度 + 七日趋势 — 按门店拆分
const SOURCES = {
  Weibo: [
    { title: '#全国流感进入高峰# 多地儿科门诊爆满', content: '国家流感中心通报本周南方省份流感阳性率 32.4%，建议家中常备退烧药。', tags: ['流感', '儿科', '退烧'], sentiment: 'concern', url: 'https://s.weibo.com/', region: '全国' },
    { title: '#连花清瘟断货# 福州多家药店补货', content: '网友晒图反映福州部分门店连花清瘟售罄，店员称 2 日内到货。', tags: ['连花清瘟', '缺货', '补货'], sentiment: 'neutral', url: 'https://s.weibo.com/', region: '福州' },
    { title: '#湿热天气养生# 藿香正气搜索量上涨 70%', content: '微博健康 KOL 建议湿热节气家中常备藿香正气类中成药。', tags: ['湿热', '养生', '中成药'], sentiment: 'positive', url: 'https://s.weibo.com/', region: '全国' },
    { title: '#儿童退烧药怎么选# 家长热议', content: '布洛芬 vs 对乙酰氨基酚对比，药师在线答疑。', tags: ['儿童', '退烧', '布洛芬'], sentiment: 'concern', url: 'https://s.weibo.com/', region: '全国' },
    { title: '#NMPA 新药获批# 国产降糖药 SGLT2 抑制剂上市', content: '国家药监局批准国产创新降糖药，可改善心衰预后。', tags: ['NMPA', '新药', '降糖'], sentiment: 'positive', url: 'https://s.weibo.com/', region: '全国' },
    { title: '#厦门花粉浓度# 思明区达中等偏高', content: '过敏体质人群外出建议佩戴口罩，可备氯雷他定。', tags: ['厦门', '花粉', '过敏'], sentiment: 'neutral', url: 'https://s.weibo.com/', region: '厦门' },
    { title: '#泉州湿热# 藿香正气水销量翻倍', content: '泉州网友晒出门店藿香正气水抢购现场。', tags: ['泉州', '湿热', '藿香'], sentiment: 'neutral', url: 'https://s.weibo.com/', region: '泉州' },
    { title: '#慢性病用药# 冬季血压波动提醒', content: '心内科医生提醒冬季高血压患者需监测血压，调整用药。', tags: ['慢性病', '高血压', '冬季'], sentiment: 'neutral', url: 'https://s.weibo.com/', region: '全国' },
    { title: '#NMPA 通报# 某批次胃药召回', content: '国家药监局通报某批次铝碳酸镁片因溶出度不合格启动三级召回。', tags: ['NMPA', '召回', '胃药'], sentiment: 'negative', url: 'https://s.weibo.com/', region: '全国' },
  ],
  Xiaohongshu: [
    { title: '家庭常备药箱清单 (2025 冬季版)', content: '退烧、感冒、肠胃、外伤四大类必备，附购买渠道。', tags: ['常备药', '清单', '家庭'], sentiment: 'positive', url: 'https://www.xiaohongshu.com/', region: '全国' },
    { title: '宝宝发烧 38.5℃ 在家怎么处理', content: '物理降温 + 退烧药使用经验分享，3 天退烧记录。', tags: ['宝宝', '退烧', '经验'], sentiment: 'positive', url: 'https://www.xiaohongshu.com/', region: '全国' },
    { title: '换季过敏性鼻炎自救指南', content: '氯雷他定 + 鼻喷 + 空气净化器三件套。', tags: ['过敏', '鼻炎', '自救'], sentiment: 'positive', url: 'https://www.xiaohongshu.com/', region: '全国' },
    { title: '维 C 真的是越贵越好吗', content: '药店药师拆解泡腾片 vs 咀嚼片 vs 软糖。', tags: ['维C', '测评', '营养'], sentiment: 'neutral', url: 'https://www.xiaohongshu.com/', region: '全国' },
    { title: '孕妇感冒能不能吃药', content: '妇产科医生建议：对乙酰氨基酚为孕期相对安全选项。', tags: ['孕妇', '感冒', '安全用药'], sentiment: 'neutral', url: 'https://www.xiaohongshu.com/', region: '全国' },
    { title: '药店店员不会告诉你的 5 个秘密', content: '联合用药 / 毛利 / 推荐机制内幕。', tags: ['药店', '内幕', '联合用药'], sentiment: 'neutral', url: 'https://www.xiaohongshu.com/', region: '全国' },
    { title: '胃药饭前吃还是饭后吃', content: 'PPI / 铝碳酸镁 / 莫沙必利服用时间图解。', tags: ['胃药', '服用时间', '图解'], sentiment: 'positive', url: 'https://www.xiaohongshu.com/', region: '全国' },
    { title: '雾化在家做可行吗', content: '医生建议儿童雾化需医师处方，不建议家长自行操作。', tags: ['雾化', '儿童', '处方'], sentiment: 'neutral', url: 'https://www.xiaohongshu.com/', region: '全国' },
    { title: '厦门过敏季延长 鼻喷使用记录', content: '思明区花粉敏感者 30 天糠酸莫米松使用心得。', tags: ['厦门', '过敏', '鼻喷'], sentiment: 'positive', url: 'https://www.xiaohongshu.com/', region: '厦门' },
    { title: '泉州祛湿茶饮 6 款实测', content: '本地博主测评 6 款祛湿茶饮，藿香正气水饮片对比。', tags: ['泉州', '祛湿', '茶饮'], sentiment: 'positive', url: 'https://www.xiaohongshu.com/', region: '泉州' },
  ],
  GovNotice: [
    { title: '福建省卫健委关于做好冬春季流感防控工作的通知', content: '要求各级医疗机构、药店加强抗病毒药与防护物资储备。', tags: ['福建', '流感', '政策'], sentiment: 'neutral', url: 'http://wjw.fujian.gov.cn/', region: '福建' },
    { title: '福建 CDC 流感周报：本周 ILI% 上升至 8.4%', content: '流感样病例就诊比例明显上升，以 A(H3N2) 为主。', tags: ['福建', 'CDC', '流感周报'], sentiment: 'concern', url: 'https://www.fjcdc.com.cn/', region: '福建' },
    { title: 'NMPA 关于发布 2025 年药品上市许可持有人年度报告的公告', content: '强调持有人主体责任，要求强化药品全生命周期管理。', tags: ['NMPA', 'MAH', '年度报告'], sentiment: 'neutral', url: 'https://www.nmpa.gov.cn/', region: '全国' },
    { title: 'NMPA 通报：某批次铝碳酸镁片三级召回', content: '涉事批次溶出度不符合标准，可能影响疗效。', tags: ['NMPA', '召回', '胃药'], sentiment: 'negative', url: 'https://www.nmpa.gov.cn/', region: '全国' },
    { title: '福建 CDC 老年人流感疫苗免费接种通知', content: '福州、厦门、泉州三地 65 岁以上老人可到社区免费接种四价流感疫苗。', tags: ['福建', '疫苗', '老人'], sentiment: 'positive', url: 'https://www.fjcdc.com.cn/', region: '福建' },
  ],
}

// 门店 → region 映射（S001 福州看全国+福州，S002 厦门+全国，S003 泉州+全国）
const STORE_REGIONS = {
  S001: new Set(['全国', '福建', '福州']),
  S002: new Set(['全国', '福建', '厦门']),
  S003: new Set(['全国', '福建', '泉州']),
}

const KEYWORD_TREND = [
  { keyword: '流感', value: 92 },
  { keyword: '连花清瘟', value: 78 },
  { keyword: '布洛芬', value: 65 },
  { keyword: '过敏', value: 54 },
  { keyword: '湿热', value: 47 },
  { keyword: '高血压', value: 41 },
  { keyword: '维C', value: 35 },
]

const SEVEN_DAY = [
  { date: '12-09', Weibo: 22, Xiaohongshu: 18, GovNotice: 3 },
  { date: '12-10', Weibo: 28, Xiaohongshu: 21, GovNotice: 4 },
  { date: '12-11', Weibo: 31, Xiaohongshu: 24, GovNotice: 2 },
  { date: '12-12', Weibo: 35, Xiaohongshu: 27, GovNotice: 3 },
  { date: '12-13', Weibo: 41, Xiaohongshu: 30, GovNotice: 5 },
  { date: '12-14', Weibo: 48, Xiaohongshu: 33, GovNotice: 4 },
  { date: '12-15', Weibo: 56, Xiaohongshu: 36, GovNotice: 6 },
]

export const SENTIMENT_SOURCES = ['All', 'Weibo', 'Xiaohongshu', 'GovNotice']

export function getSentimentMock(storeId) {
  const sid = storeId || 'S001'
  const allowed = STORE_REGIONS[sid] || STORE_REGIONS.S001
  const items = []
  for (const [source, arr] of Object.entries(SOURCES)) {
    for (const it of arr) {
      if (allowed.has(it.region)) {
        items.push({ ...it, source, crawled_at: new Date().toISOString() })
      }
    }
  }
  return { items, keyword_trend: KEYWORD_TREND, seven_day_series: SEVEN_DAY, storeId: sid }
}
