import { useState, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  CreditCard, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  FileText,
  TrendingUp,
  Calendar,
  DollarSign,
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { usePayments } from '@/hooks/usePayments';
import { useStudents } from '@/hooks/useStudents';
import { useLanguage, translations, MONTHS } from '@/contexts/LanguageContext';
import { Payment, PAYMENT_METHODS } from '@/types';
import { format } from 'date-fns';
import { auth } from '@/lib/firebase';

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

const PaymentsPage = () => {
  const { toast } = useToast();
  const { language, t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMonth, setFilterMonth] = useState<number | undefined>();
  const [filterYear, setFilterYear] = useState<number | undefined>(currentYear);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isReceiptDialogOpen, setIsReceiptDialogOpen] = useState(false);
  const [deletePaymentId, setDeletePaymentId] = useState<string | null>(null);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const receiptRef = useRef<HTMLDivElement>(null);
  
  // Form state
  const [formStudentId, setFormStudentId] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formMonth, setFormMonth] = useState<number>(new Date().getMonth() + 1);
  const [formYear, setFormYear] = useState<number>(currentYear);
  const [formMethod, setFormMethod] = useState('Cash');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { payments, isLoading, addPayment, updatePayment, deletePayment, reports } = usePayments({
    month: filterMonth,
    year: filterYear,
  });
  const { students, isLoading: studentsLoading } = useStudents();

  const getStudentName = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    return student?.fullName || 'Unknown Student';
  };

  const getStudentPhone = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    return student?.phone || '';
  };

  const filteredPayments = useMemo(() => {
    if (!searchTerm) return payments;
    const term = searchTerm.toLowerCase();
    return payments.filter(payment => {
      const studentName = getStudentName(payment.studentId).toLowerCase();
      return studentName.includes(term) || payment.method.toLowerCase().includes(term);
    });
  }, [payments, searchTerm, students]);

  const resetForm = () => {
    setFormStudentId('');
    setFormAmount('');
    setFormMonth(new Date().getMonth() + 1);
    setFormYear(currentYear);
    setFormMethod('Cash');
  };

  const handleAdd = async () => {
    // Check authentication status
    const currentUser = auth.currentUser;
    if (!currentUser) {
      toast({
        title: 'Authentication Error',
        description: 'You must be logged in to add payments',
        variant: 'destructive',
      });
      return;
    }

    if (!formStudentId || !formAmount) {
      toast({
        title: 'Error',
        description: 'Please fill all required fields',
        variant: 'destructive',
      });
      return;
    }

    if (parseFloat(formAmount) <= 0) {
      toast({
        title: 'Error',
        description: 'Amount must be greater than 0',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await addPayment({
        studentId: formStudentId,
        amount: parseFloat(formAmount),
        month: formMonth,
        year: formYear,
        method: formMethod,
      });
      toast({
        title: 'Success',
        description: 'Payment added successfully',
      });
      setIsAddDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error adding payment:', error);
      
      // Check for specific Firebase errors
      if (error instanceof Error) {
        if (error.message.includes('permission') || error.message.includes('insufficient')) {
          toast({
            title: 'Permission Error',
            description: 'You do not have permission to add payments. Please check Firebase security rules.',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Error',
            description: `Failed to add payment: ${error.message}`,
            variant: 'destructive',
          });
        }
      } else {
        toast({
          title: 'Error',
          description: 'An unknown error occurred while adding payment',
          variant: 'destructive',
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!editingPayment?.id) return;

    try {
      await updatePayment(editingPayment.id, {
        studentId: formStudentId,
        amount: parseFloat(formAmount),
        month: formMonth,
        year: formYear,
        method: formMethod,
      });
      toast({
        title: 'Success',
        description: 'Payment updated successfully',
      });
      setIsEditDialogOpen(false);
      setEditingPayment(null);
      resetForm();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update payment',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!deletePaymentId) return;

    try {
      await deletePayment(deletePaymentId);
      toast({
        title: 'Success',
        description: 'Payment deleted successfully',
      });
      setDeletePaymentId(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete payment',
        variant: 'destructive',
      });
    }
  };

  const openEditDialog = (payment: Payment) => {
    setEditingPayment(payment);
    setFormStudentId(payment.studentId);
    setFormAmount(payment.amount.toString());
    setFormMonth(payment.month);
    setFormYear(payment.year);
    setFormMethod(payment.method);
    setIsEditDialogOpen(true);
  };

  const openReceiptDialog = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsReceiptDialogOpen(true);
  };

  const handlePrint = () => {
    const printContent = receiptRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Payment Receipt</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .receipt { max-width: 400px; margin: 0 auto; border: 2px solid #333; padding: 20px; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
            .header h1 { margin: 0; color: #0d9488; }
            .header p { margin: 5px 0; color: #666; }
            .details { margin-bottom: 20px; }
            .details p { margin: 8px 0; display: flex; justify-content: space-between; }
            .details strong { color: #333; }
            .amount { font-size: 24px; text-align: center; padding: 15px; background: #f0fdfa; border-radius: 8px; margin: 20px 0; }
            .footer { text-align: center; color: #666; font-size: 12px; border-top: 1px solid #ddd; padding-top: 10px; }
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

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
    }).format(amount);
  };

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
            {t(translations.payments)}
          </h1>
          <p className="text-muted-foreground mt-1">
            Track and manage student payments
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              {t(translations.addPayment)}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{t(translations.addPayment)}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>{t(translations.selectStudent)}</Label>
                {studentsLoading ? (
                  <div className="text-sm text-muted-foreground">Loading students...</div>
                ) : activeStudents.length === 0 ? (
                  <div className="text-sm text-destructive">No active students found. Please add students first.</div>
                ) : (
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
                )}
              </div>
              <div className="grid gap-2">
                <Label>{t(translations.amount)} (ETB)</Label>
                <Input
                  type="number"
                  value={formAmount}
                  onChange={(e) => setFormAmount(e.target.value)}
                  placeholder="Enter amount"
                />
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
                <Label>{t(translations.paymentMethod)}</Label>
                <Select value={formMethod} onValueChange={setFormMethod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_METHODS.map((method) => (
                      <SelectItem key={method} value={method}>
                        {method}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsAddDialogOpen(false)}
                disabled={isSubmitting}
              >
                {t(translations.cancel)}
              </Button>
              <Button 
                onClick={handleAdd}
                disabled={isSubmitting || !formStudentId || !formAmount || studentsLoading}
              >
                {isSubmitting ? 'Adding...' : t(translations.save)}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="stat-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t(translations.total)}</p>
                <p className="text-2xl font-bold">{formatCurrency(reports.totalAmount)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(reports.byMonth[`${currentYear}-${new Date().getMonth() + 1}`] || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">This Year</p>
                <p className="text-2xl font-bold">{formatCurrency(reports.byYear[currentYear] || 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <FileText className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Transactions</p>
                <p className="text-2xl font-bold">{payments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Payments and Reports */}
      <Tabs defaultValue="payments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="payments">{t(translations.payments)}</TabsTrigger>
          <TabsTrigger value="reports">{t(translations.report)}</TabsTrigger>
        </TabsList>

        <TabsContent value="payments" className="space-y-4">
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
              </div>
            </CardContent>
          </Card>

          {/* Payments Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                {t(translations.payments)} ({filteredPayments.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  {t(translations.loading)}
                </div>
              ) : filteredPayments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {t(translations.noData)}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t(translations.student)}</TableHead>
                      <TableHead>{t(translations.amount)}</TableHead>
                      <TableHead>{t(translations.month)}</TableHead>
                      <TableHead>{t(translations.year)}</TableHead>
                      <TableHead>{t(translations.paymentMethod)}</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">{t(translations.actions)}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPayments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium">
                          {getStudentName(payment.studentId)}
                        </TableCell>
                        <TableCell className="font-semibold text-primary">
                          {formatCurrency(payment.amount)}
                        </TableCell>
                        <TableCell>{MONTHS[payment.month - 1]?.[language]}</TableCell>
                        <TableCell>{payment.year}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{payment.method}</Badge>
                        </TableCell>
                        <TableCell>
                          {format(payment.createdAt, 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openReceiptDialog(payment)}
                              title="View Receipt"
                            >
                              <FileText className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditDialog(payment)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeletePaymentId(payment.id!)}
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
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Report */}
            <Card>
              <CardHeader>
                <CardTitle>{t(translations.monthlyReport)}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(reports.byMonth)
                    .sort((a, b) => b[0].localeCompare(a[0]))
                    .slice(0, 12)
                    .map(([key, amount]) => {
                      const [year, month] = key.split('-');
                      return (
                        <div key={key} className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                          <span>{MONTHS[parseInt(month) - 1]?.[language]} {year}</span>
                          <span className="font-semibold text-primary">{formatCurrency(amount)}</span>
                        </div>
                      );
                    })}
                  {Object.keys(reports.byMonth).length === 0 && (
                    <p className="text-center py-4 text-muted-foreground">{t(translations.noData)}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Yearly Report */}
            <Card>
              <CardHeader>
                <CardTitle>{t(translations.yearlyReport)}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(reports.byYear)
                    .sort((a, b) => parseInt(b[0]) - parseInt(a[0]))
                    .map(([year, amount]) => (
                      <div key={year} className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                        <span className="font-medium">{year}</span>
                        <span className="font-semibold text-primary">{formatCurrency(amount)}</span>
                      </div>
                    ))}
                  {Object.keys(reports.byYear).length === 0 && (
                    <p className="text-center py-4 text-muted-foreground">{t(translations.noData)}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Payment Methods */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Payment Methods Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {Object.entries(reports.byMethod).map(([method, amount]) => (
                    <div key={method} className="p-4 rounded-lg bg-muted/50 text-center">
                      <p className="text-sm text-muted-foreground">{method}</p>
                      <p className="text-xl font-bold text-primary mt-1">{formatCurrency(amount)}</p>
                    </div>
                  ))}
                  {Object.keys(reports.byMethod).length === 0 && (
                    <p className="col-span-4 text-center py-4 text-muted-foreground">{t(translations.noData)}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t(translations.edit)} {t(translations.payments)}</DialogTitle>
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
              <Label>{t(translations.amount)} (ETB)</Label>
              <Input
                type="number"
                value={formAmount}
                onChange={(e) => setFormAmount(e.target.value)}
                placeholder="Enter amount"
              />
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
              <Label>{t(translations.paymentMethod)}</Label>
              <Select value={formMethod} onValueChange={setFormMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((method) => (
                    <SelectItem key={method} value={method}>
                      {method}
                    </SelectItem>
                  ))}
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

      {/* Receipt Dialog */}
      <Dialog open={isReceiptDialogOpen} onOpenChange={setIsReceiptDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              {t(translations.receipt)}
            </DialogTitle>
          </DialogHeader>
          {selectedPayment && (
            <div ref={receiptRef} className="receipt">
              <div className="header">
                <h1 className="text-xl font-bold text-primary">ORO DIGITAL</h1>
                <p className="text-sm text-muted-foreground">Computer Training Center</p>
                <p className="text-xs text-muted-foreground">Payment Receipt</p>
              </div>
              <div className="details space-y-3 py-4 border-b">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Receipt No:</span>
                  <span className="font-medium">{selectedPayment.id?.slice(-8).toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date:</span>
                  <span className="font-medium">{format(selectedPayment.createdAt, 'MMMM dd, yyyy')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Student:</span>
                  <span className="font-medium">{getStudentName(selectedPayment.studentId)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phone:</span>
                  <span className="font-medium">{getStudentPhone(selectedPayment.studentId)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Period:</span>
                  <span className="font-medium">
                    {MONTHS[selectedPayment.month - 1]?.[language]} {selectedPayment.year}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Method:</span>
                  <span className="font-medium">{selectedPayment.method}</span>
                </div>
              </div>
              <div className="amount text-center py-4 bg-primary/10 rounded-lg my-4">
                <p className="text-sm text-muted-foreground">Amount Paid</p>
                <p className="text-2xl font-bold text-primary">{formatCurrency(selectedPayment.amount)}</p>
              </div>
              <div className="footer text-center text-xs text-muted-foreground pt-4 border-t">
                <p>Thank you for your payment!</p>
                <p className="mt-1">ORO DIGITAL - Excellence in Computer Training</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReceiptDialogOpen(false)}>
              Close
            </Button>
            <Button onClick={handlePrint} className="gap-2">
              <Printer className="w-4 h-4" />
              {t(translations.print)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletePaymentId} onOpenChange={() => setDeletePaymentId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Payment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this payment record? This action cannot be undone.
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

export default PaymentsPage;
