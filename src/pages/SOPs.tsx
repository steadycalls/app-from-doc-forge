import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, BookOpen, Trash2, Edit, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { storage, STORAGE_KEYS } from '@/lib/storage';
import { useNavigate } from 'react-router-dom';

interface SOP {
  id: string;
  title: string;
  category: string;
  description: string;
  content: string;
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt: string;
}

const categories = ['Operations', 'Sales', 'Marketing', 'Customer Success', 'HR', 'Finance'];

const SOPs = () => {
  const navigate = useNavigate();
  const [sops, setSops] = useState<SOP[]>(() => {
    return storage.get(STORAGE_KEYS.SOPS) || [];
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSOP, setEditingSOP] = useState<SOP | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const sop: SOP = {
      id: editingSOP?.id || crypto.randomUUID(),
      title: formData.get('title') as string,
      category: formData.get('category') as string,
      description: formData.get('description') as string,
      content: formData.get('content') as string,
      status: (formData.get('status') as 'draft' | 'published') || 'draft',
      createdAt: editingSOP?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedSOPs = editingSOP
      ? sops.map(s => s.id === sop.id ? sop : s)
      : [...sops, sop];

    setSops(updatedSOPs);
    storage.set(STORAGE_KEYS.SOPS, updatedSOPs);
    toast.success(editingSOP ? 'SOP updated' : 'SOP created');
    setIsDialogOpen(false);
    setEditingSOP(null);
  };

  const handleDelete = (id: string) => {
    const updatedSOPs = sops.filter(s => s.id !== id);
    setSops(updatedSOPs);
    storage.set(STORAGE_KEYS.SOPS, updatedSOPs);
    toast.success('SOP deleted');
  };

  const filteredSOPs = selectedCategory === 'all'
    ? sops
    : sops.filter(s => s.category === selectedCategory);

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Standard Operating Procedures</h1>
            <p className="text-muted-foreground mt-1">Document and manage your team's processes</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingSOP(null)}>
                <Plus className="h-4 w-4 mr-2" />
                Create SOP
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingSOP ? 'Edit' : 'Create'} SOP</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    name="title"
                    defaultValue={editingSOP?.title}
                    placeholder="How to onboard a new client"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select name="category" defaultValue={editingSOP?.category || categories[0]}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select name="status" defaultValue={editingSOP?.status || 'draft'}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Short Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    defaultValue={editingSOP?.description}
                    placeholder="Brief overview of this procedure"
                    rows={2}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content">Full Content</Label>
                  <Textarea
                    id="content"
                    name="content"
                    defaultValue={editingSOP?.content}
                    placeholder="Step-by-step instructions..."
                    rows={12}
                    required
                  />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingSOP ? 'Update' : 'Create'} SOP
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex gap-2">
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory('all')}
          >
            All
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>

        {filteredSOPs.length === 0 ? (
          <Card className="p-12 text-center">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No SOPs yet</h3>
            <p className="text-muted-foreground mb-4">
              Start documenting your processes and best practices
            </p>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredSOPs.map((sop) => (
              <Card key={sop.id} className="p-6 hover:border-primary transition-colors cursor-pointer">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">{sop.category}</Badge>
                      <Badge variant={sop.status === 'published' ? 'default' : 'secondary'}>
                        {sop.status}
                      </Badge>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{sop.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {sop.description}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t">
                  <span className="text-xs text-muted-foreground">
                    Updated {new Date(sop.updatedAt).toLocaleDateString()}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setEditingSOP(sop);
                        setIsDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(sop.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default SOPs;
