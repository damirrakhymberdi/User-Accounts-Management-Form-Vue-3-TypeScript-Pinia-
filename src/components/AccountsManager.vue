<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAccountsStore } from '@/stores/accounts'
import type { AccountFormInput, AccountType } from '@/types'
import { validateAccount } from '@/types'
import { Plus, Delete } from '@element-plus/icons-vue'

const store = useAccountsStore()

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
}

function removeRow(localId: string) {
  rows.value = rows.value.filter((r) => r.id !== localId)
  store.remove(localId)
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
  <div class="accounts">
    <el-card shadow="never" class="card">
      <div class="header">
        <div class="title">
          <h2>Учетные записи</h2>
          <span class="hint">{{ hint }}</span>
        </div>
        <el-button type="primary" @click="addRow" :icon="Plus">Добавить</el-button>
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

        <div v-for="row in rows" :key="row.id" class="item">
          <div class="col col-label">
            <el-form-item :error="row.errors.labelRaw">
              <el-input
                v-model="row.model.labelRaw"
                placeholder="Метки через ;"
                :maxlength="50"
                @blur="onBlurOrChange(row)"
              />
            </el-form-item>
          </div>
          <div class="col col-type">
            <el-form-item :error="row.errors.type">
              <el-select
                v-model="row.model.type"
                placeholder="Выберите тип"
                @change="() => onBlurOrChange(row)"
              >
                <el-option v-for="t in accountTypes" :key="t" :label="t" :value="t" />
              </el-select>
            </el-form-item>
          </div>
          <div class="col col-login">
            <el-form-item :error="row.errors.login">
              <el-input
                v-model="row.model.login"
                placeholder="Логин"
                :maxlength="100"
                @blur="onBlurOrChange(row)"
              />
            </el-form-item>
          </div>
          <div class="col col-password">
            <template v-if="row.model.type === 'Локальная'">
              <el-form-item :error="row.errors.password">
                <el-input
                  v-model="row.model.password"
                  placeholder="Пароль"
                  show-password
                  :maxlength="100"
                  @blur="onBlurOrChange(row)"
                />
              </el-form-item>
            </template>
            <template v-else>
              <span class="muted">Скрыто для LDAP</span>
            </template>
          </div>
          <div class="col col-actions actions">
            <el-button type="danger" plain :icon="Delete" @click="removeRow(row.id)">
              Удалить
            </el-button>
          </div>
        </div>
      </div>

      <el-alert
        v-if="!rows.length"
        title="Нет добавленных записей"
        type="info"
        :closable="false"
        show-icon
        class="mt-12"
      />
    </el-card>

    <el-card v-if="store.accounts.length" shadow="never" class="card saved">
      <template #header>
        <div class="card-header">
          <span>Сохраненные записи</span>
        </div>
      </template>
      <pre>{{ store.accounts }}</pre>
    </el-card>
  </div>
  
</template>

<style scoped>
.accounts { display: flex; flex-direction: column; gap: 16px; padding: 16px; }
.card { border-radius: 10px; }
.header { display: flex; justify-content: space-between; align-items: center; gap: 12px; }
.title { display: flex; flex-direction: column; gap: 4px; }
.title h2 { margin: 0; font-weight: 700; }
.hint { color: #606266; font-size: 12px; }
.list { display: flex; flex-direction: column; gap: 12px; }
.labels, .item { display: grid; grid-template-columns: 2fr 1.2fr 1.6fr 1.6fr 0.9fr; gap: 12px; align-items: start; }
.labels { font-weight: 600; color: #606266; }
.col { width: 100%; }
.actions { display: flex; align-items: center; }
.muted { color: #909399; font-size: 13px; }
.saved pre { background: #f6f8fa; padding: 12px; border-radius: 8px; overflow: auto; }
.mt-12 { margin-top: 12px; }
</style>


