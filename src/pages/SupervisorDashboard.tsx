
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { getRequestsByStatus } from '@/services/requests/requestService';
import { Request } from '@/data/models';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, Package, Eye, Printer } from 'lucide-react';
import { formatDate } from '@/services/utils/dateUtils';

const SupervisorDashboard = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const pendingRequests = await getRequestsByStatus('admin_approved');
        setRequests(pendingRequests);
      } catch (error) {
        console.error('Failed to fetch requests:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const filteredRequests = requests.filter(request => {
    const matchesSearch = 
      request.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (request.roomName && request.roomName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (request.equipmentName && request.equipmentName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (request.documentName && request.documentName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = filterType === 'all' || request.type === filterType;
    
    return matchesSearch && matchesType;
  });

  const getRequestIcon = (type: string) => {
    switch (type) {
      case 'room':
        return <Building2 className="h-12 w-12 text-primary mb-2" />;
      case 'equipment':
        return <Package className="h-12 w-12 text-primary mb-2" />;
      case 'printing':
        return <Printer className="h-12 w-12 text-primary mb-2" />;
      default:
        return null;
    }
  };

  const getRequestTypeLabel = (type: string) => {
    switch (type) {
      case 'room':
        return 'Réservation de salle';
      case 'equipment':
        return 'Demande de matériel';
      case 'printing':
        return 'Demande d\'impression';
      default:
        return type;
    }
  };

  const getRequestTitle = (request: Request) => {
    switch (request.type) {
      case 'room':
        return `Salle ${request.roomName}`;
      case 'equipment':
        return `${request.equipmentQuantity}x ${request.equipmentName}`;
      case 'printing':
        return `Impression: ${request.documentName}`;
      default:
        return 'Demande';
    }
  };

  return (
    <Layout title="Approbation finale des demandes">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Demandes en attente d'approbation finale</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <Label htmlFor="search">Rechercher</Label>
                <Input
                  id="search"
                  placeholder="Rechercher par nom, classe..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="w-full md:w-48">
                <Label htmlFor="filterType">Type</Label>
                <Select
                  value={filterType}
                  onValueChange={setFilterType}
                >
                  <SelectTrigger id="filterType">
                    <SelectValue placeholder="Tous les types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les types</SelectItem>
                    <SelectItem value="room">Réservations de salle</SelectItem>
                    <SelectItem value="equipment">Demandes de matériel</SelectItem>
                    <SelectItem value="printing">Demandes d'impression</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-8">Chargement des demandes...</div>
            ) : filteredRequests.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Aucune demande en attente d'approbation finale.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredRequests.map(request => (
                  <Card key={request.id} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="flex flex-col md:flex-row">
                        <div className="bg-accent p-6 md:w-64 flex flex-col justify-center items-center">
                          {getRequestIcon(request.type)}
                          <h3 className="font-medium">
                            {getRequestTypeLabel(request.type)}
                          </h3>
                        </div>
                        <div className="p-6 flex-1">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-lg font-semibold mb-1">
                                {getRequestTitle(request)}
                              </h3>
                              <div className="space-y-1">
                                <p className="text-sm">
                                  <span className="font-medium">Demandeur:</span> {request.userName}
                                </p>
                                <p className="text-sm">
                                  <span className="font-medium">Classe:</span> {request.className}
                                </p>
                                <p className="text-sm">
                                  <span className="font-medium">Date:</span> {formatDate(request.date)}
                                  {request.startTime && request.endTime && ` (${request.startTime.substring(11, 16)} - ${request.endTime.substring(11, 16)})`}
                                </p>
                              </div>
                            </div>
                            <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                              Approuvé par admin
                            </Badge>
                          </div>
                          
                          {request.notes && (
                            <div className="mb-4">
                              <p className="text-sm font-medium">Notes:</p>
                              <p className="text-sm text-muted-foreground">{request.notes}</p>
                            </div>
                          )}
                          
                          {request.adminApproval?.notes && (
                            <div className="mb-4">
                              <p className="text-sm font-medium">Notes d'approbation administrateur:</p>
                              <p className="text-sm text-muted-foreground">{request.adminApproval.notes}</p>
                            </div>
                          )}
                          
                          <div className="flex justify-end">
                            <Button 
                              onClick={() => navigate(`/request/${request.id}`)} 
                              className="flex items-center"
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              Examiner
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default SupervisorDashboard;
