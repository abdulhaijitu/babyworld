import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { usePerformance } from '@/hooks/usePerformance';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Star } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminPerformance() {
  const { reviews, isLoading, createReview } = usePerformance();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ employee_id: '', review_period: '', rating: '3', reviewer_notes: '' });

  const { data: employees = [] } = useQuery({
    queryKey: ['employees-list'],
    queryFn: async () => {
      const { data } = await supabase.from('employees').select('id, name, role').eq('status', 'active').order('name');
      return data || [];
    },
  });

  const handleSubmit = () => {
    if (!form.employee_id || !form.review_period) return;
    createReview.mutate({
      employee_id: form.employee_id,
      review_period: form.review_period,
      rating: Number(form.rating),
      reviewer_notes: form.reviewer_notes || undefined,
    });
    setDialogOpen(false);
    setForm({ employee_id: '', review_period: '', rating: '3', reviewer_notes: '' });
  };

  const avgRating = reviews.length > 0 ? (reviews.reduce((s: number, r: any) => s + r.rating, 0) / reviews.length).toFixed(1) : '0';

  const renderStars = (rating: number) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} className={`h-4 w-4 ${i <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'}`} />
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />New Review</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New Performance Review</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Employee</Label>
                <Select value={form.employee_id} onValueChange={v => setForm(p => ({ ...p, employee_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
                  <SelectContent>{employees.map((e: any) => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Review Period</Label><Input placeholder="e.g. Q1 2026, March 2026" value={form.review_period} onChange={e => setForm(p => ({ ...p, review_period: e.target.value }))} /></div>
              <div>
                <Label>Rating (1-5)</Label>
                <Select value={form.rating} onValueChange={v => setForm(p => ({ ...p, rating: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map(n => <SelectItem key={n} value={String(n)}>{n} — {['Poor', 'Below Average', 'Average', 'Good', 'Excellent'][n - 1]}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Notes</Label><Textarea value={form.reviewer_notes} onChange={e => setForm(p => ({ ...p, reviewer_notes: e.target.value }))} /></div>
              <Button onClick={handleSubmit} className="w-full" disabled={createReview.isPending}>Save Review</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 gap-2 lg:gap-4">
        <Card><CardContent className="p-2 lg:pt-6 lg:p-4"><p className="text-[10px] lg:text-sm text-muted-foreground">Total Reviews</p><p className="text-lg lg:text-2xl font-bold">{reviews.length}</p></CardContent></Card>
        <Card><CardContent className="p-2 lg:pt-6 lg:p-4 flex items-center gap-2"><div><p className="text-[10px] lg:text-sm text-muted-foreground">Avg Rating</p><p className="text-lg lg:text-2xl font-bold">{avgRating}</p></div><Star className="h-4 w-4 lg:h-6 lg:w-6 fill-yellow-400 text-yellow-400" /></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="p-3 lg:p-6"><CardTitle className="text-base lg:text-lg">All Reviews</CardTitle></CardHeader>
        <CardContent className="p-3 lg:p-6 pt-0">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">No reviews yet</div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="lg:hidden space-y-2">
                {reviews.map((r: any) => (
                  <div key={r.id} className="border rounded-lg p-2.5 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{r.employees?.name}</span>
                      {renderStars(r.rating)}
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{r.review_period}</span>
                      <span>{format(new Date(r.reviewed_at), 'dd MMM yyyy')}</span>
                    </div>
                    {r.reviewer_notes && <p className="text-xs text-muted-foreground truncate">{r.reviewer_notes}</p>}
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden lg:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reviews.map((r: any) => (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium">{r.employees?.name}</TableCell>
                        <TableCell>{r.review_period}</TableCell>
                        <TableCell>{renderStars(r.rating)}</TableCell>
                        <TableCell className="max-w-[250px] truncate">{r.reviewer_notes || '—'}</TableCell>
                        <TableCell>{format(new Date(r.reviewed_at), 'dd MMM yyyy')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
