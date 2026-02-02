import { useState, useRef } from 'react';
import { useGallery } from '@/hooks/useGallery';
import { useLanguage, translations } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { uploadToCloudinary } from '@/lib/cloudinary';
import CloudinaryUploadWidget from '@/components/CloudinaryUploadWidget';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Plus, Trash2, Search, ImageIcon, Upload, Link, X, Filter, Camera } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { GalleryItem } from '@/types';

const GALLERY_CATEGORIES = [
  'Training',
  'Events',
  'Graduation',
  'Facilities',
  'Activities',
  'Other',
] as const;

const GalleryPage = () => {
  const { gallery, isLoading, addImage, deleteImage } = useGallery();
  const { t, language } = useLanguage();
  const { toast } = useToast();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [uploadMethod, setUploadMethod] = useState<'url' | 'file' | 'widget'>('url');
  const [previewUrl, setPreviewUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isAddingImage, setIsAddingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    imageUrl: '',
    category: 'Training' as string,
  });

  const galleryTranslations = {
    title: { en: 'Gallery', om: 'Gaalerii', am: 'ጋለሪ' },
    description: { en: 'Manage photo gallery', om: 'Gaalerii suuraa bulchi', am: 'የፎቶ ጋለሪን ያስተዳድሩ' },
    addImage: { en: 'Add Image', om: 'Suuraa Dabali', am: 'ምስል ጨምር' },
    category: { en: 'Category', om: 'Akaakuu', am: 'ምድብ' },
    allCategories: { en: 'All Categories', om: 'Akaakuu Hundaa', am: 'ሁሉም ምድቦች' },
    uploadImage: { en: 'Upload Image', om: 'Suuraa Olkaa\'i', am: 'ምስል ስቀል' },
    imageUrl: { en: 'Image URL', om: 'URL Suuraa', am: 'የምስል URL' },
    pasteUrl: { en: 'Paste image URL', om: 'URL suuraa maxxansi', am: 'የምስል URL ይለጥፉ' },
    selectFile: { en: 'Select File', om: 'Faayilii Filadhu', am: 'ፋይል ምረጥ' },
    deleteImage: { en: 'Delete Image', om: 'Suuraa Haqi', am: 'ምስል ሰርዝ' },
    deleteConfirm: { en: 'Are you sure you want to delete this image?', om: 'Suuraa kana haquuf mirkaneeffataa?', am: 'ይህን ምስል መሰረዝ ይፈልጋሉ?' },
    noImages: { en: 'No images in gallery', om: 'Gaalerii keessa suuraan hin jiru', am: 'በጋለሪ ውስጥ ምስሎች የሉም' },
    addFirst: { en: 'Add your first image to get started', om: 'Jalqabuuf suuraa jalqabaa dabali', am: 'ለመጀመር የመጀመሪያውን ምስል ጨምር' },
    urlMethod: { en: 'URL', om: 'URL', am: 'URL' },
    fileMethod: { en: 'File Upload', om: 'Faayilii Olkaa\'i', am: 'ፋይል ስቀል' },
    widgetMethod: { en: 'Cloudinary Widget', om: 'Widget Cloudinary', am: 'Cloudinary Widget' },
    preview: { en: 'Preview', om: 'Durargii', am: 'ቅድመ እይታ' },
    noPreview: { en: 'No preview available', om: 'Durargiin hin jiru', am: 'ቅድመ እይታ የለም' },
    imageAdded: { en: 'Image added successfully', om: 'Suuraan milkaa\'inaan dabalame', am: 'ምስል በተሳካ ሁኔታ ተጨምሯል' },
    imageDeleted: { en: 'Image deleted successfully', om: 'Suuraan milkaa\'inaan haqame', am: 'ምስል በተሳካ ሁኔታ ተሰርዟል' },
    postImage: { en: 'Post Image', om: 'Suuraa Maxxansi', am: 'ምስል ለጥፍ' },
    addToGallery: { en: 'Add to Gallery', om: 'Gaalerii keessa dabali', am: 'ወደ ጋለሪ ጨምር' },
    cloudinaryNote: { en: 'Upload images directly or paste Cloudinary URLs here', om: 'Suuraa kallattiin olkaa\'i ykn URL Cloudinary as maxxansi', am: 'ምስሎችን በቀጥታ ስቀሉ ወይም የCloudinary URLs እዚህ ይለጥፉ' },
  };

  const filteredGallery = gallery.filter(item => {
    const matchesSearch = item.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterCategory === 'all' || item.category === filterCategory;
    return matchesSearch && matchesFilter;
  });

  const handleAddImage = async () => {
    if (!formData.imageUrl.trim()) {
      toast({
        title: "Error",
        description: "Please provide an image URL or upload a file",
        variant: "destructive",
      });
      return;
    }

    // Validate URL format
    if (uploadMethod === 'url') {
      try {
        new URL(formData.imageUrl);
      } catch {
        toast({
          title: "Error",
          description: "Please provide a valid image URL",
          variant: "destructive",
        });
        return;
      }
    }

    setIsAddingImage(true);
    try {
      await addImage({
        imageUrl: formData.imageUrl,
        category: formData.category,
      });
      toast({
        title: t(galleryTranslations.imageAdded),
      });
      setFormData({ imageUrl: '', category: 'Training' });
      setPreviewUrl('');
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error('Add image error:', error);
      toast({
        title: "Error",
        description: "Failed to add image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAddingImage(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    
    try {
      await deleteImage(deleteId);
      toast({
        title: t(galleryTranslations.imageDeleted),
      });
      setDeleteId(null);
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Error",
        description: "Failed to delete image. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUrlChange = (url: string) => {
    setFormData(prev => ({ ...prev, imageUrl: url }));
    
    // Only set preview if URL looks like a valid image URL
    if (url && (url.startsWith('http://') || url.startsWith('https://')) && 
        (url.includes('.jpg') || url.includes('.jpeg') || url.includes('.png') || 
         url.includes('.gif') || url.includes('.webp') || url.includes('.svg'))) {
      setPreviewUrl(url);
    } else if (!url) {
      setPreviewUrl('');
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Please select a valid image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 10MB for Cloudinary)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "File size must be less than 10MB",
        variant: "destructive",
      });
      return;
    }

    // Create a local preview immediately
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to Cloudinary
    setIsUploading(true);
    try {
      const cloudinaryUrl = await uploadToCloudinary(file);
      
      setFormData(prev => ({ ...prev, imageUrl: cloudinaryUrl }));
      toast({
        title: "Success",
        description: "Image uploaded successfully to Cloudinary",
      });
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      toast({
        title: "Error",
        description: "Failed to upload image to Cloudinary. Please check your internet connection and try again.",
        variant: "destructive",
      });
      // Clear preview if upload fails
      setPreviewUrl('');
      setFormData(prev => ({ ...prev, imageUrl: '' }));
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setFormData({ imageUrl: '', category: 'Training' });
    setPreviewUrl('');
    setUploadMethod('url');
    setIsAddingImage(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCloudinaryUpload = (url: string) => {
    setFormData(prev => ({ ...prev, imageUrl: url }));
    setPreviewUrl(url);
    toast({
      title: "Success",
      description: "Image uploaded successfully via Cloudinary widget",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t(galleryTranslations.title)}</h1>
          <p className="text-muted-foreground">{t(galleryTranslations.description)}</p>
        </div>
        <Button onClick={() => { resetForm(); setIsAddDialogOpen(true); }} className="gap-2">
          <Plus className="w-4 h-4" />
          {t(galleryTranslations.addImage)}
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={t(translations.search)}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t(galleryTranslations.allCategories)}</SelectItem>
            {GALLERY_CATEGORIES.map(category => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Gallery Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <AspectRatio ratio={1}>
                <div className="w-full h-full bg-muted rounded-lg" />
              </AspectRatio>
            </Card>
          ))}
        </div>
      ) : filteredGallery.length === 0 ? (
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <ImageIcon className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">{t(galleryTranslations.noImages)}</h3>
            <p className="text-muted-foreground mb-4">{t(galleryTranslations.addFirst)}</p>
            <Button onClick={() => { resetForm(); setIsAddDialogOpen(true); }} className="gap-2">
              <Plus className="w-4 h-4" />
              {t(galleryTranslations.addImage)}
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredGallery.map((item) => (
            <Card key={item.id} className="group relative overflow-hidden">
              <AspectRatio ratio={1}>
                <img
                  src={item.imageUrl}
                  alt={item.category}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (target.src !== '/placeholder.svg') {
                      target.src = '/placeholder.svg';
                    }
                  }}
                  onLoad={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.opacity = '1';
                  }}
                  style={{ opacity: 0, transition: 'opacity 0.3s' }}
                />
              </AspectRatio>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-4 flex items-center justify-between">
                  <span className="text-sm font-medium text-white bg-black/40 px-2 py-1 rounded">
                    {item.category}
                  </span>
                  <Button
                    variant="destructive"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setDeleteId(item.id!)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Image Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t(galleryTranslations.addImage)}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 flex-1">
            {/* Upload Method Tabs */}
            <div className="flex gap-1 p-1 bg-muted rounded-lg">
              <Button
                type="button"
                variant={uploadMethod === 'url' ? 'default' : 'ghost'}
                size="sm"
                className="flex-1 gap-2 text-xs"
                onClick={() => setUploadMethod('url')}
              >
                <Link className="w-3 h-3" />
                {t(galleryTranslations.urlMethod)}
              </Button>
              <Button
                type="button"
                variant={uploadMethod === 'file' ? 'default' : 'ghost'}
                size="sm"
                className="flex-1 gap-2 text-xs"
                onClick={() => setUploadMethod('file')}
              >
                <Upload className="w-3 h-3" />
                {t(galleryTranslations.fileMethod)}
              </Button>
              <Button
                type="button"
                variant={uploadMethod === 'widget' ? 'default' : 'ghost'}
                size="sm"
                className="flex-1 gap-2 text-xs"
                onClick={() => setUploadMethod('widget')}
              >
                <ImageIcon className="w-3 h-3" />
                Widget
              </Button>
            </div>

            {/* URL Input */}
            {uploadMethod === 'url' && (
              <div className="space-y-2">
                <Label>{t(galleryTranslations.imageUrl)}</Label>
                <Input
                  placeholder={t(galleryTranslations.pasteUrl)}
                  value={formData.imageUrl}
                  onChange={(e) => handleUrlChange(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  {t(galleryTranslations.cloudinaryNote)}
                </p>
              </div>
            )}

            {/* File Upload */}
            {uploadMethod === 'file' && (
              <div className="space-y-2">
                <Label>{t(galleryTranslations.selectFile)}</Label>
                <div
                  className={`border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {isUploading ? (
                    <Loader2 className="w-8 h-8 mx-auto mb-2 text-primary animate-spin" />
                  ) : (
                    <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  )}
                  <p className="text-sm text-muted-foreground">
                    {isUploading ? 'Uploading...' : t(galleryTranslations.selectFile)}
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={isUploading}
                />
              </div>
            )}

            {/* Cloudinary Widget */}
            {uploadMethod === 'widget' && (
              <div className="space-y-2">
                <Label>Upload with Cloudinary Widget</Label>
                <CloudinaryUploadWidget
                  onUpload={handleCloudinaryUpload}
                  disabled={isUploading || isAddingImage}
                >
                  Choose Image with Widget
                </CloudinaryUploadWidget>
                <p className="text-xs text-muted-foreground">
                  Use the Cloudinary widget for advanced upload options including drag & drop, camera, and URL import.
                </p>
              </div>
            )}

            {/* Category */}
            <div className="space-y-2">
              <Label>{t(galleryTranslations.category)}</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GALLERY_CATEGORIES.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Preview */}
            <div className="space-y-2">
              <Label>{t(galleryTranslations.preview)}</Label>
              <Card className="overflow-hidden">
                <AspectRatio ratio={16 / 9}>
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (target.src !== '/placeholder.svg') {
                          target.src = '/placeholder.svg';
                        }
                      }}
                      onLoad={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.opacity = '1';
                      }}
                      style={{ opacity: 0, transition: 'opacity 0.3s' }}
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <div className="text-center text-muted-foreground">
                        <ImageIcon className="w-8 h-8 mx-auto mb-2" />
                        <p className="text-sm">{t(galleryTranslations.noPreview)}</p>
                      </div>
                    </div>
                  )}
                </AspectRatio>
              </Card>
              
              {/* Ready to Post Indicator */}
              {previewUrl && formData.imageUrl && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <p className="text-sm text-green-700 dark:text-green-300 font-medium">
                      Image ready to be added to gallery
                    </p>
                  </div>
                  
                  {/* Prominent Add Button */}
                  <Button 
                    onClick={handleAddImage} 
                    disabled={!formData.imageUrl.trim() || isUploading || isAddingImage}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground gap-2 h-12 text-base font-semibold"
                    size="lg"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Uploading Image...
                      </>
                    ) : isAddingImage ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Adding to Gallery...
                      </>
                    ) : (
                      <>
                        <Camera className="w-5 h-5" />
                        Add Image to Gallery
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
            
            {/* Always Visible Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={() => setIsAddDialogOpen(false)} 
                disabled={isUploading || isAddingImage}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAddImage} 
                disabled={!formData.imageUrl.trim() || isUploading || isAddingImage}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Uploading...
                  </>
                ) : isAddingImage ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Camera className="w-4 h-4" />
                    Add to Gallery
                  </>
                )}
              </Button>
            </div>
          </div>
          <DialogFooter className="flex-shrink-0 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={isUploading || isAddingImage}>
              {t(translations.cancel)}
            </Button>
            <Button 
              onClick={handleAddImage} 
              disabled={!formData.imageUrl.trim() || isUploading || isAddingImage}
              className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Uploading...
                </>
              ) : isAddingImage ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Camera className="w-4 h-4" />
                  {t(galleryTranslations.addToGallery)}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t(galleryTranslations.deleteImage)}</AlertDialogTitle>
            <AlertDialogDescription>
              {t(galleryTranslations.deleteConfirm)}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t(translations.cancel)}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {t(translations.delete)}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default GalleryPage;
