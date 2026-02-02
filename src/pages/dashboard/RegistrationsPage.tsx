import { useState, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  CalendarDays, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle,
  Printer
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { useRegistrations } from '@/hooks/useRegistrations';
import { useStudents } from '@/hooks/useStudents';
import { useCourses } from '@/hooks/useCourses';
import { useLanguage, translations, MONTHS } from '@/contexts/LanguageContext';
import { Registration } from '@/types';
import { PrintStudentList } from '@/components/PrintStudentList';

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

const RegistrationsPage = () => {
  const { toast } = useToast();
  const { language, t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMonth, setFilterMonth] = useState<number | undefined>();
  const [filterYear, setFilterYear] = useState<number | undefined>(currentYear);
  const [filterCourseId, setFilterCourseId] = useState<string | undefined>();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deleteRegistrationId, setDeleteRegistrationId] = useState<string | null>(null);
  const [editingRegistration, setEditingRegistration] = useState<Registration | null>(null);
  const printRef = useRef<HTMLDivElement>(null);
  
  // Form state
  const [formStudentId, setFormStudentId] = useState('');
  const [formCourseId, setFormCourseId] = useState('');
  const [formMonth, setFormMonth] = useState<number>(new Date().getMonth() + 1);
  const [formYear, setFormYear] = useState<number>(currentYear);
  const [formPaymentStatus, setFormPaymentStatus] = useState<'paid' | 'unpaid'>('unpaid');

  const { registrations, isLoading, addRegistration, updateRegistration, deleteRegistration } = useRegistrations({
    month: filterMonth,
    year: filterYear,
    courseId: filterCourseId,
  });
  const { students } = useStudents();
  const { courses } = useCourses();

  // Get student/course names by ID
  const getStudentName = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    return student?.fullName || 'Unknown Student';
  };

  const getCourseName = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    return course?.courseName || 'Unknown Course';
  };

  // Filter registrations by search
  const filteredRegistrations = useMemo(() => {
    if (!searchTerm) return registrations;
    const term = searchTerm.toLowerCase();
    return registrations.filter(reg => {
      const studentName = getStudentName(reg.studentId).toLowerCase();
      const courseName = getCourseName(reg.courseId).toLowerCase();
      return studentName.includes(term) || courseName.includes(term);
    });
  }, [registrations, searchTerm, students, courses]);

  const resetForm = () => {
    setFormStudentId('');
    setFormCourseId('');
    setFormMonth(new Date().getMonth() + 1);
    setFormYear(currentYear);
    setFormPaymentStatus('unpaid');
  };

  const handleAdd = async () => {
    if (!formStudentId || !formCourseId) {
      toast({
        title: 'Error',
        description: 'Please select a student and course',
        variant: 'destructive',
      });
      return;
    }

    try {
      await addRegistration({
        studentId: formStudentId,
        courseId: formCourseId,
        month: formMonth,
        year: formYear,
        paymentStatus: formPaymentStatus,
      });
      toast({
        title: 'Success',
        description: 'Registration added successfully',
      });
      setIsAddDialogOpen(false);
      resetForm();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add registration',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = async () => {
    if (!editingRegistration?.id) return;

    try {
      await updateRegistration(editingRegistration.id, {
        studentId: formStudentId,
        courseId: formCourseId,
        month: formMonth,
        year: formYear,
        paymentStatus: formPaymentStatus,
      });
      toast({
        title: 'Success',
        description: 'Registration updated successfully',
      });
      setIsEditDialogOpen(false);
      setEditingRegistration(null);
      resetForm();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update registration',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteRegistrationId) return;

    try {
      await deleteRegistration(deleteRegistrationId);
      toast({
        title: 'Success',
        description: 'Registration deleted successfully',
      });
      setDeleteRegistrationId(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete registration',
        variant: 'destructive',
      });
    }
  };

  const openEditDialog = (registration: Registration) => {
    setEditingRegistration(registration);
    setFormStudentId(registration.studentId);
    setFormCourseId(registration.courseId);
    setFormMonth(registration.month);
    setFormYear(registration.year);
    setFormPaymentStatus(registration.paymentStatus);
    setIsEditDialogOpen(true);
  };

  // Prepare data for print
  const printData = useMemo(() => {
    return filteredRegistrations.map(reg => ({
      studentName: getStudentName(reg.studentId),
      courseName: getCourseName(reg.courseId),
      month: reg.month,
      year: reg.year,
      paymentStatus: reg.paymentStatus,
    }));
  }, [filteredRegistrations, students, courses]);

  const handlePrintList = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Student Registration List</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .print-content { max-width: 800px; margin: 0 auto; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f4f4f4; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            .text-green-600 { color: #16a34a; }
            .text-red-600 { color: #dc2626; }
            .text-teal-600 { color: #0d9488; }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const activeStudents = students.filter(s => s.status === 'active');
  const activeCourses = courses.filter(c => c.active);
  const filterCourseName = filterCourseId ? courses.find(c => c.id === filterCourseId)?.courseName : undefined;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
            {t(translations.registrations)}
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage monthly student registrations
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={handlePrintList}>
            <Printer className="w-4 h-4" />
            {t(translations.printList)}
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                {t(translations.registerStudent)}
              </Button>
            </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{t(translations.registerStudent)}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>{t(translations.selectStudent)}</Label>
                <Select value={formStudentId} onValueChange={setFormStudentId}>
                  <SelectTrigger>
                    <SelectValue placeholder={t(translations.selectStudent)} />
                  </SelectTrigger>
                  <SelectContent>
                    {activeStudents.map((student) => (
                      <SelectItem key={student.id} value={student.id!}>
                        {student.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>{t(translations.selectCourse)}</Label>
                <Select value={formCourseId} onValueChange={setFormCourseId}>
                  <SelectTrigger>
                    <SelectValue placeholder={t(translations.selectCourse)} />
                  </SelectTrigger>
                  <SelectContent>
                    {activeCourses.map((course) => (
                      <SelectItem key={course.id} value={course.id!}>
                        {course.courseName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>{t(translations.month)}</Label>
                  <Select value={formMonth.toString()} onValueChange={(v) => setFormMonth(parseInt(v))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MONTHS.map((month, index) => (
                        <SelectItem key={index} value={(index + 1).toString()}>
                          {month[language]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>{t(translations.year)}</Label>
                  <Select value={formYear.toString()} onValueChange={(v) => setFormYear(parseInt(v))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label>{t(translations.paymentStatus)}</Label>
                <Select value={formPaymentStatus} onValueChange={(v) => setFormPaymentStatus(v as 'paid' | 'unpaid')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paid">{t(translations.paid)}</SelectItem>
                    <SelectItem value="unpaid">{t(translations.unpaid)}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                {t(translations.cancel)}
              </Button>
              <Button onClick={handleAdd}>{t(translations.save)}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        </div>
      </motion.div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder={`${t(translations.search)}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={filterMonth?.toString() || 'all'}
              onValueChange={(v) => setFilterMonth(v === 'all' ? undefined : parseInt(v))}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder={t(translations.month)} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Months</SelectItem>
                {MONTHS.map((month, index) => (
                  <SelectItem key={index} value={(index + 1).toString()}>
                    {month[language]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filterYear?.toString() || 'all'}
              onValueChange={(v) => setFilterYear(v === 'all' ? undefined : parseInt(v))}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder={t(translations.year)} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filterCourseId || 'all'}
              onValueChange={(v) => setFilterCourseId(v === 'all' ? undefined : v)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t(translations.course)} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id!}>
                    {course.courseName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Registrations Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-primary" />
            {t(translations.registrations)} ({filteredRegistrations.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              {t(translations.loading)}
            </div>
          ) : filteredRegistrations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {t(translations.noData)}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t(translations.student)}</TableHead>
                  <TableHead>{t(translations.course)}</TableHead>
                  <TableHead>{t(translations.month)}</TableHead>
                  <TableHead>{t(translations.year)}</TableHead>
                  <TableHead>{t(translations.paymentStatus)}</TableHead>
                  <TableHead className="text-right">{t(translations.actions)}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRegistrations.map((registration) => (
                  <TableRow key={registration.id}>
                    <TableCell className="font-medium">
                      {getStudentName(registration.studentId)}
                    </TableCell>
                    <TableCell>{getCourseName(registration.courseId)}</TableCell>
                    <TableCell>{MONTHS[registration.month - 1]?.[language]}</TableCell>
                    <TableCell>{registration.year}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={registration.paymentStatus === 'paid' ? 'default' : 'destructive'}
                        className="gap-1"
                      >
                        {registration.paymentStatus === 'paid' ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : (
                          <XCircle className="w-3 h-3" />
                        )}
                        {registration.paymentStatus === 'paid' ? t(translations.paid) : t(translations.unpaid)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(registration)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteRegistrationId(registration.id!)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t(translations.edit)} {t(translations.registrations)}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>{t(translations.selectStudent)}</Label>
              <Select value={formStudentId} onValueChange={setFormStudentId}>
                <SelectTrigger>
                  <SelectValue placeholder={t(translations.selectStudent)} />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id!}>
                      {student.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>{t(translations.selectCourse)}</Label>
              <Select value={formCourseId} onValueChange={setFormCourseId}>
                <SelectTrigger>
                  <SelectValue placeholder={t(translations.selectCourse)} />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id!}>
                      {course.courseName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>{t(translations.month)}</Label>
                <Select value={formMonth.toString()} onValueChange={(v) => setFormMonth(parseInt(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTHS.map((month, index) => (
                      <SelectItem key={index} value={(index + 1).toString()}>
                        {month[language]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>{t(translations.year)}</Label>
                <Select value={formYear.toString()} onValueChange={(v) => setFormYear(parseInt(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>{t(translations.paymentStatus)}</Label>
              <Select value={formPaymentStatus} onValueChange={(v) => setFormPaymentStatus(v as 'paid' | 'unpaid')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paid">{t(translations.paid)}</SelectItem>
                  <SelectItem value="unpaid">{t(translations.unpaid)}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              {t(translations.cancel)}
            </Button>
            <Button onClick={handleEdit}>{t(translations.save)}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteRegistrationId} onOpenChange={() => setDeleteRegistrationId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Registration</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this registration? This action cannot be undone.
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

      {/* Hidden Print Component */}
      <div className="hidden">
        <PrintStudentList
          ref={printRef}
          students={printData}
          filterMonth={filterMonth}
          filterYear={filterYear}
          filterCourse={filterCourseName}
        />
      </div>
    </div>
  );
};

export default RegistrationsPage;
