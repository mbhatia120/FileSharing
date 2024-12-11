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
import { generateSecureLink } from '@/services/api';

interface SecureLinkDialogProps {
  isOpen: boolean;
  onClose: () => void;
  fileId: string;
  fileName: string;
}

export function SecureLinkDialog({
  isOpen,
  onClose,
  fileId,
  fileName,
}: SecureLinkDialogProps) {
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setGeneratedLink(null);
      setIsGenerating(false);
    }
  }, [isOpen]);

  const handleGenerateLink = async () => {
    try {
      setIsGenerating(true);
      const response = await generateSecureLink(fileId);
      const matches = response.secure_url.match(/secure-link\/([^/]+)/);
      const linkId = matches ? matches[1] : null;
      
      if (!linkId) {
        throw new Error('Invalid secure link format');
      }
      
      const frontendUrl = `${window.location.origin}/view/${linkId}`;
      setGeneratedLink(frontendUrl);
      
      toast({
        title: "Success",
        description: "Secure link generated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error generating link",
        description: error.response?.data?.error || "Failed to generate secure link",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyLink = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink);
      toast({
        title: "Copied",
        description: "Link copied to clipboard",
      });
    }
  };

  const handleClose = () => {
    setGeneratedLink(null);
    setIsGenerating(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Generate Secure Link</DialogTitle>
          <DialogDescription>
            Create a one-time secure link for {fileName}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {generatedLink ? (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Input
                  value={generatedLink}
                  readOnly
                  className="flex-1"
                />
                <Button onClick={handleCopyLink}>
                  Copy
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                This link will expire in 1 hour and can only be used once.
              </p>
            </div>
          ) : (
            <Button
              onClick={handleGenerateLink}
              disabled={isGenerating}
              className="w-full"
            >
              {isGenerating ? 'Generating...' : 'Generate Secure Link'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 