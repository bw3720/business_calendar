import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder'

// 환경 변수가 없으면 더미 값으로 클라이언트를 만들어 초기화 에러만 피한다.
// 실제 호출 여부는 App.jsx의 isConfigured 체크가 막는다.
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
