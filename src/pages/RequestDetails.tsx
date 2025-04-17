
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Request, Room, Equipment } from '@/data/models';
import { 
  getRequestById, 
  updateRequest, 
  returnEquipment,
  formatDate, 
  formatDateTime,
  getRoomById,
  getEquipmentById
} from '@/services/dataService';
import { 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  File, 
  Send,
  Building2,
  Package,
  AlertTriangle,
  Info,
  Printer,
  RotateCcw
} from 'lucide-react';

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
    case 'returned':
      return <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">Matériel retourné</Badge>;
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
    case 'returned':
      return <RotateCcw className="h-5 w-5 text-purple-600" />;
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
  const [processingReturn, setProcessingReturn] = useState(false);
  const [resource, setResource] = useState<Room | Equipment | null>(null);
  const [loadingResource, setLoadingResource] = useState(false);
  const [suggestions, setSuggestions] = useState<string>('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    const fetchRequest = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const requestData = await getRequestById(id);
        if (requestData) {
          setRequest(requestData);
          
          setLoadingResource(true);
          try {
            if (requestData.type === 'room' && requestData.roomId) {
              const roomData = await getRoomById(requestData.roomId);
              setResource(roomData);
            } else if (requestData.type === 'equipment' && requestData.equipmentId) {
              const equipmentData = await getEquipmentById(requestData.equipmentId);
              setResource(equipmentData);
            }
          } catch (error) {
            console.error('Failed to fetch resource:', error);
          } finally {
            setLoadingResource(false);
          }
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
      const updatedRequest = await updateRequest(
        request.id,
        newStatus,
        currentUser.id,
        currentUser.name,
        approvalNotes
      );
      
      setRequest(updatedRequest);
      
      toast({
        title: 'Demande approuvée',
        description: 'La demande a été approuvée avec succès. Une notification a été envoyée à l\'enseignant.',
      });

      if (newStatus === 'approved' && request.type === 'equipment' && request.equipmentId) {
        setLoadingResource(true);
        try {
          const equipmentData = await getEquipmentById(request.equipmentId);
          setResource(equipmentData);
        } catch (error) {
          console.error('Failed to refresh equipment data:', error);
        } finally {
          setLoadingResource(false);
        }
      }
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
      const rejectionNotes = suggestions 
        ? `${approvalNotes}\n\nSuggestions alternatives: ${suggestions}`
        : approvalNotes;
      
      const updatedRequest = await updateRequest(
        request.id,
        'rejected',
        currentUser.id,
        currentUser.name,
        rejectionNotes
      );
      
      setRequest(updatedRequest);
      
      toast({
        title: 'Demande rejetée',
        description: 'La demande a été rejetée. Une notification et un email ont été envoyés à l\'enseignant avec les explications.',
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

  const handleReturnEquipment = async () => {
    if (!currentUser || !request) return;
    
    if (request.type !== 'equipment' || request.status !== 'approved') {
      toast({
        variant: 'destructive',
        title: 'Action impossible',
        description: 'Seul le matériel approuvé peut être retourné.',
      });
      return;
    }
    
    setProcessingReturn(true);
    try {
      await returnEquipment(
        request.id,
        currentUser.id,
        currentUser.name
      );
      
      // Fetch the updated request
      const updatedRequest = await getRequestById(request.id);
      if (updatedRequest) {
        setRequest(updatedRequest);
      }
      
      if (request.equipmentId) {
        setLoadingResource(true);
        try {
          const equipmentData = await getEquipmentById(request.equipmentId);
          setResource(equipmentData);
        } catch (error) {
          console.error('Failed to refresh equipment data:', error);
        } finally {
          setLoadingResource(false);
        }
      }
      
      toast({
        title: 'Matériel retourné',
        description: 'Le retour du matériel a été enregistré avec succès.',
      });
    } catch (error) {
      console.error('Failed to process equipment return:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible d\'enregistrer le retour du matériel. Veuillez réessayer.',
      });
    } finally {
      setProcessingReturn(false);
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

  const canReturnEquipment = () => {
    return (hasRole('admin') || hasRole('supervisor')) && 
           request?.type === 'equipment' &&
           request?.status === 'approved';
  };

  const renderResourceStatus = () => {
    if (loadingResource) {
      return <p>Chargement des détails de la ressource...</p>;
    }
    
    if (!resource) {
      return <p>Informations sur la ressource non disponibles</p>;
    }
    
    if (request?.type === 'room') {
      const room = resource as Room;
      return (
        <div className="space-y-3">
          <h3 className="font-semibold flex items-center">
            <Building2 className="mr-2 h-4 w-4" />
            État de la salle
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3 rounded-md bg-accent">
              <span className="text-sm font-medium">Disponibilité:</span>
              <div className="mt-1 flex items-center">
                {room.available ? (
                  <Badge variant="outline" className="bg-green-100 text-green-800">Disponible</Badge>
                ) : (
                  <Badge variant="outline" className="bg-red-100 text-red-800">Non disponible</Badge>
                )}
              </div>
            </div>
            
            <div className="p-3 rounded-md bg-accent">
              <span className="text-sm font-medium">Capacité:</span>
              <p className="mt-1">{room.capacity} personnes</p>
            </div>
            
            <div className="p-3 rounded-md bg-accent md:col-span-2">
              <span className="text-sm font-medium">Type:</span>
              <p className="mt-1">{room.type}</p>
            </div>
            
            {room.equipment && room.equipment.length > 0 && (
              <div className="p-3 rounded-md bg-accent md:col-span-2">
                <span className="text-sm font-medium">Équipement disponible:</span>
                <ul className="mt-1 list-disc list-inside">
                  {room.equipment.map((eq, index) => (
                    <li key={index}>{eq}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {!room.available && (
              <Alert className="md:col-span-2 bg-amber-50 border-amber-200">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <AlertDescription className="text-amber-700">
                  Attention: Cette salle n'est pas disponible actuellement.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      );
    } else if (request?.type === 'equipment') {
      const equipment = resource as Equipment;
      return (
        <div className="space-y-3">
          <h3 className="font-semibold flex items-center">
            <Package className="mr-2 h-4 w-4" />
            État du matériel
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3 rounded-md bg-accent">
              <span className="text-sm font-medium">Catégorie:</span>
              <p className="mt-1">{equipment.category}</p>
            </div>
            
            <div className="p-3 rounded-md bg-accent">
              <span className="text-sm font-medium">Disponible:</span>
              <p className="mt-1">{equipment.available} unités</p>
            </div>
            
            {request && request.equipmentQuantity && equipment.available < request.equipmentQuantity && (
              <Alert className="md:col-span-2 bg-amber-50 border-amber-200">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <AlertDescription className="text-amber-700">
                  Attention: La quantité demandée ({request.equipmentQuantity}) est supérieure à la quantité disponible ({equipment.available}).
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      );
    } else if (request?.type === 'printing') {
      return (
        <div className="space-y-3">
          <h3 className="font-semibold flex items-center">
            <Printer className="mr-2 h-4 w-4" />
            Détails de l'impression
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3 rounded-md bg-accent">
              <span className="text-sm font-medium">Pages:</span>
              <p className="mt-1">{request.pageCount} pages × {request.copies} copies = {(request.pageCount || 0) * (request.copies || 0)} pages au total</p>
            </div>
            
            <div className="p-3 rounded-md bg-accent">
              <span className="text-sm font-medium">Type d'impression:</span>
              <div className="mt-1 flex flex-wrap gap-2">
                <Badge variant="outline" className={request.colorPrint ? "bg-green-100 text-green-800" : "bg-gray-100"}>
                  {request.colorPrint ? "Couleur" : "Noir et blanc"}
                </Badge>
                <Badge variant="outline" className="bg-blue-100 text-blue-800">
                  {request.doubleSided ? "Recto-verso" : "Recto seulement"}
                </Badge>
              </div>
            </div>
            
            {request.pdfFileName && (
              <div className="p-3 rounded-md bg-accent md:col-span-2">
                <span className="text-sm font-medium">Fichier:</span>
                <div className="mt-1 flex items-center">
                  <File className="h-4 w-4 mr-2" />
                  <span>{request.pdfFileName}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }
    
    return null;
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
              {request.type === 'room' 
                ? `Réservation: ${request.roomName}` 
                : request.type === 'equipment' 
                  ? `Matériel: ${request.equipmentName}` 
                  : `Impression: ${request.documentName}`}
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
                      {request.type === 'room' 
                        ? 'Réservation de salle' 
                        : request.type === 'equipment' 
                          ? 'Demande de matériel' 
                          : 'Demande d\'impression'}
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
                
                {(hasRole('admin') || hasRole('supervisor')) && (
                  <Card className="border-dashed">
                    <CardContent className="p-4">
                      {renderResourceStatus()}
                    </CardContent>
                  </Card>
                )}
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
                
                {request.status === 'returned' && request.returnInfo && (
                  <>
                    <Separator />
                    
                    <div className="flex items-center space-x-2">
                      <div className="h-4 w-4 rounded-full bg-purple-500"></div>
                      <div>
                        <p className="font-medium">Matériel retourné</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDateTime(request.returnInfo.timestamp)} par {request.returnInfo.userName}
                        </p>
                        {request.returnInfo.notes && (
                          <p className="text-sm italic mt-1">{request.returnInfo.notes}</p>
                        )}
                      </div>
                    </div>
                  </>
                )}
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
                  
                  <div className="flex items-center space-x-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowSuggestions(!showSuggestions)}
                    >
                      {showSuggestions ? 'Masquer les suggestions' : 'Ajouter des suggestions'}
                    </Button>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </div>
                  
                  {showSuggestions && (
                    <div>
                      <Label htmlFor="suggestions">Suggestions alternatives</Label>
                      <Textarea
                        id="suggestions"
                        placeholder="Proposer des alternatives (autre salle, autre date, autre matériel)..."
                        value={suggestions}
                        onChange={(e) => setSuggestions(e.target.value)}
                        rows={2}
                      />
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button 
                    variant="outline" 
                    className="border-red-300 text-red-600 hover:bg-red-50"
                    onClick={handleReject}
                    disabled={processingAction}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Rejeter
                  </Button>
                  <Button 
                    variant="default"
                    onClick={handleApprove}
                    disabled={processingAction}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Approuver
                  </Button>
                </CardFooter>
              </Card>
            )}
            
            {canReturnEquipment() && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Retour de matériel</CardTitle>
                  <CardDescription>
                    Enregistrez le retour du matériel pour le remettre en disponibilité
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Alert className="mb-4 bg-blue-50 border-blue-200">
                    <Info className="h-4 w-4 text-blue-500" />
                    <AlertDescription className="text-blue-700">
                      En confirmant le retour, {request?.equipmentQuantity} unité(s) de {request?.equipmentName} seront ajoutées à l'inventaire.
                    </AlertDescription>
                  </Alert>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full"
                    onClick={handleReturnEquipment}
                    disabled={processingReturn}
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    {processingReturn ? 'Traitement en cours...' : 'Confirmer le retour'}
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
