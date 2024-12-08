import { FileUpload } from './FileUpload';
import { toast } from '@/hooks/use-toast';

export default function Dashboard() {
  const handleFileUpload = (
    encryptedFile: ArrayBuffer,
    fileName: string,
    fileType: string
  ) => {
    // TODO: Send to server
    console.log('Encrypted file:', { fileName, fileType, size: encryptedFile.byteLength });
    toast({
      title: "File encrypted successfully",
      description: `${fileName} is ready to be uploaded`,
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 gap-6">
        <div className="p-6 border rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Upload Files</h2>
          <FileUpload onFileUpload={handleFileUpload} />
        </div>

        {/* Placeholder for recent files section */}
        <div className="p-6 border rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Recent Files</h2>
          <p className="text-gray-600">No files uploaded yet</p>
        </div>
      </div>
    </div>
  );
} 