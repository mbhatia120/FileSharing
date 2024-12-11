import { useEffect, useState } from 'react';
import { FileUpload } from './FileUpload';
import { toast } from '@/hooks/use-toast';
import { getFiles, uploadFile, downloadFile } from '@/services/api';
import { formatDistanceToNow } from 'date-fns';
import { DecryptionDialog } from './DecryptionDialog';
import { Button } from '@/components/ui/button';
import { ShareFileDialog } from './ShareFileDialog';
import { FileViewer } from './FileViewer';
import { useNavigate, useLocation } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface File {
  id: string;
  original_name: string;
  file_type: string;
  size: number;
  created_at: string;
  is_shared: boolean;
  shared_by: string | null;
  permission?: 'VIEW' | 'DOWNLOAD';
}

export default function Dashboard() {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDecryptionDialogOpen, setIsDecryptionDialogOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [selectedFileForShare, setSelectedFileForShare] = useState<File | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [viewerContent, setViewerContent] = useState<ArrayBuffer | null>(null);
  const [selectedFileForView, setSelectedFileForView] = useState<File | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const defaultTab = location.hash.replace('#', '') || 'upload';

  useEffect(() => {
    let mounted = true;

    const loadFiles = async () => {
      try {
        const response = await getFiles();
        if (mounted) {
          setFiles(response);
        }
      } catch (error: any) {
        if (mounted) {
          if (error.response?.status === 401) {
            navigate('/auth/login');
          } else {
            toast({
              title: "Error fetching files",
              description: "Could not load your files. Please try again later.",
              variant: "destructive",
            });
          }
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadFiles();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  const handleFileUpload = async (
    encryptedFile: ArrayBuffer,
    fileName: string,
    fileType: string
  ) => {
    try {
      await uploadFile(encryptedFile, fileName, fileType);
      toast({
        title: "File uploaded successfully",
        description: `${fileName} has been uploaded`,
      });
      const response = await getFiles();
      setFiles(response);
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Could not upload the file. Please try again.",
        variant: "destructive",
      });
    }
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

  const decryptAndDownload = async (fileData: ArrayBuffer, key: string): Promise<ArrayBuffer> => {
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

  const handleDownload = async (file: File) => {
    setSelectedFile(file);
    setIsDecryptionDialogOpen(true);
  };

  const handleDecrypt = async (decryptionKey: string) => {
    if (!selectedFile) return;

    try {
      const encryptedData = await downloadFile(selectedFile.id);
      const decryptedData = await decryptAndDownload(encryptedData, decryptionKey);
      
      // Create and download the decrypted file
      const blob = new Blob([decryptedData], { type: selectedFile.file_type });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = selectedFile.original_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "File decrypted and downloaded successfully",
      });
    } catch (error) {
      throw new Error('Failed to decrypt file');
    }
  };

  const handleShare = (file: File) => {
    setSelectedFileForShare(file);
    setIsShareDialogOpen(true);
  };

  const handleView = async (file: File) => {
    try {
      const encryptedData = await downloadFile(file.id);
      setSelectedFileForView(file);
      setViewerContent(encryptedData);
      setIsViewerOpen(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not load file for viewing",
        variant: "destructive",
      });
    }
  };

  // Add new function to filter files
  const getOwnedFiles = () => {
    return files.filter(file => !file.is_shared);
  };

  const getSharedFiles = () => {
    const sharedFiles = files.filter(file => file.is_shared);
    console.log('Shared Files:', sharedFiles); // Debug log
    return sharedFiles;
  };

  const handleTabChange = (value: string) => {
    navigate(`#${value}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div 
          className={`p-8 border rounded-xl shadow-sm cursor-pointer transition-all hover:shadow-md ${
            defaultTab === 'upload' ? 'bg-primary text-primary-foreground' : 'bg-card'
          }`}
          onClick={() => handleTabChange('upload')}
        >
          <div className="text-center">
            <svg
              className="w-12 h-12 mx-auto mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
              />
            </svg>
            <h2 className="text-xl font-semibold">Upload Files</h2>
            <p className="mt-2 text-sm opacity-90">
              Upload and encrypt your files
            </p>
          </div>
        </div>

        <div 
          className={`p-8 border rounded-xl shadow-sm cursor-pointer transition-all hover:shadow-md ${
            defaultTab === 'my-files' ? 'bg-primary text-primary-foreground' : 'bg-card'
          }`}
          onClick={() => handleTabChange('my-files')}
        >
          <div className="text-center">
            <svg
              className="w-12 h-12 mx-auto mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
              />
            </svg>
            <h2 className="text-xl font-semibold">My Files</h2>
            <p className="mt-2 text-sm opacity-90">
              Access your uploaded files
            </p>
          </div>
        </div>

        <div 
          className={`p-8 border rounded-xl shadow-sm cursor-pointer transition-all hover:shadow-md ${
            defaultTab === 'shared' ? 'bg-primary text-primary-foreground' : 'bg-card'
          }`}
          onClick={() => handleTabChange('shared')}
        >
          <div className="text-center">
            <svg
              className="w-12 h-12 mx-auto mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
              />
            </svg>
            <h2 className="text-xl font-semibold">Shared With Me</h2>
            <p className="mt-2 text-sm opacity-90">
              View files shared by others
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8">
        {defaultTab === 'upload' && (
          <div className="p-6 border rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Upload Files</h2>
            <FileUpload onFileUpload={handleFileUpload} />
          </div>
        )}

        {defaultTab === 'my-files' && (
          <div className="p-6 border rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold mb-4">My Files</h2>
            {loading ? (
              <p className="text-gray-600">Loading files...</p>
            ) : getOwnedFiles().length === 0 ? (
              <p className="text-gray-600">No files uploaded yet</p>
            ) : (
              <div className="divide-y">
                {getOwnedFiles().map((file) => (
                  <div key={file.id} className="py-4 flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{file.original_name}</h3>
                      <p className="text-sm text-gray-500">
                        {formatFileSize(file.size)} • {file.file_type} • 
                        Uploaded {formatDistanceToNow(new Date(file.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => handleShare(file)}
                      >
                        Share
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleDownload(file)}
                      >
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {defaultTab === 'shared' && (
          <div className="p-6 border rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Shared With Me</h2>
            {loading ? (
              <p className="text-gray-600">Loading files...</p>
            ) : getSharedFiles().length === 0 ? (
              <p className="text-gray-600">No files shared with you</p>
            ) : (
              <div className="divide-y">
                {getSharedFiles().map((file) => (
                  <div key={file.id} className="py-4 flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{file.original_name}</h3>
                      <p className="text-sm text-gray-500">
                        {formatFileSize(file.size)} • {file.file_type} • 
                        Shared by {file.shared_by} {formatDistanceToNow(new Date(file.created_at), { addSuffix: true })}
                        {file.permission && (
                          <span className="ml-2 text-xs bg-gray-100 px-2 py-1 rounded-full">
                            {file.permission === 'VIEW' ? 'View Only' : 'Download Allowed'}
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {file.permission === 'VIEW' ? (
                        <Button
                          variant="outline"
                          onClick={() => handleView(file)}
                        >
                          View
                        </Button>
                      ) : file.permission === 'DOWNLOAD' ? (
                        <Button
                          variant="outline"
                          onClick={() => handleDownload(file)}
                        >
                          Download
                        </Button>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <ShareFileDialog
        isOpen={isShareDialogOpen}
        onClose={() => {
          setIsShareDialogOpen(false);
          setSelectedFileForShare(null);
        }}
        fileId={selectedFileForShare?.id || ''}
        fileName={selectedFileForShare?.original_name || ''}
      />

      <DecryptionDialog
        isOpen={isDecryptionDialogOpen}
        onClose={() => setIsDecryptionDialogOpen(false)}
        onDecrypt={handleDecrypt}
        fileName={selectedFile?.original_name || ''}
      />

      <FileViewer
        isOpen={isViewerOpen}
        onClose={() => {
          setIsViewerOpen(false);
          setViewerContent(null);
          setSelectedFileForView(null);
        }}
        fileContent={viewerContent}
        fileName={selectedFileForView?.original_name || ''}
        fileType={selectedFileForView?.file_type || ''}
      />
    </div>
  );
} 