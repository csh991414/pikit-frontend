export interface Tag {
  id: string;
  name: string;
}

export type AiModel = 'GPT-4' | 'GPT-3.5' | 'CLAUDE-3' | 'GEMINI-PRO';

export interface SearchFilter {
  keyword?: string;
  tags?: string[];
  aiModel?: AiModel;
  sortBy?: 'latest' | 'popular';
}

export interface User {
  userId: number;
  username: string;
  nickname: string;
  createdAt?: string;
}

export interface AuthorInfo {
  userId: number;
  nickname: string;
}

export interface PromptListItem {
  id: number;
  title: string;
  description: string | null;
  beforeImageUrl: string;
  afterImageUrl: string;
  aiModel: string | null;
  copyCount: number;
  likeCount: number;
  bookmarkCount: number;
  author: AuthorInfo;
  createdAt: string;
  isLiked: boolean;
  isBookmarked: boolean;
}

export interface PromptDetail extends PromptListItem {
  promptText: string;
  instagramUrl: string | null;
  viewCount: number;
  updatedAt: string;
}

export interface ToggleResponse {
  liked?: boolean;
  bookmarked?: boolean;
  count: number;
}

export interface CopyResponse {
  copyCount: number;
}

export type PromptSort = 'latest' | 'popular' | 'random';

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  userId: number;
  username: string;
  nickname: string;
  isAdmin: boolean;
}

export interface PromptAdminItem {
  id: number;
  title: string;
  beforeImageUrl: string;
  afterImageUrl: string;
  promptText: string;
  visible: boolean;
  copyCount: number;
  createdAt: string;
}

export interface SignupRequest {
  username: string;
  password: string;
  nickname: string;
}

export interface QuestionResponse {
  id: number;
  title: string;
  content: string;
  imageUrl: string | null;
  viewCount: number;
  commentCount: number;
  authorNickname: string;
  authorId: number;
  isAuthor: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface QuestionCreateRequest {
  title: string;
  content: string;
  imageUrl?: string;
}

export interface QuestionUpdateRequest {
  title: string;
  content: string;
  imageUrl?: string;
}

export interface CommentResponse {
  id: number;
  content: string;
  authorNickname: string;
  authorId: number;
  isAuthor: boolean;
  createdAt: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  message: string | null;
  timestamp: string;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalPages: number;
  totalElements: number;
}
