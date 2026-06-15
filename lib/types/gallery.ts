/**
 * Gallery System TypeScript Types
 * Type definitions for gallery albums and images
 */

// ============================================
// DATABASE TYPES
// ============================================

export interface GalleryAlbum {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  thumbnail_url: string | null;
  drive_folder_id: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface GalleryImage {
  id: number;
  album_id: number;
  image_url: string;
  caption: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface GalleryAlbumWithImageCount extends GalleryAlbum {
  image_count: number;
}

export interface GalleryImageWithAlbum extends GalleryImage {
  album: {
    id: number;
    name: string;
    slug: string;
  };
}

export interface AlbumsListResponse {
  albums: GalleryAlbumWithImageCount[];
  total: number;
}

export interface AlbumImagesResponse {
  album: {
    id: number;
    name: string;
    slug: string;
    description: string | null;
  };
  images: GalleryImage[];
  total_images: number;
}

export interface ImageListResponse {
  images: GalleryImageWithAlbum[];
  total: number;
}

// ============================================
// FORM / INPUT TYPES
// ============================================

export interface CreateAlbumInput {
  name: string;
  slug: string;
  description?: string;
  thumbnail_url?: string;
  display_order?: number;
  is_active?: boolean;
}

export interface UpdateAlbumInput {
  name?: string;
  slug?: string;
  description?: string;
  thumbnail_url?: string;
  display_order?: number;
  is_active?: boolean;
}

export interface CreateImageInput {
  album_id: number;
  image_url: string;
  caption?: string;
  display_order?: number;
  is_active?: boolean;
}

export interface UpdateImageInput {
  album_id?: number;
  image_url?: string;
  caption?: string;
  display_order?: number;
  is_active?: boolean;
}

export interface BulkCreateImagesInput {
  album_id: number;
  images: Array<{
    image_url: string;
    caption?: string;
    display_order?: number;
  }>;
}

export interface ReorderImagesInput {
  updates: Array<{
    id: number;
    display_order: number;
  }>;
}

export interface SetThumbnailInput {
  album_id: number;
  image_url: string;
}

// ============================================
// UPLOAD TYPES
// ============================================

export interface UploadResult {
  url: string;
  path: string;
  originalName: string;
  success: boolean;
  error?: string;
}

export interface BulkUploadResponse {
  success: boolean;
  uploaded_count: number;
  failed_count: number;
  results: UploadResult[];
  album_id: number;
}

export interface ImageValidationResult {
  valid: boolean;
  error?: string;
}

// ============================================
// COMPONENT PROPS TYPES
// ============================================

export interface AlbumListProps {
  onEdit?: (album: GalleryAlbum) => void;
  onDelete?: (albumId: number) => void;
  onViewImages?: (albumSlug: string) => void;
}

export interface AlbumFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  album?: GalleryAlbum | null;
  onSubmit: (data: CreateAlbumInput | UpdateAlbumInput) => void;
  mode: 'create' | 'edit';
}

export interface ImageUploaderProps {
  albumId: number;
  albumSlug: string;
  onUploadComplete: (results: BulkUploadResponse) => void;
}

export interface ImageGalleryViewProps {
  albumId: number;
  albumSlug: string;
  onImageUpdated?: () => void;
}

export interface ImageDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  image: GalleryImage | null;
  onSave: (data: UpdateImageInput) => void;
  onDelete?: () => void;
}

export interface SetThumbnailModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: GalleryImage[];
  currentThumbnailUrl: string | null;
  albumId: number;
  albumName: string;
  onThumbnailSet: (imageUrl: string) => void;
}

export interface BulkActionsPanelProps {
  selectedImages: number[];
  onDelete: () => void;
  onToggleActive: (isActive: boolean) => void;
  onClearSelection: () => void;
}

// ============================================
// STATE TYPES
// ============================================

export interface GalleryManagementState {
  albums: GalleryAlbumWithImageCount[];
  selectedAlbum: GalleryAlbum | null;
  images: GalleryImage[];
  selectedImages: number[];
  isLoading: boolean;
  error: string | null;
}

export interface ImageUploadState {
  uploading: boolean;
  progress: number;
  uploadedCount: number;
  totalCount: number;
  errors: string[];
}

// ============================================
// FILTER / SORT TYPES
// ============================================

export interface ImageFilters {
  album_id?: number;
  is_active?: boolean;
  search_caption?: string;
}

export interface AlbumFilters {
  is_active?: boolean;
  search_name?: string;
}

export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  field: string;
  direction: SortDirection;
}

// ============================================
// DRAG AND DROP TYPES
// ============================================

export interface DragItem {
  id: number;
  index: number;
  type: 'image' | 'album';
}

export interface DropResult {
  draggedId: number;
  droppedOnId: number;
  newOrder: number[];
}
