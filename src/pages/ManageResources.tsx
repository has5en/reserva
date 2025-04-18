
import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RoomManagementTable, EquipmentManagementTable } from '@/components/ResourceManagementTables';
import { ResourceUpdatesTable } from '@/components/ResourceUpdatesTable';
import { getRooms, getEquipment, getResourceUpdates, updateRoom, addRoom, deleteRoom, updateEquipment, addEquipment, deleteEquipment } from '@/services/dataService';
import { Room, Equipment, ResourceUpdate } from '@/data/models';
import { Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const ManageResources = () => {
  const { hasRole } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('rooms');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [updates, setUpdates] = useState<ResourceUpdate[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [loadingEquipment, setLoadingEquipment] = useState(true);
  const [loadingUpdates, setLoadingUpdates] = useState(true);

  const canManageResources = hasRole('admin') || hasRole('supervisor');

  useEffect(() => {
    fetchRooms();
    fetchEquipment();
    fetchResourceUpdates();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoadingRooms(true);
      const data = await getRooms();
      setRooms(data);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les salles.",
      });
    } finally {
      setLoadingRooms(false);
    }
  };

  const fetchEquipment = async () => {
    try {
      setLoadingEquipment(true);
      const data = await getEquipment();
      setEquipment(data);
    } catch (error) {
      console.error('Error fetching equipment:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les équipements.",
      });
    } finally {
      setLoadingEquipment(false);
    }
  };

  const fetchResourceUpdates = async () => {
    try {
      setLoadingUpdates(true);
      const data = await getResourceUpdates();
      setUpdates(data);
    } catch (error) {
      console.error('Error fetching resource updates:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger l'historique des modifications.",
      });
    } finally {
      setLoadingUpdates(false);
    }
  };

  const handleEditRoom = async (id: string, updates: Partial<Room>) => {
    try {
      const roomToUpdate = rooms.find(room => room.id === id);
      if (roomToUpdate) {
        await updateRoom({ ...roomToUpdate, ...updates });
        await fetchRooms();
      }
    } catch (error) {
      console.error('Error updating room:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de mettre à jour la salle.",
      });
    }
  };

  const handleAddRoom = async (room: Omit<Room, 'id'>) => {
    try {
      await addRoom(room);
      await fetchRooms();
    } catch (error) {
      console.error('Error adding room:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'ajouter la salle.",
      });
    }
  };

  const handleDeleteRoom = async (id: string) => {
    try {
      await deleteRoom(id);
      await fetchRooms();
    } catch (error) {
      console.error('Error deleting room:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de supprimer la salle.",
      });
    }
  };

  const handleEditEquipment = async (id: string, updates: Partial<Equipment>) => {
    try {
      const equipmentToUpdate = equipment.find(eq => eq.id === id);
      if (equipmentToUpdate) {
        await updateEquipment({ ...equipmentToUpdate, ...updates });
        await fetchEquipment();
      }
    } catch (error) {
      console.error('Error updating equipment:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de mettre à jour l'équipement.",
      });
    }
  };

  const handleAddEquipment = async (eq: Omit<Equipment, 'id'>) => {
    try {
      await addEquipment(eq);
      await fetchEquipment();
    } catch (error) {
      console.error('Error adding equipment:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'ajouter l'équipement.",
      });
    }
  };

  const handleDeleteEquipment = async (id: string) => {
    try {
      await deleteEquipment(id);
      await fetchEquipment();
    } catch (error) {
      console.error('Error deleting equipment:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de supprimer l'équipement.",
      });
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  if (!canManageResources) {
    return (
      <Layout title="Gestion des ressources">
        <div className="bg-destructive/10 text-destructive p-4 rounded-md">
          Vous n'avez pas les autorisations nécessaires pour accéder à cette page.
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Gestion des ressources">
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="rooms">Salles</TabsTrigger>
          <TabsTrigger value="equipment">Équipements</TabsTrigger>
          <TabsTrigger value="updates">Historique</TabsTrigger>
        </TabsList>
        
        <TabsContent value="rooms">
          {loadingRooms ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <RoomManagementTable 
              rooms={rooms} 
              onEditRoom={handleEditRoom}
              onAddRoom={handleAddRoom}
              onDeleteRoom={handleDeleteRoom}
            />
          )}
        </TabsContent>
        
        <TabsContent value="equipment">
          {loadingEquipment ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <EquipmentManagementTable 
              equipment={equipment}
              onEditEquipment={handleEditEquipment}
              onAddEquipment={handleAddEquipment}
              onDeleteEquipment={handleDeleteEquipment}
            />
          )}
        </TabsContent>
        
        <TabsContent value="updates">
          {loadingUpdates ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <ResourceUpdatesTable />
          )}
        </TabsContent>
      </Tabs>
    </Layout>
  );
};

export default ManageResources;
