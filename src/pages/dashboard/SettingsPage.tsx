import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { LANGUAGES } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { User, Globe, Moon, Bell, Users, Plus, Shield, Trash2, Mail, Key, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail } from 'firebase/auth';
import { doc, setDoc, serverTimestamp, collection, getDocs, deleteDoc, query, orderBy, updateDoc } from 'firebase/firestore';
import { db, firebaseConfig, auth } from '@/lib/firebase';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: any;
}

const SettingsPage = () => {
  const { admin, user, logout } = useAuth();
  const { language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  
  const [emailNotifications, setEmailNotifications] = useState(true);
  
  // Admin Management State
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [isLoadingAdmins, setIsLoadingAdmins] = useState(false);
  const [isAddAdminOpen, setIsAddAdminOpen] = useState(false);
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [newAdminRole, setNewAdminRole] = useState('admin');
  const [isAddingAdmin, setIsAddingAdmin] = useState(false);
  const [isEditAdminOpen, setIsEditAdminOpen] = useState(false);
  const [editAdminId, setEditAdminId] = useState<string | null>(null);
  const [editAdminName, setEditAdminName] = useState('');
  const [editAdminEmail, setEditAdminEmail] = useState('');
  const [editAdminRole, setEditAdminRole] = useState('admin');
  const [isUpdatingAdmin, setIsUpdatingAdmin] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmPurpose, setConfirmPurpose] = useState<'add' | 'edit' | 'delete' | null>(null);
  const [confirmTargetId, setConfirmTargetId] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedEmailNotifications = localStorage.getItem('emailNotifications');
    if (savedEmailNotifications !== null) {
      setEmailNotifications(JSON.parse(savedEmailNotifications));
    }
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      setIsLoadingAdmins(true);
      const q = query(collection(db, 'admins'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const adminsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AdminUser[];
      const isAbdi = user?.email === 'abdi@gmail.com';
      const hasAbdi = adminsList.some(a => a.id === user?.uid);
      if (isAbdi && !hasAbdi && user?.uid) {
        adminsList.unshift({
          id: user.uid,
          name: user.displayName || 'Abdi',
          email: user.email || 'abdi@gmail.com',
          role: 'admin',
          createdAt: serverTimestamp(),
        } as any);
      }
      setAdmins(adminsList);
    } catch (error) {
      console.error('Error fetching admins:', error);
    } finally {
      setIsLoadingAdmins(false);
    }
  };

  const handleSave = () => {
    // Save settings to localStorage
    localStorage.setItem('emailNotifications', JSON.stringify(emailNotifications));
    
    toast({
      title: 'Settings saved',
      description: 'Your preferences have been updated.',
    });
  };

  const handleThemeChange = (checked: boolean) => {
    setTheme(checked ? 'dark' : 'light');
  };

  const handleEmailNotificationsChange = (checked: boolean) => {
    setEmailNotifications(checked);
  };

  const handleAddAdmin = async () => {
    if (!newAdminName || !newAdminEmail || !newAdminPassword) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    if (newAdminPassword.length < 6) {
      toast({
        title: 'Error',
        description: 'Password must be at least 6 characters',
        variant: 'destructive',
      });
      return;
    }

    // Require taajuu admin password verification for adding new admins
    setConfirmPurpose('add');
    setIsConfirmOpen(true);
  };

  const handleConfirmAddAdmin = async () => {
    setIsAddingAdmin(true);
    let secondaryApp;

    try {
      // Initialize a secondary app instance to create user without logging out current user
      secondaryApp = initializeApp(firebaseConfig, "Secondary");
      const secondaryAuth = getAuth(secondaryApp);
      
      let userCredential;
      let isExistingUser = false;

      try {
        userCredential = await createUserWithEmailAndPassword(
          secondaryAuth, 
          newAdminEmail, 
          newAdminPassword
        );
      } catch (createError: any) {
        if (createError.code === 'auth/email-already-in-use') {
          // Attempt to recover by signing in with provided password
          try {
            userCredential = await signInWithEmailAndPassword(
              secondaryAuth,
              newAdminEmail,
              newAdminPassword
            );
            isExistingUser = true;
          } catch (signInError) {
            // Password didn't match or other error
            throw createError; // Throw original 'email-in-use' error
          }
        } else {
          throw createError;
        }
      }

      if (userCredential) {
        // Add to admins collection using main app's db (authenticated as current admin)
        await setDoc(doc(db, 'admins', userCredential.user.uid), {
          name: newAdminName,
          email: newAdminEmail,
          role: newAdminRole,
          createdAt: serverTimestamp(),
        });

        // Sign out from secondary app
        await signOut(secondaryAuth);

        toast({
          title: 'Success',
          description: isExistingUser 
            ? 'Existing user account successfully promoted to admin' 
            : 'New admin user created successfully',
        });

        setIsAddAdminOpen(false);
        setNewAdminName('');
        setNewAdminEmail('');
        setNewAdminPassword('');
        setNewAdminRole('admin');
        fetchAdmins(); // Refresh list
      }

    } catch (error: any) {
      console.error('Error adding admin:', error);
      let errorMessage = 'Failed to create admin user';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Email is already in use';
      } else if (error.code === 'permission-denied') {
        errorMessage = 'You do not have permission to create admins';
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      if (secondaryApp) {
        await deleteApp(secondaryApp);
      }
      setIsAddingAdmin(false);
    }
  };

  const handleSendPasswordReset = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      toast({
        title: 'Email Sent',
        description: `Password reset link sent to ${email}`,
      });
    } catch (error: any) {
      console.error('Error sending reset email:', error);
      toast({
        title: 'Error',
        description: 'Failed to send password reset email',
        variant: 'destructive',
      });
    }
  };

  const openEditAdmin = (adminUser: AdminUser) => {
    if (user?.email !== 'taju@gmail.com') {
      toast({
        title: 'Access denied',
        description: 'Only taju@gmail.com can edit admins',
        variant: 'destructive',
      });
      return;
    }
    setEditAdminId(adminUser.id);
    setEditAdminName(adminUser.name || '');
    setEditAdminEmail(adminUser.email || '');
    setEditAdminRole(adminUser.role || 'admin');
    setIsEditAdminOpen(true);
  };

  const handleUpdateAdmin = async () => {
    if (!editAdminId || !editAdminName || !editAdminEmail) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }
    if (user?.email !== 'taju@gmail.com') {
      toast({
        title: 'Access denied',
        description: 'Only taju@gmail.com can edit admins',
        variant: 'destructive',
      });
      return;
    }
    try {
      setIsUpdatingAdmin(true);
      await setDoc(doc(db, 'admins', editAdminId), {
        name: editAdminName,
        email: editAdminEmail,
        role: editAdminRole,
      }, { merge: true });
      toast({
        title: 'Success',
        description: 'Admin updated successfully',
      });
      setIsEditAdminOpen(false);
      setEditAdminId(null);
      fetchAdmins();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update admin',
        variant: 'destructive',
      });
    } finally {
      setIsUpdatingAdmin(false);
    }
  };

  const handleDeleteAdmin = async (adminId: string) => {
    if (user?.email !== 'taju@gmail.com') {
      toast({
        title: 'Access denied',
        description: 'Only taju@gmail.com can delete admins',
        variant: 'destructive',
      });
      return;
    }
    setConfirmPurpose('delete');
    setConfirmTargetId(adminId);
    setIsConfirmOpen(true);
    return;

    try {
      await deleteDoc(doc(db, 'admins', adminId));
      toast({
        title: 'Success',
        description: 'Admin removed successfully',
      });
      fetchAdmins();
    } catch (error) {
      console.error('Error removing admin:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove admin',
        variant: 'destructive',
      });
    }
  };

  const verifyTajuPassword = async (): Promise<boolean> => {
    setIsConfirming(true);
    let secondaryApp;
    try {
      secondaryApp = initializeApp(firebaseConfig, 'SecondaryConfirm');
      const secondaryAuth = getAuth(secondaryApp);
      await signInWithEmailAndPassword(secondaryAuth, 'taju@gmail.com', confirmPassword);
      await signOut(secondaryAuth);
      return true;
    } catch (error) {
      return false;
    } finally {
      if (secondaryApp) await deleteApp(secondaryApp);
      setIsConfirming(false);
    }
  };

  const handleConfirmProceed = async () => {
    const ok = await verifyTajuPassword();
    if (!ok) {
      toast({
        title: 'Incorrect password',
        description: 'The password for taju@gmail.com is incorrect',
        variant: 'destructive',
      });
      return;
    }
    
    if (confirmPurpose === 'add') {
      await handleConfirmAddAdmin();
      setIsConfirmOpen(false);
      setConfirmPassword('');
      setConfirmPurpose(null);
    } else if (confirmPurpose === 'delete' && confirmTargetId) {
      try {
        await deleteDoc(doc(db, 'admins', confirmTargetId));
        toast({ title: 'Success', description: 'Admin removed successfully' });
        fetchAdmins();
      } catch {
        toast({ title: 'Error', description: 'Failed to remove admin', variant: 'destructive' });
      } finally {
        setIsConfirmOpen(false);
        setConfirmPassword('');
        setConfirmPurpose(null);
        setConfirmTargetId(null);
      }
    } else if (confirmPurpose === 'edit') {
      await handleUpdateAdmin();
      setIsConfirmOpen(false);
      setConfirmPassword('');
      setConfirmPurpose(null);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid gap-6">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              <CardTitle>Profile Information</CardTitle>
            </div>
            <CardDescription>
              Update your account details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <div className="p-2 border rounded-md bg-muted/50 text-sm">
                  {admin?.name || 'Admin User'}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <div className="p-2 border rounded-md bg-muted/50 text-sm">
                  {admin?.email || 'admin@orodigital.com'}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <div className="p-2 border rounded-md bg-muted/50 text-sm capitalize">
                  {admin?.role || 'Administrator'}
                </div>
              </div>
            </div>
            <div className="pt-2">
                <Button variant="destructive" onClick={logout} size="sm">Sign Out</Button>
            </div>
          </CardContent>
        </Card>

        {/* Admin Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              <CardTitle>User Management</CardTitle>
            </div>
            <CardDescription>
              Manage system administrators and roles
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Admin Users</Label>
                <p className="text-sm text-muted-foreground">
                  Create new administrators for the dashboard
                </p>
              </div>
              
              <Dialog open={isAddAdminOpen} onOpenChange={setIsAddAdminOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add Admin
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Administrator</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <div className="flex items-start gap-2">
                        <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                          <strong>Note:</strong> Creating new admin accounts requires super admin (taju@gmail.com) password verification.
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input 
                        id="name" 
                        value={newAdminName}
                        onChange={(e) => setNewAdminName(e.target.value)}
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input 
                        id="email" 
                        type="email"
                        value={newAdminEmail}
                        onChange={(e) => setNewAdminEmail(e.target.value)}
                        placeholder="john@example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input 
                        id="password" 
                        type="password"
                        value={newAdminPassword}
                        onChange={(e) => setNewAdminPassword(e.target.value)}
                        placeholder="Min. 6 characters"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <Select value={newAdminRole} onValueChange={setNewAdminRole}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Administrator (Full Access)</SelectItem>
                          <SelectItem value="editor">Editor (Content Only)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddAdminOpen(false)}>Cancel</Button>
                    <Button onClick={handleAddAdmin} disabled={isAddingAdmin} className="gap-2">
                      <Shield className="w-4 h-4" />
                      {isAddingAdmin ? 'Creating...' : 'Verify & Create Admin'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <Dialog open={isEditAdminOpen} onOpenChange={setIsEditAdminOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Administrator</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-name">Full Name</Label>
                    <Input 
                      id="edit-name" 
                      value={editAdminName}
                      onChange={(e) => setEditAdminName(e.target.value)}
                      placeholder="Full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-email">Email Address</Label>
                    <Input 
                      id="edit-email" 
                      type="email"
                      value={editAdminEmail}
                      onChange={(e) => setEditAdminEmail(e.target.value)}
                      placeholder="email@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-role">Role</Label>
                    <Select value={editAdminRole} onValueChange={setEditAdminRole}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Administrator (Full Access)</SelectItem>
                        <SelectItem value="editor">Editor (Content Only)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-between">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => handleSendPasswordReset(editAdminEmail)}
                    >
                      Send Password Reset
                    </Button>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsEditAdminOpen(false)}>Cancel</Button>
                  <Button 
                    onClick={() => {
                      setConfirmPurpose('edit');
                      setIsConfirmOpen(true);
                    }} 
                    disabled={isUpdatingAdmin}
                  >
                    {isUpdatingAdmin ? 'Updating...' : 'Save Changes'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {confirmPurpose === 'add' ? 'Confirm Admin Creation' : 
                     confirmPurpose === 'edit' ? 'Confirm Admin Update' : 
                     'Confirm Admin Deletion'}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Shield className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-amber-800 dark:text-amber-200 mb-1">
                          Super Admin Verification Required
                        </p>
                        <p className="text-amber-700 dark:text-amber-300">
                          {confirmPurpose === 'add' ? 'Creating new admin accounts requires super admin authorization.' :
                           confirmPurpose === 'edit' ? 'Modifying admin accounts requires super admin authorization.' :
                           'Deleting admin accounts requires super admin authorization.'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Super Admin (taju@gmail.com) Password</Label>
                    <Input 
                      id="confirm-password" 
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Enter taju@gmail.com password"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsConfirmOpen(false)}>Cancel</Button>
                  <Button onClick={handleConfirmProceed} disabled={isConfirming || !confirmPassword}>
                    {isConfirming ? 'Verifying...' : 'Confirm'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <div className="space-y-4 pt-4">
              {isLoadingAdmins ? (
                <div className="text-center text-muted-foreground py-4">Loading admins...</div>
              ) : admins.length > 0 ? (
                <div className="grid gap-4">
                  {admins.map((adminUser) => (
                    <div 
                      key={adminUser.id} 
                      className="flex items-center justify-between p-4 border rounded-lg bg-muted/30"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                          <User className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-medium">{adminUser.name}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail className="w-3 h-3" />
                            {adminUser.email}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs px-2 py-1 rounded-full bg-muted border capitalize">
                          {adminUser.role || 'Admin'}
                        </span>
                        {user?.email === 'taju@gmail.com' ? (
                          <div className="flex gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              title="Edit"
                              onClick={() => openEditAdmin(adminUser)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            {adminUser.id !== user?.uid && (
                              <>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  title="Send Password Reset Email"
                                  onClick={() => handleSendPasswordReset('hisakkedi@gmail.com')}
                                >
                                  <Key className="w-4 h-4 text-muted-foreground" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                  onClick={() => handleDeleteAdmin(adminUser.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        ) : (
                          <div className="text-xs text-muted-foreground">Managed by taju@gmail.com</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground border rounded-lg border-dashed">
                  No other admins found
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        

        {/* Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              <CardTitle>Notifications</CardTitle>
            </div>
            <CardDescription>
              Configure how you receive alerts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive daily summaries via email
                </p>
              </div>
              <Switch 
                checked={emailNotifications} 
                onCheckedChange={handleEmailNotificationsChange} 
              />
            </div>
          </CardContent>
        </Card>
        
        <div className="flex justify-end">
            <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
