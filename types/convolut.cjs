/**
 * Convolut API Type Definitions (JavaScript compatible)
 */

// API Response wrappers
export const ContextListResponse = {
  items: [], // ConvolutContext[]
  total_count: 0,
  limit: 0,
  offset: null,
  decrypted: true,
  authenticated_user: {
    user_id: '',
    email: '',
    is_admin: false
  },
  filters_applied: {},
  admin_filter: {}
};

export const ConvolutContext = {
  id: '',
  title: '',
  content: '',
  tags: [],
  category: '',
  is_favorite: false,
  word_count: 0,
  created_date: '',
  updated_date: '',
  created_by: '',
  files: []
};

export const CreateContextRequest = {
  title: '',
  content: '',
  tags: [],
  category: 'other',
  is_favorite: false,
  files: []
};

export const UpdateContextRequest = {
  title: null,
  content: null,
  tags: null,
  category: null,
  is_favorite: null,
  files: null
};

export const ContextSearchParams = {
  limit: 20,
  offset: 0,
  contain: null,
  category: null,
  tags: null,
  from: null,
  to: null,
  is_favorite: null
};

export const ConsolidateRequest = {
  context_ids: [],
  consolidation_type: 'summarize', // 'summarize' | 'compose'
  custom_prompt: null
};

export const PlanRequest = {
  context_ids: [],
  planning_prompt: null
};

export const ExportRequest = {
  context_ids: [],
  format: 'json', // 'json' | 'xml' | 'txt' | 'markdown'
  include_metadata: true
};

export const RawUrlRequest = {
  context_id: ''
};