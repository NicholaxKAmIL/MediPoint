// 采购决策 (补货 + 促销) — 福建门店
export const SUGGESTIONS = [
  {
    id: 'D-001',
    topic: '流感高峰 — 感冒退烧类',
    action: 'Restock',
    related_category: '感冒用药 / 退烧',
    reason: '福建 CDC 通报流感指数环比上升 18%，微博 #流感# 话题阅读量 +220%。',
    confidence: 'A',
    sources: [
      { label: '福建 CDC 流感周报', url: 'https://www.fjcdc.com.cn/' },
      { label: '微博热搜 #全国流感进入高峰#', url: 'https://s.weibo.com/' },
    ],
    items: [
      { sku_id: 'SKU-FZ-001', name: '连花清瘟胶囊 (24粒)', stock: 12, margin: 32.5, sales_7d: 28, status: 'Critical' },
      { sku_id: 'SKU-FZ-002', name: '布洛芬缓释胶囊 (20粒)', stock: 18, margin: 28.0, sales_7d: 22, status: 'Critical' },
    ],
    talking_points: '近期流感活动明显上升，建议提前 1-2 天服用连花清瘟，可搭配布洛芬用于退烧。',
  },
  {
    id: 'D-002',
    topic: '换季过敏 — 鼻喷 / 抗组胺',
    action: 'Restock',
    related_category: '过敏 / 鼻喷',
    reason: '小红书「换季过敏」笔记数 +85%，厦门地区花粉指数偏高。',
    confidence: 'B',
    sources: [{ label: '小红书 #换季过敏# 话题', url: 'https://www.xiaohongshu.com/' }],
    items: [
      { sku_id: 'SKU-FZ-010', name: '氯雷他定片 (12片)', stock: 24, margin: 30.0, sales_7d: 12, status: 'Warning' },
    ],
    talking_points: '换季鼻痒、打喷嚏多为过敏性鼻炎，可先尝试氯雷他定 1 片/日。',
  },
  {
    id: 'D-003',
    topic: '清热解暑 — 藿香正气',
    action: 'Restock',
    related_category: '中成药 / 肠胃',
    reason: '南方湿热天气持续，藿香正气类搜索量显著上升。',
    confidence: 'B',
    sources: [{ label: '微博 #南方湿热# 话题', url: 'https://s.weibo.com/' }],
    items: [
      { sku_id: 'SKU-FZ-021', name: '藿香正气水 (10支)', stock: 22, margin: 26.0, sales_7d: 14, status: 'Warning' },
    ],
    talking_points: '暑湿感冒伴肠胃不适可推荐藿香正气水；驾驶员请改用无醇剂型。',
  },
  {
    id: 'D-004',
    topic: '库存积压 — 维 C 泡腾片',
    action: 'Promotion',
    related_category: '维生素 / 营养',
    reason: '本店该 SKU 库存 230 盒，远超安全水位 (50)，需要清库。',
    confidence: 'A',
    sources: [{ label: '内部 ERP 库存报表', url: '#' }],
    items: [
      { sku_id: 'SKU-FZ-100', name: '维 C 泡腾片 (20片装)', stock: 230, margin: 45.0, sales_7d: 4, status: 'Overstock' },
    ],
    talking_points: '可搭配感冒类商品做「防护组合」促销，店员主动推荐提升客单价。',
  },
  {
    id: 'D-005',
    topic: '库存积压 — 咽喉含片',
    action: 'Promotion',
    related_category: '咽喉 / 含片',
    reason: '库存 180 盒远超安全水位，建议捆绑销售或搭赠清库。',
    confidence: 'C',
    sources: [{ label: '内部 ERP 库存报表', url: '#' }],
    items: [
      { sku_id: 'SKU-FZ-101', name: '复方草珊瑚含片 (16片)', stock: 180, margin: 38.0, sales_7d: 6, status: 'Overstock' },
    ],
    talking_points: '教师 / 销售 / 直播主播可推荐复方草珊瑚含片缓解咽喉不适。',
  },
]

export function getDecisionsMock() {
  return {
    date: new Date().toISOString().slice(0, 10),
    restock: SUGGESTIONS.filter(s => s.action === 'Restock'),
    promotion: SUGGESTIONS.filter(s => s.action === 'Promotion'),
  }
}
