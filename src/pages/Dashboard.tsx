import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import { getRequestsByUserId, formatDate } from '@/services/dataService';
import { Request } from '@/data/models';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, Package, Eye, ArrowRight } from 'lucide-react';
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
const Dashboard = () => {
  const {
    currentUser
  } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchRequests = async () => {
      if (currentUser) {
        try {
          const userRequests = await getRequestsByUserId(currentUser.id);
          setRequests(userRequests);
        } catch (error) {
          console.error('Failed to fetch requests:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchRequests();
  }, [currentUser]);
  const pendingRequests = requests.filter(req => req.status === 'pending' || req.status === 'admin_approved');
  const completedRequests = requests.filter(req => req.status === 'approved' || req.status === 'rejected');
  const stats = {
    total: requests.length,
    pending: requests.filter(req => req.status === 'pending').length,
    approved: requests.filter(req => req.status === 'approved').length,
    rejected: requests.filter(req => req.status === 'rejected').length
  };
  return <Layout title="Tableau de bord">
      <div className="grid gap-6">
        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total des demandes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">En attente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Approuvées</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats.approved}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Rejetées</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{stats.rejected}</div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Access Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="cursor-pointer transition-shadow hover:shadow-md" onClick={() => navigate('/room-reservation')}>
            
          </Card>

          <Card className="cursor-pointer transition-shadow hover:shadow-md" onClick={() => navigate('/equipment-request')}>
            
          </Card>
        </div>

        {/* Requests Section */}
        <div>
          
          
          {loading ? <div className="text-center py-8">Chargement des demandes...</div> : requests.length === 0 ? <Card>
              
            </Card> : <Tabs defaultValue="pending">
              <TabsList className="mb-4">
                <TabsTrigger value="pending">En cours ({pendingRequests.length})</TabsTrigger>
                <TabsTrigger value="completed">Terminées ({completedRequests.length})</TabsTrigger>
              </TabsList>
              
              <TabsContent value="pending">
                <div className="grid gap-4">
                  {pendingRequests.length === 0 ? <Card>
                      <CardContent className="p-6 text-center">
                        <p>Aucune demande en cours.</p>
                      </CardContent>
                    </Card> : pendingRequests.map(request => <Card key={request.id} className="overflow-hidden">
                        <CardContent className="p-0">
                          <div className="flex flex-col md:flex-row">
                            <div className="bg-accent p-6 md:w-64 flex flex-col justify-center items-center">
                              {request.type === 'room' ? <Building2 className="h-12 w-12 text-primary mb-2" /> : <Package className="h-12 w-12 text-primary mb-2" />}
                              <h3 className="font-medium">
                                {request.type === 'room' ? 'Réservation de salle' : 'Demande de matériel'}
                              </h3>
                            </div>
                            <div className="p-6 flex-1">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <h3 className="text-lg font-semibold mb-1">
                                    {request.type === 'room' ? `Salle ${request.roomName}` : `${request.equipmentQuantity}x ${request.equipmentName}`}
                                  </h3>
                                  <p className="text-sm text-muted-foreground">
                                    Classe: {request.className} • Créée le {formatDate(request.createdAt)}
                                  </p>
                                </div>
                                <div>{getStatusBadge(request.status)}</div>
                              </div>
                              <div className="mt-4 flex justify-end">
                                <Button variant="outline" size="sm" className="flex items-center" onClick={() => navigate(`/request/${request.id}`)}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  Voir détails
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>)}
                </div>
              </TabsContent>
              
              <TabsContent value="completed">
                <div className="grid gap-4">
                  {completedRequests.length === 0 ? <Card>
                      <CardContent className="p-6 text-center">
                        <p>Aucune demande terminée.</p>
                      </CardContent>
                    </Card> : completedRequests.map(request => <Card key={request.id} className="overflow-hidden">
                        <CardContent className="p-0">
                          <div className="flex flex-col md:flex-row">
                            <div className="bg-accent p-6 md:w-64 flex flex-col justify-center items-center">
                              {request.type === 'room' ? <Building2 className="h-12 w-12 text-primary mb-2" /> : <Package className="h-12 w-12 text-primary mb-2" />}
                              <h3 className="font-medium">
                                {request.type === 'room' ? 'Réservation de salle' : 'Demande de matériel'}
                              </h3>
                            </div>
                            <div className="p-6 flex-1">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <h3 className="text-lg font-semibold mb-1">
                                    {request.type === 'room' ? `Salle ${request.roomName}` : `${request.equipmentQuantity}x ${request.equipmentName}`}
                                  </h3>
                                  <p className="text-sm text-muted-foreground">
                                    Classe: {request.className} • Créée le {formatDate(request.createdAt)}
                                  </p>
                                </div>
                                <div>{getStatusBadge(request.status)}</div>
                              </div>
                              <div className="mt-4 flex justify-end">
                                <Button variant="outline" size="sm" className="flex items-center" onClick={() => navigate(`/request/${request.id}`)}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  Voir détails
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>)}
                </div>
              </TabsContent>
            </Tabs>}
        </div>
      </div>
    </Layout>;
};
export default Dashboard;