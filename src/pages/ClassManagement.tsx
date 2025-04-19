
import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { getClasses, addClass, updateClass, deleteClass } from '@/services/classes/classService';
import { Class } from '@/data/models';

const classFormSchema = z.object({
  name: z.string().min(2, { message: 'Le nom doit contenir au moins 2 caractères' }),
  studentCount: z.number().min(0, { message: "L'effectif doit être positif ou nul" }).or(z.string().regex(/^\d+$/).transform(Number)),
  unit: z.string().optional(),
});

type ClassFormValues = z.infer<typeof classFormSchema>;

const ClassManagement = () => {
  const { hasRole, currentUser } = useAuth();
  const [classes, setClasses] = useState<Class[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [isAddClassDialogOpen, setIsAddClassDialogOpen] = useState(false);
  const [isEditClassDialogOpen, setIsEditClassDialogOpen] = useState(false);
  const [isDeleteClassDialogOpen, setIsDeleteClassDialogOpen] = useState(false);

  const canEdit = hasRole('admin') || hasRole('supervisor');

  const classForm = useForm<ClassFormValues>({
    resolver: zodResolver(classFormSchema),
    defaultValues: {
      name: '',
      studentCount: 0,
      unit: '',
    },
  });

  useEffect(() => {
    if (!currentUser) {
      toast({
        variant: "destructive",
        title: "Authentification requise",
        description: "Vous devez être connecté pour accéder à cette page."
      });
      return;
    }
    
    fetchClasses();
  }, [currentUser]);

  const fetchClasses = async () => {
    setIsLoading(true);
    try {
      const data = await getClasses();
      setClasses(data);
    } catch (error) {
      console.error('Failed to fetch classes:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les classes."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddClass = async (data: ClassFormValues) => {
    try {
      await addClass({
        name: data.name,
        studentCount: Number(data.studentCount),
        unit: data.unit,
      });
      
      await fetchClasses();
      setIsAddClassDialogOpen(false);
      classForm.reset();
    } catch (error) {
      console.error('Error adding class:', error);
      // Error toast is handled in the service
    }
  };

  const handleEditClass = async (data: ClassFormValues) => {
    if (!selectedClass) return;
    
    try {
      await updateClass({
        id: selectedClass.id,
        name: data.name,
        studentCount: Number(data.studentCount),
        unit: data.unit,
      });
      
      await fetchClasses();
      setIsEditClassDialogOpen(false);
      setSelectedClass(null);
      classForm.reset();
    } catch (error) {
      console.error('Error updating class:', error);
      // Error toast is handled in the service
    }
  };

  const handleDeleteClass = async () => {
    if (!selectedClass) return;
    
    try {
      await deleteClass(selectedClass.id);
      await fetchClasses();
      setIsDeleteClassDialogOpen(false);
      setSelectedClass(null);
    } catch (error) {
      console.error('Error deleting class:', error);
      // Error toast is handled in the service
    }
  };

  const openEditClassDialog = (cls: Class) => {
    setSelectedClass(cls);
    classForm.reset({
      name: cls.name,
      studentCount: cls.studentCount,
      unit: cls.unit,
    });
    setIsEditClassDialogOpen(true);
  };

  const openDeleteClassDialog = (cls: Class) => {
    setSelectedClass(cls);
    setIsDeleteClassDialogOpen(true);
  };

  return (
    <Layout title="Gestion des classes">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Liste des classes</h2>
          <div className="flex gap-2">
            {canEdit && (
              <Button onClick={() => setIsAddClassDialogOpen(true)} className="flex items-center">
                <Plus className="mr-2 h-4 w-4" />
                Ajouter une classe
              </Button>
            )}
          </div>
        </div>
        
        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Chargement des classes...</p>
          </div>
        ) : classes.length === 0 ? (
          <div className="text-center py-8 bg-muted rounded-md">
            <p className="text-muted-foreground">
              Aucune classe trouvée.
            </p>
          </div>
        ) : (
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Effectif</TableHead>
                  <TableHead>Unité</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classes.map((cls) => (
                  <TableRow key={cls.id}>
                    <TableCell className="font-medium">{cls.name}</TableCell>
                    <TableCell>{cls.studentCount}</TableCell>
                    <TableCell>{cls.unit || '-'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {canEdit && (
                          <>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => openEditClassDialog(cls)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="text-destructive hover:bg-destructive/10"
                              onClick={() => openDeleteClassDialog(cls)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Dialog pour ajouter une classe */}
      <Dialog open={isAddClassDialogOpen} onOpenChange={setIsAddClassDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Ajouter une classe</DialogTitle>
          </DialogHeader>
          <Form {...classForm}>
            <form onSubmit={classForm.handleSubmit(handleAddClass)} className="space-y-4">
              <FormField
                control={classForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom</FormLabel>
                    <FormControl>
                      <Input placeholder="Nom de la classe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={classForm.control}
                name="studentCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Effectif</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Nombre d'étudiants" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={classForm.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unité</FormLabel>
                    <FormControl>
                      <Input placeholder="Unité" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="submit">Ajouter</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Dialog pour modifier une classe */}
      <Dialog open={isEditClassDialogOpen} onOpenChange={setIsEditClassDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Modifier une classe</DialogTitle>
          </DialogHeader>
          <Form {...classForm}>
            <form onSubmit={classForm.handleSubmit(handleEditClass)} className="space-y-4">
              <FormField
                control={classForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom</FormLabel>
                    <FormControl>
                      <Input placeholder="Nom de la classe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={classForm.control}
                name="studentCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Effectif</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Nombre d'étudiants" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={classForm.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unité</FormLabel>
                    <FormControl>
                      <Input placeholder="Unité" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="submit">Enregistrer</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Dialog pour supprimer une classe */}
      <Dialog open={isDeleteClassDialogOpen} onOpenChange={setIsDeleteClassDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>
              Êtes-vous sûr de vouloir supprimer la classe{' '}
              <span className="font-semibold">{selectedClass?.name}</span> ?
              Cette action est irréversible.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteClassDialogOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDeleteClass}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default ClassManagement;
