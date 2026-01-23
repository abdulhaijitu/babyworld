import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  UserCheck, 
  Clock,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

const MAX_CAPACITY = 50; // Maximum playground capacity

export function VisitorCounter() {
  const { language } = useLanguage();
  const today = format(new Date(), 'yyyy-MM-dd');

  // Fetch active tickets (checked in but not checked out)
  const { data: activeTickets = [], refetch } = useQuery({
    queryKey: ['active-visitors', today],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('slot_date', today)
        .eq('status', 'active');
      
      if (error) throw error;
      return data || [];
    },
    refetchInterval: 10000 // Refresh every 10 seconds
  });

  // Subscribe to realtime changes
  useEffect(() => {
    const channel = supabase
      .channel('tickets-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tickets',
          filter: `slot_date=eq.${today}`
        },
        () => {
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [today, refetch]);

  // Fetch used tickets (checked out)
  const { data: usedTickets = [] } = useQuery({
    queryKey: ['used-visitors', today],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('slot_date', today)
        .eq('status', 'used');
      
      if (error) throw error;
      return data || [];
    },
    refetchInterval: 30000
  });

  const currentVisitors = activeTickets.length;
  const totalVisitorsToday = activeTickets.length + usedTickets.length;
  const capacityPercentage = Math.min((currentVisitors / MAX_CAPACITY) * 100, 100);
  const isNearCapacity = capacityPercentage >= 80;
  const isAtCapacity = capacityPercentage >= 100;

  return (
    <Card className={cn(
      "relative overflow-hidden",
      isAtCapacity && "border-destructive/50",
      isNearCapacity && !isAtCapacity && "border-yellow-500/50"
    )}>
      {/* Animated background indicator */}
      {isNearCapacity && (
        <div className={cn(
          "absolute inset-0 opacity-5",
          isAtCapacity ? "bg-destructive" : "bg-yellow-500"
        )} />
      )}
      
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="w-5 h-5" />
            {language === 'bn' ? 'লাইভ ভিজিটর' : 'Live Visitors'}
          </CardTitle>
          {isAtCapacity && (
            <Badge variant="destructive" className="animate-pulse">
              <AlertCircle className="w-3 h-3 mr-1" />
              {language === 'bn' ? 'পূর্ণ' : 'Full'}
            </Badge>
          )}
          {isNearCapacity && !isAtCapacity && (
            <Badge variant="outline" className="border-yellow-500 text-yellow-600">
              {language === 'bn' ? 'প্রায় পূর্ণ' : 'Near Capacity'}
            </Badge>
          )}
        </div>
        <CardDescription>
          {language === 'bn' ? 'বর্তমানে প্লেগ্রাউন্ডে' : 'Currently in playground'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Counter */}
        <div className="flex items-end justify-between">
          <div>
            <div className="flex items-baseline gap-2">
              <span className={cn(
                "text-5xl font-bold",
                isAtCapacity && "text-destructive",
                isNearCapacity && !isAtCapacity && "text-yellow-600"
              )}>
                {currentVisitors}
              </span>
              <span className="text-xl text-muted-foreground">/ {MAX_CAPACITY}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {language === 'bn' ? 'সর্বোচ্চ ধারণক্ষমতা' : 'max capacity'}
            </p>
          </div>
          <div className={cn(
            "w-16 h-16 rounded-full flex items-center justify-center",
            isAtCapacity ? "bg-destructive/10" : isNearCapacity ? "bg-yellow-500/10" : "bg-primary/10"
          )}>
            <UserCheck className={cn(
              "w-8 h-8",
              isAtCapacity ? "text-destructive" : isNearCapacity ? "text-yellow-600" : "text-primary"
            )} />
          </div>
        </div>

        {/* Capacity Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {language === 'bn' ? 'ধারণক্ষমতা' : 'Capacity'}
            </span>
            <span className={cn(
              "font-medium",
              isAtCapacity && "text-destructive",
              isNearCapacity && !isAtCapacity && "text-yellow-600"
            )}>
              {Math.round(capacityPercentage)}%
            </span>
          </div>
          <Progress 
            value={capacityPercentage} 
            className={cn(
              "h-3",
              isAtCapacity && "[&>div]:bg-destructive",
              isNearCapacity && !isAtCapacity && "[&>div]:bg-yellow-500"
            )}
          />
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
            <TrendingUp className="w-4 h-4 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">
                {language === 'bn' ? 'আজকের মোট' : "Today's Total"}
              </p>
              <p className="font-semibold">{totalVisitorsToday}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
            <Clock className="w-4 h-4 text-chart-2" />
            <div>
              <p className="text-xs text-muted-foreground">
                {language === 'bn' ? 'চেক আউট' : 'Checked Out'}
              </p>
              <p className="font-semibold">{usedTickets.length}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
