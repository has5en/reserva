
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
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Class } from '@/data/models';
import { getClasses, createRequest } from '@/services/dataService';
import { Printer, Copy, FileText, Files, Palette } from 'lucide-react';

const PrintingRequest = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [documentName, setDocumentName] = useState('');
  const [pageCount, setPageCount] = useState<number>(1);
  const [copies, setCopies] = useState<number>(1);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [signature, setSignature] = useState<string | null>(null);
  const [colorPrint, setColorPrint] = useState(false);
  const [doubleSided, setDoubleSided] = useState(true);

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const classesData = await getClasses();
        
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
  }, [currentUser]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!documentName) newErrors.documentName = 'Veuillez entrer le nom du document';
    if (!pageCount || pageCount < 1) newErrors.pageCount = 'Le nombre de pages doit être au moins 1';
    if (!copies || copies < 1) newErrors.copies = 'Le nombre de copies doit être au moins 1';
    if (!selectedClass) newErrors.class = 'Veuillez sélectionner une classe';
    if (!date) newErrors.date = 'Veuillez sélectionner une date';
    if (!signature) newErrors.signature = 'Veuillez signer la demande';
    
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
      
      const selectedClassData = classes.find(cls => cls.id === selectedClass);
      
      if (!selectedClassData) {
        throw new Error('Invalid class selection');
      }
      
      await createRequest({
        type: 'printing',
        status: 'pending',
        userId: currentUser.id,
        userName: currentUser.name,
        classId: selectedClassData.id,
        className: selectedClassData.name,
        date,
        notes,
        signature: signature || '',
        documentName,
        pageCount,
        copies,
        colorPrint,
        doubleSided
      });
      
      toast({
        title: 'Demande soumise',
        description: 'Votre demande d\'impression a été soumise avec succès.',
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

  const calculateTotalPages = () => {
    return pageCount * copies;
  };

  return (
    <Layout title="Demande d'impression">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="documentName" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Nom du document
                  </Label>
                  <Input
                    id="documentName"
                    value={documentName}
                    onChange={(e) => setDocumentName(e.target.value)}
                    className={errors.documentName ? 'border-red-500' : ''}
                    placeholder="Examen de mi-semestre, Exercices pratiques, etc."
                  />
                  {errors.documentName && <p className="text-sm text-red-500 mt-1">{errors.documentName}</p>}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="pageCount" className="flex items-center gap-2">
                      <Files className="h-4 w-4" />
                      Nombre de pages
                    </Label>
                    <Input
                      id="pageCount"
                      type="number"
                      min={1}
                      value={pageCount}
                      onChange={(e) => setPageCount(parseInt(e.target.value) || 0)}
                      className={errors.pageCount ? 'border-red-500' : ''}
                    />
                    {errors.pageCount && <p className="text-sm text-red-500 mt-1">{errors.pageCount}</p>}
                  </div>
                  
                  <div>
                    <Label htmlFor="copies" className="flex items-center gap-2">
                      <Copy className="h-4 w-4" />
                      Nombre de copies
                    </Label>
                    <Input
                      id="copies"
                      type="number"
                      min={1}
                      value={copies}
                      onChange={(e) => setCopies(parseInt(e.target.value) || 0)}
                      className={errors.copies ? 'border-red-500' : ''}
                    />
                    {errors.copies && <p className="text-sm text-red-500 mt-1">{errors.copies}</p>}
                  </div>
                </div>
                
                <div className="bg-muted p-4 rounded-md">
                  <p className="text-sm">
                    Total des pages à imprimer: <span className="font-bold">{calculateTotalPages()}</span>
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="colorPrint" 
                      checked={colorPrint} 
                      onCheckedChange={setColorPrint}
                    />
                    <Label htmlFor="colorPrint" className="flex items-center gap-2 cursor-pointer">
                      <Palette className="h-4 w-4" />
                      Impression en couleur
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="doubleSided" 
                      checked={doubleSided} 
                      onCheckedChange={setDoubleSided}
                    />
                    <Label htmlFor="doubleSided" className="cursor-pointer">
                      Impression recto-verso
                    </Label>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="date">Date d'impression souhaitée</Label>
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
                    placeholder="Instructions spéciales pour l'impression..."
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

export default PrintingRequest;
