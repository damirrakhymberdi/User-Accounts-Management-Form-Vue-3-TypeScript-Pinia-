<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAccountsStore } from '@/stores/accounts'
import type { AccountFormInput, AccountType } from '@/types'
import { validateAccount } from '@/types'

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
  // Remove local row
  rows.value = rows.value.filter((r) => r.id !== localId)
  // Also try remove from store if exists
  store.remove(localId)
}

function onBlurOrChange(row: LocalRow) {
  const { valid, errors } = validateAccount(row.model)
  row.errors = errors
  if (!valid) return

  // Save/update into store. We use local row id as key; store will insert/update.
  store.upsertFromInput(row.id, row.model)
}

const hint = computed(
  () => 'Подсказка: указывайте несколько меток через ";". Пример: test; prod; backup'
)
</script>

<template>
  <div class="accounts">
    <div class="header">
      <h2>Учетные записи</h2>
      <el-button type="primary" circle @click="addRow" aria-label="Добавить">
        +
      </el-button>
    </div>

    <p class="hint">{{ hint }}</p>

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
          <el-input
            v-model="row.model.labelRaw"
            placeholder="Метки через ;"
            :maxlength="50"
            @blur="onBlurOrChange(row)"
            :class="{ error: row.errors.labelRaw }"
          />
        </div>
        <div class="col col-type">
          <el-select
            v-model="row.model.type"
            placeholder="Выберите тип"
            @change="() => onBlurOrChange(row)"
            :class="{ error: row.errors.type }"
          >
            <el-option v-for="t in accountTypes" :key="t" :label="t" :value="t" />
          </el-select>
        </div>
        <div class="col col-login">
          <el-input
            v-model="row.model.login"
            placeholder="Логин"
            :maxlength="100"
            @blur="onBlurOrChange(row)"
            :class="{ error: row.errors.login }"
          />
        </div>
        <div class="col col-password">
          <template v-if="row.model.type === 'Локальная'">
            <el-input
              v-model="row.model.password"
              placeholder="Пароль"
              show-password
              :maxlength="100"
              @blur="onBlurOrChange(row)"
              :class="{ error: row.errors.password }"
            />
          </template>
          <template v-else>
            <span class="muted">Скрыто для LDAP</span>
          </template>
        </div>
        <div class="col col-actions">
          <el-button type="danger" @click="removeRow(row.id)">Удалить</el-button>
        </div>
      </div>
    </div>

    <div v-if="store.accounts.length" class="saved">
      <h3>Сохраненные записи (state)</h3>
      <pre>{{ store.accounts }}</pre>
    </div>
  </div>
  
</template>

<style scoped>
.accounts {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.hint { color: #666; font-size: 12px; }
.list { display: flex; flex-direction: column; gap: 8px; }
.labels, .item { display: grid; grid-template-columns: 2fr 1.2fr 1.6fr 1.6fr 0.8fr; gap: 8px; align-items: center; }
.labels { font-weight: 600; color: #555; }
.col { width: 100%; }
.error :deep(.el-input__wrapper), .error :deep(.el-select .el-input__wrapper) { box-shadow: 0 0 0 1px #f56c6c inset; }
.muted { color: #999; }
.saved pre { background: #f6f6f6; padding: 8px; border-radius: 6px; overflow: auto; }
</style>


