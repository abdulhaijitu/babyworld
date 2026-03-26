import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Ticket } from 'lucide-react';
import { CounterTicketForm } from '@/components/admin/ticketing/CounterTicketForm';
import { TicketSuccessDialog } from '@/components/admin/ticketing/TicketSuccessDialog';

export default function AdminCreateTicket() {
  const navigate = useNavigate();
  const [rideNames, setRideNames] = useState<Record<string, string>>({});
  const [createdTicket, setCreatedTicket] = useState<any>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  useEffect(() => {
    supabase.from('rides').select('id, name').eq('is_active', true).then(({ data }) => {
      if (data) {
        const names: Record<string, string> = {};
        data.forEach((ride: any) => { names[ride.id] = ride.name; });
        setRideNames(names);
      }
    });
  }, []);

  const handleTicketCreated = (ticket: any) => {
    setCreatedTicket(ticket);
    setShowSuccessDialog(true);
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Ticket className="w-6 h-6" />
          Create Ticket
        </h1>
        <p className="text-muted-foreground">Create a new ticket</p>
      </div>

      <CounterTicketForm onSuccess={handleTicketCreated} />

      <TicketSuccessDialog
        open={showSuccessDialog}
        onClose={() => {
          setShowSuccessDialog(false);
          navigate('/admin/ticketing');
        }}
        ticket={createdTicket}
        rideNames={rideNames}
      />
    </div>
  );
}
