import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { QrCode } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { QRScanner } from './QRScanner';

export function QRScannerDialog() {
  const { language } = useLanguage();
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <QrCode className="w-4 h-4" />
          {language === 'bn' ? 'স্ক্যান' : 'Scan QR'}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>{language === 'bn' ? 'QR স্ক্যানার' : 'QR Scanner'}</DialogTitle>
        </DialogHeader>
        <QRScanner />
      </DialogContent>
    </Dialog>
  );
}
