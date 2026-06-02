// 采购决策 (补货 + 促销) — 按门店拆分
const SUGGESTIONS_BY_STORE = {
  S001: [
    {
      id: 'D-S001-1', store_id: 'S001', region: '福州',
      topic: '流感高峰 — 感冒退烧类', action: 'Restock',
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
      id: 'D-S001-2', store_id: 'S001', region: '福州',
      topic: '换季过敏 — 鼻喷 / 抗组胺', action: 'Restock',
      related_category: '过敏 / 鼻喷',
      reason: '小红书「换季过敏」笔记数 +85%。',
      confidence: 'B',
      sources: [{ label: '小红书 #换季过敏# 话题', url: 'https://www.xiaohongshu.com/' }],
      items: [
        { sku_id: 'SKU-FZ-010', name: '氯雷他定片 (12片)', stock: 24, margin: 30.0, sales_7d: 12, status: 'Warning' },
      ],
      talking_points: '换季鼻痒、打喷嚏多为过敏性鼻炎，可先尝试氯雷他定 1 片/日。',
    },
    {
      id: 'D-S001-3', store_id: 'S001', region: '福州',
      topic: '清热解暑 — 藿香正气', action: 'Restock',
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
      id: 'D-S001-4', store_id: 'S001', region: '福州',
      topic: '库存积压 — 维 C 泡腾片', action: 'Promotion',
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
      id: 'D-S001-5', store_id: 'S001', region: '福州',
      topic: '库存积压 — 咽喉含片', action: 'Promotion',
      related_category: '咽喉 / 含片',
      reason: '库存 180 盒远超安全水位，建议捆绑销售或搭赠清库。',
      confidence: 'C',
      sources: [{ label: '内部 ERP 库存报表', url: '#' }],
      items: [
        { sku_id: 'SKU-FZ-101', name: '复方草珊瑚含片 (16片)', stock: 180, margin: 38.0, sales_7d: 6, status: 'Overstock' },
      ],
      talking_points: '教师 / 销售 / 直播主播可推荐复方草珊瑚含片缓解咽喉不适。',
    },
  ],
  S002: [
    {
      id: 'D-S002-1', store_id: 'S002', region: '厦门',
      topic: '换季过敏 — 鼻喷主力补货', action: 'Restock',
      related_category: '过敏 / 鼻喷',
      reason: '厦门思明区花粉指数达中等偏高，鼻喷类目搜索 +120%。',
      confidence: 'A',
      sources: [
        { label: '小红书 #厦门花粉# 话题', url: 'https://www.xiaohongshu.com/' },
        { label: '微博 #过敏季延长#', url: 'https://s.weibo.com/' },
      ],
      items: [
        { sku_id: 'SKU-XM-001', name: '糠酸莫米松鼻喷雾剂 (60喷)', stock: 9, margin: 34.0, sales_7d: 25, status: 'Critical' },
        { sku_id: 'SKU-XM-002', name: '氯雷他定片 (12片)', stock: 14, margin: 30.0, sales_7d: 19, status: 'Critical' },
      ],
      talking_points: '过敏性鼻炎推荐糠酸莫米松每日 1 次喷鼻，急性期可联合氯雷他定。',
    },
    {
      id: 'D-S002-2', store_id: 'S002', region: '厦门',
      topic: '流感预防 — 退烧药备货', action: 'Restock',
      related_category: '感冒用药 / 退烧',
      reason: '气温骤降，门店周边社区退烧药日销上升 40%。',
      confidence: 'B',
      sources: [{ label: '福建 CDC 流感周报', url: 'https://www.fjcdc.com.cn/' }],
      items: [
        { sku_id: 'SKU-XM-010', name: '对乙酰氨基酚片 (20片)', stock: 21, margin: 27.5, sales_7d: 16, status: 'Warning' },
      ],
      talking_points: '孕妇、老人退烧首选对乙酰氨基酚，相对安全。',
    },
    {
      id: 'D-S002-3', store_id: 'S002', region: '厦门',
      topic: '皮肤护理 — 冬季润肤', action: 'Restock',
      related_category: '皮肤 / 保湿',
      reason: '小红书「厦门冬季干燥」话题热度上升，润肤霜类搜索 +60%。',
      confidence: 'B',
      sources: [{ label: '小红书 #厦门干燥#', url: 'https://www.xiaohongshu.com/' }],
      items: [
        { sku_id: 'SKU-XM-021', name: '尿素维 E 乳膏 (50g)', stock: 28, margin: 32.0, sales_7d: 11, status: 'Warning' },
      ],
      talking_points: '手部皲裂、足跟干裂可推荐尿素维 E 乳膏，每日 2-3 次。',
    },
    {
      id: 'D-S002-4', store_id: 'S002', region: '厦门',
      topic: '库存积压 — 蛋白粉礼盒', action: 'Promotion',
      related_category: '营养 / 蛋白',
      reason: '蛋白粉礼盒库存 165 盒，远超安全水位。',
      confidence: 'B',
      sources: [{ label: '内部 ERP 库存报表', url: '#' }],
      items: [
        { sku_id: 'SKU-XM-100', name: '乳清蛋白粉礼盒 (1kg)', stock: 165, margin: 42.0, sales_7d: 5, status: 'Overstock' },
      ],
      talking_points: '冬季送礼场景可推荐蛋白粉，搭配会员积分抵扣提升转化。',
    },
  ],
  S003: [
    {
      id: 'D-S003-1', store_id: 'S003', region: '泉州',
      topic: '湿热肠胃 — 藿香正气补货', action: 'Restock',
      related_category: '中成药 / 肠胃',
      reason: '泉州地区湿热持续，藿香正气类日销 +55%。',
      confidence: 'A',
      sources: [
        { label: '微博 #南方湿热# 话题', url: 'https://s.weibo.com/' },
        { label: '小红书 #泉州祛湿#', url: 'https://www.xiaohongshu.com/' },
      ],
      items: [
        { sku_id: 'SKU-QZ-001', name: '藿香正气水 (10支)', stock: 10, margin: 26.0, sales_7d: 26, status: 'Critical' },
        { sku_id: 'SKU-QZ-002', name: '保和丸 (200丸)', stock: 16, margin: 28.5, sales_7d: 18, status: 'Critical' },
      ],
      talking_points: '暑湿感冒伴肠胃不适可推荐藿香正气水；食积腹胀可搭配保和丸。',
    },
    {
      id: 'D-S003-2', store_id: 'S003', region: '泉州',
      topic: '流感高峰 — 退烧止咳', action: 'Restock',
      related_category: '感冒用药 / 退烧',
      reason: '福建 CDC 通报流感指数环比上升 18%，泉州 ILI% 同步走高。',
      confidence: 'A',
      sources: [{ label: '福建 CDC 流感周报', url: 'https://www.fjcdc.com.cn/' }],
      items: [
        { sku_id: 'SKU-QZ-010', name: '布洛芬缓释胶囊 (20粒)', stock: 20, margin: 28.0, sales_7d: 17, status: 'Warning' },
        { sku_id: 'SKU-QZ-011', name: '急支糖浆 (100ml)', stock: 18, margin: 30.0, sales_7d: 13, status: 'Warning' },
      ],
      talking_points: '咳嗽痰多推荐急支糖浆，干咳少痰可搭配右美沙芬。',
    },
    {
      id: 'D-S003-3', store_id: 'S003', region: '泉州',
      topic: '老人保健 — 钙片礼盒', action: 'Restock',
      related_category: '营养 / 钙片',
      reason: '泉州市老龄化率较高，冬季补钙需求增加。',
      confidence: 'C',
      sources: [{ label: '小红书 #老人冬季保健#', url: 'https://www.xiaohongshu.com/' }],
      items: [
        { sku_id: 'SKU-QZ-021', name: '钙尔奇 D 片 (60片)', stock: 26, margin: 31.0, sales_7d: 10, status: 'Warning' },
      ],
      talking_points: '中老年补钙推荐钙尔奇 D，每日 1 片随餐服用。',
    },
    {
      id: 'D-S003-4', store_id: 'S003', region: '泉州',
      topic: '库存积压 — 板蓝根颗粒', action: 'Promotion',
      related_category: '中成药 / 清热',
      reason: '板蓝根颗粒库存 210 盒，超安全水位 4 倍。',
      confidence: 'B',
      sources: [{ label: '内部 ERP 库存报表', url: '#' }],
      items: [
        { sku_id: 'SKU-QZ-100', name: '板蓝根颗粒 (10袋)', stock: 210, margin: 40.0, sales_7d: 6, status: 'Overstock' },
      ],
      talking_points: '可搭配感冒灵做「冬日防护组合」促销，店员主动推荐提升客单价。',
    },
    {
      id: 'D-S003-5', store_id: 'S003', region: '泉州',
      topic: '库存积压 — 创可贴大盒', action: 'Promotion',
      related_category: '外用 / 创可贴',
      reason: '创可贴库存 140 盒，建议搭赠清库。',
      confidence: 'C',
      sources: [{ label: '内部 ERP 库存报表', url: '#' }],
      items: [
        { sku_id: 'SKU-QZ-101', name: '邦迪创可贴大盒 (100片)', stock: 140, margin: 36.0, sales_7d: 4, status: 'Overstock' },
      ],
      talking_points: '可作为满赠门槛品，提升客单价与会员复购。',
    },
  ],
}

export function getDecisionsByScope(account, storeIds) {
  const ids = (storeIds && storeIds.length) ? storeIds : (account?.store_ids || ['S001'])
  const merged = []
  for (const id of ids) {
    for (const s of (SUGGESTIONS_BY_STORE[id] || [])) merged.push(s)
  }
  return {
    date: new Date().toISOString().slice(0, 10),
    restock: merged.filter(s => s.action === 'Restock'),
    promotion: merged.filter(s => s.action === 'Promotion'),
    storeIds: ids,
    stores: ids.map(id => ({ store_id: id })),
  }
}
