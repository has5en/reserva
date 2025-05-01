
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import { toast } from '@/components/ui/use-toast';
import { getAvailableRoomsByType, getTeacherClassesForReservation } from '@/services/dataService';
import { RoomType, Room, Class } from '@/data/models';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building, Users, Presentation, Swords, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const RoomReservation = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [selectedRoomType, setSelectedRoomType] = useState<RoomType>('classroom');
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [startTime, setStartTime] = useState<string>('');
  const [endTime, setEndTime] = useState<string>('');
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [classesLoading, setClassesLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [showValidationErrors, setShowValidationErrors] = useState(false);
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [currentTab, setCurrentTab] = useState<RoomType>('classroom');

  useEffect(() => {
    const loadClasses = async () => {
      if (!currentUser) return;
      
      try {
        setClassesLoading(true);
        console.log('Loading classes for teacher ID:', currentUser.id);
        const userClasses = await getTeacherClassesForReservation(currentUser.id);
        console.log('Classes loaded:', userClasses);
        
        if (userClasses.length > 0) {
          setClasses(userClasses);
          setSelectedClass(userClasses[0]);
        } else {
          console.log('No classes found for this teacher');
          toast({
            // Changed from 'warning' to 'default' with a custom style
            variant: 'default',
            title: 'Aucune classe trouvée',
            description: 'Vous n\'avez pas de classes assignées. Veuillez contacter l\'administration.',
          });
        }
      } catch (error) {
        console.error('Failed to load classes:', error);
        toast({
          variant: 'destructive',
          title: 'Erreur',
          description: 'Impossible de charger vos classes. Veuillez réessayer.',
        });
      } finally {
        setClassesLoading(false);
      }
    };
    
    loadClasses();
  }, [currentUser]);

  useEffect(() => {
    if (date && startTime && endTime) {
      handleSearchRooms();
    }
  }, [selectedRoomType]);

  const handleSearchRooms = async () => {
    if (!date || !startTime || !endTime) {
      setShowValidationErrors(true);
      return;
    }

    setLoading(true);
    try {
      const rooms = await getAvailableRoomsByType(selectedRoomType, date.toISOString(), startTime, endTime);
      setAvailableRooms(rooms);
      setSearchPerformed(true);
      // Set current tab to match selected room type
      setCurrentTab(selectedRoomType);
    } catch (error) {
      console.error('Failed to search rooms:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de rechercher des salles. Veuillez réessayer.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRoomSelection = (room: Room) => {
    if (!date || !startTime || !endTime || !selectedClass || !currentUser) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Veuillez sélectionner une date, une heure de début, une heure de fin et une classe.',
      });
      return;
    }

    navigate('/request/new', {
      state: {
        type: 'room',
        roomId: room.id,
        roomName: room.name,
        date: date.toISOString(),
        startTime: startTime,
        endTime: endTime,
        classId: selectedClass.id,
        className: selectedClass.name
      },
    });
  };

  // Get room icon by type
  const getRoomIcon = (type: RoomType) => {
    switch (type) {
      case 'classroom':
        return <Users className="h-4 w-4 text-gray-500" />;
      case 'training_room':
        return <Presentation className="h-4 w-4 text-gray-500" />;
      case 'weapons_room':
        return <Swords className="h-4 w-4 text-gray-500" />;
      case 'tactical_room':
        return <MapPin className="h-4 w-4 text-gray-500" />;
      default:
        return <Building className="h-4 w-4 text-gray-500" />;
    }
  };

  // Get style for room type tab
  const getRoomTypeStyle = (type: RoomType) => {
    switch (type) {
      case 'classroom':
        return 'text-blue-600';
      case 'training_room':
        return 'text-green-600';
      case 'weapons_room':
        return 'text-red-600';
      case 'tactical_room':
        return 'text-purple-600';
      default:
        return '';
    }
  };

  // Translate room type to French
  const translateRoomType = (type: RoomType): string => {
    switch (type) {
      case 'classroom':
        return 'Salle de classe';
      case 'training_room':
        return 'Salle de formation';
      case 'weapons_room':
        return 'Salle d\'armes';
      case 'tactical_room':
        return 'Salle tactique';
      default:
        return type;
    }
  };

  // Filter rooms by current tab type
  const filteredRooms = availableRooms.filter(room => room.type === currentTab);

  return (
    <Layout title="Réservation de salle">
      <div className="container max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Rechercher une salle disponible</CardTitle>
            <CardDescription>Sélectionnez les critères de recherche pour trouver une salle.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="roomType">Type de salle</Label>
                <Select onValueChange={(value) => setSelectedRoomType(value as RoomType)} value={selectedRoomType}>
                  <SelectTrigger id="roomType">
                    <SelectValue placeholder="Sélectionner un type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="classroom">Salle de classe</SelectItem>
                    <SelectItem value="training_room">Salle de formation</SelectItem>
                    <SelectItem value="weapons_room">Salle d'armes</SelectItem>
                    <SelectItem value="tactical_room">Salle tactique</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="class">Classe</Label>
                <Select 
                  disabled={classesLoading} 
                  onValueChange={(value) => {
                    const selected = classes.find(cls => cls.id === value);
                    setSelectedClass(selected || null);
                  }}
                >
                  <SelectTrigger id="class">
                    <SelectValue placeholder={classesLoading ? "Chargement..." : "Sélectionner une classe"} />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.length > 0 ? (
                      classes.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                      ))
                    ) : (
                      <SelectItem disabled value="no-classes">Aucune classe disponible</SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {classesLoading && <p className="text-xs text-muted-foreground mt-1">Chargement des classes...</p>}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Date</Label>
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  locale={fr}
                  className={cn("border rounded-md")}
                />
              </div>
              <div>
                <Label htmlFor="startTime">Heure de début</Label>
                <Input
                  type="time"
                  id="startTime"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="endTime">Heure de fin</Label>
                <Input
                  type="time"
                  id="endTime"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>
            {showValidationErrors && (!date || !startTime || !endTime) && (
              <p className="text-red-500">Veuillez sélectionner une date et une heure de début et de fin.</p>
            )}
            <Button onClick={handleSearchRooms} disabled={loading}>
              {loading ? 'Recherche en cours...' : 'Rechercher'}
            </Button>
          </CardContent>
        </Card>

        {searchPerformed && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-4">Salles disponibles</h2>
            {loading ? (
              <p>Chargement des salles disponibles...</p>
            ) : availableRooms.length > 0 ? (
              <>
                <Tabs value={currentTab} onValueChange={(value) => setCurrentTab(value as RoomType)} className="mb-6">
                  <TabsList className="w-full grid grid-cols-4">
                    <TabsTrigger 
                      value="classroom" 
                      className={currentTab === 'classroom' ? getRoomTypeStyle('classroom') : ''}
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Classe
                    </TabsTrigger>
                    <TabsTrigger 
                      value="training_room" 
                      className={currentTab === 'training_room' ? getRoomTypeStyle('training_room') : ''}
                    >
                      <Presentation className="h-4 w-4 mr-2" />
                      Formation
                    </TabsTrigger>
                    <TabsTrigger 
                      value="weapons_room" 
                      className={currentTab === 'weapons_room' ? getRoomTypeStyle('weapons_room') : ''}
                    >
                      <Swords className="h-4 w-4 mr-2" />
                      Armes
                    </TabsTrigger>
                    <TabsTrigger 
                      value="tactical_room" 
                      className={currentTab === 'tactical_room' ? getRoomTypeStyle('tactical_room') : ''}
                    >
                      <MapPin className="h-4 w-4 mr-2" />
                      Tactique
                    </TabsTrigger>
                  </TabsList>

                  {(['classroom', 'training_room', 'weapons_room', 'tactical_room'] as RoomType[]).map((type) => (
                    <TabsContent key={type} value={type} className="mt-4">
                      {filteredRooms.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {filteredRooms.map((room) => (
                            <Card key={room.id} className="cursor-pointer hover:shadow-md transition-shadow duration-200" onClick={() => handleRoomSelection(room)}>
                              <CardContent className="flex flex-col space-y-2 pt-6">
                                <div className="flex items-center space-x-2">
                                  {getRoomIcon(room.type)}
                                  <h3 className="text-sm font-semibold">{room.name}</h3>
                                </div>
                                <p className="text-xs text-gray-500">Capacité: {room.capacity} personnes</p>
                                <p className="text-xs text-gray-500">Étage: {room.floor || 'Non spécifié'}</p>
                                <p className="text-xs text-gray-500">Bâtiment: {room.building || 'Non spécifié'}</p>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <p>Aucune salle de type {translateRoomType(type)} disponible pour les critères sélectionnés.</p>
                      )}
                    </TabsContent>
                  ))}
                </Tabs>
              </>
            ) : (
              <p>Aucune salle disponible pour les critères sélectionnés.</p>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default RoomReservation;
