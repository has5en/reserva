
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { getRooms } from '@/services/dataService';
import { Room, RoomType } from '@/data/models';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Building2, Users, BookOpen, Computer, Beaker } from 'lucide-react';
import RoomTypeSelector from '@/components/RoomTypeSelector';

const AvailableRooms = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roomType, setRoomType] = useState<string>('all');

  useEffect(() => {
    const fetchRooms = async () => {
      setLoading(true);
      try {
        const roomsData = await getRooms();
        setRooms(roomsData);
      } catch (error) {
        console.error('Failed to fetch rooms:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  const getRoomTypeIcon = (type: RoomType) => {
    switch (type) {
      case 'computer_lab':
        return <Computer className="h-5 w-5 text-blue-500" />;
      case 'science_lab':
        return <Beaker className="h-5 w-5 text-green-500" />;
      case 'classroom':
        return <BookOpen className="h-5 w-5 text-orange-500" />;
      case 'meeting_room':
        return <Users className="h-5 w-5 text-purple-500" />;
      default:
        return <Building2 className="h-5 w-5 text-gray-500" />;
    }
  };

  const getTypeLabel = (type: RoomType): string => {
    switch (type) {
      case 'computer_lab':
        return 'Salle informatique';
      case 'science_lab':
        return 'Laboratoire scientifique';
      case 'classroom':
        return 'Salle de classe';
      case 'meeting_room':
        return 'Salle de réunion';
      default:
        return 'Autre';
    }
  };

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = 
      room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (room.building && room.building.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (room.description && room.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = roomType === 'all' || room.type === roomType;
    
    return matchesSearch && matchesType;
  });

  const handleReserveClick = (roomId: string) => {
    navigate(`/room-reservation?roomId=${roomId}`);
  };

  return (
    <Layout title="Salles Disponibles">
      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Liste des salles disponibles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <Label htmlFor="search">Rechercher</Label>
                <Input
                  id="search"
                  placeholder="Rechercher par nom, bâtiment..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="w-full md:w-64">
                <Label htmlFor="roomType">Type de salle</Label>
                <RoomTypeSelector 
                  selectedType={roomType} 
                  onChange={setRoomType}
                  includeAll={true}
                  className="mt-1" 
                />
              </div>
            </div>

            {loading ? (
              <div className="text-center py-8">Chargement des salles...</div>
            ) : filteredRooms.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Aucune salle disponible correspondant à vos critères.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Nom</TableHead>
                    <TableHead>Capacité</TableHead>
                    <TableHead>Emplacement</TableHead>
                    <TableHead>Disponibilité</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRooms.map((room) => (
                    <TableRow key={room.id}>
                      <TableCell>
                        <div className="flex items-center">
                          {getRoomTypeIcon(room.type)}
                          <span className="ml-2">{getTypeLabel(room.type)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{room.name}</TableCell>
                      <TableCell>{room.capacity} personnes</TableCell>
                      <TableCell>
                        {room.building && room.floor 
                          ? `${room.building}, Étage ${room.floor}` 
                          : room.building || 'Non spécifié'}
                      </TableCell>
                      <TableCell>
                        {room.available ? (
                          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                            Disponible
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
                            Indisponible
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleReserveClick(room.id)}
                          disabled={!room.available}
                        >
                          Réserver
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default AvailableRooms;
