import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Calendar, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/hooks/useOrganization';

const NoteDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentOrganization } = useOrganization();
  const [note, setNote] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNote = async () => {
      if (!currentOrganization || !id) return;
      
      setIsLoading(true);

      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('id', id)
        .eq('organization_id', currentOrganization.id)
        .single();

      if (error) {
        toast.error('Note not found');
        navigate('/notes');
        return;
      }

      setNote(data);
      setIsLoading(false);
    };

    fetchNote();
  }, [id, currentOrganization, navigate]);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </MainLayout>
    );
  }

  if (!note) {
    return null;
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate('/notes')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Notes
          </Button>
          <Button onClick={() => navigate('/notes')}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Note
          </Button>
        </div>

        <div>
          <h1 className="text-3xl font-bold mb-4">{note.title}</h1>
          {note.tags && note.tags.length > 0 && (
            <div className="flex gap-2 mb-4">
              {note.tags.map((tag: string) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <Card className="p-6">
          <div className="prose prose-sm max-w-none">
            <p className="whitespace-pre-wrap">{note.content}</p>
          </div>
        </Card>

        <div className="flex gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>Created: {new Date(note.created_at).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>Updated: {new Date(note.updated_at).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default NoteDetail;