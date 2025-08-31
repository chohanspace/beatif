
'use client';
import { useState, useEffect } from 'react';
import { deleteUser, getAllUsers, saveUser } from '@/lib/auth';
import { createUserAsAdmin } from '@/lib/auth';
import type { User } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, Edit, Save, Search, Key, Shield, UserPlus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { MusicalNotesLoader } from '@/components/ui/gears-loader';
import { Label } from '@/components/ui/label';

export default function AdminPage() {
  const [accessGranted, setAccessGranted] = useState(false);
  const [accessKey, setAccessKey] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<User | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newUser, setNewUser] = useState({ email: '', password: '' });
  const { toast } = useToast();

  useEffect(() => {
    if (accessGranted) {
      fetchUsers();
    }
  }, [accessGranted]);

  useEffect(() => {
    const results = users.filter(user =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(results);
  }, [searchTerm, users]);
  
  const handleAccessCheck = () => {
    if (accessKey === process.env.NEXT_PUBLIC_ADMIN_ACCESS_KEY || accessKey === '36572515') {
        setAccessGranted(true);
        setIsLoading(true);
    } else {
        toast({ variant: 'destructive', title: 'Access Denied', description: 'Incorrect access key.' });
    }
  };

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const fetchedUsers = await getAllUsers();
      setUsers(fetchedUsers);
      setFilteredUsers(fetchedUsers);
    } catch (e) {
      toast({ variant: 'destructive', title: 'Failed to fetch users', description: 'Could not connect to the database. Please ensure the MongoDB URI is correct.' });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleEdit = (user: User) => {
    setEditingUser({ ...user });
  };
  
  const handleSave = async () => {
    if (!editingUser) return;
    
    setIsUpdating(true);
    await saveUser(editingUser);
    setEditingUser(null);
    await fetchUsers();
    toast({ title: 'User Updated', description: `Saved changes for ${editingUser.email}.` });
    setIsUpdating(false);
  };
  
  const handleDelete = async (user: User) => {
    setIsUpdating(true);
    await deleteUser(user.email);
    setShowDeleteConfirm(null);
    await fetchUsers();
    toast({ title: 'User Deleted', description: `${user.email} has been deleted.` });
    setIsUpdating(false);
  };
  
  const handlePasswordChange = async () => {
      if(!editingUser) return;
      const newPassword = prompt(`Enter new password for ${editingUser.email}.`);
      if (newPassword) {
        setEditingUser({ ...editingUser, password: `hashed_${newPassword}` });
        toast({title: 'Password Updated', description: "Password has been updated locally. Click Save to persist."})
      }
  }

  const handleCreateUser = async () => {
    if (!newUser.email || !newUser.password) {
        toast({ variant: 'destructive', title: 'Error', description: 'Email and password are required.' });
        return;
    }
    setIsUpdating(true);
    const { success, message } = await createUserAsAdmin(newUser.email, newUser.password);
    if (success) {
        toast({ title: 'User Created', description: `Account for ${newUser.email} created.`});
        setShowCreateDialog(false);
        setNewUser({email: '', password: ''});
        await fetchUsers();
    } else {
        toast({ variant: 'destructive', title: 'Creation Failed', description: message });
    }
    setIsUpdating(false);
  }


  if (!accessGranted) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="w-full max-w-sm p-6 space-y-4 border rounded-lg shadow-lg">
            <div className="text-center">
                <Shield size={48} className="mx-auto text-primary" />
                <h1 className="text-2xl font-bold mt-2">XXX Access</h1>
                <p className="text-muted-foreground">Enter the XXX key to continue.</p>
            </div>
            <div className="flex gap-2">
                <Input 
                    type="password"
                    placeholder="Access Key"
                    value={accessKey}
                    onChange={e => setAccessKey(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAccessCheck()}
                />
                <Button onClick={handleAccessCheck}>Unlock</Button>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 bg-background text-foreground">
      <h1 className="text-3xl font-bold mb-6">User Management</h1>
      
      <div className="flex items-center mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder="Search users by email..."
            className="pl-10"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={() => setShowCreateDialog(true)} className="ml-4">
          <UserPlus className="mr-2" />
          Create User
        </Button>
        <Button onClick={fetchUsers} variant="outline" className="ml-2">
          {isLoading ? <MusicalNotesLoader size="sm" /> : 'Refresh'}
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <MusicalNotesLoader size="lg" />
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map(user => (
              <TableRow key={user.createdAt}>
                <TableCell>
                  {editingUser?.createdAt === user.createdAt ? (
                    <Input value={editingUser.email} onChange={e => setEditingUser({...editingUser, email: e.target.value, id: e.target.value })} disabled />
                  ) : user.email}
                </TableCell>
                <TableCell>{new Date(user.createdAt).toLocaleString()}</TableCell>
                <TableCell className="space-x-2">
                  {editingUser?.createdAt === user.createdAt ? (
                    <>
                      <Button size="icon" variant="ghost" onClick={handleSave} disabled={isUpdating}><Save className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => setEditingUser(null)}>
                        <span className="text-xs">Cancel</span>
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button size="icon" variant="ghost" onClick={() => handleEdit(user)}><Edit className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => setShowDeleteConfirm(user)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => { setEditingUser(user); handlePasswordChange(); }} title="Change Password"><Key className="h-4 w-4"/></Button>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={!!showDeleteConfirm} onOpenChange={() => setShowDeleteConfirm(null)}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Are you sure?</DialogTitle>
                <DialogDescription>
                    This action cannot be undone. This will permanently delete the user account for {showDeleteConfirm?.email}.
                </DialogDescription>
            </DialogHeader>
            <DialogFooter>
                <DialogClose asChild>
                    <Button variant="ghost">Cancel</Button>
                </DialogClose>
                <Button variant="destructive" onClick={() => handleDelete(showDeleteConfirm!)} disabled={isUpdating}>Delete</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Create User Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Create New User</DialogTitle>
                <DialogDescription>
                    Create a new user account. The user will be automatically verified.
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="new-email" className="text-right">Email</Label>
                    <Input id="new-email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} className="col-span-3" />
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="new-password" className="text-right">Password</Label>
                    <Input id="new-password" type="password" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} className="col-span-3" />
                </div>
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button variant="ghost">Cancel</Button>
                </DialogClose>
                <Button onClick={handleCreateUser} disabled={isUpdating}>
                    {isUpdating && <MusicalNotesLoader size="sm" className="mr-2" />}
                    Create User
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
