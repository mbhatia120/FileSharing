import { useState, useRef } from 'react';
import { Upload, File, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { uploadFile } from '@/services/api';
import { auth } from '@/utils/auth';

interface FileUploadProps {
  onFileUpload?: (encryptedFile: ArrayBuffer, fileName: string, fileType: string) => void;
}

const SUPPORTED_EXTENSIONS = [
  'zip', 'jpg', 'jpeg', 'png', 'gif', 'mp4', 'mov', 'avi','pdf'
];

export function FileUpload({ onFileUpload }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [encryptionKey, setEncryptionKey] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [encryptedData, setEncryptedData] = useState<ArrayBuffer | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !SUPPORTED_EXTENSIONS.includes(extension)) {
      setError(`Unsupported file type. Supported types: ${SUPPORTED_EXTENSIONS.join(', ')}`);
      return false;
    }
    if (file.size > 100 * 1024 * 1024) { // 100MB limit
      setError('File size must be less than 100MB');
      return false;
    }
    return true;
  };

  const encryptFile = async (file: File, key: string): Promise<ArrayBuffer> => {
    // Convert encryption key to crypto key
    const encoder = new TextEncoder();
    const keyData = encoder.encode(key);
    const hashBuffer = await crypto.subtle.digest('SHA-256', keyData);
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      hashBuffer,
      { name: 'AES-GCM' },
      false,
      ['encrypt']
    );

    // Generate random IV
    const iv = crypto.getRandomValues(new Uint8Array(12));

    // Read and encrypt file
    const fileBuffer = await file.arrayBuffer();
    const encryptedContent = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      cryptoKey,
      fileBuffer
    );

    // Combine IV and encrypted content
    const result = new Uint8Array(iv.length + encryptedContent.byteLength);
    result.set(iv, 0);
    result.set(new Uint8Array(encryptedContent), iv.length);

    return result.buffer;
  };

  const handleFile = async (file: File) => {
    try {
      setError(null);
      if (!validateFile(file)) return;
      if (!encryptionKey) {
        setError('Please enter an encryption key');
        return;
      }

      setSelectedFile(file);
      setIsEncrypting(true);
      const encrypted = await encryptFile(file, encryptionKey);
      setEncryptedData(encrypted);
      onFileUpload?.(encrypted, file.name, file.type);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process file');
    } finally {
      setIsEncrypting(false);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !encryptedData) return;

    try {
      setIsUploading(true);
      setError(null);
      await uploadFile(encryptedData, selectedFile.name, selectedFile.type);
      clearSelection();
      // Optional: Show success message
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setError(null);
    setEncryptedData(null);
    setUploadProgress(0);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className="w-full space-y-4">
      <Input
        type="text"
        placeholder="Enter encryption key (required)"
        value={encryptionKey}
        onChange={(e) => setEncryptionKey(e.target.value)}
      />
      
      <div
        className={cn(
          "relative border-2 border-dashed rounded-lg p-6 transition-colors",
          dragActive ? "border-primary" : "border-muted-foreground/25",
          selectedFile ? "bg-muted/50" : "bg-background"
        )}
        onDragEnter={() => setDragActive(true)}
        onDragLeave={() => setDragActive(false)}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          disabled={isEncrypting || isUploading || !encryptionKey || encryptionKey.length === 0}
          type="file"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          accept={SUPPORTED_EXTENSIONS.map(ext => `.${ext}`).join(',')}
        />

        <div className="flex flex-col items-center justify-center space-y-4">
          {selectedFile ? (
            <>
              <div className="flex items-center space-x-4">
                <File className="h-8 w-8 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-auto"
                  onClick={clearSelection}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="rounded-full bg-muted p-4">
                <Upload className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">
                  Drag files here or click to upload
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Supported files: {SUPPORTED_EXTENSIONS.join(', ')}
                </p>
              </div>
              <Button
                variant="secondary"
                onClick={() => inputRef.current?.click()}
              >
                Select File
              </Button>
            </>
          )}
        </div>
      </div>

      {selectedFile && encryptedData && (
        <Button
          className="w-full"
          onClick={handleUpload}
          disabled={isUploading || isEncrypting}
        >
          {isUploading ? 'Uploading...' : 'Upload File'}
        </Button>
      )}

      {(isEncrypting || isUploading) && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            {isEncrypting ? 'Encrypting file...' : 'Uploading file...'}
          </p>
          <Progress 
            value={isUploading ? uploadProgress : 100} 
            className={isEncrypting ? 'animate-pulse' : ''}
          />
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
} 