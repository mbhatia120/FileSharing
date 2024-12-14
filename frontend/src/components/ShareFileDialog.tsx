import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { shareFile } from '@/services/api';

interface ShareFileDialogProps {
  isOpen: boolean;
  onClose: () => void;
  fileId: string;
  fileName: string;
}

export function ShareFileDialog({
  isOpen,
  onClose,
  fileId,
  fileName,
}: ShareFileDialogProps) {
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState('VIEW');
  const [isSharing, setIsSharing] = useState(false);

  const handleShare = async () => {
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSharing(true);
      // console.log("Sending data:", {
      //   shared_with_email: email,
      //   permission: permission,
      // });
      
      await shareFile(fileId, {
        shared_with_email: email,
        permission: permission,
      });
      
      toast({
        title: "Success",
        description: `File shared with ${email}`,
      });
      onClose();
      setEmail('');
      setPermission('VIEW');
    } catch (error: any) {
      console.error("Share error:", error);
      toast({
        title: "Error sharing file",
        description: error.response?.data?.error || "Failed to share file",
        variant: "destructive",
      });
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share File</DialogTitle>
          <DialogDescription>
            Share {fileName} with another user
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              User Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Permission
            </label>
            <Select
              value={permission}
              onValueChange={setPermission}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="VIEW">View Only</SelectItem>
                <SelectItem value="DOWNLOAD">Download</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleShare} disabled={isSharing}>
              {isSharing ? 'Sharing...' : 'Share'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 