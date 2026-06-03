// 5 个演示账号 — 点击即登录 (无密码)
import { STORES } from './mockDashboard'

export const ACCOUNTS = [
  {
    email: 'zhang.hq@medipoint.cn',
    name: '张三',
    role: 'HQ Manager',
    role_label: '总部管理者',
    avatar: '👨‍💼',
    store_ids: STORES.map(s => s.store_id),
    region_scope: ['全国', '福建', '福州', '厦门', '泉州'],
    cities: ['福州市', '厦门市', '泉州市'],
  },
  {
    email: 'li.region.xm@medipoint.cn',
    name: '李四',
    role: '区域督导',
    role_label: '厦门区域督导',
    avatar: '👩‍💼',
    store_ids: ['S002'],
    region_scope: ['全国', '福建', '厦门'],
    cities: ['厦门市'],
  },
  {
    email: 'wang.region.fz@medipoint.cn',
    name: '王五',
    role: '区域督导',
    role_label: '福州区域督导',
    avatar: '🧑‍💼',
    store_ids: ['S001'],
    region_scope: ['全国', '福建', '福州'],
    cities: ['福州市'],
  },
  {
    email: 'chen.pharma.fz@medipoint.cn',
    name: '陈药师',
    role: '门店药师',
    role_label: '门店药师 · 福州',
    avatar: '👨‍⚕️',
    store_ids: ['S001'],
    region_scope: ['全国', '福建', '福州'],
    cities: ['福州市'],
  },
  {
    email: 'lin.pharma.xm@medipoint.cn',
    name: '林药师',
    role: '门店药师',
    role_label: '门店药师 · 厦门',
    avatar: '👩‍⚕️',
    store_ids: ['S002'],
    region_scope: ['全国', '福建', '厦门'],
    cities: ['厦门市'],
  },
  {
    email: 'huang.pharma.qz@medipoint.cn',
    name: '黄药师',
    role: '门店药师',
    role_label: '门店药师 · 泉州',
    avatar: '🧑‍⚕️',
    store_ids: ['S003'],
    region_scope: ['全国', '福建', '泉州'],
    cities: ['泉州市'],
  },
]

export function findAccountByEmail(email) {
  return ACCOUNTS.find(a => a.email === email) || null
}

export function visibleStoreIds(account) {
  if (!account) return []
  return account.store_ids || []
}

export function storesByIds(ids) {
  return STORES.filter(s => ids.includes(s.store_id))
}

export const ROLE_LABELS = {
  'HQ Manager': '总部管理者',
  '区域督导': '区域督导',
  '门店药师': '门店药师',
}
