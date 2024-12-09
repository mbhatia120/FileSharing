import { useEffect, useState } from 'react';
import { FileUpload } from './FileUpload';
import { toast } from '@/hooks/use-toast';
import { getFiles, uploadFile } from '@/services/api';
import { formatDistanceToNow } from 'date-fns';

interface File {
  id: string;
  original_name: string;
  file_type: string;
  size: number;
  created_at: string;
}

export default function Dashboard() {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadFiles = async () => {
      try {
        const response = await getFiles();
        if (mounted) {
          setFiles(response);
        }
      } catch (error) {
        if (mounted) {
          toast({
            title: "Error fetching files",
            description: "Could not load your files. Please try again later.",
            variant: "destructive",
          });
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
  }, []);

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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 gap-6">
        <div className="p-6 border rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Upload Files</h2>
          <FileUpload onFileUpload={handleFileUpload} />
        </div>

        <div className="p-6 border rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Recent Files</h2>
          {loading ? (
            <p className="text-gray-600">Loading files...</p>
          ) : files.length === 0 ? (
            <p className="text-gray-600">No files uploaded yet</p>
          ) : (
            <div className="divide-y">
              {files.map((file) => (
                <div key={file.id} className="py-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{file.original_name}</h3>
                    <p className="text-sm text-gray-500">
                      {formatFileSize(file.size)} • {file.file_type} • 
                      Uploaded {formatDistanceToNow(new Date(file.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  <button
                    className="text-blue-600 hover:text-blue-800"
                    onClick={() => {/* TODO: Implement download */}}
                  >
                    Download
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 