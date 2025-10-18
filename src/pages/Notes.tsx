import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/hooks/useOrganization';

interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

const Notes = () => {
  const { currentOrganization } = useOrganization();
  const [notes, setNotes] = useState<Note[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotes = async () => {
    if (!currentOrganization) return;
    
    setIsLoading(true);
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('organization_id', currentOrganization.id)
      .order('updated_at', { ascending: false });

    if (error) {
      toast.error('Failed to load notes');
      console.error(error);
    } else {
      setNotes(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchNotes();
  }, [currentOrganization]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentOrganization) return;

    const formData = new FormData(e.currentTarget);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error('You must be logged in');
      return;
    }

    const noteData = {
      title: formData.get('title') as string,
      content: formData.get('content') as string,
      tags: (formData.get('tags') as string).split(',').map(t => t.trim()).filter(Boolean),
      organization_id: currentOrganization.id,
      user_id: user.id,
    };

    if (editingNote) {
      const { error } = await supabase
        .from('notes')
        .update(noteData)
        .eq('id', editingNote.id);

      if (error) {
        toast.error('Failed to update note');
        console.error(error);
      } else {
        toast.success('Note updated successfully');
        fetchNotes();
      }
    } else {
      const { error } = await supabase
        .from('notes')
        .insert(noteData);

      if (error) {
        toast.error('Failed to add note');
        console.error(error);
      } else {
        toast.success('Note added successfully');
        fetchNotes();
      }
    }

    setIsDialogOpen(false);
    setEditingNote(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return;

    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete note');
      console.error(error);
    } else {
      toast.success('Note deleted successfully');
      fetchNotes();
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold mb-2">Notes</h1>
            <p className="text-muted-foreground">Document and organize your knowledge</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingNote(null)} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Note
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingNote ? 'Edit Note' : 'Add New Note'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="Meeting notes, ideas, documentation..."
                    defaultValue={editingNote?.title}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    name="content"
                    placeholder="Write your note here..."
                    rows={12}
                    defaultValue={editingNote?.content}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    name="tags"
                    placeholder="meeting, client, ideas"
                    defaultValue={editingNote?.tags.join(', ')}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingNote ? 'Update' : 'Add'} Note
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>All Notes ({notes.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : notes.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No notes yet. Create your first note.</p>
                <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Note
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {notes.map((note) => (
                  <Card key={note.id} className="border-border/50 hover:border-primary/50 transition-all">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg mb-2 line-clamp-1">{note.title}</CardTitle>
                          <p className="text-xs text-muted-foreground">
                            Updated {new Date(note.updated_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => {
                              setEditingNote(note);
                              setIsDialogOpen(true);
                            }}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleDelete(note.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-muted-foreground line-clamp-4">{note.content}</p>
                      {note.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {note.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Notes;
