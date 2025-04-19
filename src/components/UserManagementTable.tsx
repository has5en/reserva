
import { useState, useEffect } from 'react';
import { User, useAuth, UserRole } from '@/contexts/AuthContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { MultiSelect } from '@/components/ui/multi-select';
import { toast } from '@/components/ui/use-toast';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Pencil, Trash2, Plus, Upload } from 'lucide-react';
import { getUsersByRole } from '@/services/users/userService';
import { assignClassesToTeacher, getTeacherClasses } from '@/services/users/teacherService';
import { uploadProfilePhoto } from '@/services/users/profileService';
import { getClasses } from '@/services/dataService';
import { Class } from '@/data/models';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

const userFormSchema = z.object({
  name: z.string().min(2, { message: 'Le nom doit contenir au moins 2 caractères' }),
  email: z.string().email({ message: 'Adresse e-mail invalide' }),
  password: z.string().min(6, { message: 'Le mot de passe doit contenir au moins 6 caractères' }),
  classes: z.array(z.string()).optional(),
  photo: z.instanceof(FileList).optional(),
});

type UserFormValues = z.infer<typeof userFormSchema>;

const UserManagementTable = ({ userRole }: { userRole: UserRole }) => {
  const { hasRole } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const canEdit = hasRole('admin') || hasRole('supervisor');

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      classes: [],
    },
  });

  useEffect(() => {
    fetchUsers();
    fetchClasses();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const data = await getUsersByRole(userRole);
      // Map the profile data to User format - note that profiles don't have email directly
      const formattedUsers: User[] = data.map(profile => ({
        id: profile.id,
        name: profile.full_name || '',
        email: profile.id, // Using id as email temporarily since profile doesn't have email
        role: profile.role as UserRole,
        avatar_url: profile.avatar_url,
      }));
      setUsers(formattedUsers);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les utilisateurs."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const allClasses = await getClasses();
      setClasses(allClasses);
    } catch (error) {
      console.error('Failed to fetch classes:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les classes."
      });
    }
  };

  const handleCreateUser = async (data: UserFormValues) => {
    try {
      setIsLoading(true);
      // Using console.log for now since createUser function isn't implemented
      console.log("Creating user:", {
        email: data.email,
        password: data.password,
        name: data.name,
        role: userRole,
        classes: data.classes,
      });
      
      // Simulate success for now
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Handle photo upload if provided
      if (data.photo && data.photo.length > 0) {
        const photo = data.photo[0];
        console.log("Uploading photo:", photo.name);
        // uploadProfilePhoto would be implemented once user creation is functional
      }
      
      await fetchUsers();
      toast({
        title: "Utilisateur créé",
        description: `${data.name} a été ajouté avec succès.`,
      });
      setIsAddDialogOpen(false);
      form.reset();
      setPhotoPreview(null);
    } catch (error) {
      console.error("Erreur lors de la création de l'utilisateur:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur s'est produite lors de la création de l'utilisateur.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateUser = async (data: UserFormValues) => {
    if (!selectedUser) return;

    try {
      setIsLoading(true);
      // Using console.log for now since updateUser function isn't implemented
      console.log("Updating user:", {
        id: selectedUser.id,
        email: data.email,
        name: data.name,
        role: userRole,
        classes: data.classes,
      });
      
      // Simulate success for now
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Handle photo upload if provided
      if (data.photo && data.photo.length > 0) {
        const photo = data.photo[0];
        console.log("Uploading photo:", photo.name);
        // uploadProfilePhoto would be implemented once user update is functional
      }
      
      // Assign classes to teacher if applicable
      if (userRole === 'teacher' && data.classes && data.classes.length > 0) {
        await assignClassesToTeacher(selectedUser.id, data.classes);
      }

      await fetchUsers();
      toast({
        title: "Utilisateur mis à jour",
        description: `${data.name} a été mis à jour avec succès.`,
      });
      setIsEditDialogOpen(false);
      setSelectedUser(null);
      form.reset();
      setPhotoPreview(null);
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'utilisateur:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur s'est produite lors de la mise à jour de l'utilisateur.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      setIsLoading(true);
      // Using console.log for now since deleteUser function isn't implemented
      console.log("Deleting user:", selectedUser.id);
      
      // Simulate success for now
      await new Promise(resolve => setTimeout(resolve, 1000));
      
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
    } finally {
      setIsLoading(false);
    }
  };

  const openEditDialog = async (user: User) => {
    setSelectedUser(user);
    setPhotoPreview(user.avatar_url || null);

    // Récupérer les classes de l'enseignant si c'est un enseignant
    let teacherClasses: string[] = [];
    if (userRole === 'teacher') {
      const teacherClassesData = await getTeacherClasses(user.id);
      teacherClasses = teacherClassesData.map(tc => tc.classId);
    }

    form.reset({
      name: user.name,
      email: user.email,
      password: '', // Le mot de passe ne doit pas être pré-rempli
      classes: teacherClasses,
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (user: User) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      // Prévisualiser l'image
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
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

      {isLoading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}

      {!isLoading && users.length === 0 ? (
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
                <TableHead className="w-12"></TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <Avatar>
                      {user.avatar_url ? (
                        <AvatarImage src={user.avatar_url} alt={user.name} />
                      ) : (
                        <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                      )}
                    </Avatar>
                  </TableCell>
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
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Ajouter un utilisateur</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleCreateUser)} className="space-y-4">
              <div className="flex justify-center mb-4">
                <div className="relative w-24 h-24 overflow-hidden rounded-full border border-border">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">
                      <Upload size={24} />
                    </div>
                  )}
                </div>
              </div>

              <FormField
                control={form.control}
                name="photo"
                render={({ field: { value, onChange, ...fieldProps } }) => (
                  <FormItem>
                    <FormLabel>Photo de profil</FormLabel>
                    <FormControl>
                      <Input
                        {...fieldProps}
                        type="file"
                        accept="image/*"
                        className="cursor-pointer"
                        onChange={(e) => {
                          onChange(e.target.files);
                          handlePhotoChange(e);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                <FormField
                  control={form.control}
                  name="classes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Classes</FormLabel>
                      <FormControl>
                        <MultiSelect
                          options={classes.map(c => ({ label: c.name, value: c.id }))}
                          placeholder="Sélectionner les classes"
                          selected={field.value || []}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <DialogFooter>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Chargement...' : 'Ajouter'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Dialog pour modifier un utilisateur */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Modifier un utilisateur</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleUpdateUser)} className="space-y-4">
              <div className="flex justify-center mb-4">
                <div className="relative w-24 h-24 overflow-hidden rounded-full border border-border">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">
                      <Upload size={24} />
                    </div>
                  )}
                </div>
              </div>

              <FormField
                control={form.control}
                name="photo"
                render={({ field: { value, onChange, ...fieldProps } }) => (
                  <FormItem>
                    <FormLabel>Photo de profil</FormLabel>
                    <FormControl>
                      <Input
                        {...fieldProps}
                        type="file"
                        accept="image/*"
                        className="cursor-pointer"
                        onChange={(e) => {
                          onChange(e.target.files);
                          handlePhotoChange(e);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
              
              {userRole === 'teacher' && (
                <FormField
                  control={form.control}
                  name="classes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Classes</FormLabel>
                      <FormControl>
                        <MultiSelect
                          options={classes.map(c => ({ label: c.name, value: c.id }))}
                          placeholder="Sélectionner les classes"
                          selected={field.value || []}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <DialogFooter>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Chargement...' : 'Enregistrer'}
                </Button>
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
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isLoading}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser} disabled={isLoading}>
              {isLoading ? 'Chargement...' : 'Supprimer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagementTable;
