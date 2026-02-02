import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Newspaper, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Image as ImageIcon,
  Calendar,
  ExternalLink,
  Eye,
  AlertTriangle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useNews } from '@/hooks/useNews';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage, translations } from '@/contexts/LanguageContext';
import { News } from '@/types';
import { format } from 'date-fns';

interface NewsFormProps {
  formTitle: string;
  setFormTitle: (value: string) => void;
  formContent: string;
  setFormContent: (value: string) => void;
  formImageUrl: string;
  setFormImageUrl: (value: string) => void;
  onSubmit: () => void;
  submitLabel: string;
  onCancel: () => void;
  t: (key: string) => string;
  translations: any;
  isUploading: boolean;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const NewsForm = ({ 
  formTitle, 
  setFormTitle, 
  formContent, 
  setFormContent, 
  formImageUrl, 
  setFormImageUrl, 
  onSubmit, 
  submitLabel, 
  onCancel,
  t,
  translations,
  isUploading,
  onFileChange
}: NewsFormProps) => (
  <div className="grid gap-4 py-4">
    <div className="grid gap-2">
      <Label>{t(translations.newsTitle)}</Label>
      <Input
        value={formTitle}
        onChange={(e) => setFormTitle(e.target.value)}
        placeholder="Enter news title"
      />
    </div>
    <div className="grid gap-2">
      <Label>{t(translations.newsContent)}</Label>
      <Textarea
        value={formContent}
        onChange={(e) => setFormContent(e.target.value)}
        placeholder="Enter news content"
        rows={5}
      />
    </div>
    <div className="grid gap-2">
      <Label className="flex items-center gap-2">
        <ImageIcon className="w-4 h-4" />
        {t(translations.imageUrl)} ({t(translations.optional)})
      </Label>
      
      {/* File Upload Input */}
      <div className="flex gap-2 items-center">
        <Input
          type="file"
          accept="image/*"
          onChange={onFileChange}
          disabled={isUploading}
          className="cursor-pointer"
        />
      </div>
      
      {isUploading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          Uploading image...
        </div>
      )}

      {/* Preview */}
      {formImageUrl && (
        <div className="mt-2 relative rounded-lg overflow-hidden border group">
          <img 
            src={formImageUrl} 
            alt="Preview" 
            className="w-full h-32 object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => setFormImageUrl('')}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
    <DialogFooter>
      <Button variant="outline" onClick={onCancel} disabled={isUploading}>
        {t(translations.cancel)}
      </Button>
      <Button onClick={onSubmit} disabled={isUploading}>
        {isUploading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Uploading...
          </>
        ) : submitLabel}
      </Button>
    </DialogFooter>
  </div>
);

import { uploadToCloudinary } from '@/lib/cloudinary';
import { Loader2 } from 'lucide-react';

const NewsPage = () => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const { user, admin, isAdmin } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deleteNewsId, setDeleteNewsId] = useState<string | null>(null);
  const [editingNews, setEditingNews] = useState<News | null>(null);
  const [viewingNews, setViewingNews] = useState<News | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');

  const { news, isLoading, error, addNews, updateNews, deleteNews } = useNews();

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

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "File size must be less than 10MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      const cloudinaryUrl = await uploadToCloudinary(file);
      setFormImageUrl(cloudinaryUrl);
      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Error",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      // Clear input value so same file can be selected again if needed
      e.target.value = '';
    }
  };

  const filteredNews = useMemo(() => {
    if (!searchTerm) return news;
    const term = searchTerm.toLowerCase();
    return news.filter(item => 
      item.title.toLowerCase().includes(term) || 
      item.content.toLowerCase().includes(term)
    );
  }, [news, searchTerm]);

  const resetForm = () => {
    setFormTitle('');
    setFormContent('');
    setFormImageUrl('');
  };

  const handleAdd = async () => {
    if (!isAdmin) {
      toast({
        title: 'Access Denied',
        description: 'You must be logged in as an admin to add news',
        variant: 'destructive',
      });
      return;
    }

    if (!formTitle.trim() || !formContent.trim()) {
      toast({
        title: 'Error',
        description: 'Please fill in title and content',
        variant: 'destructive',
      });
      return;
    }

    try {
      await addNews({
        title: formTitle.trim(),
        content: formContent.trim(),
        imageUrl: formImageUrl.trim() || undefined,
      });
      toast({
        title: 'Success',
        description: 'News published successfully',
      });
      setIsAddDialogOpen(false);
      resetForm();
    } catch (error: any) {
      console.error('Add news error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to publish news',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = async () => {
    if (!editingNews?.id) return;

    if (!isAdmin) {
      toast({
        title: 'Access Denied',
        description: 'You must be logged in as an admin to edit news',
        variant: 'destructive',
      });
      return;
    }

    if (!formTitle.trim() || !formContent.trim()) {
      toast({
        title: 'Error',
        description: 'Please fill in title and content',
        variant: 'destructive',
      });
      return;
    }

    try {
      await updateNews(editingNews.id, {
        title: formTitle.trim(),
        content: formContent.trim(),
        imageUrl: formImageUrl.trim() || undefined,
      });
      toast({
        title: 'Success',
        description: 'News updated successfully',
      });
      setIsEditDialogOpen(false);
      setEditingNews(null);
      resetForm();
    } catch (error: any) {
      console.error('Update news error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update news',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteNewsId) return;

    if (!isAdmin) {
      toast({
        title: 'Access Denied',
        description: 'You must be logged in as an admin to delete news',
        variant: 'destructive',
      });
      return;
    }

    try {
      await deleteNews(deleteNewsId);
      toast({
        title: 'Success',
        description: 'News deleted successfully',
      });
      setDeleteNewsId(null);
    } catch (error: any) {
      console.error('Delete news error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete news',
        variant: 'destructive',
      });
    }
  };

  const openEditDialog = (newsItem: News) => {
    setEditingNews(newsItem);
    setFormTitle(newsItem.title);
    setFormContent(newsItem.content);
    setFormImageUrl(newsItem.imageUrl || '');
    setIsEditDialogOpen(true);
  };

  const openViewDialog = (newsItem: News) => {
    setViewingNews(newsItem);
  };

  return (
    <div className="space-y-6">
      {/* Authentication Status */}
      {!isAdmin && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              <div>
                <p className="font-medium text-destructive">Authentication Required</p>
                <p className="text-sm text-muted-foreground">
                  You must be logged in as an admin to manage news. 
                  {user ? ' Your account does not have admin privileges.' : ' Please log in to continue.'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
            {t(translations.news)}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t(translations.newsDescription)}
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" disabled={!isAdmin}>
              <Plus className="w-4 h-4" />
              {t(translations.publishNews)}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{t(translations.publishNews)}</DialogTitle>
            </DialogHeader>
            <NewsForm 
              formTitle={formTitle}
              setFormTitle={setFormTitle}
              formContent={formContent}
              setFormContent={setFormContent}
              formImageUrl={formImageUrl}
              setFormImageUrl={setFormImageUrl}
              onSubmit={handleAdd} 
              submitLabel={t(translations.publish)}
              onCancel={() => {
                setIsAddDialogOpen(false);
                resetForm();
              }}
              t={t}
              translations={translations}
              isUploading={isUploading}
              onFileChange={handleFileChange}
            />
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder={`${t(translations.search)} ${t(translations.news).toLowerCase()}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* News Grid */}
      {error ? (
        <Card>
          <CardContent className="py-16 text-center">
            <div className="text-destructive mb-4">
              <Newspaper className="w-12 h-12 mx-auto mb-2" />
              <p className="font-medium">Error Loading News</p>
            </div>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
              className="gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Refresh Page
            </Button>
          </CardContent>
        </Card>
      ) : isLoading ? (
        <div className="text-center py-8 text-muted-foreground">
          {t(translations.loading)}
        </div>
      ) : filteredNews.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Newspaper className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">
              {searchTerm ? 'No news found matching your search' : t(translations.noData)}
            </p>
            {searchTerm && (
              <Button 
                variant="outline" 
                onClick={() => setSearchTerm('')}
                className="mt-4"
              >
                Clear Search
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNews.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                {item.imageUrl && (
                  <div className="aspect-video relative overflow-hidden">
                    <img 
                      src={item.imageUrl} 
                      alt={item.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder.svg';
                      }}
                    />
                  </div>
                )}
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg line-clamp-2">{item.title}</CardTitle>
                    <div className="flex gap-1 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openViewDialog(item)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openEditDialog(item)}
                        disabled={!isAdmin}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setDeleteNewsId(item.id!)}
                        disabled={!isAdmin}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm line-clamp-3 mb-4 whitespace-pre-line">
                    {item.content}
                  </p>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3 mr-1" />
                    {format(item.createdAt, 'MMM dd, yyyy')}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* View Dialog */}
      <Dialog open={!!viewingNews} onOpenChange={(open) => !open && setViewingNews(null)}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{viewingNews?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {viewingNews?.imageUrl && (
              <div className="rounded-lg overflow-hidden border">
                <img 
                  src={viewingNews.imageUrl} 
                  alt={viewingNews.title}
                  className="w-full h-auto max-h-[400px] object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="w-4 h-4 mr-2" />
              {viewingNews?.createdAt && format(viewingNews.createdAt, 'MMMM dd, yyyy')}
            </div>
            <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
              {viewingNews?.content}
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setViewingNews(null)}>
              {t(translations.close) || 'Close'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t(translations.edit)} {t(translations.news)}</DialogTitle>
          </DialogHeader>
          <NewsForm 
            formTitle={formTitle}
            setFormTitle={setFormTitle}
            formContent={formContent}
            setFormContent={setFormContent}
            formImageUrl={formImageUrl}
            setFormImageUrl={setFormImageUrl}
            onSubmit={handleEdit} 
            submitLabel={t(translations.save)}
            onCancel={() => {
              setIsEditDialogOpen(false);
              resetForm();
            }}
            t={t}
            translations={translations}
            isUploading={isUploading}
            onFileChange={handleFileChange}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteNewsId} onOpenChange={() => setDeleteNewsId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t(translations.deleteNews)}</AlertDialogTitle>
            <AlertDialogDescription>
              {t(translations.deleteNewsConfirm)}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t(translations.cancel)}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              {t(translations.delete)}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default NewsPage;
