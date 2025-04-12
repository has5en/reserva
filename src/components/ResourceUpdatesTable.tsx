
import { useState, useEffect } from 'react';
import { getResourceUpdates, formatDateTime } from '@/services/dataService';
import { ResourceUpdate } from '@/data/models';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Building2, Package, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const ResourceUpdatesTable = () => {
  const [updates, setUpdates] = useState<ResourceUpdate[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUpdates = async () => {
    setLoading(true);
    try {
      const data = await getResourceUpdates();
      setUpdates(data);
    } catch (error) {
      console.error('Failed to fetch resource updates:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUpdates();
  }, []);

  const getResourceTypeIcon = (type: 'room' | 'equipment') => {
    return type === 'room' ? 
      <Building2 className="h-4 w-4 text-blue-500" /> : 
      <Package className="h-4 w-4 text-green-500" />;
  };

  const renderQuantityChange = (update: ResourceUpdate) => {
    if (update.resourceType === 'equipment' && 
        'available' in update.previousState && 
        'available' in update.newState) {
      
      const oldQuantity = update.previousState.available;
      const newQuantity = update.newState.available;
      const diff = newQuantity - oldQuantity;
      
      if (diff > 0) {
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800">
            +{diff} unités
          </Badge>
        );
      } else if (diff < 0) {
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800">
            {diff} unités
          </Badge>
        );
      }
    }
    
    return null;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Historique des modifications</CardTitle>
          <CardDescription>
            Suivi des changements de disponibilité des ressources
          </CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={fetchUpdates} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <p>Chargement de l'historique...</p>
          </div>
        ) : updates.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>Aucune modification enregistrée</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Ressource</TableHead>
                  <TableHead>Modification</TableHead>
                  <TableHead>Par</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {updates.map((update) => (
                  <TableRow key={update.id}>
                    <TableCell>
                      <div className="flex items-center">
                        {getResourceTypeIcon(update.resourceType)}
                        <span className="ml-2 capitalize">
                          {update.resourceType === 'room' ? 'Salle' : 'Matériel'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{update.resourceName}</TableCell>
                    <TableCell>
                      <div className="flex flex-col space-y-1">
                        <span className="text-sm">{update.details}</span>
                        {renderQuantityChange(update)}
                      </div>
                    </TableCell>
                    <TableCell>{update.updaterName}</TableCell>
                    <TableCell>{formatDateTime(update.timestamp)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
