
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { getRequestById, updateRequestStatus } from '@/services/requests/requestService';
import { Request, RequestStatus } from '@/data/models';
import { toast } from '@/components/ui/use-toast';
import { ArrowLeft, Check, X, RefreshCw, FileCheck } from 'lucide-react';
import { formatDate } from '@/services/utils/dateUtils';

const formatDateTime = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const RequestDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser, hasRole } = useAuth();
  const [request, setRequest] = useState<Request | null>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState('');
  const [processingAction, setProcessingAction] = useState(false);

  const canApprove = hasRole('admin') || hasRole('supervisor');
  const isAdmin = hasRole('admin');
  const isSupervisor = hasRole('supervisor');

  useEffect(() => {
    if (id) {
      fetchRequest(id);
    }
  }, [id]);

  const fetchRequest = async (requestId: string) => {
    try {
      setLoading(true);
      const data = await getRequestById(requestId);
      if (data) {
        setRequest(data);
      } else {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Demande non trouvée.",
        });
        navigate(-1);
      }
    } catch (error) {
      console.error('Error fetching request:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les détails de la demande.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: RequestStatus) => {
    if (!request || !currentUser || processingAction) return;

    try {
      setProcessingAction(true);
      await updateRequestStatus(
        request.id,
        newStatus,
        notes
      );

      toast({
        title: "Statut mis à jour",
        description: `La demande a été ${statusToFrench(newStatus)}.`,
      });

      await fetchRequest(request.id);
      setNotes('');
    } catch (error) {
      console.error('Error updating request status:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de mettre à jour le statut de la demande.",
      });
    } finally {
      setProcessingAction(false);
    }
  };

  const statusToFrench = (status: RequestStatus): string => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'admin_approved': return 'Approuvée par admin';
      case 'approved': return 'Approuvée';
      case 'rejected': return 'Rejetée';
      case 'returned': return 'Retournée';
      default: return status;
    }
  };

  const requestTypeToFrench = (type: string): string => {
    switch (type) {
      case 'room': return 'Réservation de salle';
      case 'equipment': return 'Emprunt d\'équipement';
      case 'printing': return 'Demande d\'impression';
      default: return type;
    }
  };

  if (loading) {
    return (
      <Layout title="Détails de la demande">
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin">
            <RefreshCw className="h-8 w-8 text-primary" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!request) {
    return (
      <Layout title="Détails de la demande">
        <div className="text-center py-8">
          <p className="text-muted-foreground">Demande non trouvée.</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Détails de la demande">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Button 
            variant="outline" 
            onClick={() => navigate(-1)}
            className="flex items-center"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
          
          <div className="flex gap-2">
            {request.status === 'pending' && isAdmin && (
              <Button 
                onClick={() => handleStatusChange('admin_approved')}
                disabled={processingAction}
                className="bg-amber-500 hover:bg-amber-600"
              >
                <FileCheck className="mr-2 h-4 w-4" />
                Approuver (Admin)
              </Button>
            )}
            
            {(request.status === 'pending' || request.status === 'admin_approved') && isSupervisor && (
              <Button 
                onClick={() => handleStatusChange('approved')}
                disabled={processingAction}
                className="bg-green-500 hover:bg-green-600"
              >
                <Check className="mr-2 h-4 w-4" />
                Approuver
              </Button>
            )}
            
            {request.status === 'pending' && canApprove && (
              <Button 
                variant="destructive"
                onClick={() => handleStatusChange('rejected')}
                disabled={processingAction}
              >
                <X className="mr-2 h-4 w-4" />
                Rejeter
              </Button>
            )}
            
            {request.status === 'approved' && request.type === 'equipment' && canApprove && (
              <Button 
                variant="outline"
                onClick={() => handleStatusChange('returned')}
                disabled={processingAction}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Marquer comme retourné
              </Button>
            )}
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>
              {requestTypeToFrench(request.type)}
              <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                request.status === 'approved' ? 'bg-green-100 text-green-800' :
                request.status === 'admin_approved' ? 'bg-amber-100 text-amber-800' :
                request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                request.status === 'returned' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {statusToFrench(request.status)}
              </span>
            </CardTitle>
            <CardDescription>
              Demande #{request.id.slice(0, 8)} • Créée le {formatDateTime(request.createdAt)}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Demandeur</Label>
                  <p className="mt-1">{request.userName}</p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Classe</Label>
                  <p className="mt-1">{request.className || '-'}</p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Date</Label>
                  <p className="mt-1">{request.date ? formatDate(request.date) : '-'}</p>
                </div>
                
                {request.startTime && (
                  <div>
                    <Label className="text-sm font-medium">Horaires</Label>
                    <p className="mt-1">
                      De {request.startTime.split('T')[1]?.substring(0, 5) || ''} à {request.endTime?.split('T')[1]?.substring(0, 5) || ''}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                {request.type === 'room' && request.roomName && (
                  <div>
                    <Label className="text-sm font-medium">Salle</Label>
                    <p className="mt-1">{request.roomName}</p>
                  </div>
                )}
                
                {request.type === 'equipment' && request.equipmentName && (
                  <>
                    <div>
                      <Label className="text-sm font-medium">Équipement</Label>
                      <p className="mt-1">{request.equipmentName}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Quantité</Label>
                      <p className="mt-1">{request.equipmentQuantity || 1}</p>
                    </div>
                  </>
                )}

                {request.type === 'printing' && (
                  <>
                    <div>
                      <Label className="text-sm font-medium">Document</Label>
                      <p className="mt-1">{request.documentName}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Détails d'impression</Label>
                      <p className="mt-1">{request.pageCount} pages × {request.copies} copies</p>
                      <p className="mt-1">
                        {request.colorPrint ? 'Couleur' : 'Noir et blanc'}, 
                        {request.doubleSided ? ' recto-verso' : ' recto simple'}
                      </p>
                    </div>
                  </>
                )}
                
                {request.notes && (
                  <div>
                    <Label className="text-sm font-medium">Notes</Label>
                    <p className="mt-1 whitespace-pre-line">{request.notes}</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Historique des approbations */}
            <div className="space-y-3 border-t pt-4">
              <h3 className="font-medium">Historique</h3>
              
              <div className="space-y-2">
                {request.adminApproval && (
                  <div className="bg-amber-50 p-3 rounded-md">
                    <p className="text-sm text-amber-800 font-medium">
                      Approuvé par administrateur : {request.adminApproval.userName}
                    </p>
                    <p className="text-xs text-amber-600">
                      {formatDateTime(request.adminApproval.timestamp)}
                    </p>
                    {request.adminApproval.notes && (
                      <p className="text-sm mt-1 text-amber-700">{request.adminApproval.notes}</p>
                    )}
                  </div>
                )}
                
                {request.supervisorApproval && (
                  <div className="bg-green-50 p-3 rounded-md">
                    <p className="text-sm text-green-800 font-medium">
                      Approuvé par superviseur : {request.supervisorApproval.userName}
                    </p>
                    <p className="text-xs text-green-600">
                      {formatDateTime(request.supervisorApproval.timestamp)}
                    </p>
                    {request.supervisorApproval.notes && (
                      <p className="text-sm mt-1 text-green-700">{request.supervisorApproval.notes}</p>
                    )}
                  </div>
                )}
                
                {request.returnInfo && (
                  <div className="bg-blue-50 p-3 rounded-md">
                    <p className="text-sm text-blue-800 font-medium">
                      Retourné : {request.returnInfo.userName}
                    </p>
                    <p className="text-xs text-blue-600">
                      {formatDateTime(request.returnInfo.timestamp)}
                    </p>
                    {request.returnInfo.notes && (
                      <p className="text-sm mt-1 text-blue-700">{request.returnInfo.notes}</p>
                    )}
                  </div>
                )}
                
                {!request.adminApproval && !request.supervisorApproval && !request.returnInfo && (
                  <p className="text-sm text-muted-foreground">Aucune action effectuée sur cette demande.</p>
                )}
              </div>
            </div>
          </CardContent>
          
          {canApprove && (request.status === 'pending' || (request.status === 'admin_approved' && isSupervisor)) && (
            <CardFooter className="border-t pt-4">
              <div className="w-full space-y-2">
                <Label htmlFor="notes">Notes (optionnel)</Label>
                <Textarea 
                  id="notes"
                  placeholder="Ajouter des notes à propos de cette demande..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </CardFooter>
          )}
        </Card>
      </div>
    </Layout>
  );
};

export default RequestDetails;
