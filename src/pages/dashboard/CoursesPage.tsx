import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  BookOpen,
  DollarSign,
  Clock,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useCourses } from '@/hooks/useCourses';
import { Course, COURSE_CATEGORIES } from '@/types';
import { toast } from '@/hooks/use-toast';

const CoursesPage = () => {
  const { courses, isLoading, addCourse, updateCourse, deleteCourse } = useCourses();
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    courseName: '',
    category: '',
    monthlyPrice: 0,
    duration: '',
    active: true,
  });

  const filteredCourses = courses.filter(course =>
    course.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenDialog = (course?: Course) => {
    if (course) {
      setSelectedCourse(course);
      setFormData({
        courseName: course.courseName,
        category: course.category,
        monthlyPrice: course.monthlyPrice,
        duration: course.duration,
        active: course.active,
      });
    } else {
      setSelectedCourse(null);
      setFormData({
        courseName: '',
        category: '',
        monthlyPrice: 0,
        duration: '',
        active: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (selectedCourse?.id) {
        await updateCourse(selectedCourse.id, formData);
        toast({ title: 'Course updated successfully' });
      } else {
        await addCourse(formData);
        toast({ title: 'Course added successfully' });
      }
      setIsDialogOpen(false);
    } catch (error) {
      toast({ 
        title: 'Error', 
        description: 'Failed to save course', 
        variant: 'destructive' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedCourse?.id) return;
    
    setIsSubmitting(true);
    try {
      await deleteCourse(selectedCourse.id);
      toast({ title: 'Course deleted successfully' });
      setIsDeleteDialogOpen(false);
      setSelectedCourse(null);
    } catch (error) {
      toast({ 
        title: 'Error', 
        description: 'Failed to delete course', 
        variant: 'destructive' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDeleteDialog = (course: Course) => {
    setSelectedCourse(course);
    setIsDeleteDialogOpen(true);
  };

  const toggleCourseActive = async (course: Course) => {
    if (!course.id) return;
    try {
      await updateCourse(course.id, { active: !course.active });
      toast({ 
        title: `Course ${course.active ? 'deactivated' : 'activated'} successfully` 
      });
    } catch (error) {
      toast({ 
        title: 'Error', 
        description: 'Failed to update course', 
        variant: 'destructive' 
      });
    }
  };

  const activeCourses = courses.filter(c => c.active);
  const totalRevenuePotential = courses.reduce((sum, c) => sum + c.monthlyPrice, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Courses</h1>
          <p className="text-muted-foreground mt-1">
            Manage training courses and programs
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="gradient-primary gap-2">
          <Plus className="w-4 h-4" />
          Add Course
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="stat-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{courses.length}</p>
                <p className="text-sm text-muted-foreground">Total Courses</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <BookOpen className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeCourses.length}</p>
                <p className="text-sm text-muted-foreground">Active Courses</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10">
                <DollarSign className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">ETB {totalRevenuePotential.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Monthly Potential</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Course List</CardTitle>
              <CardDescription>
                All available training courses
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 mx-auto text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-medium text-foreground">No courses found</h3>
              <p className="mt-2 text-muted-foreground">
                {searchQuery 
                  ? 'Try adjusting your search query'
                  : 'Get started by adding your first course'}
              </p>
              {!searchQuery && (
                <Button onClick={() => handleOpenDialog()} className="mt-4 gradient-primary">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Course
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Monthly Price</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[70px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCourses.map((course) => (
                    <TableRow key={course.id} className="table-row-hover">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-info/10 flex items-center justify-center">
                            <BookOpen className="w-4 h-4 text-info" />
                          </div>
                          <span className="font-medium">{course.courseName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{course.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 font-medium">
                          <span className="text-muted-foreground">ETB</span>
                          {course.monthlyPrice.toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          {course.duration}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={course.active}
                          onCheckedChange={() => toggleCourseActive(course)}
                        />
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleOpenDialog(course)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => openDeleteDialog(course)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedCourse ? 'Edit Course' : 'Add New Course'}
            </DialogTitle>
            <DialogDescription>
              {selectedCourse 
                ? 'Update the course information below' 
                : 'Enter the course details below'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="courseName">Course Name</Label>
                <Input
                  id="courseName"
                  value={formData.courseName}
                  onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
                  placeholder="e.g., Microsoft Office Basics"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {COURSE_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="monthlyPrice">Monthly Price (ETB)</Label>
                  <Input
                    id="monthlyPrice"
                    type="number"
                    value={formData.monthlyPrice}
                    onChange={(e) => setFormData({ ...formData, monthlyPrice: Number(e.target.value) })}
                    placeholder="0"
                    min="0"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration</Label>
                  <Input
                    id="duration"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="e.g., 3 months"
                    required
                  />
                </div>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="active">Active Course</Label>
                  <p className="text-sm text-muted-foreground">
                    Active courses are available for registration
                  </p>
                </div>
                <Switch
                  id="active"
                  checked={formData.active}
                  onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="gradient-primary" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  selectedCourse ? 'Update' : 'Add Course'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Course</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedCourse?.courseName}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default CoursesPage;
