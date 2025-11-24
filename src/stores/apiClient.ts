import createClient from 'openapi-fetch'
import type { paths } from './api'

export const apiClient = createClient<paths>({
  baseUrl: 'http://192.168.0.201'
})
