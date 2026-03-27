import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plus, Search, Trash2, Edit, ExternalLink, Calendar, Clock,
  CheckCircle, FileText, Image, Video, Facebook, Instagram, Youtube
} from 'lucide-react';
import { format } from 'date-fns';
import {
  useSocialMediaPosts, useCreateSocialMediaPost, useUpdateSocialMediaPost, useDeleteSocialMediaPost,
  type SocialPostStatus, type SocialPlatform, type SocialMediaPostInsert, type SocialMediaPost
} from '@/hooks/useSocialMediaPosts';

const PLATFORM_CONFIG: Record<SocialPlatform, { label: string; icon: React.ElementType; color: string }> = {
  facebook: { label: 'Facebook', icon: Facebook, color: 'text-blue-600' },
  instagram: { label: 'Instagram', icon: Instagram, color: 'text-pink-500' },
  tiktok: { label: 'TikTok', icon: Video, color: 'text-foreground' },
  youtube: { label: 'YouTube', icon: Youtube, color: 'text-red-600' },
};

const STATUS_CONFIG: Record<SocialPostStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  draft: { label: 'Draft', variant: 'secondary' },
  scheduled: { label: 'Scheduled', variant: 'outline' },
  published: { label: 'Published', variant: 'default' },
  failed: { label: 'Failed', variant: 'destructive' },
};

const POST_TYPE_OPTIONS = [
  { value: 'post', label: 'পোস্ট', icon: FileText },
  { value: 'story', label: 'স্টোরি', icon: Image },
  { value: 'reel', label: 'রিল/শর্ট', icon: Video },
  { value: 'live', label: 'লাইভ', icon: Video },
];

function PostForm({ post, onClose }: { post?: SocialMediaPost; onClose: () => void }) {
  const createPost = useCreateSocialMediaPost();
  const updatePost = useUpdateSocialMediaPost();
  const isEdit = !!post;

  const [form, setForm] = useState({
    title: post?.title || '',
    content: post?.content || '',
    platform: (post?.platform || 'facebook') as SocialPlatform,
    status: (post?.status || 'draft') as SocialPostStatus,
    post_type: post?.post_type || 'post',
    image_url: post?.image_url || '',
    post_url: post?.post_url || '',
    scheduled_at: post?.scheduled_at ? format(new Date(post.scheduled_at), "yyyy-MM-dd'T'HH:mm") : '',
    published_at: post?.published_at ? format(new Date(post.published_at), "yyyy-MM-dd'T'HH:mm") : '',
    notes: post?.notes || '',
    tags: post?.tags?.join(', ') || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) return;

    const tags = form.tags.split(',').map(t => t.trim()).filter(Boolean);

    const payload: SocialMediaPostInsert = {
      title: form.title.trim(),
      content: form.content.trim(),
      platform: form.platform,
      status: form.status,
      post_type: form.post_type,
      image_url: form.image_url.trim() || null,
      post_url: form.post_url.trim() || null,
      scheduled_at: form.scheduled_at ? new Date(form.scheduled_at).toISOString() : null,
      published_at: form.published_at ? new Date(form.published_at).toISOString() : null,
      notes: form.notes.trim() || null,
      tags: tags.length > 0 ? tags : null,
      created_by: null,
    };

    if (isEdit && post) {
      updatePost.mutate({ id: post.id, updates: payload }, { onSuccess: onClose });
    } else {
      createPost.mutate(payload, { onSuccess: onClose });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="title">শিরোনাম *</Label>
          <Input id="title" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required maxLength={200} placeholder="পোস্টের শিরোনাম" />
        </div>
        <div className="space-y-2">
          <Label>প্ল্যাটফর্ম *</Label>
          <Select value={form.platform} onValueChange={v => setForm(p => ({ ...p, platform: v as SocialPlatform }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(PLATFORM_CONFIG).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>পোস্ট টাইপ</Label>
          <Select value={form.post_type} onValueChange={v => setForm(p => ({ ...p, post_type: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {POST_TYPE_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="content">কন্টেন্ট / ক্যাপশন *</Label>
          <Textarea id="content" value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} required maxLength={2200} rows={4} placeholder="পোস্টের কন্টেন্ট লিখুন..." />
          <p className="text-xs text-muted-foreground text-right">{form.content.length}/2200</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="image_url">ইমেজ/ভিডিও URL</Label>
          <Input id="image_url" value={form.image_url} onChange={e => setForm(p => ({ ...p, image_url: e.target.value }))} placeholder="https://..." />
        </div>
        <div className="space-y-2">
          <Label htmlFor="post_url">পোস্ট লিংক (পাবলিশ হলে)</Label>
          <Input id="post_url" value={form.post_url} onChange={e => setForm(p => ({ ...p, post_url: e.target.value }))} placeholder="https://..." />
        </div>
        <div className="space-y-2">
          <Label htmlFor="scheduled_at">শিডিউল তারিখ</Label>
          <Input id="scheduled_at" type="datetime-local" value={form.scheduled_at} onChange={e => setForm(p => ({ ...p, scheduled_at: e.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="published_at">পাবলিশ তারিখ</Label>
          <Input id="published_at" type="datetime-local" value={form.published_at} onChange={e => setForm(p => ({ ...p, published_at: e.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label>স্ট্যাটাস</Label>
          <Select value={form.status} onValueChange={v => setForm(p => ({ ...p, status: v as SocialPostStatus }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(STATUS_CONFIG).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="tags">ট্যাগ (কমা দিয়ে আলাদা)</Label>
          <Input id="tags" value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} placeholder="offer, eid, summer" />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="notes">নোট</Label>
          <Textarea id="notes" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} maxLength={500} rows={2} />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onClose}>বাতিল</Button>
        <Button type="submit" disabled={createPost.isPending || updatePost.isPending}>
          {isEdit ? 'আপডেট' : 'তৈরি করুন'}
        </Button>
      </div>
    </form>
  );
}

export default function AdminSocialMedia() {
  const [statusFilter, setStatusFilter] = useState<SocialPostStatus | 'all'>('all');
  const [platformFilter, setPlatformFilter] = useState<SocialPlatform | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<SocialMediaPost | undefined>();

  const { data: posts = [], isLoading } = useSocialMediaPosts(statusFilter, platformFilter);
  const deletePost = useDeleteSocialMediaPost();

  const filtered = posts.filter(p => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q);
  });

  const stats = {
    total: posts.length,
    published: posts.filter(p => p.status === 'published').length,
    scheduled: posts.filter(p => p.status === 'scheduled').length,
    draft: posts.filter(p => p.status === 'draft').length,
  };

  const openEdit = (post: SocialMediaPost) => { setEditingPost(post); setDialogOpen(true); };
  const openNew = () => { setEditingPost(undefined); setDialogOpen(true); };
  const handleClose = () => { setDialogOpen(false); setEditingPost(undefined); };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Social Media</h1>
          <p className="text-muted-foreground">পোস্ট শিডিউল, ম্যানেজ ও ট্র্যাকিং</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew}><Plus className="h-4 w-4 mr-2" />নতুন পোস্ট</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPost ? 'পোস্ট এডিট' : 'নতুন পোস্ট তৈরি'}</DialogTitle>
            </DialogHeader>
            <PostForm post={editingPost} onClose={handleClose} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 flex items-center gap-3">
          <FileText className="h-8 w-8 text-primary" />
          <div><p className="text-2xl font-bold">{stats.total}</p><p className="text-xs text-muted-foreground">মোট পোস্ট</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <CheckCircle className="h-8 w-8 text-emerald-500" />
          <div><p className="text-2xl font-bold">{stats.published}</p><p className="text-xs text-muted-foreground">পাবলিশড</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <Clock className="h-8 w-8 text-amber-500" />
          <div><p className="text-2xl font-bold">{stats.scheduled}</p><p className="text-xs text-muted-foreground">শিডিউলড</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <Edit className="h-8 w-8 text-muted-foreground" />
          <div><p className="text-2xl font-bold">{stats.draft}</p><p className="text-xs text-muted-foreground">ড্রাফট</p></div>
        </CardContent></Card>
      </div>

      {/* Filters */}
      <Card><CardContent className="p-4">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="পোস্ট খুঁজুন..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
            </div>
            <Select value={platformFilter} onValueChange={v => setPlatformFilter(v as SocialPlatform | 'all')}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="প্ল্যাটফর্ম" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">সব প্ল্যাটফর্ম</SelectItem>
                {Object.entries(PLATFORM_CONFIG).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Tabs value={statusFilter} onValueChange={v => setStatusFilter(v as SocialPostStatus | 'all')}>
            <TabsList>
              <TabsTrigger value="all">সব</TabsTrigger>
              <TabsTrigger value="draft">Draft</TabsTrigger>
              <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
              <TabsTrigger value="published">Published</TabsTrigger>
              <TabsTrigger value="failed">Failed</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardContent></Card>

      {/* Post List */}
      <Card><CardContent className="p-0">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">লোড হচ্ছে...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">কোনো পোস্ট পাওয়া যায়নি</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>পোস্ট</TableHead>
                  <TableHead>প্ল্যাটফর্ম</TableHead>
                  <TableHead>টাইপ</TableHead>
                  <TableHead>শিডিউল</TableHead>
                  <TableHead>স্ট্যাটাস</TableHead>
                  <TableHead>ট্যাগ</TableHead>
                  <TableHead className="text-right">অ্যাকশন</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(post => {
                  const platformInfo = PLATFORM_CONFIG[post.platform];
                  const PlatformIcon = platformInfo.icon;
                  const typeInfo = POST_TYPE_OPTIONS.find(o => o.value === post.post_type);

                  return (
                    <TableRow key={post.id}>
                      <TableCell>
                        <div className="max-w-[250px]">
                          <p className="font-medium truncate">{post.title}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1">{post.content}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <PlatformIcon className={`h-4 w-4 ${platformInfo.color}`} />
                          <span className="text-sm">{platformInfo.label}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">{typeInfo?.label || post.post_type}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {post.scheduled_at ? (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(post.scheduled_at), 'dd MMM yyyy HH:mm')}
                          </span>
                        ) : post.published_at ? (
                          <span className="flex items-center gap-1 text-emerald-600">
                            <CheckCircle className="h-3 w-3" />
                            {format(new Date(post.published_at), 'dd MMM yyyy')}
                          </span>
                        ) : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={STATUS_CONFIG[post.status].variant}>
                          {STATUS_CONFIG[post.status].label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap max-w-[150px]">
                          {post.tags?.slice(0, 3).map(tag => (
                            <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                          ))}
                          {(post.tags?.length || 0) > 3 && <Badge variant="secondary" className="text-xs">+{(post.tags?.length || 0) - 3}</Badge>}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          {post.post_url && (
                            <Button variant="ghost" size="icon" asChild>
                              <a href={post.post_url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" onClick={() => openEdit(post)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive"
                            onClick={() => { if (confirm('এই পোস্ট ডিলিট করতে চান?')) deletePost.mutate(post.id); }}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent></Card>
    </div>
  );
}
