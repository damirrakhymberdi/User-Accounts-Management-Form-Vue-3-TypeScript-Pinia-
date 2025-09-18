import { defineStore } from 'pinia'
import type { AccountFormInput, AccountRecord, AccountType } from '@/types'
import { parseLabelToArray } from '@/types'

export const useAccountsStore = defineStore('accounts', {
  state: () => ({
    accounts: [] as AccountRecord[],
  }),
  persist: true,
  actions: {
    addEmpty(): AccountRecord {
      const record: AccountRecord = {
        id: crypto.randomUUID(),
        label: [],
        type: 'LDAP',
        login: '',
        password: null,
      }
      this.accounts.push(record)
      return record
    },
    remove(id: string) {
      this.accounts = this.accounts.filter((a) => a.id !== id)
    },
    upsertFromInput(id: string | null, input: AccountFormInput) {
      const existingIndex = id ? this.accounts.findIndex((a) => a.id === id) : -1
      const passwordValue = input.type === 'LDAP' ? null : input.password
      const base: AccountRecord = {
        id: id ?? crypto.randomUUID(),
        label: parseLabelToArray(input.labelRaw),
        type: (input.type as AccountType) ?? 'LDAP',
        login: input.login,
        password: passwordValue,
      }
      if (existingIndex >= 0) {
        this.accounts.splice(existingIndex, 1, base)
      } else {
        this.accounts.push(base)
      }
    },
  },
})


