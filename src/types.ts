export type AccountType = 'LDAP' | 'Локальная'

export interface AccountFormInput {
  labelRaw: string
  type: AccountType | ''
  login: string
  password: string
}

export interface AccountRecord {
  id: string
  label: Array<{ text: string }>
  type: AccountType
  login: string
  password: string | null
}

export function parseLabelToArray(raw: string): Array<{ text: string }> {
  return raw
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .map((s) => ({ text: s }))
}

export function validateAccount(input: AccountFormInput): {
  valid: boolean
  errors: Partial<Record<keyof AccountFormInput, string>>
} {
  const errors: Partial<Record<keyof AccountFormInput, string>> = {}

  if (input.labelRaw.length > 50) {
    errors.labelRaw = 'Максимум 50 символов'
  }

  if (!input.type) {
    errors.type = 'Обязательное поле'
  }

  if (!input.login) {
    errors.login = 'Обязательное поле'
  } else if (input.login.length > 100) {
    errors.login = 'Максимум 100 символов'
  }

  const requiresPassword = input.type === 'Локальная'
  if (requiresPassword) {
    if (!input.password) {
      errors.password = 'Обязательное поле'
    } else if (input.password.length > 100) {
      errors.password = 'Максимум 100 символов'
    }
  }

  return { valid: Object.keys(errors).length === 0, errors }
}


