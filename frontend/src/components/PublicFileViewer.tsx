import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { getSecureFile } from '@/services/api';

export default function PublicFileViewer() {
  const { linkId } = useParams();
  console.log('PublicFileViewer rendered with linkId:', linkId);

  const [decryptionKey, setDecryptionKey] = useState('');
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [fileContent, setFileContent] = useState<ArrayBuffer | null>(null);
  const [fileType, setFileType] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');

  if (!linkId) {
    return <div>Invalid link</div>;
  }

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
      const response = await getSecureFile(linkId!);
      
      // Get file metadata from response headers
      const fileName = response.headers['x-file-name'];
      const fileType = response.headers['x-file-type'];
      
      if (!fileName || !fileType) {
        console.error('Missing file metadata in headers:', response.headers);
        throw new Error('Failed to get file metadata');
      }
      
      setFileName(fileName);
      setFileType(fileType);

      // Decrypt the file
      const encryptedData = response.data;
      const decryptedContent = await decryptFile(encryptedData, decryptionKey);
      setFileContent(decryptedContent);
      
      console.log('Response headers:', response.headers);
      console.log('File type:', fileType);
      console.log('File name:', fileName);
    } catch (error: any) {
      console.error('Error details:', error);
      let errorMessage = "Failed to decrypt file";
      
      if (error.response?.status === 410) {
        const errorData = error.response.data;
        errorMessage = errorData.error || "This link has expired or has already been used";
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      // Show a more prominent error message in the UI
      setFileContent(null);
      setFileType('');
      setFileName('');
    } finally {
      setIsDecrypting(false);
    }
  };

  const decryptFile = async (fileData: ArrayBuffer, key: string): Promise<ArrayBuffer> => {
    // Convert encryption key to crypto key
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

  const renderContent = () => {
    if (!linkId) {
      return (
        <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-lg shadow-md text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Invalid Link</h1>
          <p className="text-gray-600">
            The secure link you're trying to access is invalid.
          </p>
        </div>
      );
    }

    if (!fileContent) {
      return (
        <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-4">Enter Decryption Key</h1>
          <p className="text-sm text-gray-600 mb-4">
            This is a secure link. Enter the decryption key provided by the sender to view the file.
          </p>
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
              {isDecrypting ? 'Decrypting...' : 'View File'}
            </Button>
          </div>
        </div>
      );
    }

    // Ensure fileType is not undefined
    const currentFileType = fileType || 'application/octet-stream';
    const blob = new Blob([fileContent], { type: fileType });
    const url = URL.createObjectURL(blob);

    if (currentFileType.startsWith('image/')) {
      return (
        <div className="max-w-4xl mx-auto mt-8">
          <h2 className="text-xl font-semibold mb-4">{fileName}</h2>
          <img 
            src={url} 
            alt={fileName} 
            className="max-w-full h-auto rounded-lg shadow-lg select-none"
            onContextMenu={(e) => e.preventDefault()}
            style={{ pointerEvents: 'none' }}
            onLoad={() => URL.revokeObjectURL(url)}
          />
        </div>
      );
    } else if (currentFileType === 'application/pdf') {
      return (
        <div className="max-w-4xl mx-auto mt-8">
          <h2 className="text-xl font-semibold mb-4">{fileName}</h2>
          <div 
            className="relative w-full h-[800px] rounded-lg shadow-lg overflow-hidden"
            onContextMenu={(e) => e.preventDefault()}
          >
            <iframe
              src={`${url}#toolbar=0&navpanes=0&scrollbar=1&statusbar=0&messages=0&print=0`}
              className="absolute inset-0 w-full h-full"
              style={{
                pointerEvents: 'all',
                userSelect: 'none',
                WebkitUserSelect: 'none',
                MozUserSelect: 'none',
                msUserSelect: 'none',
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                pointerEvents: 'none',
                background: 'transparent',
              }}
            />
          </div>
        </div>
      );
    } else if (currentFileType.startsWith('text/')) {
      return (
        <div className="max-w-4xl mx-auto mt-8">
          <h2 className="text-xl font-semibold mb-4">{fileName}</h2>
          <div 
            className="bg-white p-4 rounded-lg shadow-lg select-none"
            onContextMenu={(e) => e.preventDefault()}
          >
            <pre className="whitespace-pre-wrap">
              {new TextDecoder().decode(fileContent)}
            </pre>
          </div>
        </div>
      );
    } else if (currentFileType.startsWith('video/')) {
      return (
        <div className="max-w-4xl mx-auto mt-8">
          <h2 className="text-xl font-semibold mb-4">{fileName}</h2>
          <video 
            src={url}
            controls
            className="w-full rounded-lg shadow-lg select-none"
            onContextMenu={(e) => e.preventDefault()}
            controlsList="nodownload"
            onLoad={() => URL.revokeObjectURL(url)}
          >
            Your browser does not support the video tag.
          </video>
        </div>
      );
    } else {
      return (
        <div className="max-w-md mx-auto mt-8 text-center">
          <h2 className="text-xl font-semibold mb-4">{fileName}</h2>
          <p className="text-gray-600">
            Preview not available for this file type ({currentFileType})
          </p>
        </div>
      );
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {renderContent()}
    </div>
  );
} 