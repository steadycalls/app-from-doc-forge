import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, DollarSign, Calendar, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/hooks/useOrganization';

interface Project {
  id: string;
  name: string;
  client_id: string;
  status: 'planning' | 'active' | 'completed' | 'on-hold';
  priority: 'low' | 'medium' | 'high';
  budget: number;
  start_date: string;
  deadline: string;
  description: string;
  created_at: string;
}

const Projects = () => {
  const { currentOrganization } = useOrganization();
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    if (!currentOrganization) return;
    
    setIsLoading(true);
    const [projectsRes, clientsRes] = await Promise.all([
      supabase
        .from('projects')
        .select('*')
        .eq('organization_id', currentOrganization.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('clients')
        .select('*')
        .eq('organization_id', currentOrganization.id)
    ]);

    if (projectsRes.error) {
      toast.error('Failed to load projects');
      console.error(projectsRes.error);
    } else {
      setProjects(projectsRes.data || []);
    }

    if (clientsRes.error) {
      console.error(clientsRes.error);
    } else {
      setClients(clientsRes.data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
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

    const projectData = {
      name: formData.get('name') as string,
      client_id: formData.get('clientId') as string,
      status: formData.get('status') as Project['status'],
      priority: formData.get('priority') as Project['priority'],
      budget: parseFloat(formData.get('budget') as string) || 0,
      start_date: formData.get('startDate') as string,
      deadline: formData.get('deadline') as string,
      description: formData.get('description') as string,
      organization_id: currentOrganization.id,
      user_id: user.id,
    };

    if (editingProject) {
      const { error } = await supabase
        .from('projects')
        .update(projectData)
        .eq('id', editingProject.id);

      if (error) {
        toast.error('Failed to update project');
        console.error(error);
      } else {
        toast.success('Project updated successfully');
        fetchData();
      }
    } else {
      const { error } = await supabase
        .from('projects')
        .insert(projectData);

      if (error) {
        toast.error('Failed to add project');
        console.error(error);
      } else {
        toast.success('Project added successfully');
        fetchData();
      }
    }

    setIsDialogOpen(false);
    setEditingProject(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete project');
      console.error(error);
    } else {
      toast.success('Project deleted successfully');
      fetchData();
    }
  };

  const statusColors = {
    planning: 'bg-info/10 text-info border-info',
    active: 'bg-success/10 text-success border-success',
    completed: 'bg-muted/10 text-muted-foreground border-muted',
    'on-hold': 'bg-warning/10 text-warning border-warning',
  };

  const priorityColors = {
    low: 'bg-muted/10 text-muted-foreground',
    medium: 'bg-warning/10 text-warning',
    high: 'bg-destructive/10 text-destructive',
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold mb-2">Projects</h1>
            <p className="text-muted-foreground">Track and manage your client projects</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingProject(null)} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Project
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingProject ? 'Edit Project' : 'Add New Project'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Project Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Website Redesign"
                    defaultValue={editingProject?.name}
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="clientId">Client</Label>
                    <Select name="clientId" defaultValue={editingProject?.client_id} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select client" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.company_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select name="status" defaultValue={editingProject?.status || 'planning'} required>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="planning">Planning</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="on-hold">On Hold</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select name="priority" defaultValue={editingProject?.priority || 'medium'} required>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="budget">Budget ($)</Label>
                    <Input
                      id="budget"
                      name="budget"
                      type="number"
                      placeholder="10000"
                      defaultValue={editingProject?.budget}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      name="startDate"
                      type="date"
                      defaultValue={editingProject?.start_date}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deadline">Deadline</Label>
                    <Input
                      id="deadline"
                      name="deadline"
                      type="date"
                      defaultValue={editingProject?.deadline}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Project details and requirements..."
                    rows={4}
                    defaultValue={editingProject?.description}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingProject ? 'Update' : 'Add'} Project
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>All Projects ({projects.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No projects yet. Create your first project.</p>
                <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Project
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {projects.map((project) => {
                  const client = clients.find(c => c.id === project.client_id);
                  return (
                    <Card key={project.id} className="border-border/50 hover:border-primary/50 transition-all">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-xl mb-2">{project.name}</CardTitle>
                            <p className="text-sm text-muted-foreground">{client?.company_name || 'Unknown Client'}</p>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setEditingProject(project);
                                setIsDialogOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(project.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex gap-2">
                          <Badge variant="outline" className={statusColors[project.status]}>
                            {project.status}
                          </Badge>
                          <Badge variant="outline" className={priorityColors[project.priority]}>
                            {project.priority} priority
                          </Badge>
                        </div>
                        {project.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
                        )}
                        <div className="flex gap-4 text-sm text-muted-foreground">
                          {project.budget > 0 && (
                            <span className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              ${project.budget.toLocaleString()}
                            </span>
                          )}
                          {project.start_date && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(project.start_date).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Projects;