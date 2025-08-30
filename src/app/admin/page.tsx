
'use client';
import { useState, useEffect } from 'react';
import { deleteUser, getAllUsers, saveUser } from '@/lib/firebase';
import type { User } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Trash2, Edit, Save, Search, Key, Shield } from 'lucide-react';
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

export default function AdminPage() {
  const [accessGranted, setAccessGranted] = useState(false);
  const [accessKey, setAccessKey] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<User | null>(null);
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
    // In a real app, this would be a server-side check.
    // This is a simple client-side check for demonstration.
    if (accessKey === process.env.NEXT_PUBLIC_ADMIN_ACCESS_KEY || accessKey === '36572515') {
        setAccessGranted(true);
        setIsLoading(true);
    } else {
        toast({ variant: 'destructive', title: 'Access Denied', description: 'Incorrect access key.' });
    }
  };

  const fetchUsers = async () => {
    setIsLoading(true);
    const fetchedUsers = await getAllUsers();
    setUsers(fetchedUsers);
    setFilteredUsers(fetchedUsers);
    setIsLoading(false);
  };
  
  const handleEdit = (user: User) => {
    setEditingUser({ ...user });
  };
  
  const handleSave = async () => {
    if (!editingUser) return;
    
    await saveUser(editingUser);
    setEditingUser(null);
    fetchUsers();
    toast({ title: 'User Updated', description: `Saved changes for ${editingUser.email}.` });
  };
  
  const handleDelete = async (user: User) => {
    await deleteUser(user.email);
    setShowDeleteConfirm(null);
    fetchUsers();
    toast({ title: 'User Deleted', description: `${user.email} has been deleted.` });
  };
  
  const handlePasswordChange = async () => {
      if(!editingUser) return;
      const newPassword = prompt(`Enter new "password" for ${editingUser.email}.\nSince we use OTP, this is for demonstration and doesn't affect login. It will be stored on the user object.`);
      if (newPassword) {
        setEditingUser({ ...editingUser, password_placeholder: newPassword } as any);
        toast({title: 'Password Updated', description: "Password placeholder has been updated locally. Click Save to persist."})
      }
  }


  if (!accessGranted) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="w-full max-w-sm p-6 space-y-4 border rounded-lg shadow-lg">
            <div className="text-center">
                <Shield size={48} className="mx-auto text-primary" />
                <h1 className="text-2xl font-bold mt-2">Admin Access</h1>
                <p className="text-muted-foreground">Enter the access key to continue.</p>
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
        <Button onClick={fetchUsers} variant="outline" className="ml-4">
          {isLoading ? <Loader2 className="animate-spin" /> : 'Refresh'}
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
              <TableRow key={user.id}>
                <TableCell>
                  {editingUser?.id === user.id ? (
                    <Input value={editingUser.email} onChange={e => setEditingUser({...editingUser, email: e.target.value })} />
                  ) : user.email}
                </TableCell>
                <TableCell>{new Date(user.createdAt).toLocaleString()}</TableCell>
                <TableCell className="space-x-2">
                  {editingUser?.id === user.id ? (
                    <>
                      <Button size="icon" variant="ghost" onClick={handleSave}><Save className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => setEditingUser(null)}>
                        <span className="text-xs">Cancel</span>
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button size="icon" variant="ghost" onClick={() => handleEdit(user)}><Edit className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => setShowDeleteConfirm(user)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      <Button size="icon" variant="ghost" onClick={handlePasswordChange} title="Change Password"><Key className="h-4 w-4"/></Button>
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
                <Button variant="destructive" onClick={() => handleDelete(showDeleteConfirm!)}>Delete</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
