// Database types for Kenavo Alumni Directory
// Auto-generated based on Supabase schema

export interface Profile {
  id: number
  name: string
  profile_image_url: string | null
  location: string | null
  year_graduated: string | null
  current_job: string | null
  company: string | null
  designation_organisation: string | null
  bio: string | null
  email: string | null
  phone: string | null
  linkedin_url: string | null
  nicknames: string | null
  created_at: string
  updated_at: string
}

export interface GalleryImage {
  id: number
  profile_id: number
  image_url: string
  caption: string | null
  image_type: string | null
  order_index: number | null
  created_at: string
}

// Profile Question (master question list)
export interface ProfileQuestion {
  id: number
  question_text: string
  order_index: number
  is_active: boolean
  created_at: string
  updated_at: string
}

// Profile Answer (alumni response to a question)
export interface ProfileAnswer {
  id: number
  profile_id: number
  question_id: number
  answer: string | null
  created_at: string
  updated_at: string
}

// Q&A pair for display (joins question and answer)
export interface ProfileQA {
  question_id: number
  question_text: string
  answer: string | null
  order_index: number
}

// Profile with gallery images joined
export interface ProfileWithGallery extends Profile {
  gallery_images: GalleryImage[]
}

// Profile with Q&A answers
export interface ProfileWithAnswers extends Profile {
  qa_responses: ProfileQA[]
}

// Complete profile data (with gallery and Q&A)
export interface ProfileComplete extends Profile {
  gallery_images: GalleryImage[]
  qa_responses: ProfileQA[]
}

// User Management Types
export type UserRole = 'admin' | 'user';

export interface AppUser {
  id: string // UUID from auth.users
  email: string
  username: string | null
  role: UserRole
  has_directory_access: boolean
  status: 'active' | 'inactive'
  created_by: string | null // UUID
  created_at: string
  updated_at: string
}

// Extended user with creator info
export interface AppUserWithCreator extends AppUser {
  created_by_user: {
    email: string
    username: string | null
  } | null
}

// User creation input
export interface CreateAppUserInput {
  email: string
  username?: string
  password: string
  role?: UserRole
  has_directory_access?: boolean
  status?: 'active' | 'inactive'
}

// User update input
export interface UpdateAppUserInput {
  email?: string
  username?: string
  password?: string
  role?: UserRole
  has_directory_access?: boolean
  status?: 'active' | 'inactive'
}

// API response types
export type ProfilesResponse = Profile[]
export type SingleProfileResponse = Profile
export type AppUsersResponse = AppUser[]
export type SingleAppUserResponse = AppUser

// Gemini AI Types
export type DocumentCategory = 'alumni_profiles' | 'knowledge_base' | 'events' | 'newsletters' | 'resources'
export type UploadStatus = 'pending' | 'uploading' | 'completed' | 'failed'

export interface GeminiDocument {
  id: string
  name: string
  display_name: string
  file_name: string
  file_size: number | null
  file_type: string | null
  category: DocumentCategory
  tags: string[]
  description: string | null
  rag_store_name: string | null
  gemini_file_name: string | null
  upload_status: UploadStatus
  error_message: string | null
  uploaded_by: string | null
  created_at: string
  updated_at: string
}

export interface CreateGeminiDocumentInput {
  display_name: string
  file_name: string
  file_size?: number
  file_type?: string
  category: DocumentCategory
  tags?: string[]
  description?: string
}

export interface UpdateGeminiDocumentInput {
  display_name?: string
  category?: DocumentCategory
  tags?: string[]
  description?: string
  upload_status?: UploadStatus
  error_message?: string
  rag_store_name?: string
  gemini_file_name?: string
}

export interface GroundingChunk {
  retrievedContext?: {
    text?: string
  }
}

export interface ChatMessage {
  role: 'user' | 'model'
  parts: { text: string }[]
  groundingChunks?: GroundingChunk[]
}

export interface GeminiChatHistory {
  id: string
  session_id: string
  user_id: string | null
  message_role: 'user' | 'model'
  message_text: string
  grounding_chunks: GroundingChunk[] | null
  created_at: string
}

export interface ChatRequest {
  message: string
  sessionId?: string
}

export interface ChatResponse {
  response: string
  groundingChunks: GroundingChunk[]
  sessionId: string
}
