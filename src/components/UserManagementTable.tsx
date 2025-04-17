import { useState, useEffect } from 'react';
import { User, useAuth, UserRole } from '@/contexts/AuthContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Pencil, Trash2, UserPlus, BookOpen } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { getDepartments, getClasses, assignClassToTeacher, getTeacherClasses, removeClassFromTeacher } from '@/services/dataService';
import { Department, Class, TeacherClass } from '@/data/models';

interface UserManagementTableProps {
  userRole: UserRole;
}

const createUserFormSchema = (userRole: UserRole) => {
  const baseSchema = {
    name: z.string().min(2, { message: 'Le nom doit contenir au moins 2 caractères' }),
    email: z.string().email({ message: 'Email invalide' }),
    password: z.string().min(6, { message: 'Le mot de passe doit contenir au moins 6 caractères' }),
  };

  if (userRole === 'teacher') {
    return z.object({
      ...baseSchema,
      department: z.string().min(1, { message: 'Le département est obligatoire' }),
    });
  }

  return z.object({
    ...baseSchema,
    department: z.string().optional(),
  });
};

type UserFormValues = z.infer<ReturnType<typeof createUserFormSchema>>;

const UserManagementTable = ({ userRole }: UserManagementTableProps) => {
  const { getUsers, addUser, updateUser, deleteUser, currentUser } = useAuth();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isClassDialogOpen, setIsClassDialogOpen] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [userClasses, setUserClasses] = useState<TeacherClass[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('');

  const users = getUsers(userRole);

  const formSchema = createUserFormSchema(userRole);

  const addForm = useForm<UserFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      department: '',
    },
  });

  const editForm = useForm<UserFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      department: '',
    },
  });

  const handleAddUser = (data: UserFormValues) => {
    try {
      addUser({
        name: data.name,
        email: data.email,
        password: data.password,
        department: data.department,
        role: userRole,
      });

      toast({
        title: "Utilisateur ajouté",
        description: `${data.name} a été ajouté avec succès.`,
      });

      setIsAddDialogOpen(false);
      addForm.reset();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur s'est produite lors de l'ajout de l'utilisateur.",
      });
    }
  };

  const handleEditUser = (data: UserFormValues) => {
    try {
      if (selectedUser) {
        updateUser(selectedUser.id, {
          name: data.name,
          email: data.email,
          password: data.password || undefined,
          department: data.department,
          role: userRole,
        });

        toast({
          title: "Utilisateur mis à jour",
          description: `${data.name} a été mis à jour avec succès.`,
        });

        setIsEditDialogOpen(false);
        setSelectedUser(null);
        editForm.reset();
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur s'est produite lors de la mise à jour de l'utilisateur.",
      });
    }
  };

  const handleDeleteUser = () => {
    try {
      if (selectedUser) {
        deleteUser(selectedUser.id);

        toast({
          title: "Utilisateur supprimé",
          description: `${selectedUser.name} a été supprimé avec succès.`,
        });

        setIsDeleteDialogOpen(false);
        setSelectedUser(null);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur s'est produite lors de la suppression de l'utilisateur.",
      });
    }
  };

  const openEditDialog = (user: User) => {
    setSelectedUser(user);
    editForm.reset({
      name: user.name,
      email: user.email,
      password: '',
      department: user.department || '',
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (user: User) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const openClassDialog = (user: User) => {
    setSelectedUser(user);
    setSelectedDepartment('');
    setSelectedClass('');
    setIsClassDialogOpen(true);
  };

  useEffect(() => {
    if (userRole === 'teacher') {
      fetchDepartments();
    }
  }, [userRole]);

  useEffect(() => {
    if (selectedDepartment) {
      fetchClassesByDepartment(selectedDepartment);
    }
  }, [selectedDepartment]);

  useEffect(() => {
    if (selectedUser && isClassDialogOpen) {
      fetchUserClasses(selectedUser.id);
    }
  }, [selectedUser, isClassDialogOpen]);

  const fetchDepartments = async () => {
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
    }
  };

  const fetchClassesByDepartment = async (departmentId: string) => {
    try {
      const data = await getClasses();
      setClasses(data.filter(c => c.departmentId === departmentId));
    } catch (error) {
      console.error('Failed to fetch classes:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les classes."
      });
    }
  };

  const fetchUserClasses = async (userId: string) => {
    try {
      const data = await getTeacherClasses(userId);
      setUserClasses(data);
    } catch (error) {
      console.error('Failed to fetch user classes:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les classes de l'utilisateur."
      });
    }
  };

  const handleAssignClass = async () => {
    if (!selectedUser || !selectedClass) return;

    try {
      await assignClassToTeacher(selectedUser.id, selectedClass);
      await fetchUserClasses(selectedUser.id);
      setSelectedClass('');
      toast({
        title: "Classe assignée",
        description: "La classe a été assignée avec succès."
      });
    } catch (error) {
      console.error('Failed to assign class:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'assigner la classe à l'enseignant."
      });
    }
  };

  const handleRemoveClass = async (teacherClassId: string) => {
    if (!selectedUser) return;

    try {
      await removeClassFromTeacher(teacherClassId);
      await fetchUserClasses(selectedUser.id);
      toast({
        title: "Classe retirée",
        description: "La classe a été retirée avec succès."
      });
    } catch (error) {
      console.error('Failed to remove class:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de retirer la classe de l'enseignant."
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">
          {userRole === 'teacher' ? 'Gestion des enseignants' : 'Gestion des administrateurs'}
        </h2>
        <Button onClick={() => setIsAddDialogOpen(true)} className="flex items-center">
          <UserPlus className="mr-2 h-4 w-4" />
          Ajouter {userRole === 'teacher' ? 'un enseignant' : 'un administrateur'}
        </Button>
      </div>

      {users.length === 0 ? (
        <div className="text-center py-8 bg-muted rounded-md">
          <p className="text-muted-foreground">
            Aucun {userRole === 'teacher' ? 'enseignant' : 'administrateur'} trouvé.
          </p>
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Email</TableHead>
                {userRole === 'teacher' && <TableHead>Département</TableHead>}
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  {userRole === 'teacher' && (
                    <TableCell>{user.department || '-'}</TableCell>
                  )}
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {userRole === 'teacher' && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => openClassDialog(user)}
                          title="Gérer les classes"
                        >
                          <BookOpen className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => openEditDialog(user)}
                        disabled={user.id === currentUser?.id}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => openDeleteDialog(user)}
                        disabled={user.id === currentUser?.id}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              Ajouter {userRole === 'teacher' ? 'un enseignant' : 'un administrateur'}
            </DialogTitle>
          </DialogHeader>
          <Form {...addForm}>
            <form onSubmit={addForm.handleSubmit(handleAddUser)} className="space-y-4">
              <FormField
                control={addForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom</FormLabel>
                    <FormControl>
                      <Input placeholder="Nom complet" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={addForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="email@exemple.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={addForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mot de passe</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Mot de passe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={addForm.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{userRole === 'teacher' ? 'Département *' : 'Département'}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un département" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Informatique">Informatique</SelectItem>
                        <SelectItem value="Sciences">Sciences</SelectItem>
                        <SelectItem value="Mathématiques">Mathématiques</SelectItem>
                        <SelectItem value="Langues">Langues</SelectItem>
                        <SelectItem value="Histoire-Géographie">Histoire-Géographie</SelectItem>
                      </SelectContent>
                    </Select>
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

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              Modifier {userRole === 'teacher' ? 'un enseignant' : 'un administrateur'}
            </DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEditUser)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom</FormLabel>
                    <FormControl>
                      <Input placeholder="Nom complet" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="email@exemple.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mot de passe (laisser vide pour ne pas changer)</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Nouveau mot de passe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{userRole === 'teacher' ? 'Département *' : 'Département'}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ''}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un département" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Informatique">Informatique</SelectItem>
                        <SelectItem value="Sciences">Sciences</SelectItem>
                        <SelectItem value="Mathématiques">Mathématiques</SelectItem>
                        <SelectItem value="Langues">Langues</SelectItem>
                        <SelectItem value="Histoire-Géographie">Histoire-Géographie</SelectItem>
                      </SelectContent>
                    </Select>
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

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>
              Êtes-vous sûr de vouloir supprimer{' '}
              <span className="font-semibold">{selectedUser?.name}</span> ?
              Cette action est irréversible.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isClassDialogOpen} onOpenChange={setIsClassDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>
              Gérer les classes de {selectedUser?.name}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="border rounded-md p-4">
              <h3 className="font-medium mb-2">Assigner une classe</h3>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="department">Département</Label>
                  <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                    <SelectTrigger id="department">
                      <SelectValue placeholder="Sélectionner un département" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="class">Classe</Label>
                  <Select 
                    value={selectedClass} 
                    onValueChange={setSelectedClass}
                    disabled={!selectedDepartment}
                  >
                    <SelectTrigger id="class">
                      <SelectValue placeholder="Sélectionner une classe" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id}>
                          {cls.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button 
                onClick={handleAssignClass} 
                disabled={!selectedClass}
                className="mt-2"
              >
                Assigner
              </Button>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Classes assignées</h3>
              {userClasses.length === 0 ? (
                <p className="text-muted-foreground">Aucune classe assignée.</p>
              ) : (
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Classe</TableHead>
                        <TableHead>Département</TableHead>
                        <TableHead className="w-16"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {userClasses.map((tc) => (
                        <TableRow key={tc.id}>
                          <TableCell>{tc.className}</TableCell>
                          <TableCell>{tc.departmentName}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive"
                              onClick={() => handleRemoveClass(tc.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button onClick={() => setIsClassDialogOpen(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagementTable;
