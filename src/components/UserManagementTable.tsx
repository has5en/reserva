import { useState, useEffect } from 'react';
import { User, useAuth, UserRole } from '@/contexts/AuthContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/components/ui/use-toast';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Pencil, Trash2, Plus, Check } from 'lucide-react';
import { createUser, deleteUser, updateUser, getUsers, getTeacherClasses, assignClassToTeacher, removeClassFromTeacher, getClasses, getClassesByDepartment, getDepartments } from '@/services/dataService';
import { Department, Class, TeacherClass } from '@/data/models'; 

const userFormSchema = z.object({
  name: z.string().min(2, { message: 'Le nom doit contenir au moins 2 caractères' }),
  email: z.string().email({ message: 'Adresse e-mail invalide' }),
  password: z.string().min(6, { message: 'Le mot de passe doit contenir au moins 6 caractères' }),
});

type UserFormValues = z.infer<typeof userFormSchema>;

const UserManagementTable = ({ userRole }: { userRole: UserRole }) => {
  const { hasRole } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [availableClasses, setAvailableClasses] = useState<Class[]>([]);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [teacherClasses, setTeacherClasses] = useState<TeacherClass[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');

  const canEdit = hasRole('admin') || hasRole('supervisor');

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    fetchUsers();
    fetchDepartments();
  }, []);

  useEffect(() => {
    if (userRole === 'teacher') {
      fetchClasses();
    }
  }, [userRole]);

  useEffect(() => {
    if (selectedUser && userRole === 'teacher') {
      fetchTeacherClasses(selectedUser.id);
    }
  }, [selectedUser, userRole]);

  useEffect(() => {
    if (selectedDepartment) {
      fetchClassesByDepartment(selectedDepartment);
    } else {
      fetchClasses();
    }
  }, [selectedDepartment]);

  const fetchUsers = async () => {
    try {
      const data = await getUsers(userRole);
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les utilisateurs."
      });
    }
  };

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

  const fetchClasses = async () => {
    try {
      const data = await getClasses();
      setAvailableClasses(data);
    } catch (error) {
      console.error('Failed to fetch classes:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les classes."
      });
    }
  };

  const fetchClassesByDepartment = async (departmentId: string) => {
    try {
      const data = await getClassesByDepartment(departmentId);
      setAvailableClasses(data);
    } catch (error) {
      console.error('Failed to fetch classes by department:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les classes pour ce département."
      });
    }
  };

  const fetchTeacherClasses = async (teacherId: string) => {
    try {
      const data = await getTeacherClasses(teacherId);
      setTeacherClasses(data);
      setSelectedClasses(data.map(tc => tc.classId));
    } catch (error) {
      console.error('Failed to fetch teacher classes:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les classes de l'enseignant."
      });
    }
  };

  const handleCreateUser = async (data: UserFormValues) => {
    try {
      const newUser = await createUser({
        email: data.email,
        password: data.password,
        name: data.name,
        role: userRole,
      });

      // Vérifier que newUser existe avant de continuer
      if (userRole === 'teacher' && selectedClasses.length > 0 && newUser?.id) {
        // Si c'est un enseignant, associer les classes sélectionnées
        for (const classId of selectedClasses) {
          await assignClassToTeacher(newUser.id, classId);
        }
      }

      // Actualiser la liste des utilisateurs
      await fetchUsers();

      toast({
        title: "Utilisateur créé",
        description: `${data.name} a été ajouté avec succès.`,
      });

      setIsAddDialogOpen(false);
      form.reset();
      setSelectedDepartment('');
      setSelectedClasses([]);
      setAvailableClasses([]);
    } catch (error) {
      console.error("Erreur lors de la création de l'utilisateur:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur s'est produite lors de la création de l'utilisateur.",
      });
    }
  };

  const handleUpdateUser = async (data: UserFormValues) => {
    if (!selectedUser) return;

    try {
      await updateUser({
        id: selectedUser.id,
        email: data.email,
        name: data.name,
        role: userRole,
      });

      if (userRole === 'teacher') {
        // Supprimer les anciennes associations de classes
        for (const tc of teacherClasses) {
          await removeClassFromTeacher(selectedUser.id, tc.classId);
        }

        // Ajouter les nouvelles associations de classes
        for (const classId of selectedClasses) {
          await assignClassToTeacher(selectedUser.id, classId);
        }
      }

      await fetchUsers();
      toast({
        title: "Utilisateur mis à jour",
        description: `${data.name} a été mis à jour avec succès.`,
      });
      setIsEditDialogOpen(false);
      setSelectedUser(null);
      form.reset();
      setSelectedDepartment('');
      setSelectedClasses([]);
      setAvailableClasses([]);
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'utilisateur:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur s'est produite lors de la mise à jour de l'utilisateur.",
      });
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      await deleteUser(selectedUser.id);
      await fetchUsers();
      toast({
        title: "Utilisateur supprimé",
        description: `${selectedUser.name} a été supprimé avec succès.`,
      });
      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error("Erreur lors de la suppression de l'utilisateur:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur s'est produite lors de la suppression de l'utilisateur.",
      });
    }
  };

  const openEditDialog = (user: User) => {
    setSelectedUser(user);
    form.reset({
      name: user.name,
      email: user.email,
      password: '', // Le mot de passe ne doit pas être pré-rempli
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (user: User) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const handleClassSelectionChange = (classId: string) => {
    setSelectedClasses(prev => {
      if (prev.includes(classId)) {
        return prev.filter(id => id !== classId);
      } else {
        return [...prev, classId];
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Liste des {userRole === 'teacher' ? 'enseignants' : 'administrateurs'}</h2>
        {canEdit && (
          <Button onClick={() => setIsAddDialogOpen(true)} className="flex items-center">
            <Plus className="mr-2 h-4 w-4" />
            Ajouter un utilisateur
          </Button>
        )}
      </div>

      {users.length === 0 ? (
        <div className="text-center py-8 bg-muted rounded-md">
          <p className="text-muted-foreground">
            Aucun utilisateur trouvé.
          </p>
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {canEdit && (
                        <>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => openEditDialog(user)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="text-destructive hover:bg-destructive/10"
                            onClick={() => openDeleteDialog(user)}
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

      {/* Dialog pour ajouter un utilisateur */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Ajouter un utilisateur</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleCreateUser)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom</FormLabel>
                    <FormControl>
                      <Input placeholder="Nom de l'utilisateur" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Email de l'utilisateur" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
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

              {userRole === 'teacher' && (
                <>
                  <FormField
                    control={form.control}
                    name="department"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Département</FormLabel>
                        <Select onValueChange={(value) => {
                          setSelectedDepartment(value);
                        }} value={selectedDepartment}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner un département" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="">Tous les départements</SelectItem>
                            {departments.map((dept) => (
                              <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="border rounded-md p-4">
                    <p className="text-sm font-medium mb-2">Classes disponibles :</p>
                    {availableClasses.length === 0 ? (
                      <p className="text-muted-foreground">Aucune classe disponible.</p>
                    ) : (
                      availableClasses.map((cls) => (
                        <div key={cls.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`class-${cls.id}`}
                            checked={selectedClasses.includes(cls.id)}
                            onCheckedChange={() => handleClassSelectionChange(cls.id)}
                          />
                          <label
                            htmlFor={`class-${cls.id}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {cls.name}
                          </label>
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}

              <DialogFooter>
                <Button type="submit">Ajouter</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Dialog pour modifier un utilisateur */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Modifier un utilisateur</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleUpdateUser)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom</FormLabel>
                    <FormControl>
                      <Input placeholder="Nom de l'utilisateur" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Email de l'utilisateur" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Le champ mot de passe est intentionnellement omis ici */}

              {userRole === 'teacher' && (
                <>
                  <FormField
                    control={form.control}
                    name="department"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Département</FormLabel>
                        <Select onValueChange={(value) => {
                          setSelectedDepartment(value);
                        }} value={selectedDepartment}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner un département" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="">Tous les départements</SelectItem>
                            {departments.map((dept) => (
                              <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="border rounded-md p-4">
                    <p className="text-sm font-medium mb-2">Classes disponibles :</p>
                    {availableClasses.length === 0 ? (
                      <p className="text-muted-foreground">Aucune classe disponible.</p>
                    ) : (
                      availableClasses.map((cls) => (
                        <div key={cls.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`class-${cls.id}`}
                            checked={selectedClasses.includes(cls.id)}
                            onCheckedChange={() => handleClassSelectionChange(cls.id)}
                          />
                          <label
                            htmlFor={`class-${cls.id}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {cls.name}
                          </label>
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}

              <DialogFooter>
                <Button type="submit">Enregistrer</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Dialog pour supprimer un utilisateur */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>
              Êtes-vous sûr de vouloir supprimer cet utilisateur{' '}
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
    </div>
  );
};

export default UserManagementTable;
