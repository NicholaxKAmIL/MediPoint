<script setup>
import { ref, onMounted, computed, nextTick } from 'vue'
import axios from 'axios'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

// ⚡️ 設定 API 連線位置
const API_BASE_URL = 'http://localhost:8000' 

// --- 狀態管理 ---
const loading = ref(true)
const reportDate = ref('2025-10-30') 
const kpiData = ref({
  coverage_label: '讀取中...',
  coverage_value: '-',
  coverage_trend: '-',
  coverage_progress: 0,
  gross_profit: '-',
  margin_rate: '-',
  margin_status: 'high',
  top_category: '-'
})
const alerts = ref([])
const suggestions = ref([])
const insights = ref([])

// 互動狀態
const showToast = ref(false) 
const toastMessage = ref('')
const showModal = ref(false) 
const currentModalData = ref({}) 
const activeFilter = ref('All')

// --- 計算屬性 ---
const filteredInsights = computed(() => {
  let list = insights.value || []
  if (activeFilter.value === 'All') {
    return list
  } else if (activeFilter.value === 'News') {
    return list.filter(i => i.source === 'GoogleNews')
  } else {
    return list.filter(i => i.source === activeFilter.value)
  }
})

// --- 輔助函式 ---
const getMarginColor = (margin) => {
  const val = parseFloat(margin)
  if (val >= 30) return 'text-primary bg-primary-50 border-primary-100'
  if (val >= 15) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
  return 'text-red-600 bg-red-50 border-red-200'
}

const getStockStatus = (qty) => {
  if (qty <= 30) return { label: '庫存告急', color: 'text-red-600', dot: 'bg-red-500', text: '急需進貨' }
  if (qty <= 60) return { label: '庫存偏低', color: 'text-yellow-600', dot: 'bg-yellow-500', text: '觀察' }
  return { label: '庫存充足', color: 'text-primary', dot: 'bg-primary', text: '庫存高' }
}

// --- 互動功能 ---

const handleCsvExport = () => {
  const headers = ['報表日期', '決策主題', '關聯品類', 'SKU編號', '商品名稱', '當前庫存', '毛利率', '建議行動', '銷售話術/備註'];
  const rows = [];
  rows.push(headers.join(','));

  suggestions.value.forEach(suggestion => {
    if (suggestion.items && suggestion.items.length > 0) {
      suggestion.items.forEach(item => {
        const safeName = `"${item.name}"`; 
        const safeTalk = `"${suggestion.talking_points.replace(/"/g, '""')}"`; 
        const row = [
          reportDate.value, suggestion.topic, suggestion.related_category, item.sku_id, safeName, item.stock, `${item.margin}%`, suggestion.action === 'Restock' ? '建議補貨' : '建議促銷', safeTalk
        ];
        rows.push(row.join(','));
      });
    }
  });

  const csvContent = "\uFEFF" + rows.join("\n");
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `MediPoint_採購單_${reportDate.value}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  showToastMessage("採購單 (CSV) 下載成功！")
}

// 2. 匯出專業 PDF
const handlePdfExport = async () => {
  // 抓取我們專門為了 PDF 設計的隱藏區塊
  const element = document.getElementById('pdf-report'); 
  if (!element) return;

  showToastMessage("正在生成專業報表，請稍候...", 5000)

  try {
    // 等待 Vue 渲染完成 (確保隱藏區塊有資料)
    await nextTick();

    const canvas = await html2canvas(element, {
      scale: 2, // 高解析度
      useCORS: true,
      logging: false,
      windowWidth: 1200 // 模擬桌面寬度以確保排版正確
    });

    const imgData = canvas.toDataURL('image/png');
    
    // 設定 A4 PDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    // 計算等比例縮放
    const imgProps = pdf.getImageProperties(imgData);
    const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;
    
    // 如果內容太長超過一頁，這裡可以做分頁邏輯，但目前先做單頁縮放
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight);
    pdf.save(`MediPoint_週報_${reportDate.value}.pdf`);
    
    showToastMessage("PDF 週報下載成功！")
  } catch (error) {
    console.error("PDF 生成失敗:", error);
    alert("PDF 生成失敗");
  }
}

const showToastMessage = (msg, duration=3000) => {
  toastMessage.value = msg
  showToast.value = true
  setTimeout(() => { showToast.value = false }, duration)
}

const openScriptModal = (item) => {
  currentModalData.value = {
    title: item.topic,
    category: item.related_category,
    intro: item.talking_points,
    checkpoints: [
      '詢問顧客症狀持續天數',
      '確認是否有藥物過敏史',
      '若為兒童，請依照體重計算劑量'
    ],
    upsell: '建議搭配：維他命 C 發泡錠（提升免疫力）'
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const fetchDashboard = async () => {
  loading.value = true
  try {
    const response = await axios.get(`${API_BASE_URL}/api/dashboard/weekly-report`)
    const data = response.data
    
    reportDate.value = data.report_date
    kpiData.value = data.kpiData
    alerts.value = data.alerts
    suggestions.value = data.suggestions
    insights.value = data.insights

  } catch (error) {
    console.error("API 連線失敗:", error)
    alert(`連線失敗！請確認後端網址。\n目標: ${API_BASE_URL}`)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchDashboard()
})
</script>

<template>
  <div class="min-h-screen bg-slate-50 font-sans text-slate-800 pb-20">
    
    <!-- Navbar -->
    <header class="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center gap-3">
            <img src="@/assets/logo.png" alt="藥點 MediPoint" class="h-8 md:h-10 w-auto object-contain" />
            <div class="hidden md:block border-l border-slate-300 pl-3 ml-1">
              <h1 class="text-lg font-bold text-slate-900 tracking-tight leading-tight">藥點 MediPoint</h1>
              <p class="text-[10px] text-slate-500 leading-none">ERP 智慧商情系統</p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <div class="hidden md:flex items-center gap-2">
              <button @click="handlePdfExport" class="text-xs bg-slate-100 text-slate-700 px-3 py-2 rounded-md font-medium hover:bg-slate-200 transition-all flex items-center gap-1 border border-slate-300">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
                </svg>
                下載 PDF 報表
              </button>
              <button @click="handleCsvExport" class="text-xs bg-primary text-white px-3 py-2 rounded-md font-medium hover:bg-green-700 transition-all shadow-sm flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                匯出
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Alerts Ticker -->
    <div v-if="alerts.length" class="bg-orange-50 border-b border-orange-100">
      <div class="max-w-7xl mx-auto px-4 py-2 overflow-hidden">
        <div class="flex gap-6 animate-marquee whitespace-nowrap">
          <div v-for="(alert, idx) in alerts" :key="idx" class="flex items-center gap-2 text-sm text-orange-800">
            <span class="bg-orange-200 text-orange-900 text-[10px] font-bold px-2 py-0.5 rounded">
              {{ alert.agency }}
            </span>
            <span class="font-medium">{{ alert.title }}</span>
          </div>
        </div>
      </div>
    </div>

    <main id="dashboard-content" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 bg-slate-50">
      
      <!-- 1. KPI Stats -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div class="flex justify-between items-start">
            <p class="text-xs text-slate-500 font-medium">{{ kpiData.coverage_label }}</p>
            <span class="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded">Top 20</span>
          </div>
          <div class="flex items-end gap-2 mt-1">
            <span class="text-2xl font-bold text-slate-900">{{ kpiData.coverage_value }}</span>
            <span class="text-xs font-bold mb-1 text-primary">{{ kpiData.coverage_trend }}</span>
          </div>
          <div class="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div class="bg-primary h-1.5 rounded-full transition-all duration-1000" :style="`width: ${kpiData.coverage_progress}%`"></div>
          </div>
        </div>

        <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p class="text-xs text-slate-500 font-medium">今日毛利額</p>
          <div class="flex items-end gap-2 mt-1">
            <span class="text-2xl font-bold text-slate-900">${{ kpiData.gross_profit }}</span>
          </div>
        </div>

        <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p class="text-xs text-slate-500 font-medium">平均毛利率</p>
          <div class="flex items-end gap-2 mt-1">
            <span :class="`text-2xl font-bold ${kpiData.margin_status === 'low' ? 'text-orange-500' : 'text-primary'}`">
              {{ kpiData.margin_rate }}
            </span>
            <span class="text-xs text-slate-400 mb-1">偏低</span>
          </div>
        </div>

        <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p class="text-xs text-slate-500 font-medium">熱銷品類</p>
          <div class="flex items-end gap-2 mt-1">
            <span class="text-xl font-bold text-slate-900">{{ kpiData.top_category }}</span>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <!-- 2. Action Plan -->
        <div class="lg:col-span-2 space-y-6">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span class="w-2 h-6 bg-primary rounded-full"></span>
              AI 備貨與行動建議
            </h2>
          </div>

          <div v-if="loading" class="p-12 text-center text-slate-400">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2"></div>
            <p>AI 正在分析 ERP 與輿情數據...</p>
          </div>

          <div v-else class="space-y-4">
            <div v-for="(item, index) in suggestions" :key="index" 
                 class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-all duration-200 group">
              
              <div class="p-5 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
                <div>
                  <div class="flex items-center gap-3 mb-2">
                    <span :class="`px-2.5 py-1 rounded-md text-xs font-bold ${item.action === 'Restock' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`">
                      {{ item.action === 'Restock' ? '建議補貨' : '行銷推廣' }}
                    </span>
                    <h3 class="text-base font-bold text-slate-800">{{ item.topic }}</h3>
                  </div>
                  <p class="text-sm text-slate-600">{{ item.reason }}</p>
                </div>
                <div class="text-right">
                   <span class="text-xs text-slate-400 block mb-1">關聯品類</span>
                   <span class="text-sm font-medium text-slate-700 bg-white px-2 py-1 rounded border border-slate-200">
                     {{ item.related_category }}
                   </span>
                </div>
              </div>

              <div class="p-5">
                <div class="overflow-x-auto">
                  <table class="w-full text-sm text-left">
                    <thead class="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                      <tr>
                        <th class="px-2 py-2">商品名稱 (SKU)</th>
                        <th class="px-2 py-2">當前庫存</th>
                        <th class="px-2 py-2">毛利率</th>
                        <th class="px-2 py-2 text-right">狀態</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                      <tr v-for="sku in item.items" :key="sku.sku_id" class="hover:bg-slate-50 transition-colors">
                        <td class="px-2 py-3 font-medium text-slate-800">
                          {{ sku.name }}
                          <span class="block text-[10px] text-slate-400 font-normal">{{ sku.sku_id }}</span>
                        </td>
                        <td class="px-2 py-3">
                          <div class="flex items-center gap-2">
                            <span :class="`w-2 h-2 rounded-full ${getStockStatus(sku.stock).dot}`"></span>
                            <span :class="getStockStatus(sku.stock).color + ' font-bold'">{{ sku.stock }}</span>
                            <span class="text-[10px] text-slate-400">/ 盒</span>
                          </div>
                        </td>
                        <td class="px-2 py-3">
                          <span :class="`px-2 py-0.5 rounded text-xs font-medium border ${getMarginColor(sku.margin)}`">
                            {{ sku.margin }}%
                          </span>
                        </td>
                        <td class="px-2 py-3 text-right">
                           <span :class="`text-xs font-bold ${getStockStatus(sku.stock).color}`">
                             {{ getStockStatus(sku.stock).text }}
                           </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div @click="openScriptModal(item)" class="mt-4 bg-primary-50 rounded-lg p-3 flex gap-3 items-start cursor-pointer hover:bg-green-100 transition-colors border border-transparent hover:border-primary-200">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 text-yellow-500 flex-shrink-0">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 18v-1.946a2.207 2.207 0 01-.518-3.58C13.341 10.817 15 9.318 15 8c0-3.866-3.582-7-8-7s-8 3.134-8 7c0 1.318 1.659 2.817 3.518 4.474a2.207 2.207 0 01-.518 3.58V18m3-12h.01M12 18a1.5 1.5 0 01-3 0" />
                  </svg>
                  <div class="w-full">
                    <div class="flex justify-between items-center">
                        <span class="text-xs font-bold text-primary-700 uppercase">藥師銷售話術 (點擊查看詳情)</span>
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
                    <p class="text-sm text-green-900 mt-1 leading-relaxed">
                      {{ item.talking_points }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 3. 右側：輿情脈絡 (UI 優化版) -->
        <div class="lg:col-span-1 space-y-6">
          <div class="flex items-center justify-between mb-2">
            <h2 class="text-lg font-bold text-slate-900">輿情脈絡 (證據)</h2>
          </div>
          
          <!-- 篩選按鈕 -->
          <div class="flex gap-2 mb-3 overflow-x-auto pb-1 scrollbar-hide">
            <button 
              v-for="tab in ['All', 'PTT', 'Dcard', 'News']" :key="tab"
              @click="activeFilter = tab"
              :class="`px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-200 whitespace-nowrap border ${activeFilter === tab ? 'bg-slate-800 text-white border-slate-800 shadow-md' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:border-slate-300'}`">
              {{ tab === 'All' ? '全部' : tab === 'News' ? '新聞' : tab }}
            </button>
          </div>

          <!-- 列表 (固定高度 + 捲軸) -->
          <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-4 h-[420px] overflow-y-auto custom-scrollbar">
            <div class="space-y-6">
              <div v-for="(insight, idx) in filteredInsights" :key="idx" class="relative pl-4 border-l-2 border-slate-200 hover:border-primary transition-colors group">
                <div class="mb-1 flex justify-between items-center">
                  <span :class="`text-[10px] font-bold px-2 py-0.5 rounded ${
                    insight.source === 'PTT' ? 'bg-green-100 text-green-800' : 
                    insight.source === 'Dcard' ? 'bg-blue-100 text-blue-800' : 
                    'bg-gray-100 text-gray-700'
                  }`">
                    {{ insight.source }} / {{ insight.board }}
                  </span>
                  <span class="text-[10px] text-slate-400">今日</span>
                </div>
                <h4 class="text-sm font-bold text-slate-800 mb-1 leading-snug transition-colors">
                  <a 
                    :href="insight.url" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    class="hover:text-primary hover:underline decoration-primary decoration-2 underline-offset-2 block"
                  >
                    {{ insight.title }}
                    <span class="inline-block align-middle text-slate-400 ml-0.5">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-3 h-3">
                        <path fill-rule="evenodd" d="M4.25 5.5a.75.75 0 00-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 00.75-.75v-4a.75.75 0 011.5 0v4A2.25 2.25 0 0112.75 19H4.25A2.25 2.25 0 012 16.75V6.25A2.25 2.25 0 014.25 4h4a.75.75 0 010 1.5h-4z" clip-rule="evenodd" />
                        <path fill-rule="evenodd" d="M6.194 12.753a.75.75 0 001.06.053L16.5 4.44v2.81a.75.75 0 001.5 0v-4.5a.75.75 0 00-.75-.75h-4.5a.75.75 0 000 1.5h2.553l-9.056 8.194a.75.75 0 00-.053 1.06z" clip-rule="evenodd" />
                      </svg>
                    </span>
                  </a>
                </h4>
                <p class="text-xs text-slate-500 line-clamp-3 mb-2 group-hover:text-slate-700 transition-colors">
                  {{ insight.content }}
                </p>
                <div class="flex flex-wrap gap-1">
                  <span v-for="tag in insight.tags" :key="tag" class="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">#{{ tag }}</span>
                </div>
              </div>
              
              <div v-if="filteredInsights.length === 0" class="text-center py-12 text-slate-400">
                <p class="text-sm">此分類暫無最新輿情</p>
              </div>
            </div>
          </div>

          <!-- 趨勢圖 -->
          <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
             <h3 class="text-sm font-bold text-slate-800 mb-3">熱門關鍵字趨勢</h3>
             <div class="h-32 flex items-end gap-2 px-2">
                <div class="w-1/5 bg-green-100 h-[40%] rounded-t transition-all hover:bg-green-200"></div>
                <div class="w-1/5 bg-green-200 h-[60%] rounded-t transition-all hover:bg-green-300"></div>
                <div class="w-1/5 bg-green-300 h-[50%] rounded-t transition-all hover:bg-green-400"></div>
                <div class="w-1/5 bg-green-400 h-[80%] rounded-t relative group transition-all hover:bg-green-500 cursor-pointer">
                    <div class="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        +150%
                    </div>
                </div>
                <div class="w-1/5 bg-primary h-[90%] rounded-t transition-all hover:bg-green-700 cursor-pointer"></div>
             </div>
             <div class="flex justify-between text-[10px] text-slate-400 mt-2">
                <span>10/26</span>
                <span>10/30</span>
             </div>
          </div>

        </div>
      </div>
    </main>

    <!-- Toast -->
    <div v-if="showToast" class="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 transition-all duration-500 z-50 animate-bounce-in">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg>
      <div>
        <p class="text-sm font-bold">{{ toastMessage }}</p>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-4 backdrop-blur-sm transition-opacity" @click.self="closeModal">
      <div class="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden transform transition-all scale-100">
        <div class="bg-primary px-6 py-4 flex justify-between items-center">
          <h3 class="text-white font-bold text-lg flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.499 5.24c-.967.666-2.071 1.01-3.222 1.218m-1.989.558a11.257 11.257 0 01-6.578 0m0 0a3.125 3.125 0 00-1.757 4.306 3.125 3.125 0 004.306 1.757 3.125 3.125 0 001.757-4.306 3.125 3.125 0 00-4.306-1.757H12z" /></svg>
            藥師 AI 衛教助手
          </h3>
          <button @click="closeModal" class="text-white/80 hover:text-white"><svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
        </div>
        <div class="p-6 space-y-4">
          <div><span class="text-xs font-bold text-slate-400 uppercase tracking-wide">主題</span><h4 class="text-xl font-bold text-slate-900">{{ currentModalData.title }}</h4><span class="text-sm text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded mt-1 inline-block">{{ currentModalData.category }}</span></div>
          <div class="bg-slate-50 p-4 rounded-lg border border-slate-100"><h5 class="text-sm font-bold text-slate-700 mb-2">🩺 問診檢查點</h5><ul class="space-y-2"><li v-for="(point, idx) in currentModalData.checkpoints" :key="idx" class="flex items-start gap-2 text-sm text-slate-600"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4 text-primary mt-0.5 flex-shrink-0"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" /></svg>{{ point }}</li></ul></div>
          <div><h5 class="text-sm font-bold text-slate-700 mb-1">💬 建議話術</h5><p class="text-sm text-slate-600 leading-relaxed bg-white border border-primary-100 p-3 rounded-lg shadow-sm">"{{ currentModalData.intro }}"</p></div>
          <div class="pt-2 border-t border-slate-100"><p class="text-xs font-bold text-orange-600 flex items-center gap-1"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4 text-orange-500"><path fill-rule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12a3 3 0 10-4.24-4.24 3 3 0 004.24 4.24z" clip-rule="evenodd" /></svg>{{ currentModalData.upsell }}</p></div>
          <button @click="closeModal" class="w-full py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors">我知道了</button>
        </div>
      </div>
    </div>

    <!-- 🔥 隱藏的 PDF 報表模板 (專業 A4 格式) -->
    <div id="pdf-report" class="fixed top-0 left-0 -z-50 bg-white p-8 w-[800px]" style="width: 210mm; min-height: 297mm;">
      <div class="flex justify-between items-center border-b-2 border-primary pb-4 mb-6">
        <div>
           <h1 class="text-3xl font-bold text-slate-900">MediPoint 智慧採購週報</h1>
           <p class="text-slate-500 mt-1">門市：S001 大安和平店 | 日期：{{ reportDate }}</p>
        </div>
        <div class="text-right">
           <div class="text-4xl font-bold text-primary">A+</div>
           <p class="text-xs text-slate-400">庫存健康度</p>
        </div>
      </div>

      <div class="mb-8">
        <h3 class="text-lg font-bold text-slate-800 mb-3 bg-slate-100 p-2 rounded">📊 營運關鍵指標</h3>
        <div class="grid grid-cols-4 gap-4 text-center">
           <div class="border p-3 rounded">
              <p class="text-xs text-slate-500">熱門商品覆蓋率</p>
              <p class="text-xl font-bold text-slate-900">{{ kpiData.coverage_value }}</p>
           </div>
           <div class="border p-3 rounded">
              <p class="text-xs text-slate-500">預估毛利額</p>
              <p class="text-xl font-bold text-slate-900">${{ kpiData.gross_profit }}</p>
           </div>
           <div class="border p-3 rounded">
              <p class="text-xs text-slate-500">平均毛利率</p>
              <p class="text-xl font-bold text-primary">{{ kpiData.margin_rate }}</p>
           </div>
           <div class="border p-3 rounded">
              <p class="text-xs text-slate-500">本週熱點</p>
              <p class="text-lg font-bold text-slate-900">{{ kpiData.top_category }}</p>
           </div>
        </div>
      </div>

      <div class="mb-8">
         <h3 class="text-lg font-bold text-slate-800 mb-3 bg-slate-100 p-2 rounded">🛒 智慧備貨建議清單</h3>
         <table class="w-full text-sm text-left border border-slate-200">
            <thead class="bg-slate-50 text-slate-600">
               <tr>
                 <th class="p-2 border">行動</th>
                 <th class="p-2 border">商品名稱</th>
                 <th class="p-2 border">庫存</th>
                 <th class="p-2 border">毛利</th>
                 <th class="p-2 border">備註</th>
               </tr>
            </thead>
            <tbody>
               <template v-for="sug in suggestions" :key="sug.topic">
                  <tr v-for="item in sug.items" :key="item.sku_id" class="border-b">
                     <td class="p-2 font-bold" :class="sug.action === 'Restock' ? 'text-red-600' : 'text-blue-600'">
                       {{ sug.action === 'Restock' ? '補貨' : '促銷' }}
                     </td>
                     <td class="p-2">{{ item.name }}</td>
                     <td class="p-2">{{ item.stock }}</td>
                     <td class="p-2">{{ item.margin }}%</td>
                     <td class="p-2 text-xs text-slate-500 truncate max-w-[200px]">{{ sug.topic }}</td>
                  </tr>
               </template>
            </tbody>
         </table>
      </div>

      <div>
         <h3 class="text-lg font-bold text-slate-800 mb-3 bg-slate-100 p-2 rounded">📢 重點輿情摘要</h3>
         <ul class="list-disc pl-5 space-y-2 text-sm text-slate-700">
            <li v-for="insight in insights.slice(0, 5)" :key="insight.title">
               <span class="font-bold text-slate-900">[{{ insight.source }}]</span> {{ insight.title }}
            </li>
         </ul>
      </div>

      <div class="mt-12 text-center text-xs text-slate-400 border-t pt-4">
         Powered by MediPoint AI | 生成時間：{{ new Date().toLocaleString() }}
      </div>
    </div>

  </div>
</template>

<style scoped>
/* 原本的 CSS 保持不變 */
.animate-marquee {
  animation: marquee 20s linear infinite;
}
@keyframes marquee {
  0% { transform: translateX(100%); }
  100% { transform: translateX(-100%); }
}
.animate-bounce-in {
  animation: bounceIn 0.5s cubic-bezier(0.68, -0.55, 0.27, 1.55);
}
@keyframes bounceIn {
  0% { opacity: 0; transform: translate(-50%, 20px); }
  100% { opacity: 1; transform: translate(-50%, 0); }
}

/* 隱藏 Scrollbar 但保留功能 */
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f1f1;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #ccc; 
  border-radius: 2px;
}
</style>