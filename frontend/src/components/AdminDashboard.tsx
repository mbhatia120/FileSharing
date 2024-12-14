import React, { useEffect, useState } from 'react';
import { adminApi } from '../services/adminApi';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { format } from 'date-fns';

interface AdminUser {
  id: string;
  email: string;
  is_active: boolean;
  role: string;
  date_joined: string;
}

interface UserFilesDialogProps {
  userId: string;
  userEmail: string;
  isOpen: boolean;
  onClose: () => void;
}

const UserFilesDialog: React.FC<UserFilesDialogProps> = ({
  userId,
  userEmail,
  isOpen,
  onClose,
}) => {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      loadFiles();
    }
  }, [isOpen]);

  const loadFiles = async () => {
    try {
      const response = await adminApi.getUserFiles(userId);
      setFiles(response);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load user files",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    if (!window.confirm('Are you sure you want to delete this file?')) {
      return;
    }

    try {
      await adminApi.deleteFile(fileId);
      toast({
        title: "Success",
        description: "File deleted successfully",
      });
      loadFiles(); // Reload the files list
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete file",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Files for {userEmail}</DialogTitle>
        </DialogHeader>
        {loading ? (
          <div className="py-4">Loading...</div>
        ) : (
          <div className="overflow-y-auto flex-1 -mx-6 px-6">
            {files.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                No files found
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="sticky top-0 bg-background">Name</TableHead>
                    <TableHead className="sticky top-0 bg-background">Type</TableHead>
                    <TableHead className="sticky top-0 bg-background">Size</TableHead>
                    <TableHead className="sticky top-0 bg-background">Created</TableHead>
                    <TableHead className="sticky top-0 bg-background">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {files.map((file) => (
                    <TableRow key={file.id}>
                      <TableCell className="max-w-[200px] truncate" title={file.original_name}>
                        {file.original_name}
                      </TableCell>
                      <TableCell>{file.file_type}</TableCell>
                      <TableCell>{formatFileSize(file.size)}</TableCell>
                      <TableCell>
                        {format(new Date(file.created_at), 'PPP')}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteFile(file.id)}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

const formatFileSize = (bytes: number) => {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(1)} ${units[unitIndex]}`;
};

export const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [showFilesDialog, setShowFilesDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await adminApi.getUsers();
      setUsers(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await adminApi.updateUser(userId, { role: newRole });
      toast({
        title: "Success",
        description: "User role updated successfully",
      });
      loadUsers();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      await adminApi.deleteUser(userId);
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
      loadUsers();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      });
    }
  };

  const handleViewFiles = (user: AdminUser) => {
    setSelectedUser(user);
    setShowFilesDialog(true);
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      className="border rounded p-1"
                    >
                      <option value="USER">User</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </TableCell>
                  <TableCell>
                    {user.is_active ? 'Active' : 'Inactive'}
                  </TableCell>
                  <TableCell>
                    {format(new Date(user.date_joined), 'PPP')}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewFiles(user)}
                      >
                        Files
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteUser(user.id)}
                      >
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

      {selectedUser && (
        <UserFilesDialog
          userId={selectedUser.id}
          userEmail={selectedUser.email}
          isOpen={showFilesDialog}
          onClose={() => {
            setShowFilesDialog(false);
            setSelectedUser(null);
          }}
        />
      )}
    </div>
  );
}; 