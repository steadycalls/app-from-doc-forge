import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Edit, Calendar, DollarSign, Users, FileText } from 'lucide-react';
import { storage, STORAGE_KEYS } from '@/lib/storage';
import { toast } from 'sonner';

interface Project {
  id: string;
  name: string;
  description: string;
  clientId: string;
  status: 'planning' | 'in-progress' | 'completed' | 'on-hold';
  budget: number;
  startDate: string;
  endDate: string;
  progress: number;
  createdAt: string;
}

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [client, setClient] = useState<any>(null);

  useEffect(() => {
    const projects = (storage.get(STORAGE_KEYS.PROJECTS) || []) as Project[];
    const foundProject = projects.find((p: Project) => p.id === id);
    
    if (!foundProject) {
      toast.error('Project not found');
      navigate('/projects');
      return;
    }
    
    setProject(foundProject);

    // Load client details
    const clients = (storage.get(STORAGE_KEYS.CLIENTS) || []) as any[];
    const projectClient = clients.find((c: any) => c.id === foundProject.clientId);
    setClient(projectClient);
  }, [id, navigate]);

  if (!project) {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning': return 'secondary';
      case 'in-progress': return 'default';
      case 'completed': return 'outline';
      case 'on-hold': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/projects')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Button>
        </div>

        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{project.name}</h1>
            <p className="text-muted-foreground">{project.description}</p>
            {client && (
              <Button
                variant="link"
                className="px-0 mt-2"
                onClick={() => navigate(`/clients/${client.id}`)}
              >
                <Users className="h-4 w-4 mr-2" />
                {client.name} - {client.company}
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Badge variant={getStatusColor(project.status)}>
              {project.status.replace('-', ' ')}
            </Badge>
            <Button onClick={() => navigate('/projects')}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Project
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="p-6">
            <div className="flex items-center gap-3 text-muted-foreground mb-2">
              <DollarSign className="h-5 w-5" />
              <span className="text-sm font-medium">Budget</span>
            </div>
            <p className="text-2xl font-bold">${project.budget.toLocaleString()}</p>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center gap-3 text-muted-foreground mb-2">
              <Calendar className="h-5 w-5" />
              <span className="text-sm font-medium">Start Date</span>
            </div>
            <p className="text-lg font-semibold">{new Date(project.startDate).toLocaleDateString()}</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 text-muted-foreground mb-2">
              <Calendar className="h-5 w-5" />
              <span className="text-sm font-medium">End Date</span>
            </div>
            <p className="text-lg font-semibold">{new Date(project.endDate).toLocaleDateString()}</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 text-muted-foreground mb-2">
              <FileText className="h-5 w-5" />
              <span className="text-sm font-medium">Progress</span>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold">{project.progress}%</p>
            </div>
          </Card>
        </div>

        <Card className="p-6">
          <h3 className="font-semibold mb-4">Project Progress</h3>
          <Progress value={project.progress} className="h-3" />
          <div className="flex justify-between mt-2 text-sm text-muted-foreground">
            <span>Started: {new Date(project.startDate).toLocaleDateString()}</span>
            <span>Due: {new Date(project.endDate).toLocaleDateString()}</span>
          </div>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Timeline</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                <div className="flex-1">
                  <p className="font-medium">Project Created</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(project.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                <div className="flex-1">
                  <p className="font-medium">Start Date</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(project.startDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="h-2 w-2 rounded-full bg-muted mt-2" />
                <div className="flex-1">
                  <p className="font-medium">Expected Completion</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(project.endDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold mb-4">Project Details</h3>
            <div className="space-y-4">
              <div>
                <Label className="text-sm text-muted-foreground">Status</Label>
                <p className="font-medium capitalize">{project.status.replace('-', ' ')}</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Budget Allocation</Label>
                <p className="font-medium">${project.budget.toLocaleString()}</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Duration</Label>
                <p className="font-medium">
                  {Math.ceil((new Date(project.endDate).getTime() - new Date(project.startDate).getTime()) / (1000 * 60 * 60 * 24))} days
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

const Label = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <div className={className}>{children}</div>
);

export default ProjectDetail;
