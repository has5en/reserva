
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import Layout from '@/components/Layout';
import SignatureCanvas from '@/components/SignatureCanvas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Room, Class } from '@/data/models';
import { getAvailableRooms, getClasses, createRequest } from '@/services/dataService';

const RoomReservation = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [rooms, setRooms] = useState<Room[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [selectedRoom, setSelectedRoom] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [startTime, setStartTime] = useState<string>('');
  const [endTime, setEndTime] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [signature, setSignature] = useState<string | null>(null);

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [roomsData, classesData] = await Promise.all([
          getAvailableRooms(date, startTime, endTime),
          getClasses()
        ]);
        
        setRooms(roomsData);
        
        // If user is a teacher, filter classes by their department
        if (currentUser?.role === 'teacher' && currentUser?.department) {
          setClasses(classesData.filter(cls => cls.department === currentUser.department));
        } else {
          setClasses(classesData);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
        toast({
          variant: 'destructive',
          title: 'Erreur',
          description: 'Impossible de charger les données. Veuillez réessayer.',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser, date, startTime, endTime]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!selectedRoom) newErrors.room = 'Veuillez sélectionner une salle';
    if (!selectedClass) newErrors.class = 'Veuillez sélectionner une classe';
    if (!date) newErrors.date = 'Veuillez sélectionner une date';
    if (!startTime) newErrors.startTime = 'Veuillez sélectionner une heure de début';
    if (!endTime) newErrors.endTime = 'Veuillez sélectionner une heure de fin';
    if (!signature) newErrors.signature = 'Veuillez signer la demande';
    
    // Check if end time is after start time
    if (startTime && endTime && startTime >= endTime) {
      newErrors.endTime = 'L\'heure de fin doit être après l\'heure de début';
    }
    
    // Check if date is not in the past
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      newErrors.date = 'La date ne peut pas être dans le passé';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setSubmitting(true);
    
    try {
      if (!currentUser) throw new Error('User not authenticated');
      
      const selectedRoomData = rooms.find(room => room.id === selectedRoom);
      const selectedClassData = classes.find(cls => cls.id === selectedClass);
      
      if (!selectedRoomData || !selectedClassData) {
        throw new Error('Invalid selection');
      }
      
      await createRequest({
        type: 'room',
        status: 'pending',
        userId: currentUser.id,
        userName: currentUser.name,
        roomId: selectedRoomData.id,
        roomName: selectedRoomData.name,
        classId: selectedClassData.id,
        className: selectedClassData.name,
        date,
        startTime,
        endTime,
        notes,
        signature: signature || '',
      });
      
      toast({
        title: 'Demande soumise',
        description: 'Votre demande de réservation a été soumise avec succès.',
      });
      
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to submit request:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de soumettre la demande. Veuillez réessayer.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getSelectedRoomDetails = () => {
    const room = rooms.find(r => r.id === selectedRoom);
    if (!room) return null;
    
    return (
      <div className="space-y-2 p-4 border rounded-md bg-accent">
        <h3 className="font-semibold">Détails de la salle</h3>
        <p><span className="font-medium">Capacité:</span> {room.capacity} personnes</p>
        {room.software && room.software.length > 0 && (
          <p><span className="font-medium">Logiciels:</span> {room.software.join(', ')}</p>
        )}
        {room.equipment && room.equipment.length > 0 && (
          <p><span className="font-medium">Équipement:</span> {room.equipment.join(', ')}</p>
        )}
      </div>
    );
  };

  const getSelectedClassDetails = () => {
    const selectedClassData = classes.find(c => c.id === selectedClass);
    if (!selectedClassData) return null;
    
    return (
      <div className="space-y-2 p-4 border rounded-md bg-accent">
        <h3 className="font-semibold">Détails de la classe</h3>
        <p><span className="font-medium">Effectif:</span> {selectedClassData.studentCount} étudiants</p>
        <p><span className="font-medium">Département:</span> {selectedClassData.department}</p>
      </div>
    );
  };

  return (
    <Layout title="Réservation de salle">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="date">Date de réservation</Label>
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className={errors.date ? 'border-red-500' : ''}
                  />
                  {errors.date && <p className="text-sm text-red-500 mt-1">{errors.date}</p>}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startTime">Heure de début</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className={errors.startTime ? 'border-red-500' : ''}
                    />
                    {errors.startTime && <p className="text-sm text-red-500 mt-1">{errors.startTime}</p>}
                  </div>
                  
                  <div>
                    <Label htmlFor="endTime">Heure de fin</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className={errors.endTime ? 'border-red-500' : ''}
                    />
                    {errors.endTime && <p className="text-sm text-red-500 mt-1">{errors.endTime}</p>}
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="class">Classe</Label>
                  <Select
                    value={selectedClass}
                    onValueChange={setSelectedClass}
                  >
                    <SelectTrigger id="class" className={errors.class ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Sélectionner une classe" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id}>
                          {cls.name} ({cls.studentCount} étudiants)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.class && <p className="text-sm text-red-500 mt-1">{errors.class}</p>}
                  
                  {selectedClass && getSelectedClassDetails()}
                </div>
                
                <div>
                  <Label htmlFor="room">Salle</Label>
                  <Select
                    value={selectedRoom}
                    onValueChange={setSelectedRoom}
                  >
                    <SelectTrigger id="room" className={errors.room ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Sélectionner une salle" />
                    </SelectTrigger>
                    <SelectContent>
                      {rooms.map((room) => (
                        <SelectItem key={room.id} value={room.id}>
                          {room.name} (Capacité: {room.capacity})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.room && <p className="text-sm text-red-500 mt-1">{errors.room}</p>}
                  
                  {selectedRoom && getSelectedRoomDetails()}
                </div>
                
                <div>
                  <Label htmlFor="notes">Notes supplémentaires (optionnel)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Précisez les besoins spécifiques..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                  />
                </div>
                
                <div>
                  <Label htmlFor="signature">Signature électronique</Label>
                  <div className="mt-2">
                    <SignatureCanvas onChange={setSignature} />
                  </div>
                  {errors.signature && <p className="text-sm text-red-500 mt-1">{errors.signature}</p>}
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => navigate('/dashboard')}>
                  Annuler
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Soumission en cours...' : 'Soumettre la demande'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default RoomReservation;
