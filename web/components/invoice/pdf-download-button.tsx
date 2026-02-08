'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileText, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface PDFDownloadButtonProps {
  invoiceId: string;
  invoiceNumber?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export function PDFDownloadButton({
  invoiceId,
  invoiceNumber,
  variant = 'outline',
  size = 'default',
  showIcon = true,
  className,
}: PDFDownloadButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleDownload = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/pdf?download=true`);

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      // Get the blob and create download link
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = invoiceNumber
        ? `${invoiceNumber}.pdf`
        : `INV-${invoiceId.slice(-6).toUpperCase()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: 'PDF Downloaded',
        description: 'Invoice PDF has been downloaded successfully.',
      });
    } catch (error) {
      console.error('PDF download error:', error);
      toast({
        title: 'Download Failed',
        description: 'Failed to download invoice PDF. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleDownload}
      disabled={isLoading}
      className={className}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : showIcon ? (
        <Download className="h-4 w-4" />
      ) : null}
      {size !== 'sm' && (
        <span className={showIcon ? 'ml-2' : ''}>
          {isLoading ? 'Generating...' : 'Download PDF'}
        </span>
      )}
    </Button>
  );
}

interface PDFViewButtonProps {
  invoiceId: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
}

export function PDFViewButton({
  invoiceId,
  variant = 'ghost',
  size = 'default',
  className,
}: PDFViewButtonProps) {
  const handleView = () => {
    // Open in new tab for viewing
    window.open(`/api/invoices/${invoiceId}/pdf`, '_blank');
  };

  return (
    <Button variant={variant} size={size} onClick={handleView} className={className}>
      <FileText className="h-4 w-4" />
      {size !== 'sm' && <span className="ml-2">View PDF</span>}
    </Button>
  );
}
