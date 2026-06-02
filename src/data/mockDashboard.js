export const STORES = [
  { store_id: 'S001', name: '福州鼓楼东街店', city: '福州市', region: '鼓楼区', is_demo: true },
  { store_id: 'S002', name: '厦门思明湖滨店', city: '厦门市', region: '思明区', is_demo: false },
  { store_id: 'S003', name: '泉州丰泽田安店', city: '泉州市', region: '丰泽区', is_demo: false },
]

const KPI_BY_STORE = {
  S001: {
    coverage_label: '热门商品覆盖率',
    coverage_value: '87%',
    coverage_trend: '较上周 +3%',
    coverage_progress: 87,
    gross_profit: '8,256',
    margin_rate: '12.4%',
    margin_status: 'low',
    top_category: '感冒用药 / 中成药',
  },
  S002: {
    coverage_label: '热门商品覆盖率',
    coverage_value: '82%',
    coverage_trend: '较上周 +5%',
    coverage_progress: 82,
    gross_profit: '9,142',
    margin_rate: '13.8%',
    margin_status: 'ok',
    top_category: '过敏 / 鼻喷用药',
  },
  S003: {
    coverage_label: '热门商品覆盖率',
    coverage_value: '79%',
    coverage_trend: '较上周 +1%',
    coverage_progress: 79,
    gross_profit: '6,938',
    margin_rate: '11.6%',
    margin_status: 'low',
    top_category: '清热解暑 / 中成药',
  },
}

const ALERTS_BY_STORE = {
  S001: [
    { agency: 'NMPA', type: '药品召回', title: '某批次铝碳酸镁片启动三级召回 (2025-12-15)', risk_level: 'High' },
    { agency: '福建卫健委', type: '季节性防控', title: '冬春季流感与呼吸道传染病防控工作通知', risk_level: 'Medium' },
    { agency: '福建 CDC', type: '疫情速讯', title: '本周流感样病例就诊指数环比上升 18%', risk_level: 'Medium' },
    { agency: 'NMPA', type: '不良反应', title: '2025 年第 4 季度药品不良反应监测年度报告发布', risk_level: 'Low' },
    { agency: '福建 CDC', type: '疫苗提示', title: '老年人流感疫苗免费接种工作启动', risk_level: 'Low' },
  ],
  S002: [
    { agency: 'NMPA', type: '药品召回', title: '某批次铝碳酸镁片启动三级召回 (2025-12-15)', risk_level: 'High' },
    { agency: '厦门卫健委', type: '季节性防控', title: '厦门花粉浓度偏高，过敏季延长', risk_level: 'Medium' },
    { agency: '福建 CDC', type: '疫情速讯', title: '流感样病例就诊指数环比上升 12%', risk_level: 'Medium' },
    { agency: 'NMPA', type: '新药审批', title: '国产 SGLT2 抑制剂获批，关注心衰患者用药', risk_level: 'Low' },
  ],
  S003: [
    { agency: 'NMPA', type: '药品召回', title: '某批次铝碳酸镁片启动三级召回 (2025-12-15)', risk_level: 'High' },
    { agency: '福建 CDC', type: '疫情速讯', title: '南方湿热持续，肠胃用药需求增加', risk_level: 'Medium' },
    { agency: '福建卫健委', type: '季节性防控', title: '冬春季流感与呼吸道传染病防控工作通知', risk_level: 'Medium' },
    { agency: '福建 CDC', type: '疫苗提示', title: '老年人流感疫苗免费接种工作启动', risk_level: 'Low' },
  ],
}

export function getDashboardMock(storeId) {
  const sid = storeId || STORES[0].store_id
  return {
    report_date: new Date().toISOString().slice(0, 10),
    kpiData: KPI_BY_STORE[sid] || KPI_BY_STORE.S001,
    alerts: ALERTS_BY_STORE[sid] || ALERTS_BY_STORE.S001,
    suggestions: [],
    insights: [],
    stores: STORES,
    storeId: sid,
  }
}
