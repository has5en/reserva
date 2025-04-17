
import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Room, RoomType } from '@/data/models';
import { getRooms } from '@/services/dataService';
import { Building, Users, Presentation, Swords, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const AvailableRooms = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const getIconForRoomType = (type: string) => {
    // Mappez les anciens types vers les nouveaux types
    const typeMapping: Record<string, RoomType> = {
      'computer_lab': 'classroom',
      'science_lab': 'classroom',
      'classroom': 'classroom',
      'meeting_room': 'training_room'
    };
    
    const mappedType = (typeMapping[type] || type) as RoomType;
    
    if (mappedType === 'classroom') {
      return <Users className="h-5 w-5" />;
    } else if (mappedType === 'training_room') {
      return <Presentation className="h-5 w-5" />;
    } else if (mappedType === 'weapons_room') {
      return <Swords className="h-5 w-5" />;
    } else if (mappedType === 'tactical_room') {
      return <MapPin className="h-5 w-5" />;
    }
    return <Building className="h-5 w-5" />;
  };

  const getColorForRoomType = (type: string) => {
    // Mappez les anciens types vers les nouveaux types
    const typeMapping: Record<string, RoomType> = {
      'computer_lab': 'classroom',
      'science_lab': 'classroom',
      'classroom': 'classroom',
      'meeting_room': 'training_room'
    };
    
    const mappedType = (typeMapping[type] || type) as RoomType;
    
    if (mappedType === 'classroom') {
      return 'bg-blue-100 text-blue-800';
    } else if (mappedType === 'training_room') {
      return 'bg-green-100 text-green-800';
    } else if (mappedType === 'weapons_room') {
      return 'bg-red-100 text-red-800';
    } else if (mappedType === 'tactical_room') {
      return 'bg-purple-100 text-purple-800';
    }
    return 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return <Layout title="Salles disponibles">Chargement des salles...</Layout>;
  }

  if (error) {
    return <Layout title="Salles disponibles">Erreur: {error}</Layout>;
  }

  return (
    <Layout title="Salles disponibles">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rooms.map(room => (
          <div key={room.id} className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center space-x-3 mb-3">
              <span className={`p-1 rounded-full ${getColorForRoomType(room.type)}`}>
                {getIconForRoomType(room.type)}
              </span>
              <h3 className="text-lg font-semibold">{room.name}</h3>
            </div>
            <p>Capacité: {room.capacity} personnes</p>
            <p>Étage: {room.floor || 'Non spécifié'}</p>
            <p>Bâtiment: {room.building || 'Non spécifié'}</p>
            <Badge variant={room.available ? "default" : "destructive"}>
              {room.available ? 'Disponible' : 'Indisponible'}
            </Badge>
          </div>
        ))}
      </div>
    </Layout>
  );
};

export default AvailableRooms;
