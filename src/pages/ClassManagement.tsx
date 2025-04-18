
import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Pencil, Trash2, Plus, Users } from 'lucide-react';
import { getDepartments, getClasses, getClassesByDepartment, addClass, updateClass, deleteClass, addDepartment, updateDepartment, deleteDepartment } from '@/services/dataService';
import { Department, Class } from '@/data/models';

const departmentFormSchema = z.object({
  name: z.string().min(2, { message: 'Le nom doit contenir au moins 2 caractères' }),
  description: z.string().optional(),
});

const classFormSchema = z.object({
  name: z.string().min(2, { message: 'Le nom doit contenir au moins 2 caractères' }),
  departmentId: z.string().min(1, { message: 'Le département est obligatoire' }),
  studentCount: z.number().min(0, { message: "L'effectif doit être positif ou nul" }).or(z.string().regex(/^\d+$/).transform(Number)),
  unit: z.string().optional(),
});

type DepartmentFormValues = z.infer<typeof departmentFormSchema>;
type ClassFormValues = z.infer<typeof classFormSchema>;

const ClassManagement = () => {
  const { hasRole, currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('departments');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [isAddDepartmentDialogOpen, setIsAddDepartmentDialogOpen] = useState(false);
  const [isEditDepartmentDialogOpen, setIsEditDepartmentDialogOpen] = useState(false);
  const [isDeleteDepartmentDialogOpen, setIsDeleteDepartmentDialogOpen] = useState(false);
  const [isAddClassDialogOpen, setIsAddClassDialogOpen] = useState(false);
  const [isEditClassDialogOpen, setIsEditClassDialogOpen] = useState(false);
  const [isDeleteClassDialogOpen, setIsDeleteClassDialogOpen] = useState(false);
  const [filterDepartmentId, setFilterDepartmentId] = useState<string>("all");

  const canEdit = hasRole('admin') || hasRole('supervisor');

  const departmentForm = useForm<DepartmentFormValues>({
    resolver: zodResolver(departmentFormSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const classForm = useForm<ClassFormValues>({
    resolver: zodResolver(classFormSchema),
    defaultValues: {
      name: '',
      departmentId: '',
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
    
    fetchDepartments();
    fetchClasses();
  }, [currentUser]);

  useEffect(() => {
    if (filterDepartmentId) {
      fetchClassesByDepartmentId(filterDepartmentId);
    } else {
      fetchClasses();
    }
  }, [filterDepartmentId]);

  const fetchDepartments = async () => {
    setIsLoading(true);
    try {
      const data = await getDepartments();
      setDepartments(data);
    } catch (error) {
      console.error('Failed to fetch departments:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les départements."
      });
    } finally {
      setIsLoading(false);
    }
  };

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

  const fetchClassesByDepartmentId = async (departmentId: string) => {
    setIsLoading(true);
    try {
      const data = await getClassesByDepartment(departmentId);
      setClasses(data);
    } catch (error) {
      console.error('Failed to fetch classes by department:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les classes pour ce département."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddDepartment = async (data: DepartmentFormValues) => {
    try {
      await addDepartment({
        name: data.name,
        description: data.description
      });
      await fetchDepartments();
      setIsAddDepartmentDialogOpen(false);
      departmentForm.reset();
    } catch (error) {
      console.error('Error adding department:', error);
      // Error toast is handled in the service
    }
  };

  const handleEditDepartment = async (data: DepartmentFormValues) => {
    if (!selectedDepartment) return;
    
    try {
      await updateDepartment({
        id: selectedDepartment.id,
        name: data.name,
        description: data.description,
      });
      await fetchDepartments();
      setIsEditDepartmentDialogOpen(false);
      setSelectedDepartment(null);
      departmentForm.reset();
    } catch (error) {
      console.error('Error updating department:', error);
      // Error toast is handled in the service
    }
  };

  const handleDeleteDepartment = async () => {
    if (!selectedDepartment) return;
    
    try {
      await deleteDepartment(selectedDepartment.id);
      await fetchDepartments();
      setIsDeleteDepartmentDialogOpen(false);
      setSelectedDepartment(null);
      
      // Also refresh classes as they might reference this department
      fetchClasses();
    } catch (error) {
      console.error('Error deleting department:', error);
      // Error toast is handled in the service
    }
  };

  const handleAddClass = async (data: ClassFormValues) => {
    try {
      await addClass({
        name: data.name,
        departmentId: data.departmentId,
        studentCount: Number(data.studentCount),
        unit: data.unit,
      });
      
      if (filterDepartmentId) {
        await fetchClassesByDepartmentId(filterDepartmentId);
      } else {
        await fetchClasses();
      }
      
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
        departmentId: data.departmentId,
        studentCount: Number(data.studentCount),
        unit: data.unit,
      });
      
      if (filterDepartmentId) {
        await fetchClassesByDepartmentId(filterDepartmentId);
      } else {
        await fetchClasses();
      }
      
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
    
      if (filterDepartmentId) {
        await fetchClassesByDepartmentId(filterDepartmentId);
      } else {
        await fetchClasses();
      }
    
      setIsDeleteClassDialogOpen(false);
      setSelectedClass(null);
    } catch (error) {
      console.error('Error deleting class:', error);
      // Error toast is handled in the service
    }
  };

  const openEditDepartmentDialog = (department: Department) => {
    setSelectedDepartment(department);
    departmentForm.reset({
      name: department.name,
      description: department.description,
    });
    setIsEditDepartmentDialogOpen(true);
  };

  const openDeleteDepartmentDialog = (department: Department) => {
    setSelectedDepartment(department);
    setIsDeleteDepartmentDialogOpen(true);
  };

  const openEditClassDialog = (cls: Class) => {
    setSelectedClass(cls);
    classForm.reset({
      name: cls.name,
      departmentId: cls.departmentId,
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
    <Layout title="Gestion des départements et classes">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="departments">Départements</TabsTrigger>
          <TabsTrigger value="classes">Classes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="departments">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Liste des départements</h2>
              {canEdit && (
                <Button onClick={() => setIsAddDepartmentDialogOpen(true)} className="flex items-center">
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter un département
                </Button>
              )}
            </div>
            
            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Chargement des départements...</p>
              </div>
            ) : departments.length === 0 ? (
              <div className="text-center py-8 bg-muted rounded-md">
                <p className="text-muted-foreground">
                  Aucun département trouvé.
                </p>
              </div>
            ) : (
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {departments.map((department) => (
                      <TableRow key={department.id}>
                        <TableCell className="font-medium">{department.name}</TableCell>
                        <TableCell>{department.description || '-'}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setFilterDepartmentId(department.id);
                                setActiveTab('classes');
                              }}
                            >
                              <Users className="h-4 w-4 mr-1" />
                              Classes
                            </Button>
                            {canEdit && (
                              <>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => openEditDepartmentDialog(department)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="text-destructive hover:bg-destructive/10"
                                  onClick={() => openDeleteDepartmentDialog(department)}
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
        </TabsContent>
        
        <TabsContent value="classes">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Liste des classes</h2>
              <div className="flex gap-2">
                <Select value={filterDepartmentId} onValueChange={setFilterDepartmentId}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Filtrer par département" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les départements</SelectItem>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
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
                      <TableHead>Département</TableHead>
                      <TableHead>Effectif</TableHead>
                      <TableHead>Unité</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {classes.map((cls) => (
                      <TableRow key={cls.id}>
                        <TableCell className="font-medium">{cls.name}</TableCell>
                        <TableCell>{cls.department || getDepartmentName(cls.departmentId)}</TableCell>
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
        </TabsContent>
      </Tabs>

      {/* Dialogs pour les départements */}
      <Dialog open={isAddDepartmentDialogOpen} onOpenChange={setIsAddDepartmentDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Ajouter un département</DialogTitle>
          </DialogHeader>
          <Form {...departmentForm}>
            <form onSubmit={departmentForm.handleSubmit(handleAddDepartment)} className="space-y-4">
              <FormField
                control={departmentForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom</FormLabel>
                    <FormControl>
                      <Input placeholder="Nom du département" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={departmentForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input placeholder="Description" {...field} />
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

      <Dialog open={isEditDepartmentDialogOpen} onOpenChange={setIsEditDepartmentDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Modifier un département</DialogTitle>
          </DialogHeader>
          <Form {...departmentForm}>
            <form onSubmit={departmentForm.handleSubmit(handleEditDepartment)} className="space-y-4">
              <FormField
                control={departmentForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom</FormLabel>
                    <FormControl>
                      <Input placeholder="Nom du département" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={departmentForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input placeholder="Description" {...field} />
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

      <Dialog open={isDeleteDepartmentDialogOpen} onOpenChange={setIsDeleteDepartmentDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>
              Êtes-vous sûr de vouloir supprimer le département{' '}
              <span className="font-semibold">{selectedDepartment?.name}</span> ?
              Cette action est irréversible et supprimera également toutes les classes associées.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDepartmentDialogOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDeleteDepartment}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialogs pour les classes */}
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
                name="departmentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Département</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un département" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                name="departmentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Département</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un département" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
  
  // Fonction utilitaire pour obtenir le nom du département à partir de son ID
  function getDepartmentName(departmentId: string): string {
    const department = departments.find(d => d.id === departmentId);
    return department?.name || '-';
  }
};

export default ClassManagement;
