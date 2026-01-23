import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Ticket, 
  UtensilsCrossed, 
  Zap,
  Loader2,
  User,
  Phone,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import { format } from 'date-fns';

interface QuickActionsProps {
  onAction?: (action: string, data: unknown) => void;
}

export function QuickActions({ onAction }: QuickActionsProps) {
  const { language } = useLanguage();
  const queryClient = useQueryClient();
  const [ticketDialogOpen, setTicketDialogOpen] = useState(false);
  const [foodDialogOpen, setFoodDialogOpen] = useState(false);
  
  // Ticket form state
  const [ticketForm, setTicketForm] = useState({
    guardianName: '',
    guardianPhone: '',
    childName: '',
    ticketType: 'hourly_play'
  });

  // Generate ticket number
  const generateTicketNumber = () => {
    const date = format(new Date(), 'yyMMdd');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `TKT-${date}-${random}`;
  };

  // Create ticket mutation
  const createTicketMutation = useMutation({
    mutationFn: async () => {
      const ticketNumber = generateTicketNumber();
      const { data, error } = await supabase
        .from('tickets')
        .insert({
          ticket_number: ticketNumber,
          guardian_name: ticketForm.guardianName,
          guardian_phone: ticketForm.guardianPhone,
          child_name: ticketForm.childName || null,
          ticket_type: ticketForm.ticketType,
          slot_date: format(new Date(), 'yyyy-MM-dd'),
          time_slot: format(new Date(), 'HH:00') + '-' + format(new Date(Date.now() + 3600000), 'HH:00'),
          source: 'physical',
          status: 'active'
        })
        .select()
        .single();
      
      if (error) throw error;

      // Log activity
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('activity_logs').insert({
          user_id: user.id,
          action: 'create',
          entity_type: 'ticket',
          entity_id: data.id,
          details: { ticket_number: ticketNumber, guardian_name: ticketForm.guardianName }
        });
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['activity-logs'] });
      toast.success(
        language === 'bn' 
          ? `টিকেট তৈরি হয়েছে: ${data.ticket_number}` 
          : `Ticket created: ${data.ticket_number}`
      );
      setTicketDialogOpen(false);
      setTicketForm({ guardianName: '', guardianPhone: '', childName: '', ticketType: 'hourly_play' });
      onAction?.('ticket_created', data);
    },
    onError: () => {
      toast.error(language === 'bn' ? 'টিকেট তৈরি করতে সমস্যা হয়েছে' : 'Failed to create ticket');
    }
  });

  const handleCreateTicket = () => {
    if (!ticketForm.guardianName || !ticketForm.guardianPhone) {
      toast.error(language === 'bn' ? 'নাম ও ফোন নম্বর দিন' : 'Please enter name and phone');
      return;
    }
    createTicketMutation.mutate();
  };

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Zap className="w-5 h-5 text-yellow-500" />
            {language === 'bn' ? 'কুইক অ্যাকশন' : 'Quick Actions'}
          </CardTitle>
          <CardDescription>
            {language === 'bn' ? 'দ্রুত কাজ সম্পন্ন করুন' : 'Quickly complete common tasks'}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="h-auto py-4 flex flex-col gap-2 hover:border-primary hover:bg-primary/5"
            onClick={() => setTicketDialogOpen(true)}
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Ticket className="w-5 h-5 text-primary" />
            </div>
            <span className="font-medium">
              {language === 'bn' ? 'টিকেট ইস্যু' : 'Issue Ticket'}
            </span>
            <Badge variant="secondary" className="text-xs">
              {language === 'bn' ? 'ওয়াক-ইন' : 'Walk-in'}
            </Badge>
          </Button>

          <Button
            variant="outline"
            className="h-auto py-4 flex flex-col gap-2 hover:border-chart-2 hover:bg-chart-2/5"
            onClick={() => setFoodDialogOpen(true)}
          >
            <div className="w-10 h-10 rounded-full bg-chart-2/10 flex items-center justify-center">
              <UtensilsCrossed className="w-5 h-5 text-chart-2" />
            </div>
            <span className="font-medium">
              {language === 'bn' ? 'ফুড অর্ডার' : 'Food Order'}
            </span>
            <Badge variant="secondary" className="text-xs">
              {language === 'bn' ? 'দ্রুত' : 'Quick'}
            </Badge>
          </Button>
        </CardContent>
      </Card>

      {/* Quick Ticket Dialog */}
      <Dialog open={ticketDialogOpen} onOpenChange={setTicketDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Ticket className="w-5 h-5" />
              {language === 'bn' ? 'দ্রুত টিকেট ইস্যু' : 'Quick Ticket Issue'}
            </DialogTitle>
            <DialogDescription>
              {language === 'bn' ? 'ওয়াক-ইন কাস্টমারের জন্য টিকেট' : 'Ticket for walk-in customer'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <User className="w-4 h-4" />
                {language === 'bn' ? 'অভিভাবকের নাম' : 'Guardian Name'} *
              </Label>
              <Input
                value={ticketForm.guardianName}
                onChange={(e) => setTicketForm({ ...ticketForm, guardianName: e.target.value })}
                placeholder={language === 'bn' ? 'নাম লিখুন' : 'Enter name'}
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                {language === 'bn' ? 'ফোন নম্বর' : 'Phone Number'} *
              </Label>
              <Input
                value={ticketForm.guardianPhone}
                onChange={(e) => setTicketForm({ ...ticketForm, guardianPhone: e.target.value })}
                placeholder="01XXX-XXXXXX"
              />
            </div>
            <div className="space-y-2">
              <Label>{language === 'bn' ? 'শিশুর নাম (ঐচ্ছিক)' : 'Child Name (optional)'}</Label>
              <Input
                value={ticketForm.childName}
                onChange={(e) => setTicketForm({ ...ticketForm, childName: e.target.value })}
                placeholder={language === 'bn' ? 'শিশুর নাম' : "Child's name"}
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {language === 'bn' ? 'টিকেট টাইপ' : 'Ticket Type'}
              </Label>
              <Select
                value={ticketForm.ticketType}
                onValueChange={(value) => setTicketForm({ ...ticketForm, ticketType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly_play">
                    {language === 'bn' ? 'আওয়ারলি প্লে (১ ঘন্টা)' : 'Hourly Play (1 hour)'}
                  </SelectItem>
                  <SelectItem value="extended">
                    {language === 'bn' ? 'এক্সটেন্ডেড (২ ঘন্টা)' : 'Extended (2 hours)'}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTicketDialogOpen(false)}>
              {language === 'bn' ? 'বাতিল' : 'Cancel'}
            </Button>
            <Button onClick={handleCreateTicket} disabled={createTicketMutation.isPending}>
              {createTicketMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              <Ticket className="w-4 h-4 mr-2" />
              {language === 'bn' ? 'টিকেট তৈরি করুন' : 'Create Ticket'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Food Order Dialog - Redirect to food page */}
      <Dialog open={foodDialogOpen} onOpenChange={setFoodDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UtensilsCrossed className="w-5 h-5" />
              {language === 'bn' ? 'ফুড অর্ডার' : 'Food Order'}
            </DialogTitle>
            <DialogDescription>
              {language === 'bn' ? 'ফুড সেলস পেজে যান' : 'Go to food sales page for full ordering'}
            </DialogDescription>
          </DialogHeader>
          <div className="py-6 text-center">
            <div className="w-16 h-16 rounded-full bg-chart-2/10 flex items-center justify-center mx-auto mb-4">
              <UtensilsCrossed className="w-8 h-8 text-chart-2" />
            </div>
            <p className="text-muted-foreground mb-4">
              {language === 'bn' 
                ? 'সম্পূর্ণ অর্ডার ফিচারের জন্য ফুড সেলস পেজে যান'
                : 'For full order features, go to Food Sales page'}
            </p>
            <Button onClick={() => {
              setFoodDialogOpen(false);
              window.location.href = '/admin/food';
            }}>
              <UtensilsCrossed className="w-4 h-4 mr-2" />
              {language === 'bn' ? 'ফুড সেলস যান' : 'Go to Food Sales'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
