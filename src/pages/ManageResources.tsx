
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import Layout from '@/components/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  RoomManagementTable, 
  EquipmentManagementTable 
} from '@/components/ResourceManagementTables';
import { ResourceUpdatesTable } from '@/components/ResourceUpdatesTable';
import { Room, Equipment } from '@/data/models';
import { 
  getRooms, 
  getEquipment, 
  updateRoom, 
  addRoom, 
  deleteRoom,
  updateEquipment,
  addEquipment,
  deleteEquipment,
  getResourceUpdates
} from '@/services/dataService';
import { Building2, Package, History } from 'lucide-react';

const ManageResources = () => {
  const { currentUser } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('rooms');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [roomsData, equipmentData] = await Promise.all([
          getRooms(),
          getEquipment()
        ]);
        
        setRooms(roomsData);
        setEquipment(equipmentData);
      } catch (error) {
        console.error('Failed to fetch resources:', error);
        toast({
          variant: 'destructive',
          title: 'Erreur',
          description: 'Impossible de charger les ressources. Veuillez réessayer.',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleEditRoom = async (id: string, updates: Partial<Room>) => {
    try {
      const updatedRoom = await updateRoom(id, updates);
      setRooms(rooms.map(room => room.id === id ? updatedRoom : room));
      return Promise.resolve();
    } catch (error) {
      console.error('Failed to update room:', error);
      return Promise.reject(error);
    }
  };

  const handleAddRoom = async (room: Omit<Room, 'id'>) => {
    try {
      const newRoom = await addRoom(room);
      setRooms([...rooms, newRoom]);
      return Promise.resolve();
    } catch (error) {
      console.error('Failed to add room:', error);
      return Promise.reject(error);
    }
  };

  const handleDeleteRoom = async (id: string) => {
    try {
      await deleteRoom(id);
      setRooms(rooms.filter(room => room.id !== id));
      return Promise.resolve();
    } catch (error) {
      console.error('Failed to delete room:', error);
      return Promise.reject(error);
    }
  };

  const handleEditEquipment = async (id: string, updates: Partial<Equipment>) => {
    try {
      const updatedEquipment = await updateEquipment(id, updates);
      setEquipment(equipment.map(item => item.id === id ? updatedEquipment : item));
      return Promise.resolve();
    } catch (error) {
      console.error('Failed to update equipment:', error);
      return Promise.reject(error);
    }
  };

  const handleAddEquipment = async (equipmentItem: Omit<Equipment, 'id'>) => {
    try {
      const newEquipment = await addEquipment(equipmentItem);
      setEquipment([...equipment, newEquipment]);
      return Promise.resolve();
    } catch (error) {
      console.error('Failed to add equipment:', error);
      return Promise.reject(error);
    }
  };

  const handleDeleteEquipment = async (id: string) => {
    try {
      await deleteEquipment(id);
      setEquipment(equipment.filter(item => item.id !== id));
      return Promise.resolve();
    } catch (error) {
      console.error('Failed to delete equipment:', error);
      return Promise.reject(error);
    }
  };

  if (loading) {
    return (
      <Layout title="Gestion des ressources">
        <div className="flex justify-center items-center h-64">
          <p>Chargement des ressources...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Gestion des ressources">
      <Tabs defaultValue="rooms" className="max-w-5xl mx-auto" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="rooms" className="flex items-center">
            <Building2 className="mr-2 h-4 w-4" />
            Salles
          </TabsTrigger>
          <TabsTrigger value="equipment" className="flex items-center">
            <Package className="mr-2 h-4 w-4" />
            Matériel
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center">
            <History className="mr-2 h-4 w-4" />
            Historique
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="rooms">
          <RoomManagementTable
            rooms={rooms}
            onEditRoom={handleEditRoom}
            onAddRoom={handleAddRoom}
            onDeleteRoom={handleDeleteRoom}
          />
        </TabsContent>
        
        <TabsContent value="equipment">
          <EquipmentManagementTable
            equipment={equipment}
            onEditEquipment={handleEditEquipment}
            onAddEquipment={handleAddEquipment}
            onDeleteEquipment={handleDeleteEquipment}
          />
        </TabsContent>
        
        <TabsContent value="history">
          <ResourceUpdatesTable />
        </TabsContent>
      </Tabs>
    </Layout>
  );
};

export default ManageResources;
