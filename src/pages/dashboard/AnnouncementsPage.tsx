import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Megaphone, 
  Plus, 
  Trash2, 
  Calendar,
  Edit,
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
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useAnnouncements } from '@/hooks/useAnnouncements';
import { format } from 'date-fns';

const AnnouncementsPage = () => {
  const { toast } = useToast();
  const { announcements, addAnnouncement, updateAnnouncement, deleteAnnouncement } = useAnnouncements();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [visibleOnHome, setVisibleOnHome] = useState(true);

  const handleSave = async () => {
    if (!title || !content) {
      toast({
        title: 'Error',
        description: 'Please fill in title and content',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (editingId) {
        await updateAnnouncement(editingId, {
          title,
          content,
          visibleOnHome,
        });
        toast({
          title: 'Success',
          description: 'Announcement updated successfully',
        });
      } else {
        await addAnnouncement({
          title,
          content,
          language: 'en', // Defaulting to English for now
          visibleOnHome,
          adminOnly: false,
        });
        toast({
          title: 'Success',
          description: 'Announcement posted successfully',
        });
      }
      setIsAddDialogOpen(false);
      resetForm();
    } catch (error) {
      toast({
        title: 'Error',
        description: editingId ? 'Failed to update announcement' : 'Failed to post announcement',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setVisibleOnHome(true);
    setEditingId(null);
  };

  const openNewDialog = () => {
    resetForm();
    setIsAddDialogOpen(true);
  };

  const openEditDialog = (item: any) => {
    setEditingId(item.id);
    setTitle(item.title);
    setContent(item.content);
    setVisibleOnHome(item.visibleOnHome);
    setIsAddDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAnnouncement(id);
      toast({
        title: 'Success',
        description: 'Announcement deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete announcement',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Announcements</h1>
          <p className="text-muted-foreground">
            Manage system announcements and updates
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={openNewDialog}>
              <Plus className="w-4 h-4" />
              New Announcement
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Announcement' : 'Create Announcement'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input 
                  id="title" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  placeholder="Announcement title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea 
                  id="content" 
                  value={content} 
                  onChange={(e) => setContent(e.target.value)} 
                  placeholder="Announcement details..."
                  className="min-h-[100px]"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch 
                  id="visible" 
                  checked={visibleOnHome}
                  onCheckedChange={setVisibleOnHome}
                />
                <Label htmlFor="visible">Visible on Home Page</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSave}>{editingId ? 'Update' : 'Post Announcement'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {announcements.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <Megaphone className="w-4 h-4 text-primary" />
                      {item.title}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      <Calendar className="w-3 h-3" />
                      {format(item.createdAt, 'PPP')}
                      {item.visibleOnHome && (
                        <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-[10px] font-medium">
                          Public
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-muted-foreground hover:text-primary hover:bg-primary/10"
                      onClick={() => openEditDialog(item)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                      onClick={() => item.id && handleDelete(item.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{item.content}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
        {announcements.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No announcements found. Create one to get started.
          </div>
        )}
      </div>
    </div>
  );
};

export default AnnouncementsPage;
