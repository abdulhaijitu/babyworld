import { LogIn } from 'lucide-react';
import MemberEntryTab from '@/components/admin/MemberEntryTab';

export default function AdminMemberEntry() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <LogIn className="h-6 w-6 text-primary" />
          Member Entry
        </h1>
        <p className="text-muted-foreground">Check-in and check-out members</p>
      </div>
      <MemberEntryTab />
    </div>
  );
}
