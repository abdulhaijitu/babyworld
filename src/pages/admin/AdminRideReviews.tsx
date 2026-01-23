import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Loader2, Star, Check, X, Trash2, Eye, MessageSquare, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { bn } from 'date-fns/locale';

interface Ride {
  id: string;
  name: string;
  name_bn: string | null;
}

interface Review {
  id: string;
  ride_id: string;
  reviewer_name: string;
  reviewer_phone: string | null;
  rating: number;
  review_text: string | null;
  is_approved: boolean;
  created_at: string;
  rides?: Ride;
}

export default function AdminRideReviews() {
  const { language } = useLanguage();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [filterRide, setFilterRide] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [{ data: reviewsData }, { data: ridesData }] = await Promise.all([
        supabase
          .from('ride_reviews')
          .select('*, rides(id, name, name_bn)')
          .order('created_at', { ascending: false }),
        supabase
          .from('rides')
          .select('id, name, name_bn')
          .eq('is_active', true)
          .order('name')
      ]);

      setReviews((reviewsData || []) as Review[]);
      setRides(ridesData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error(language === 'bn' ? 'ডেটা লোড ব্যর্থ' : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const toggleApproval = async (review: Review) => {
    try {
      const { error } = await supabase
        .from('ride_reviews')
        .update({ is_approved: !review.is_approved })
        .eq('id', review.id);

      if (error) throw error;

      // Update local state
      setReviews(prev => prev.map(r => 
        r.id === review.id ? { ...r, is_approved: !review.is_approved } : r
      ));

      // Update ride rating
      await updateRideRating(review.ride_id);

      toast.success(
        review.is_approved 
          ? (language === 'bn' ? 'রিভিউ অপ্রকাশিত করা হয়েছে' : 'Review unpublished')
          : (language === 'bn' ? 'রিভিউ প্রকাশিত হয়েছে' : 'Review published')
      );
    } catch (error) {
      console.error('Error updating review:', error);
      toast.error(language === 'bn' ? 'আপডেট ব্যর্থ' : 'Update failed');
    }
  };

  const updateRideRating = async (rideId: string) => {
    try {
      // Get all approved reviews for this ride
      const { data: approvedReviews } = await supabase
        .from('ride_reviews')
        .select('rating')
        .eq('ride_id', rideId)
        .eq('is_approved', true);

      if (approvedReviews && approvedReviews.length > 0) {
        const avgRating = approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length;
        
        await supabase
          .from('rides')
          .update({ 
            avg_rating: parseFloat(avgRating.toFixed(1)),
            review_count: approvedReviews.length
          })
          .eq('id', rideId);
      } else {
        await supabase
          .from('rides')
          .update({ avg_rating: 0, review_count: 0 })
          .eq('id', rideId);
      }
    } catch (error) {
      console.error('Error updating ride rating:', error);
    }
  };

  const deleteReview = async (review: Review) => {
    if (!confirm(language === 'bn' ? 'রিভিউটি মুছে ফেলতে চান?' : 'Delete this review?')) return;

    try {
      const { error } = await supabase
        .from('ride_reviews')
        .delete()
        .eq('id', review.id);

      if (error) throw error;

      setReviews(prev => prev.filter(r => r.id !== review.id));
      await updateRideRating(review.ride_id);

      toast.success(language === 'bn' ? 'রিভিউ মুছে ফেলা হয়েছে' : 'Review deleted');
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error(language === 'bn' ? 'মুছে ফেলা ব্যর্থ' : 'Delete failed');
    }
  };

  const filteredReviews = reviews.filter(review => {
    if (filterRide !== 'all' && review.ride_id !== filterRide) return false;
    if (filterStatus === 'approved' && !review.is_approved) return false;
    if (filterStatus === 'pending' && review.is_approved) return false;
    return true;
  });

  const renderStars = (rating: number) => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <Star 
          key={star} 
          className={`h-4 w-4 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`}
        />
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            {language === 'bn' ? 'রাইড রিভিউ ম্যানেজমেন্ট' : 'Ride Reviews Management'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'bn' ? 'কাস্টমার রিভিউ দেখুন ও অনুমোদন করুন' : 'View and approve customer reviews'}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{reviews.length}</p>
                <p className="text-xs text-muted-foreground">
                  {language === 'bn' ? 'মোট রিভিউ' : 'Total Reviews'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{reviews.filter(r => r.is_approved).length}</p>
                <p className="text-xs text-muted-foreground">
                  {language === 'bn' ? 'অনুমোদিত' : 'Approved'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <X className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{reviews.filter(r => !r.is_approved).length}</p>
                <p className="text-xs text-muted-foreground">
                  {language === 'bn' ? 'অপেক্ষমান' : 'Pending'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-400" />
              <div>
                <p className="text-2xl font-bold">
                  {reviews.length > 0 
                    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
                    : '0'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {language === 'bn' ? 'গড় রেটিং' : 'Avg Rating'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{language === 'bn' ? 'ফিল্টার:' : 'Filter:'}</span>
            </div>
            <Select value={filterRide} onValueChange={setFilterRide}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={language === 'bn' ? 'রাইড নির্বাচন' : 'Select ride'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{language === 'bn' ? 'সব রাইড' : 'All Rides'}</SelectItem>
                {rides.map(ride => (
                  <SelectItem key={ride.id} value={ride.id}>
                    {language === 'bn' ? ride.name_bn || ride.name : ride.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder={language === 'bn' ? 'স্ট্যাটাস' : 'Status'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{language === 'bn' ? 'সব' : 'All'}</SelectItem>
                <SelectItem value="approved">{language === 'bn' ? 'অনুমোদিত' : 'Approved'}</SelectItem>
                <SelectItem value="pending">{language === 'bn' ? 'অপেক্ষমান' : 'Pending'}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reviews Table */}
      <Card>
        <CardContent className="pt-4">
          {filteredReviews.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>{language === 'bn' ? 'কোনো রিভিউ নেই' : 'No reviews found'}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{language === 'bn' ? 'রাইড' : 'Ride'}</TableHead>
                    <TableHead>{language === 'bn' ? 'রিভিউয়ার' : 'Reviewer'}</TableHead>
                    <TableHead>{language === 'bn' ? 'রেটিং' : 'Rating'}</TableHead>
                    <TableHead>{language === 'bn' ? 'রিভিউ' : 'Review'}</TableHead>
                    <TableHead>{language === 'bn' ? 'তারিখ' : 'Date'}</TableHead>
                    <TableHead>{language === 'bn' ? 'স্ট্যাটাস' : 'Status'}</TableHead>
                    <TableHead className="text-right">{language === 'bn' ? 'অ্যাকশন' : 'Actions'}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReviews.map(review => (
                    <TableRow key={review.id}>
                      <TableCell className="font-medium">
                        {language === 'bn' 
                          ? review.rides?.name_bn || review.rides?.name 
                          : review.rides?.name}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{review.reviewer_name}</p>
                          {review.reviewer_phone && (
                            <p className="text-xs text-muted-foreground">{review.reviewer_phone}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{renderStars(review.rating)}</TableCell>
                      <TableCell className="max-w-[200px]">
                        <p className="truncate">{review.review_text || '-'}</p>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(review.created_at), 'dd MMM yyyy', { 
                          locale: language === 'bn' ? bn : undefined 
                        })}
                      </TableCell>
                      <TableCell>
                        <Badge variant={review.is_approved ? 'default' : 'secondary'}>
                          {review.is_approved 
                            ? (language === 'bn' ? 'প্রকাশিত' : 'Published')
                            : (language === 'bn' ? 'অপেক্ষমান' : 'Pending')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedReview(review);
                              setViewDialogOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant={review.is_approved ? 'outline' : 'default'}
                            onClick={() => toggleApproval(review)}
                          >
                            {review.is_approved ? (
                              <X className="h-4 w-4" />
                            ) : (
                              <Check className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteReview(review)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{language === 'bn' ? 'রিভিউ বিবরণ' : 'Review Details'}</DialogTitle>
            <DialogDescription>
              {language === 'bn' ? 'সম্পূর্ণ রিভিউ দেখুন' : 'View full review'}
            </DialogDescription>
          </DialogHeader>
          {selectedReview && (
            <div className="space-y-4">
              <div>
                <Label className="text-muted-foreground">{language === 'bn' ? 'রাইড' : 'Ride'}</Label>
                <p className="font-medium">
                  {language === 'bn' 
                    ? selectedReview.rides?.name_bn || selectedReview.rides?.name 
                    : selectedReview.rides?.name}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">{language === 'bn' ? 'রিভিউয়ার' : 'Reviewer'}</Label>
                  <p className="font-medium">{selectedReview.reviewer_name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{language === 'bn' ? 'ফোন' : 'Phone'}</Label>
                  <p className="font-medium">{selectedReview.reviewer_phone || '-'}</p>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">{language === 'bn' ? 'রেটিং' : 'Rating'}</Label>
                <div className="mt-1">{renderStars(selectedReview.rating)}</div>
              </div>
              <div>
                <Label className="text-muted-foreground">{language === 'bn' ? 'রিভিউ' : 'Review'}</Label>
                <p className="mt-1 p-3 bg-muted rounded-lg">{selectedReview.review_text || '-'}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">{language === 'bn' ? 'তারিখ' : 'Date'}</Label>
                <p className="font-medium">
                  {format(new Date(selectedReview.created_at), 'dd MMMM yyyy, hh:mm a', { 
                    locale: language === 'bn' ? bn : undefined 
                  })}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            {selectedReview && (
              <Button
                variant={selectedReview.is_approved ? 'outline' : 'default'}
                onClick={() => {
                  toggleApproval(selectedReview);
                  setViewDialogOpen(false);
                }}
              >
                {selectedReview.is_approved 
                  ? (language === 'bn' ? 'অপ্রকাশিত করুন' : 'Unpublish')
                  : (language === 'bn' ? 'প্রকাশ করুন' : 'Publish')}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
