import { useState, useEffect } from 'react';
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

interface FileViewerProps {
  isOpen: boolean;
  onClose: () => void;
  fileContent: ArrayBuffer | null;
  fileName: string;
  fileType: string;
}

export function FileViewer({
  isOpen,
  onClose,
  fileContent,
  fileName,
  fileType,
}: FileViewerProps) {
  const [decryptionKey, setDecryptionKey] = useState('');
  const [decryptedContent, setDecryptedContent] = useState<ArrayBuffer | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);

  const decryptAndDownload = async (fileData: ArrayBuffer, key: string): Promise<ArrayBuffer> => {
    try {
      // Convert encryption key to crypto key
      console.log('Starting decryption process');
      console.log('File data length:', fileData.byteLength);
      
      const encoder = new TextEncoder();
      const keyData = encoder.encode(key);
      console.log('Key data length:', keyData.length);
      
      const hashBuffer = await crypto.subtle.digest('SHA-256', keyData);
      console.log('Hash buffer length:', hashBuffer.byteLength);
      
      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        hashBuffer,
        { name: 'AES-GCM' },
        false,
        ['decrypt']
      );

      // Extract IV and encrypted data
      const iv = new Uint8Array(fileData.slice(0, 12));
      const encryptedContent = new Uint8Array(fileData.slice(12));
      console.log('IV length:', iv.length);
      console.log('Encrypted content length:', encryptedContent.length);
      console.log('IV:', Array.from(iv).map(b => b.toString(16).padStart(2, '0')).join(''));

      // Decrypt the content
      const decryptedContent = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: iv
        },
        cryptoKey,
        encryptedContent
      );

      return decryptedContent;
    } catch (error) {
      console.error('Detailed decryption error:', {
        error,
        fileDataLength: fileData.byteLength,
        ivPresent: fileData.slice(0, 12).byteLength === 12,
        encryptedContentPresent: fileData.slice(12).byteLength > 0
      });
      throw error;
    }
  };

  const handleDecrypt = async () => {
    if (!fileContent || !decryptionKey) {
      toast({
        title: "Error",
        description: "Please enter a decryption key",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsDecrypting(true);
      const decrypted = await decryptAndDownload(fileContent, decryptionKey);
      setDecryptedContent(decrypted);
    } catch (error) {
      console.error('Decryption error:', error); // Add error logging
      toast({
        title: "Decryption failed",
        description: "Invalid decryption key or corrupted file",
        variant: "destructive",
      });
      setDecryptedContent(null);
    } finally {
      setIsDecrypting(false);
    }
  };

  const renderContent = () => {
    if (!decryptedContent) {
      return (
        <div className="space-y-4">
          <Input
            type="password"
            placeholder="Enter decryption key"
            value={decryptionKey}
            onChange={(e) => setDecryptionKey(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleDecrypt();
              }
            }}
          />
          <Button 
            onClick={handleDecrypt}
            disabled={isDecrypting}
            className="w-full"
          >
            {isDecrypting ? 'Decrypting...' : 'Decrypt to View'}
          </Button>
        </div>
      );
    }

    const blob = new Blob([decryptedContent], { type: fileType });
    const url = URL.createObjectURL(blob);

    // Cleanup function to revoke object URL
    const cleanup = () => {
      URL.revokeObjectURL(url);
    };

    if (fileType.startsWith('image/')) {
      return (
        <div className="max-h-[70vh] overflow-auto">
          <img 
            src={url} 
            alt={fileName} 
            className="max-w-full h-auto"
            onLoad={cleanup}
          />
        </div>
      );
    } else if (fileType.startsWith('text/')) {
      return (
        <iframe 
          src={url} 
          className="w-full h-[500px] border rounded"
          title={fileName}
          onLoad={cleanup}
        />
      );
    } else if (fileType === 'application/pdf') {
      return (
        <iframe 
          src={url} 
          className="w-full h-[500px] border rounded"
          title={fileName}
          onLoad={cleanup}
        />
      );
    } else {
      cleanup();
      return <p className="text-center text-gray-500">Preview not available for this file type</p>;
    }
  };

  // Reset state when dialog is closed
  const handleClose = () => {
    setDecryptionKey('');
    setDecryptedContent(null);
    setIsDecrypting(false);
    onClose();
  };

  useEffect(() => {
    if (fileContent) {
      console.log('Received file content:', {
        totalLength: fileContent.byteLength,
        hasIV: fileContent.byteLength > 12,
        ivLength: 12,
        contentLength: fileContent.byteLength - 12
      });
    }
  }, [fileContent]);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>View File: {fileName}</DialogTitle>
          <DialogDescription>
            Enter the decryption key to view this file
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          {renderContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
} 