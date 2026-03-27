import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Search, LogIn, LogOut, Phone, Crown, Clock, Loader2, Users, CalendarCheck } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface MembershipVisit {
  id: string;
  membership_id: string;
  check_in_at: string;
  check_out_at: string | null;
  checked_in_by: string | null;
  notes: string | null;
  created_at: string;
}

export default function MemberEntryTab() {
  const queryClient = useQueryClient();
  const [searchPhone, setSearchPhone] = useState('');
  const [foundMember, setFoundMember] = useState<any>(null);
  const [searching, setSearching] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchPhone.replace(/\s/g, ''));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchPhone]);

  // Close suggestions on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Suggestions query
  const { data: suggestions = [] } = useQuery({
    queryKey: ['member-suggestions', debouncedSearch],
    queryFn: async () => {
      const q = debouncedSearch;
      if (q.length < 3) return [];
      const { data, error } = await supabase
        .from('memberships')
        .select('*')
        .or(`phone.ilike.%${q}%,member_name.ilike.%${q}%`)
        .order('status', { ascending: true })
        .limit(5);
      if (error) throw error;
      if (!data || data.length === 0) return [];

      // Fetch last visit for each member
      const memberIds = data.map((m: any) => m.id);
      const { data: visits } = await supabase
        .from('membership_visits')
        .select('membership_id, check_in_at')
        .in('membership_id', memberIds)
        .order('check_in_at', { ascending: false });

      const lastVisitMap: Record<string, string> = {};
      (visits || []).forEach((v: any) => {
        if (!lastVisitMap[v.membership_id]) {
          lastVisitMap[v.membership_id] = v.check_in_at;
        }
      });

      return data.map((m: any) => ({ ...m, lastVisit: lastVisitMap[m.id] || null }));
    },
    enabled: debouncedSearch.length >= 3,
  });

  // Today's stats
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const { data: todayVisits = [] } = useQuery<MembershipVisit[]>({
    queryKey: ['membership-visits-today', todayStr],
    queryFn: async () => {
      const startOfDay = `${todayStr}T00:00:00`;
      const endOfDay = `${todayStr}T23:59:59`;
      const { data, error } = await supabase
        .from('membership_visits')
        .select('*')
        .gte('check_in_at', startOfDay)
        .lte('check_in_at', endOfDay)
        .order('check_in_at', { ascending: false });
      if (error) throw error;
      return (data || []) as MembershipVisit[];
    },
    refetchInterval: 15000,
  });

  const todayCheckedIn = todayVisits.length;
  const currentlyInside = todayVisits.filter(v => !v.check_out_at).length;
  const checkedOut = todayVisits.filter(v => v.check_out_at).length;

  // Member visits for found member
  const { data: memberVisits = [] } = useQuery<MembershipVisit[]>({
    queryKey: ['member-visits', foundMember?.id],
    queryFn: async () => {
      if (!foundMember) return [];
      const { data, error } = await supabase
        .from('membership_visits')
        .select('*')
        .eq('membership_id', foundMember.id)
        .order('check_in_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return (data || []) as MembershipVisit[];
    },
    enabled: !!foundMember,
  });

  // Active visit (checked in but not out)
  const activeVisit = memberVisits.find(v => !v.check_out_at);

  const handleSearch = async () => {
    const phone = searchPhone.replace(/\s/g, '');
    if (!phone) return;
    setSearching(true);
    setFoundMember(null);
    try {
      const { data, error } = await supabase
        .from('memberships')
        .select('*')
        .eq('phone', phone)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1);
      if (error) throw error;
      if (data && data.length > 0) {
        setFoundMember(data[0]);
      } else {
        toast.error('No active member found');
      }
    } catch {
      toast.error('Search failed');
    } finally {
      setSearching(false);
    }
  };

  const checkInMutation = useMutation({
    mutationFn: async (membershipId: string) => {
      const { data: userData } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('membership_visits')
        .insert({
          membership_id: membershipId,
          checked_in_by: userData.user?.id || null,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('✅ Check-in successful');
      queryClient.invalidateQueries({ queryKey: ['membership-visits-today'] });
      queryClient.invalidateQueries({ queryKey: ['member-visits', foundMember?.id] });
    },
    onError: () => toast.error('Check-in failed'),
  });

  const checkOutMutation = useMutation({
    mutationFn: async (visitId: string) => {
      const { error } = await supabase
        .from('membership_visits')
        .update({ check_out_at: new Date().toISOString() })
        .eq('id', visitId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('✅ Check-out successful');
      queryClient.invalidateQueries({ queryKey: ['membership-visits-today'] });
      queryClient.invalidateQueries({ queryKey: ['member-visits', foundMember?.id] });
    },
    onError: () => toast.error('Check-out failed'),
  });

  const remainingDays = foundMember
    ? Math.max(0, Math.ceil((new Date(foundMember.valid_till).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  return (
    <div className="space-y-6">
      {/* Today's Summary */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-primary">{todayCheckedIn}</p>
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <CalendarCheck className="h-3 w-3" /> Today's Check-ins
            </p>
          </CardContent>
        </Card>
        <Card className="border-primary/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-green-600">{currentlyInside}</p>
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <Users className="h-3 w-3" /> বর্তমানে ভেতরে
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-muted-foreground">{checkedOut}</p>
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <LogOut className="h-3 w-3" /> চেক-আউট
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-2">
            <div className="relative flex-1" ref={suggestionsRef}>
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ফোন নম্বর বা নাম দিয়ে মেম্বার খুঁজুন..."
                className="pl-10"
                value={searchPhone}
                onChange={(e) => {
                  setSearchPhone(e.target.value);
                  setShowSuggestions(true);
                  setFoundMember(null);
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                onFocus={() => debouncedSearch.length >= 3 && setShowSuggestions(true)}
              />
              {/* Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-popover border border-border rounded-md shadow-lg overflow-hidden">
                  {suggestions.map((member: any) => (
                    <button
                      key={member.id}
                      className="w-full text-left px-3 py-2.5 hover:bg-accent flex items-center justify-between gap-2 border-b last:border-b-0 border-border/50 transition-colors"
                      onClick={() => {
                        setFoundMember(member);
                        setSearchPhone(member.phone);
                        setShowSuggestions(false);
                      }}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Avatar className="h-8 w-8 shrink-0">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                            {member.member_name?.charAt(0)?.toUpperCase() || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">{member.member_name}</p>
                          <p className="text-xs text-muted-foreground">{member.phone}</p>
                          <p className="text-xs text-muted-foreground">
                            {member.lastVisit
                              ? `শেষ ভিজিট: ${format(new Date(member.lastVisit), 'dd MMM yyyy')}`
                              : 'কোনো ভিজিট নেই'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Badge variant="outline" className="capitalize text-xs">{member.membership_type}</Badge>
                        <Badge className={member.status === 'active' ? 'bg-green-500/10 text-green-600 border-green-200 text-xs' : 'bg-destructive/10 text-destructive border-destructive/20 text-xs'}>
                          {member.status === 'active' ? 'Active' : member.status}
                        </Badge>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <Button onClick={handleSearch} disabled={searching}>
              {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              <span className="ml-2 hidden sm:inline">খুঁজুন</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Member Profile Card */}
      {foundMember && (
        <Card className="border-primary/30">
          <CardContent className="p-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <Crown className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">{foundMember.member_name}</h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Phone className="h-3 w-3" /> {foundMember.phone}
                  </p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <Badge variant="outline" className="capitalize">{foundMember.membership_type}</Badge>
                    <Badge className="bg-green-500/10 text-green-600 border-green-200">Active</Badge>
                    <span className="text-xs text-muted-foreground">
                      {foundMember.child_count} শিশু
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 text-right">
                <p className="text-sm text-muted-foreground">
                  মেয়াদ: {foundMember.valid_from} → {foundMember.valid_till}
                </p>
                <Badge variant={remainingDays <= 7 ? 'destructive' : 'secondary'}>
                  {remainingDays} দিন বাকি
                </Badge>
                <p className="text-xs text-muted-foreground">
                  মোট ভিজিট: {memberVisits.length}
                </p>
              </div>
            </div>

            {/* Check In / Check Out */}
            <div className="mt-4 flex gap-3">
              {activeVisit ? (
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => checkOutMutation.mutate(activeVisit.id)}
                  disabled={checkOutMutation.isPending}
                >
                  {checkOutMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <LogOut className="h-4 w-4 mr-2" />
                  )}
                  চেক-আউট
                </Button>
              ) : (
                <Button
                  className="flex-1"
                  onClick={() => checkInMutation.mutate(foundMember.id)}
                  disabled={checkInMutation.isPending}
                >
                  {checkInMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <LogIn className="h-4 w-4 mr-2" />
                  )}
                  চেক-ইন
                </Button>
              )}
            </div>

            {activeVisit && (
              <p className="mt-2 text-xs text-primary bg-primary/10 rounded px-3 py-1.5 text-center">
                ⏰ চেক-ইন: {format(new Date(activeVisit.check_in_at), 'hh:mm a')} — বর্তমানে ভেতরে আছে
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Visit History */}
      {foundMember && memberVisits.length > 0 && (
        <Card>
          <CardContent className="p-0">
            <div className="px-4 py-3 border-b">
              <h4 className="font-semibold flex items-center gap-2">
                <Clock className="h-4 w-4" /> ভিজিট হিস্ট্রি
              </h4>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>তারিখ</TableHead>
                  <TableHead>চেক-ইন</TableHead>
                  <TableHead>চেক-আউট</TableHead>
                  <TableHead>স্ট্যাটাস</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {memberVisits.map((visit) => (
                  <TableRow key={visit.id}>
                    <TableCell className="text-sm">
                      {format(new Date(visit.check_in_at), 'dd MMM yyyy')}
                    </TableCell>
                    <TableCell className="text-sm">
                      {format(new Date(visit.check_in_at), 'hh:mm a')}
                    </TableCell>
                    <TableCell className="text-sm">
                      {visit.check_out_at
                        ? format(new Date(visit.check_out_at), 'hh:mm a')
                        : '—'}
                    </TableCell>
                    <TableCell>
                      {visit.check_out_at ? (
                        <Badge variant="secondary">সম্পন্ন</Badge>
                      ) : (
                        <Badge className="bg-green-500/10 text-green-600 border-green-200">ভেতরে</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Today's Visit Log */}
      {todayVisits.length > 0 && !foundMember && (
        <Card>
          <CardContent className="p-0">
            <div className="px-4 py-3 border-b">
              <h4 className="font-semibold flex items-center gap-2">
                <CalendarCheck className="h-4 w-4" /> আজকের ভিজিট লগ
              </h4>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>মেম্বার</TableHead>
                  <TableHead>চেক-ইন</TableHead>
                  <TableHead>চেক-আউট</TableHead>
                  <TableHead>স্ট্যাটাস</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {todayVisits.map((visit) => (
                  <TodayVisitRow key={visit.id} visit={visit} />
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function TodayVisitRow({ visit }: { visit: MembershipVisit }) {
  const { data: member } = useQuery({
    queryKey: ['membership-name', visit.membership_id],
    queryFn: async () => {
      const { data } = await supabase
        .from('memberships')
        .select('member_name, phone')
        .eq('id', visit.membership_id)
        .single();
      return data;
    },
    staleTime: 60000,
  });

  return (
    <TableRow>
      <TableCell>
        <div>
          <p className="font-medium text-sm">{member?.member_name || '...'}</p>
          <p className="text-xs text-muted-foreground">{member?.phone || ''}</p>
        </div>
      </TableCell>
      <TableCell className="text-sm">
        {format(new Date(visit.check_in_at), 'hh:mm a')}
      </TableCell>
      <TableCell className="text-sm">
        {visit.check_out_at ? format(new Date(visit.check_out_at), 'hh:mm a') : '—'}
      </TableCell>
      <TableCell>
        {visit.check_out_at ? (
          <Badge variant="secondary">সম্পন্ন</Badge>
        ) : (
          <Badge className="bg-green-500/10 text-green-600 border-green-200">ভেতরে</Badge>
        )}
      </TableCell>
    </TableRow>
  );
}
