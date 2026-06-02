// 模拟门店 — 福建 3 家
export const STORES = [
  { store_id: 'S001', name: '福州鼓楼东街店', city: '福州市', region: '鼓楼区', is_demo: true },
  { store_id: 'S002', name: '厦门思明湖滨店', city: '厦门市', region: '思明区', is_demo: false },
  { store_id: 'S003', name: '泉州丰泽田安店', city: '泉州市', region: '丰泽区', is_demo: false },
]

export const KPI = {
  coverage_label: '热门商品覆盖率',
  coverage_value: '87%',
  coverage_trend: '较上周 +3%',
  coverage_progress: 87,
  gross_profit: '8,256',
  margin_rate: '12.4%',
  margin_status: 'low',
  top_category: '感冒用药 / 中成药',
}

export const ALERTS = [
  { agency: 'NMPA', type: '药品召回', title: '某批次铝碳酸镁片启动三级召回 (2025-12-15)', risk_level: 'High' },
  { agency: '福建卫健委', type: '季节性防控', title: '冬春季流感与呼吸道传染病防控工作通知', risk_level: 'Medium' },
  { agency: '福建 CDC', type: '疫情速讯', title: '本周流感样病例就诊指数环比上升 18%', risk_level: 'Medium' },
  { agency: 'NMPA', type: '不良反应', title: '2025 年第 4 季度药品不良反应监测年度报告发布', risk_level: 'Low' },
  { agency: '福建 CDC', type: '疫苗提示', title: '老年人流感疫苗免费接种工作启动', risk_level: 'Low' },
]

export function getDashboardMock() {
  return {
    report_date: new Date().toISOString().slice(0, 10),
    kpiData: KPI,
    alerts: ALERTS,
    suggestions: [], // 由 mockDecisions 聚合
    insights: [], // 由 mockSentiment 聚合
    stores: STORES,
  }
}
