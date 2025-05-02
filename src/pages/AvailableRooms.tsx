import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Room, RoomType, RoomTypeWithAll } from '@/data/models';
import { getRooms } from '@/services/dataService';
import { Building, Users, Presentation, Swords, MapPin, Computer, Beaker, BookOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';

const AvailableRooms = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<RoomTypeWithAll>('all');

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const data = await getRooms();
      setRooms(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch rooms');
    } finally {
      setLoading(false);
    }
  };

  const getIconForRoomType = (type: RoomType) => {
    switch (type) {
      case 'classroom':
        return <Users className="h-5 w-5" />;
      case 'training_room':
        return <Presentation className="h-5 w-5" />;
      case 'weapons_room':
        return <Swords className="h-5 w-5" />;
      case 'tactical_room':
        return <MapPin className="h-5 w-5" />;
      case 'computer_lab':
        return <Computer className="h-5 w-5" />;
      case 'science_lab':
        return <Beaker className="h-5 w-5" />;
      case 'meeting_room':
        return <Users className="h-5 w-5" />;
      default:
        return <Building className="h-5 w-5" />;
    }
  };

  const getColorForRoomType = (type: RoomType) => {
    switch (type) {
      case 'classroom':
        return 'bg-blue-100 text-blue-800';
      case 'training_room':
        return 'bg-green-100 text-green-800';
      case 'weapons_room':
        return 'bg-red-100 text-red-800';
      case 'tactical_room':
        return 'bg-purple-100 text-purple-800';
      case 'computer_lab':
        return 'bg-orange-100 text-orange-800';
      case 'science_lab':
        return 'bg-emerald-100 text-emerald-800';
      case 'meeting_room':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Translate room type to French
  const translateRoomType = (type: RoomType): string => {
    switch (type) {
      case 'classroom':
        return 'Salles de classe';
      case 'training_room':
        return 'Salles de formation';
      case 'weapons_room':
        return 'Salles d\'armes';
      case 'tactical_room':
        return 'Salles tactiques';
      case 'computer_lab':
        return 'Laboratoires informatiques';
      case 'science_lab':
        return 'Laboratoires scientifiques';
      case 'meeting_room':
        return 'Salles de réunion';
      default:
        return type;
    }
  };

  // Get filtered rooms based on active tab
  const getFilteredRooms = () => {
    if (activeTab === 'all') {
      return rooms;
    }
    return rooms.filter(room => room.type === activeTab);
  };

  const filteredRooms = getFilteredRooms();

  if (loading) {
    return <Layout title="Salles disponibles">Chargement des salles...</Layout>;
  }

  if (error) {
    return <Layout title="Salles disponibles">Erreur: {error}</Layout>;
  }

  return (
    <Layout title="Salles disponibles">
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as RoomTypeWithAll)} className="mb-6">
        <TabsList className="mb-4 flex flex-wrap">
          <TabsTrigger value="all">Toutes les salles</TabsTrigger>
          <TabsTrigger value="classroom">Classes</TabsTrigger>
          <TabsTrigger value="training_room">Formation</TabsTrigger>
          <TabsTrigger value="weapons_room">Armes</TabsTrigger>
          <TabsTrigger value="tactical_room">Tactique</TabsTrigger>
          <TabsTrigger value="computer_lab">Informatique</TabsTrigger>
          <TabsTrigger value="science_lab">Laboratoire</TabsTrigger>
          <TabsTrigger value="meeting_room">Réunion</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <h2 className="text-lg font-semibold mb-4">Toutes les salles ({rooms.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRooms.map(room => (
              <Card key={room.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <span className={`p-1 rounded-full ${getColorForRoomType(room.type)}`}>
                      {getIconForRoomType(room.type)}
                    </span>
                    <h3 className="text-lg font-semibold">{room.name}</h3>
                  </div>
                  <p className="text-sm">Type: {translateRoomType(room.type).slice(0, -1)}</p>
                  <p className="text-sm">Capacité: {room.capacity} personnes</p>
                  <p className="text-sm">Étage: {room.floor || 'Non spécifié'}</p>
                  <p className="text-sm">Bâtiment: {room.building || 'Non spécifié'}</p>
                  <Badge variant={room.available ? "default" : "destructive"} className="mt-2">
                    {room.available ? 'Disponible' : 'Indisponible'}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {(['classroom', 'training_room', 'weapons_room', 'tactical_room', 'computer_lab', 'science_lab', 'meeting_room'] as RoomType[]).map(type => (
          <TabsContent key={type} value={type}>
            <h2 className="text-lg font-semibold mb-4">{translateRoomType(type)} ({filteredRooms.length})</h2>
            {filteredRooms.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredRooms.map(room => (
                  <Card key={room.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <span className={`p-1 rounded-full ${getColorForRoomType(room.type)}`}>
                          {getIconForRoomType(room.type)}
                        </span>
                        <h3 className="text-lg font-semibold">{room.name}</h3>
                      </div>
                      <p className="text-sm">Capacité: {room.capacity} personnes</p>
                      <p className="text-sm">Étage: {room.floor || 'Non spécifié'}</p>
                      <p className="text-sm">Bâtiment: {room.building || 'Non spécifié'}</p>
                      <Badge variant={room.available ? "default" : "destructive"} className="mt-2">
                        {room.available ? 'Disponible' : 'Indisponible'}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p>Aucune salle de ce type n'est disponible.</p>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </Layout>
  );
};

export default AvailableRooms;
