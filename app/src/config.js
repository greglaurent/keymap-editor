function env(key) {
  return process.env[key] || process.env[`REACT_APP_${key}`]
}

export const apiBaseUrl = env('API_BASE_URL') || ''
export const appBaseUrl = env('APP_BASE_URL')
