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

interface DecryptionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onDecrypt: (key: string) => Promise<void>;
  fileName: string;
}

export function DecryptionDialog({
  isOpen,
  onClose,
  onDecrypt,
  fileName,
}: DecryptionDialogProps) {
  const [decryptionKey, setDecryptionKey] = useState('');
  const [isDecrypting, setIsDecrypting] = useState(false);

  const handleDecrypt = async () => {
    if (!decryptionKey) {
      toast({
        title: "Error",
        description: "Please enter a decryption key",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsDecrypting(true);
      await onDecrypt(decryptionKey);
      setDecryptionKey('');
      onClose();
    } catch (error) {
      toast({
        title: "Decryption failed",
        description: "Invalid decryption key or corrupted file",
        variant: "destructive",
      });
    } finally {
      setIsDecrypting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Decrypt File</DialogTitle>
          <DialogDescription>
            Enter the decryption key for {fileName}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            type="password"
            placeholder="Enter decryption key"
            value={decryptionKey}
            onChange={(e) => setDecryptionKey(e.target.value)}
          />
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleDecrypt} disabled={isDecrypting}>
              {isDecrypting ? 'Decrypting...' : 'Decrypt and Download'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 