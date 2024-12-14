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
    // Convert encryption key to crypto key
    // console.log('Decrypting file with key:', key);
    const encoder = new TextEncoder();
    const keyData = encoder.encode(key);
    const hashBuffer = await crypto.subtle.digest('SHA-256', keyData);
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
            style={{ pointerEvents: 'none' }}
          />
        </div>
      );
    } else if (fileType.startsWith('text/')) {
      return (
        <div className="w-full h-[500px] border rounded overflow-hidden">
          <iframe 
            src={url} 
            className="w-full h-full"
            title={fileName}
            onLoad={cleanup}
            sandbox="allow-same-origin"
            style={{ pointerEvents: 'none' }}
          />
        </div>
      );
    } else if (fileType === 'application/pdf') {
      return (
        <div className="w-full h-[500px] border rounded overflow-hidden">
          <embed
            src={url + '#toolbar=0&print=0&download=0'}
            type="application/pdf"
            className="w-full h-full"
            style={{ 
              pointerEvents: 'auto',
              WebkitUserSelect: 'none',
              MozUserSelect: 'none',
              userSelect: 'none',
              cursor: 'default'
            }}
          />
        </div>
      );
    } else {
      cleanup();
      return (
        <div className="flex flex-col items-center justify-center space-y-4 py-8">
          <div className="w-16 h-16 text-gray-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
              />
            </svg>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-gray-700">Preview not available</p>
            <p className="text-sm text-gray-500">This file type ({fileType}) cannot be previewed</p>
          </div>
        </div>
      );
    }
  };

  // Reset state when dialog is closed
  const handleClose = () => {
    setDecryptionKey('');
    setDecryptedContent(null);
    setIsDecrypting(false);
    onClose();
  };

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