// Friendly names for the generated Supabase types (types/supabase.ts).
import type { Database, Tables } from './supabase';

export type { Database };

export type UserRole = Database['public']['Enums']['user_role'];
export type StudentStatus = Database['public']['Enums']['student_status'];
export type ContractStatus = Database['public']['Enums']['contract_status'];
export type LessonStatus = Database['public']['Enums']['lesson_status'];
export type CefrLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export type Profile = Tables<'profiles'>;
export type Student = Tables<'students'>;
export type Plan = Tables<'plans'>;
export type Contract = Tables<'contracts'>;
export type Lesson = Tables<'lessons'>;
export type GoogleAccount = Tables<'google_accounts'>;
export type GoogleUnlinkedEvent = Tables<'google_unlinked_events'>;
export type Assessment = Tables<'assessments'>;
