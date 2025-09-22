<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAccountsStore } from '@/stores/accounts'
import type { AccountFormInput, AccountType } from '@/types'
import { validateAccount } from '@/types'
import { Plus, Delete } from '@element-plus/icons-vue'

const store = useAccountsStore()

// Always dark mode
const isDarkMode = ref(true)

// Update theme
function updateTheme() {
  const html = document.documentElement
  html.classList.add('dark')
}

// Load theme on mount
onMounted(() => {
  updateTheme()
})

type LocalRow = {
  id: string
  model: AccountFormInput
  errors: Partial<Record<keyof AccountFormInput, string>>
}

const accountTypes: AccountType[] = ['LDAP', 'Локальная']

const rows = ref<LocalRow[]>([])

function createEmptyRow(): LocalRow {
  return {
    id: crypto.randomUUID(),
    model: {
      labelRaw: '',
      type: '',
      login: '',
      password: '',
    },
    errors: {},
  }
}

function addRow() {
  rows.value.push(createEmptyRow())
  // Add animation class for new row
  setTimeout(() => {
    const newRow = document.querySelector('.item:last-child')
    if (newRow) {
      newRow.classList.add('animate-in')
    }
  }, 10)
}

function removeRow(localId: string) {
  // Add exit animation
  const rowElement = document.querySelector(`[data-row-id="${localId}"]`)
  if (rowElement) {
    rowElement.classList.add('animate-out')
    setTimeout(() => {
      rows.value = rows.value.filter((r) => r.id !== localId)
      store.remove(localId)
    }, 300)
  } else {
    rows.value = rows.value.filter((r) => r.id !== localId)
    store.remove(localId)
  }
}

function onBlurOrChange(row: LocalRow) {
  const { valid, errors } = validateAccount(row.model)
  row.errors = errors
  if (!valid) return
  store.upsertFromInput(row.id, row.model)
}

const hint = computed(
  () => 'Подсказка: несколько меток через ";". Пример: test; prod; backup'
)
</script>

<template>
  <div class="accounts dark-mode">
    <el-card shadow="never" class="card container main-card">
      <div class="header">
        <div class="title">
          <h2 class="gradient-title">Учетные записи</h2>
          <span class="hint">{{ hint }}</span>
        </div>
        <el-button 
          type="primary" 
          @click="addRow" 
          :icon="Plus" 
          size="default"
          class="add-btn"
        >
          Добавить запись
        </el-button>
      </div>

      <el-divider />

      <div class="list">
        <div class="labels">
          <span class="col col-label">Метка</span>
          <span class="col col-type">Тип записи</span>
          <span class="col col-login">Логин</span>
          <span class="col col-password">Пароль</span>
          <span class="col col-actions"></span>
        </div>

        <div 
          v-for="row in rows" 
          :key="row.id" 
          class="item"
          :data-row-id="row.id"
        >
          <div class="col col-label">
            <el-form-item :error="row.errors.labelRaw" label-width="0">
              <el-input
                v-model="row.model.labelRaw"
                placeholder="Метки через ;"
                :maxlength="50"
                @blur="onBlurOrChange(row)"
                size="small"
                clearable
              />
              <div class="help">Например: dev; staging; prod</div>
            </el-form-item>
          </div>
          <div class="col col-type">
            <el-form-item :error="row.errors.type" label-width="0">
              <el-select
                v-model="row.model.type"
                placeholder="Выберите тип"
                @change="() => onBlurOrChange(row)"
                size="small"
                clearable
              >
                <el-option v-for="t in accountTypes" :key="t" :label="t" :value="t" />
              </el-select>
            </el-form-item>
          </div>
          <div class="col col-login">
            <el-form-item :error="row.errors.login" label-width="0">
              <el-input
                v-model="row.model.login"
                placeholder="Логин"
                :maxlength="100"
                @blur="onBlurOrChange(row)"
                size="small"
                clearable
              />
            </el-form-item>
          </div>
          <div class="col col-password">
            <template v-if="row.model.type === 'Локальная'">
              <el-form-item :error="row.errors.password" label-width="0">
                <el-input
                  v-model="row.model.password"
                  placeholder="Пароль"
                  show-password
                  :maxlength="100"
                  @blur="onBlurOrChange(row)"
                  size="small"
                />
              </el-form-item>
            </template>
            <template v-else>
              <el-tag size="small" type="info" effect="light">Пароль скрыт (LDAP)</el-tag>
            </template>
          </div>
          <div class="col col-actions actions">
            <el-tooltip content="Удалить" placement="top">
              <el-button 
                type="danger" 
                plain 
                :icon="Delete" 
                size="small" 
                @click="removeRow(row.id)"
                class="delete-btn"
              />
            </el-tooltip>
          </div>
        </div>
      </div>

      <el-empty
        v-if="!rows.length"
        description="Нет добавленных записей"
        class="mt-12"
      />
    </el-card>

    <el-card v-if="store.accounts.length" shadow="never" class="card saved container saved-card">
      <template #header>
        <div class="card-header">
          <span class="saved-title">Сохраненные записи</span>
        </div>
      </template>
      <div class="saved-content">
        <pre class="saved-pre">{{ store.accounts }}</pre>
      </div>
    </el-card>
  </div>
  
</template>

<style scoped>
/* CSS Variables for theming */
:root {
  --bg-primary: #ffffff;
  --bg-secondary: #f8fafc;
  --bg-card: #ffffff;
  --text-primary: #1a202c;
  --text-secondary: #4a5568;
  --text-muted: #718096;
  --border-color: #000000;
  --border-strong: #000000;
  --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  --gradient-primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --gradient-secondary: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  --accent-color: #667eea;
  --hover-bg: #f3f4f6;
}

.dark-mode {
  --bg-primary: #0f172a;
  --bg-secondary: #1e293b;
  --bg-card: #334155;
  --text-primary: #f1f5f9;
  --text-secondary: #cbd5e1;
  --text-muted: #94a3b8;
  --border-color: #475569;
  --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2);
  --shadow-lg: 0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2);
  --hover-bg: #475569;
}

/* Global styles */
* {
  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}

.accounts {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 20px;
  min-height: 100vh;
  background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%);
  position: relative;
}

.accounts::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.1) 0%, transparent 50%);
  pointer-events: none;
  z-index: -1;
}


/* Container */
.container {
  max-width: 1200px;
  margin: 0 auto;
  
}

/* Cards */
.card {
  border-radius: 16px;
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow);
  background: var(--bg-card);
  transition: all 0.3s ease;
  overflow: hidden;
  
}

.saved-card {
  border: 1px solid var(--border-color);
}

.card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}

.main-card {
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.95);
  border: 2px solid var(--border-color) !important;
}

.dark-mode .main-card {
  background: rgba(51, 65, 85, 0.95);
  border: 2px solid var(--border-color) !important;
}

/* Header */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  padding: 20px 0;
}

.title {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.gradient-title {
  margin: 0;
  font-weight: 800;
  font-size: 2rem;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: titleGlow 3s ease-in-out infinite alternate;
}

@keyframes titleGlow {
  0% { filter: brightness(1); }
  100% { filter: brightness(1.2); }
}

.hint {
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 500;
}

/* Add Button */
.add-btn {
  background: var(--gradient-primary) !important;
  border: none !important;
  border-radius: 12px !important;
  padding: 12px 24px !important;
  font-weight: 600 !important;
  box-shadow: var(--shadow) !important;
  transition: all 0.3s ease !important;
  color: white !important;
}

.add-btn:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: var(--shadow-lg) !important;
  color: white !important;
}

.add-btn:active {
  transform: translateY(0) scale(0.98);
  color: white !important;
}

.add-btn:active {
  transform: translateY(0) scale(0.98);
}

/* List */
.list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.labels, .item {
  display: grid;
  grid-template-columns: 2fr 1.2fr 1.6fr 1.6fr 0.9fr;
  gap: 16px;
  align-items: start;
  padding: 16px 20px;
}

.labels {
  font-weight: 700;
  color: var(--text-primary);
  background: var(--bg-secondary);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.col {
  width: 100%;
}

/* Items */
.item {
  padding: 20px;
  border-radius: 12px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--gradient-primary);
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.item:hover {
  background: var(--hover-bg);
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.item:hover::before {
  transform: scaleX(1);
}

/* Animations */
.animate-in {
  animation: slideInUp 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.animate-out {
  animation: slideOutDown 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 0;
  transform: translateY(-20px) scale(0.95);
}

@keyframes slideInUp {
  0% {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes slideOutDown {
  0% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
}

/* Actions */
.actions {
  display: flex;
  align-items: center;
  justify-content: center;
}

.delete-btn {
  transition: all 0.3s ease !important;
  border-radius: 8px !important;
}

.delete-btn:hover {
  transform: scale(1.1) !important;
  background: #ef4444 !important;
  color: white !important;
}

/* Help text */
.help {
  color: var(--text-muted);
  font-size: 12px;
  margin-top: 6px;
  font-weight: 500;
}

/* Saved section */
.saved-card {
  background: var(--bg-card);
}

.saved-title {
  font-weight: 700;
  font-size: 1.2rem;
  color: var(--text-primary);
}

.saved-content {
  padding: 20px;
}

.saved-pre {
  background: var(--bg-secondary);
  padding: 20px;
  border-radius: 12px;
  overflow: auto;
  border: 1px solid var(--border-color);
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 13px;
  line-height: 1.6;
  color: var(--text-primary);
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Element Plus customizations */
:deep(.el-input__wrapper) {
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background: var(--bg-primary);
  transition: all 0.3s ease;
}

:deep(.el-input__wrapper:not(.is-focus)) {
  border-color: var(--border-color);
}

:deep(.el-input__wrapper:hover) {
  border-color: var(--accent-color);
}

:deep(.el-input__wrapper.is-focus) {
  border-color: var(--accent-color);
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
}

:deep(.el-select .el-input__wrapper) {
  border-radius: 8px;
}

:deep(.el-tag) {
  border-radius: 6px;
  font-weight: 500;
}

:deep(.el-empty) {
  padding: 40px 0;
}

:deep(.el-empty__description) {
  color: var(--text-secondary);
  font-size: 16px;
}

/* Responsive */
@media (max-width: 860px) {
  .accounts {
    padding: 16px;
    gap: 16px;
  }
  
  .gradient-title {
    font-size: 1.5rem;
  }
  
  .labels {
    display: none;
  }
  
  .item {
    grid-template-columns: 1fr;
    gap: 16px;
    padding: 16px;
  }
  
  .header {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .accounts {
    padding: 12px;
  }
  
  .item {
    padding: 12px;
  }
  
  .saved-pre {
    padding: 12px;
    font-size: 11px;
  }
}

/* Loading animation */
.item.loading {
  opacity: 0.6;
  pointer-events: none;
}

.item.loading::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 20px;
  height: 20px;
  margin: -10px 0 0 -10px;
  border: 2px solid var(--accent-color);
  border-top: 2px solid transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>


