import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Search, Loader2, Phone, Edit, Trash2 } from 'lucide-react';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { collection, onSnapshot, orderBy, query, doc, updateDoc, addDoc, Timestamp, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { StudentRequest } from '@/types';

const StudentRequestsPage = () => {
  const [requests, setRequests] = useState<StudentRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<StudentRequest | null>(null);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({ fullName: '', phone: '' });

  useEffect(() => {
    const q = query(collection(db, 'student_requests'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(
      q,
      snapshot => {
        const list = snapshot.docs.map(d => ({
          id: d.id,
          ...d.data(),
          createdAt: d.data().createdAt?.toDate() || new Date(),
        })) as StudentRequest[];
        setRequests(list);
        setIsLoading(false);
      },
      () => {
        setIsLoading(false);
        toast({ title: 'Error', description: 'Failed to load requests', variant: 'destructive' });
      }
    );
    return () => unsubscribe();
  }, []);

  const filteredRequests = requests.filter(r =>
    r.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.phone.includes(searchQuery)
  );

  const openApproveDialog = (req: StudentRequest) => {
    setSelectedRequest(req);
    setIsApproveDialogOpen(true);
  };

  const openRejectDialog = (req: StudentRequest) => {
    setSelectedRequest(req);
    setIsRejectDialogOpen(true);
  };
  
  const openEditDialog = (req: StudentRequest) => {
    setSelectedRequest(req);
    setEditForm({ fullName: req.fullName, phone: req.phone });
    setIsEditDialogOpen(true);
  };
  
  const openDeleteDialog = (req: StudentRequest) => {
    setSelectedRequest(req);
    setIsDeleteDialogOpen(true);
  };

  const handleApprove = async () => {
    if (!selectedRequest?.id) return;
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'students'), {
        fullName: selectedRequest.fullName,
        phone: selectedRequest.phone,
        status: 'active',
        createdAt: Timestamp.now(),
      });
      await updateDoc(doc(db, 'student_requests', selectedRequest.id), { status: 'accepted' });
      setIsApproveDialogOpen(false);
      setSelectedRequest(null);
      toast({ title: 'Request approved' });
    } catch {
      toast({ title: 'Error', description: 'Failed to approve request', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest?.id) return;
    setIsSubmitting(true);
    try {
      await updateDoc(doc(db, 'student_requests', selectedRequest.id), { status: 'rejected' });
      setIsRejectDialogOpen(false);
      setSelectedRequest(null);
      toast({ title: 'Request rejected' });
    } catch {
      toast({ title: 'Error', description: 'Failed to reject request', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleUpdate = async () => {
    if (!selectedRequest?.id) return;
    setIsSubmitting(true);
    try {
      await updateDoc(doc(db, 'student_requests', selectedRequest.id), {
        fullName: editForm.fullName,
        phone: editForm.phone,
      });
      setIsEditDialogOpen(false);
      setSelectedRequest(null);
      toast({ title: 'Request updated' });
    } catch {
      toast({ title: 'Error', description: 'Failed to update request', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDelete = async () => {
    if (!selectedRequest?.id) return;
    setIsSubmitting(true);
    try {
      await deleteDoc(doc(db, 'student_requests', selectedRequest.id));
      setIsDeleteDialogOpen(false);
      setSelectedRequest(null);
      toast({ title: 'Request deleted' });
    } catch {
      toast({ title: 'Error', description: 'Failed to delete request', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Student Requests</h1>
          <p className="text-muted-foreground mt-1">Manage incoming registration requests</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Requests</CardTitle>
              <CardDescription>Approve or reject student registration requests</CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search requests..."
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
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="mt-4 text-lg font-medium text-foreground">No requests found</h3>
              <p className="mt-2 text-muted-foreground">New registrations will appear here</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Full Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Requested</TableHead>
                    <TableHead className="w-[160px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.map((req) => (
                    <TableRow key={req.id} className="table-row-hover">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-sm font-medium text-primary">
                              {req.fullName.charAt(0)}
                            </span>
                          </div>
                          <span className="font-medium">{req.fullName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="w-4 h-4" />
                          {req.phone}
                        </div>
                      </TableCell>
                      <TableCell className="capitalize">{req.status}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {req.createdAt?.toLocaleDateString?.() || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            className="text-success hover:text-success hover:bg-success/10"
                            onClick={() => openApproveDialog(req)}
                            disabled={req.status !== 'pending'}
                          >
                            <Check className="w-4 h-4 mr-2" />
                            Approve
                          </Button>
                          <Button
                            variant="ghost"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => openRejectDialog(req)}
                            disabled={req.status !== 'pending'}
                          >
                            <X className="w-4 h-4 mr-2" />
                            Reject
                          </Button>
                          <Button
                            variant="ghost"
                            onClick={() => openEditDialog(req)}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => openDeleteDialog(req)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Request</DialogTitle>
            <DialogDescription>Approve this student and add to the list</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label>Full Name</Label>
            <div className="text-foreground">{selectedRequest?.fullName}</div>
            <Label>Phone</Label>
            <div className="text-foreground">{selectedRequest?.phone}</div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApproveDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleApprove} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Approving...
                </>
              ) : (
                'Approve'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Request</DialogTitle>
            <DialogDescription>Reject this student registration request</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label>Full Name</Label>
            <div className="text-foreground">{selectedRequest?.fullName}</div>
            <Label>Phone</Label>
            <div className="text-foreground">{selectedRequest?.phone}</div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleReject} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Rejecting...
                </>
              ) : (
                'Reject'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Request</DialogTitle>
            <DialogDescription>Update the request details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="editFullName">Full Name</Label>
              <Input
                id="editFullName"
                value={editForm.fullName}
                onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editPhone">Phone</Label>
              <Input
                id="editPhone"
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdate} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Request</DialogTitle>
            <DialogDescription>This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label>Full Name</Label>
            <div className="text-foreground">{selectedRequest?.fullName}</div>
            <Label>Phone</Label>
            <div className="text-foreground">{selectedRequest?.phone}</div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isSubmitting}>
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

export default StudentRequestsPage;
