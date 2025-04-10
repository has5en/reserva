
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Request } from '@/data/models';
import { 
  getRequestById, 
  updateRequestStatus, 
  formatDate, 
  formatDateTime 
} from '@/services/dataService';
import { AlertCircle, CheckCircle2, Clock, XCircle } from 'lucide-react';

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'pending':
      return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">En attente</Badge>;
    case 'admin_approved':
      return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">Approuvé par admin</Badge>;
    case 'approved':
      return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Approuvé</Badge>;
    case 'rejected':
      return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">Rejeté</Badge>;
    default:
      return <Badge variant="outline">Inconnu</Badge>;
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'pending':
      return <Clock className="h-5 w-5 text-yellow-600" />;
    case 'admin_approved':
      return <CheckCircle2 className="h-5 w-5 text-blue-600" />;
    case 'approved':
      return <CheckCircle2 className="h-5 w-5 text-green-600" />;
    case 'rejected':
      return <XCircle className="h-5 w-5 text-red-600" />;
    default:
      return <AlertCircle className="h-5 w-5" />;
  }
};

const RequestDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { currentUser, hasRole } = useAuth();
  const navigate = useNavigate();

  const [request, setRequest] = useState<Request | null>(null);
  const [loading, setLoading] = useState(true);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [processingAction, setProcessingAction] = useState(false);

  useEffect(() => {
    const fetchRequest = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const requestData = await getRequestById(id);
        if (requestData) {
          setRequest(requestData);
        } else {
          toast({
            variant: 'destructive',
            title: 'Erreur',
            description: 'Demande non trouvée.',
          });
          navigate('/dashboard');
        }
      } catch (error) {
        console.error('Failed to fetch request:', error);
        toast({
          variant: 'destructive',
          title: 'Erreur',
          description: 'Impossible de charger les détails de la demande.',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRequest();
  }, [id, navigate]);

  const handleApprove = async () => {
    if (!currentUser || !request) return;
    
    setProcessingAction(true);
    try {
      const newStatus = hasRole('admin') ? 'admin_approved' : 'approved';
      const updatedRequest = await updateRequestStatus(
        request.id,
        newStatus,
        currentUser.id,
        currentUser.name,
        approvalNotes
      );
      
      setRequest(updatedRequest);
      
      toast({
        title: 'Demande approuvée',
        description: 'La demande a été approuvée avec succès.',
      });
    } catch (error) {
      console.error('Failed to approve request:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible d\'approuver la demande. Veuillez réessayer.',
      });
    } finally {
      setProcessingAction(false);
    }
  };

  const handleReject = async () => {
    if (!currentUser || !request) return;
    
    if (approvalNotes.trim() === '') {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Veuillez indiquer la raison du rejet.',
      });
      return;
    }
    
    setProcessingAction(true);
    try {
      const updatedRequest = await updateRequestStatus(
        request.id,
        'rejected',
        currentUser.id,
        currentUser.name,
        approvalNotes
      );
      
      setRequest(updatedRequest);
      
      toast({
        title: 'Demande rejetée',
        description: 'La demande a été rejetée.',
      });
    } catch (error) {
      console.error('Failed to reject request:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de rejeter la demande. Veuillez réessayer.',
      });
    } finally {
      setProcessingAction(false);
    }
  };

  const canApproveAsAdmin = () => {
    return hasRole('admin') && 
           request?.status === 'pending';
  };

  const canApproveAsSupervisor = () => {
    return hasRole('supervisor') && 
           request?.status === 'admin_approved';
  };

  if (loading) {
    return (
      <Layout title="Détails de la demande">
        <div className="flex justify-center items-center h-64">
          <p>Chargement des détails...</p>
        </div>
      </Layout>
    );
  }

  if (!request) {
    return (
      <Layout title="Détails de la demande">
        <div className="flex justify-center items-center h-64">
          <p>Demande non trouvée.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Détails de la demande">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            {getStatusIcon(request.status)}
            <h2 className="text-xl font-semibold">
              {request.type === 'room' ? `Réservation: ${request.roomName}` : `Matériel: ${request.equipmentName}`}
            </h2>
            <div>{getStatusBadge(request.status)}</div>
          </div>
          <Button variant="outline" onClick={() => navigate(-1)}>
            Retour
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Informations de la demande</CardTitle>
                <CardDescription>Détails de la demande #{request.id}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">Type de demande</Label>
                    <p className="font-medium">
                      {request.type === 'room' ? 'Réservation de salle' : 'Demande de matériel'}
                    </p>
                  </div>
                  
                  <div>
                    <Label className="text-sm text-muted-foreground">Date de création</Label>
                    <p className="font-medium">{formatDateTime(request.createdAt)}</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm text-muted-foreground">Demandeur</Label>
                    <p className="font-medium">{request.userName}</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm text-muted-foreground">Classe</Label>
                    <p className="font-medium">{request.className}</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm text-muted-foreground">Date d'utilisation</Label>
                    <p className="font-medium">{formatDate(request.date)}</p>
                  </div>
                  
                  {request.type === 'room' && (
                    <div>
                      <Label className="text-sm text-muted-foreground">Horaire</Label>
                      <p className="font-medium">{request.startTime} - {request.endTime}</p>
                    </div>
                  )}
                  
                  {request.type === 'equipment' && (
                    <div>
                      <Label className="text-sm text-muted-foreground">Quantité</Label>
                      <p className="font-medium">{request.equipmentQuantity}</p>
                    </div>
                  )}
                </div>
                
                {request.notes && (
                  <div>
                    <Label className="text-sm text-muted-foreground">Notes</Label>
                    <p className="font-medium">{request.notes}</p>
                  </div>
                )}
                
                <div>
                  <Label className="text-sm text-muted-foreground">Signature</Label>
                  <div className="mt-2 border rounded p-2 bg-white">
                    <img 
                      src={request.signature} 
                      alt="Signature" 
                      className="max-h-24 mx-auto"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Statut de la demande</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <div className={`h-4 w-4 rounded-full ${request.status !== 'rejected' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <div>
                    <p className="font-medium">Soumission</p>
                    <p className="text-sm text-muted-foreground">{formatDateTime(request.createdAt)}</p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex items-center space-x-2">
                  <div className={`h-4 w-4 rounded-full ${
                    request.status === 'admin_approved' || request.status === 'approved' || request.status === 'rejected' 
                      ? 'bg-green-500' 
                      : 'bg-gray-300'
                  }`}></div>
                  <div>
                    <p className="font-medium">Validation administrateur</p>
                    {request.adminApproval ? (
                      <>
                        <p className="text-sm text-muted-foreground">
                          {formatDateTime(request.adminApproval.timestamp)} par {request.adminApproval.userName}
                        </p>
                        {request.adminApproval.notes && (
                          <p className="text-sm italic mt-1">{request.adminApproval.notes}</p>
                        )}
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground">En attente</p>
                    )}
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex items-center space-x-2">
                  <div className={`h-4 w-4 rounded-full ${
                    request.status === 'approved' || request.status === 'rejected' 
                      ? request.status === 'approved' ? 'bg-green-500' : 'bg-red-500'
                      : 'bg-gray-300'
                  }`}></div>
                  <div>
                    <p className="font-medium">Approbation finale</p>
                    {request.supervisorApproval ? (
                      <>
                        <p className="text-sm text-muted-foreground">
                          {formatDateTime(request.supervisorApproval.timestamp)} par {request.supervisorApproval.userName}
                        </p>
                        {request.supervisorApproval.notes && (
                          <p className="text-sm italic mt-1">{request.supervisorApproval.notes}</p>
                        )}
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        {request.status === 'admin_approved' ? 'En attente' : 'Non applicable'}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {(canApproveAsAdmin() || canApproveAsSupervisor()) && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="notes">Notes (obligatoire pour rejeter)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Commentaires sur l'approbation ou le rejet..."
                      value={approvalNotes}
                      onChange={(e) => setApprovalNotes(e.target.value)}
                      rows={3}
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button 
                    variant="outline" 
                    className="border-red-300 text-red-600 hover:bg-red-50"
                    onClick={handleReject}
                    disabled={processingAction}
                  >
                    Rejeter
                  </Button>
                  <Button 
                    variant="default"
                    onClick={handleApprove}
                    disabled={processingAction}
                  >
                    Approuver
                  </Button>
                </CardFooter>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default RequestDetails;
