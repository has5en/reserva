import { useState, useEffect, useRef } from 'react';
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
import { getClasses } from '@/services/classes/classService';
import { createRequest } from '@/services/requests/requestService';
import { Printer, Copy, FileText, Files, Palette, Upload, File, FileUp } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const PrintingRequest = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const classesData = await getClasses();
        console.log("Classes loaded:", classesData);
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
    
    if (!documentName) newErrors.documentName = 'Veuillez entrer le nom du document';
    if (!pageCount || pageCount < 1) newErrors.pageCount = 'Le nombre de pages doit être au moins 1';
    if (!copies || copies < 1) newErrors.copies = 'Le nombre de copies doit être au moins 1';
    if (!selectedClass) newErrors.class = 'Veuillez sélectionner une classe';
    if (!date) newErrors.date = 'Veuillez sélectionner une date';
    if (!signature) newErrors.signature = 'Veuillez signer la demande';
    if (!pdfFile) newErrors.pdfFile = 'Veuillez importer un fichier PDF';
    
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type !== 'application/pdf') {
        setErrors(prev => ({
          ...prev,
          pdfFile: 'Seuls les fichiers PDF sont acceptés'
        }));
        return;
      }
      
      setPdfFile(file);
      // Auto-detect document name from file name if not already set
      if (!documentName) {
        const fileName = file.name.replace('.pdf', '');
        setDocumentName(fileName);
      }
      
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.pdfFile;
        return newErrors;
      });
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setSubmitting(true);
    
    try {
      if (!currentUser) {
        throw new Error('User not authenticated');
      }
      
      const selectedClassData = classes.find(cls => cls.id === selectedClass);
      
      if (!selectedClassData) {
        throw new Error('Invalid class selection');
      }
      
      // In a real application, we would upload the PDF file to a storage service here
      // For this demo, we'll just use the file name
      const pdfFileName = pdfFile ? pdfFile.name : '';
      
      console.log('Current user information:', currentUser);
      console.log('Selected class data:', selectedClassData);

      const result = await createRequest({
        type: 'printing',
        status: 'pending',
        userId: currentUser.id,
        userName: currentUser.name || currentUser.full_name || 'Unknown User',
        classId: selectedClassData.id,
        className: selectedClassData.name,
        date,
        notes,
        signature: signature || '',
        documentName,
        pageCount,
        copies,
        colorPrint,
        doubleSided,
        pdfFileName
      });
      
      if (result) {
        toast({
          title: 'Demande soumise',
          description: 'Votre demande d\'impression a été soumise avec succès.',
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
                {/* PDF File Upload */}
                <div>
                  <Label htmlFor="pdfFile" className="flex items-center gap-2">
                    <FileUp className="h-4 w-4" />
                    Document PDF à imprimer
                  </Label>
                  <div className="mt-2">
                    <input
                      type="file"
                      id="pdfFile"
                      ref={fileInputRef}
                      accept="application/pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <div className="flex items-center gap-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={triggerFileInput}
                        className="w-full"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {pdfFile ? 'Changer de fichier' : 'Importer un fichier PDF'}
                      </Button>
                    </div>
                    {pdfFile && (
                      <Alert className="mt-2 bg-green-50 border-green-200">
                        <File className="h-4 w-4 mr-2 text-green-500" />
                        <AlertDescription className="text-green-700">
                          {pdfFile.name} ({Math.round(pdfFile.size / 1024)} Ko)
                        </AlertDescription>
                      </Alert>
                    )}
                    {errors.pdfFile && <p className="text-sm text-red-500 mt-1">{errors.pdfFile}</p>}
                  </div>
                </div>

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
