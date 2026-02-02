import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  User,
  Phone,
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
import { useStudents } from '@/hooks/useStudents';
import { Student } from '@/types';
import { toast } from '@/hooks/use-toast';

const StudentsPage = () => {
  const { students, isLoading, addStudent, updateStudent, deleteStudent } = useStudents();
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    status: 'active' as 'active' | 'inactive',
  });

  const filteredStudents = students.filter(student =>
    student.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.phone.includes(searchQuery)
  );

  const handleOpenDialog = (student?: Student) => {
    if (student) {
      setSelectedStudent(student);
      setFormData({
        fullName: student.fullName,
        phone: student.phone,
        status: student.status,
      });
    } else {
      setSelectedStudent(null);
      setFormData({ fullName: '', phone: '', status: 'active' });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (selectedStudent?.id) {
        await updateStudent(selectedStudent.id, formData);
        toast({ title: 'Student updated successfully' });
      } else {
        await addStudent(formData);
        toast({ title: 'Student added successfully' });
      }
      setIsDialogOpen(false);
      setFormData({ fullName: '', phone: '', status: 'active' });
    } catch (error) {
      toast({ 
        title: 'Error', 
        description: 'Failed to save student', 
        variant: 'destructive' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedStudent?.id) return;
    
    setIsSubmitting(true);
    try {
      await deleteStudent(selectedStudent.id);
      toast({ title: 'Student deleted successfully' });
      setIsDeleteDialogOpen(false);
      setSelectedStudent(null);
    } catch (error) {
      toast({ 
        title: 'Error', 
        description: 'Failed to delete student', 
        variant: 'destructive' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDeleteDialog = (student: Student) => {
    setSelectedStudent(student);
    setIsDeleteDialogOpen(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Students</h1>
          <p className="text-muted-foreground mt-1">
            Manage registered students
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="gradient-primary gap-2">
          <Plus className="w-4 h-4" />
          Add Student
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="stat-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{students.length}</p>
                <p className="text-sm text-muted-foreground">Total Students</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <User className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {students.filter(s => s.status === 'active').length}
                </p>
                <p className="text-sm text-muted-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <User className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {students.filter(s => s.status === 'inactive').length}
                </p>
                <p className="text-sm text-muted-foreground">Inactive</p>
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
              <CardTitle>Student List</CardTitle>
              <CardDescription>
                All registered students in the system
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search students..."
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
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-12">
              <User className="w-12 h-12 mx-auto text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-medium text-foreground">No students found</h3>
              <p className="mt-2 text-muted-foreground">
                {searchQuery 
                  ? 'Try adjusting your search query'
                  : 'Get started by adding your first student'}
              </p>
              {!searchQuery && (
                <Button onClick={() => handleOpenDialog()} className="mt-4 gradient-primary">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Student
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Full Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Registered</TableHead>
                    <TableHead className="w-[70px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => (
                    <TableRow key={student.id} className="table-row-hover">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-sm font-medium text-primary">
                              {student.fullName.charAt(0)}
                            </span>
                          </div>
                          <span className="font-medium">{student.fullName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="w-4 h-4" />
                          {student.phone}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={student.status === 'active' ? 'default' : 'secondary'}
                          className={student.status === 'active' 
                            ? 'bg-success/10 text-success hover:bg-success/20' 
                            : ''
                          }
                        >
                          {student.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {student.createdAt?.toLocaleDateString?.() || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleOpenDialog(student)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => openDeleteDialog(student)}
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
              {selectedStudent ? 'Edit Student' : 'Add New Student'}
            </DialogTitle>
            <DialogDescription>
              {selectedStudent 
                ? 'Update the student information below' 
                : 'Enter the student details below'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Enter full name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Enter phone number"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: 'active' | 'inactive') => 
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
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
                  selectedStudent ? 'Update' : 'Add Student'
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
            <DialogTitle>Delete Student</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedStudent?.fullName}"? This action cannot be undone.
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

export default StudentsPage;
