import { ref, onMounted, watch } from 'vue'

// 共享 scope 加载器 — 防过期请求 (token guard) + 统一 loading/error 状态
// fetcher: () => Promise<any>，assign(result): 写回组件本地 refs
// watchSource: 响应式源 (ref / getter)，变化时自动重载
export function useScopedLoader(fetcher, assign, { watchSource, immediate = true } = {}) {
  const loading = ref(true)
  const error = ref(null)
  const token = ref(0)

  async function run() {
    const t = ++token.value
    loading.value = true
    try {
      const result = await fetcher()
      if (t !== token.value) return
      if (assign) assign(result)
    } catch (e) {
      if (t !== token.value) return
      console.error('[useScopedLoader]', e)
      error.value = e
    } finally {
      if (t === token.value) loading.value = false
    }
  }

  if (immediate) onMounted(run)
  if (watchSource) watch(watchSource, run)

  return { loading, error, reload: run }
}
