import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Calendar, Tag } from 'lucide-react';
import { storage, STORAGE_KEYS } from '@/lib/storage';
import { toast } from 'sonner';

interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

const NoteDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [note, setNote] = useState<Note | null>(null);

  useEffect(() => {
    const notes = (storage.get(STORAGE_KEYS.NOTES) || []) as Note[];
    const foundNote = notes.find((n: Note) => n.id === id);
    
    if (!foundNote) {
      toast.error('Note not found');
      navigate('/notes');
      return;
    }
    
    setNote(foundNote);
  }, [id, navigate]);

  if (!note) {
    return null;
  }

  return (
    <MainLayout>
      <div className="space-y-6 max-w-4xl">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/notes')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Notes
          </Button>
        </div>

        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-4">{note.title}</h1>
            {note.tags.length > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <div className="flex gap-2">
                  {note.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
          <Button onClick={() => navigate('/notes')}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Note
          </Button>
        </div>

        <Card className="p-6">
          <div className="prose prose-sm max-w-none">
            <div className="whitespace-pre-wrap text-foreground">{note.content}</div>
          </div>
        </Card>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>Created: {new Date(note.createdAt).toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>Updated: {new Date(note.updatedAt).toLocaleString()}</span>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default NoteDetail;
