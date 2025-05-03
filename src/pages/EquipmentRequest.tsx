
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
import { Equipment, Class } from '@/data/models';
import { getAvailableEquipment } from '@/services/equipment/equipmentService';
import { getClasses } from '@/services/classes/classService';
import { createRequest } from '@/services/requests/requestService';

const EquipmentRequest = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [selectedEquipment, setSelectedEquipment] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [signature, setSignature] = useState<string | null>(null);

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [equipmentData, classesData] = await Promise.all([
          getAvailableEquipment(),
          getClasses()
        ]);
        
        setEquipment(equipmentData);
        setClasses(classesData);
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
  }, [currentUser]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!selectedEquipment) newErrors.equipment = 'Veuillez sélectionner un équipement';
    if (!quantity || quantity < 1) newErrors.quantity = 'La quantité doit être au moins 1';
    if (!selectedClass) newErrors.class = 'Veuillez sélectionner une classe';
    if (!date) newErrors.date = 'Veuillez sélectionner une date';
    if (!signature) newErrors.signature = 'Veuillez signer la demande';
    
    // Check if quantity is valid
    const selectedEquipmentData = equipment.find(eq => eq.id === selectedEquipment);
    if (selectedEquipmentData && quantity > selectedEquipmentData.available) {
      newErrors.quantity = `Quantité maximale disponible: ${selectedEquipmentData.available}`;
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
      if (!currentUser) {
        throw new Error('User not authenticated');
      }
      
      const selectedEquipmentData = equipment.find(eq => eq.id === selectedEquipment);
      const selectedClassData = classes.find(cls => cls.id === selectedClass);
      
      if (!selectedEquipmentData || !selectedClassData) {
        throw new Error('Invalid selection');
      }

      console.log('Current user information:', currentUser);
      
      const result = await createRequest({
        type: 'equipment',
        status: 'pending',
        userId: currentUser.id,
        userName: currentUser.name || currentUser.full_name || 'Unknown User',
        equipmentId: selectedEquipmentData.id,
        equipmentName: selectedEquipmentData.name,
        equipmentQuantity: quantity,
        classId: selectedClassData.id,
        className: selectedClassData.name,
        date,
        notes,
        signature: signature || '',
      });
      
      if (result) {
        toast({
          title: 'Demande soumise',
          description: 'Votre demande de matériel a été soumise avec succès.',
        });
        
        navigate('/dashboard');
      } else {
        throw new Error('Failed to create request');
      }
    } catch (error: any) {
      console.error('Failed to submit request:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: `Impossible de soumettre la demande: ${error.message || 'Erreur inconnue'}`,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getSelectedEquipmentDetails = () => {
    const selectedItem = equipment.find(eq => eq.id === selectedEquipment);
    if (!selectedItem) return null;
    
    return (
      <div className="space-y-2 p-4 border rounded-md bg-accent">
        <h3 className="font-semibold">Détails du matériel</h3>
        <p><span className="font-medium">Catégorie:</span> {selectedItem.category}</p>
        <p><span className="font-medium">Disponible:</span> {selectedItem.available} unités</p>
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
      </div>
    );
  };

  return (
    <Layout title="Demande de matériel">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="equipment">Matériel</Label>
                  <Select
                    value={selectedEquipment}
                    onValueChange={setSelectedEquipment}
                  >
                    <SelectTrigger id="equipment" className={errors.equipment ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Sélectionner un matériel" />
                    </SelectTrigger>
                    <SelectContent>
                      {equipment.map((eq) => (
                        <SelectItem key={eq.id} value={eq.id}>
                          {eq.name} (Disponible: {eq.available})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.equipment && <p className="text-sm text-red-500 mt-1">{errors.equipment}</p>}
                  
                  {selectedEquipment && getSelectedEquipmentDetails()}
                </div>
                
                <div>
                  <Label htmlFor="quantity">Quantité</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                    className={errors.quantity ? 'border-red-500' : ''}
                  />
                  {errors.quantity && <p className="text-sm text-red-500 mt-1">{errors.quantity}</p>}
                </div>
                
                <div>
                  <Label htmlFor="date">Date d'utilisation</Label>
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className={errors.date ? 'border-red-500' : ''}
                  />
                  {errors.date && <p className="text-sm text-red-500 mt-1">{errors.date}</p>}
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

export default EquipmentRequest;
