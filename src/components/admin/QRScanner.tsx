import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Camera, 
  CameraOff, 
  DoorOpen, 
  DoorClosed, 
  CheckCircle, 
  XCircle,
  Loader2,
  AlertTriangle,
  User,
  Ticket
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';

interface ScanResult {
  success: boolean;
  action?: 'entry' | 'exit';
  ticket?: {
    id: string;
    ticket_number: string;
    child_name: string | null;
    guardian_name: string;
  };
  error?: string;
  code?: string;
}

interface GateCamera {
  gate_id: string;
  gate_name: string;
  camera_ref: string | null;
}

export function QRScanner() {
  const { language } = useLanguage();
  const [isScanning, setIsScanning] = useState(false);
  const [scanMode, setScanMode] = useState<'entry' | 'exit'>('entry');
  const [selectedGate, setSelectedGate] = useState('main_gate');
  const [gates, setGates] = useState<GateCamera[]>([]);
  const [lastResult, setLastResult] = useState<ScanResult | null>(null);
  const [processing, setProcessing] = useState(false);
  const [showResult, setShowResult] = useState(false);
  
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = 'qr-scanner-container';

  // Fetch gates on mount
  useEffect(() => {
    const fetchGates = async () => {
      const { data } = await supabase.from('gate_cameras').select('*').eq('is_active', true);
      if (data) setGates(data);
    };
    fetchGates();
  }, []);

  const startScanner = async () => {
    try {
      const scanner = new Html5Qrcode(scannerContainerId);
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        onScanSuccess,
        () => {} // Ignore errors during scanning
      );

      setIsScanning(true);
    } catch (err) {
      console.error('Scanner error:', err);
      toast.error(language === 'bn' ? 'ক্যামেরা অ্যাক্সেস ব্যর্থ' : 'Failed to access camera');
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (err) {
        console.error('Stop scanner error:', err);
      }
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  const onScanSuccess = async (decodedText: string) => {
    if (processing) return;

    // Pause scanner during processing
    setProcessing(true);
    
    // Play beep sound
    try {
      const beepSound = '/placeholder.svg'; // Simple placeholder, real beep would be an audio file
      console.log('Scanned:', decodedText);
    } catch {
      // Ignore audio errors
    }

    try {
      // Extract ticket number from QR code
      // QR code might contain full URL or just ticket number
      let ticketNumber = decodedText;
      if (decodedText.includes('/')) {
        const parts = decodedText.split('/');
        ticketNumber = parts[parts.length - 1];
      }

      const { data, error } = await supabase.functions.invoke('gate-scan', {
        body: {
          action: scanMode,
          ticket_number: ticketNumber,
          gate_id: selectedGate,
          staff_name: 'Scanner'
        }
      });

      if (error) throw error;

      setLastResult(data as ScanResult);
      setShowResult(true);

      if (data.success) {
        toast.success(
          scanMode === 'entry' 
            ? (language === 'bn' ? 'এন্ট্রি সফল!' : 'Entry successful!')
            : (language === 'bn' ? 'এক্সিট সফল!' : 'Exit successful!')
        );
      }
    } catch (err: unknown) {
      const error = err as { message?: string };
      setLastResult({
        success: false,
        error: error.message || 'Unknown error',
        code: 'SCAN_ERROR'
      });
      setShowResult(true);
      toast.error(language === 'bn' ? 'স্ক্যান ব্যর্থ' : 'Scan failed');
    } finally {
      setProcessing(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="w-5 h-5" />
          {language === 'bn' ? 'QR স্ক্যানার' : 'QR Scanner'}
        </CardTitle>
        <CardDescription>
          {language === 'bn' ? 'টিকেট QR কোড স্ক্যান করুন' : 'Scan ticket QR code'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Mode & Gate Selection */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">
              {language === 'bn' ? 'মোড' : 'Mode'}
            </label>
            <Select value={scanMode} onValueChange={(v) => setScanMode(v as 'entry' | 'exit')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="entry">
                  <div className="flex items-center gap-2">
                    <DoorOpen className="w-4 h-4 text-green-600" />
                    {language === 'bn' ? 'এন্ট্রি' : 'Entry'}
                  </div>
                </SelectItem>
                <SelectItem value="exit">
                  <div className="flex items-center gap-2">
                    <DoorClosed className="w-4 h-4 text-orange-600" />
                    {language === 'bn' ? 'এক্সিট' : 'Exit'}
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">
              {language === 'bn' ? 'গেট' : 'Gate'}
            </label>
            <Select value={selectedGate} onValueChange={setSelectedGate}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {gates.map(g => (
                  <SelectItem key={g.gate_id} value={g.gate_id}>{g.gate_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Scanner View */}
        <div 
          id={scannerContainerId}
          className={`w-full aspect-square rounded-lg overflow-hidden bg-muted ${!isScanning ? 'flex items-center justify-center' : ''}`}
        >
          {!isScanning && (
            <div className="text-center text-muted-foreground">
              <Camera className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">{language === 'bn' ? 'স্ক্যান শুরু করুন' : 'Start scanning'}</p>
            </div>
          )}
        </div>

        {/* Processing Indicator */}
        {processing && (
          <div className="flex items-center justify-center gap-2 py-2 text-primary">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>{language === 'bn' ? 'প্রসেসিং...' : 'Processing...'}</span>
          </div>
        )}

        {/* Mode Badge */}
        <div className="flex justify-center">
          <Badge 
            variant="outline" 
            className={`text-lg py-2 px-4 ${scanMode === 'entry' ? 'border-green-500 text-green-600' : 'border-orange-500 text-orange-600'}`}
          >
            {scanMode === 'entry' ? (
              <><DoorOpen className="w-5 h-5 mr-2" /> {language === 'bn' ? 'এন্ট্রি মোড' : 'ENTRY MODE'}</>
            ) : (
              <><DoorClosed className="w-5 h-5 mr-2" /> {language === 'bn' ? 'এক্সিট মোড' : 'EXIT MODE'}</>
            )}
          </Badge>
        </div>

        {/* Start/Stop Button */}
        <Button
          onClick={isScanning ? stopScanner : startScanner}
          variant={isScanning ? 'destructive' : 'default'}
          className="w-full"
          size="lg"
        >
          {isScanning ? (
            <><CameraOff className="w-5 h-5 mr-2" /> {language === 'bn' ? 'বন্ধ করুন' : 'Stop Scanner'}</>
          ) : (
            <><Camera className="w-5 h-5 mr-2" /> {language === 'bn' ? 'স্ক্যান শুরু করুন' : 'Start Scanner'}</>
          )}
        </Button>
      </CardContent>

      {/* Result Dialog */}
      <Dialog open={showResult} onOpenChange={setShowResult}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {lastResult?.success ? (
                <CheckCircle className="w-6 h-6 text-green-600" />
              ) : (
                <XCircle className="w-6 h-6 text-destructive" />
              )}
              {lastResult?.success 
                ? (language === 'bn' ? 'সফল!' : 'Success!')
                : (language === 'bn' ? 'ব্যর্থ' : 'Failed')}
            </DialogTitle>
            <DialogDescription>
              {lastResult?.success 
                ? (lastResult.action === 'entry' 
                    ? (language === 'bn' ? 'এন্ট্রি রেকর্ড হয়েছে' : 'Entry has been recorded')
                    : (language === 'bn' ? 'এক্সিট রেকর্ড হয়েছে' : 'Exit has been recorded'))
                : lastResult?.error}
            </DialogDescription>
          </DialogHeader>

          {lastResult?.success && lastResult.ticket && (
            <div className="space-y-3 pt-4">
              <div className="flex items-center gap-3">
                <Ticket className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">{language === 'bn' ? 'টিকেট' : 'Ticket'}</p>
                  <p className="font-mono font-medium">{lastResult.ticket.ticket_number}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">{language === 'bn' ? 'অতিথি' : 'Guest'}</p>
                  <p className="font-medium">{lastResult.ticket.guardian_name}</p>
                  {lastResult.ticket.child_name && (
                    <p className="text-sm text-muted-foreground">{lastResult.ticket.child_name}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {!lastResult?.success && (
            <div className="flex items-center gap-3 p-4 bg-destructive/10 rounded-lg mt-4">
              <AlertTriangle className="w-5 h-5 text-destructive shrink-0" />
              <div>
                <p className="font-medium text-destructive">
                  {lastResult?.code === 'ALREADY_INSIDE' && (language === 'bn' ? 'অতিথি ইতোমধ্যে ভিতরে' : 'Guest already inside')}
                  {lastResult?.code === 'NOT_INSIDE' && (language === 'bn' ? 'অতিথি ভিতরে নেই' : 'Guest not inside')}
                  {lastResult?.code === 'TICKET_NOT_FOUND' && (language === 'bn' ? 'টিকেট পাওয়া যায়নি' : 'Ticket not found')}
                  {lastResult?.code === 'TICKET_CANCELLED' && (language === 'bn' ? 'টিকেট বাতিল' : 'Ticket cancelled')}
                  {lastResult?.code === 'TICKET_COMPLETED' && (language === 'bn' ? 'টিকেট শেষ হয়ে গেছে' : 'Ticket already used')}
                  {!lastResult?.code && (language === 'bn' ? 'অজানা সমস্যা' : 'Unknown error')}
                </p>
              </div>
            </div>
          )}

          <Button onClick={() => setShowResult(false)} className="w-full mt-4">
            {language === 'bn' ? 'ঠিক আছে' : 'OK'}
          </Button>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
