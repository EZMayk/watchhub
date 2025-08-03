import type { NextRequest } from 'next/server'
import type { Session } from '@supabase/auth-helpers-nextjs'

export interface MiddlewareContext {
  req: NextRequest
  session?: Session | null
}

export interface UserAccount {
  id: string
  rol: string
  [key: string]: unknown
}

export interface MiddlewareResult {
  redirect?: string
  error?: string
  continue?: boolean
}
