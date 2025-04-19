
import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from '@/components/ui/use-toast';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { uploadProfilePhoto } from '@/services/users/profileService';
import { User } from '@/data/models';
import { Upload, Save, KeyRound, Phone, Mail, User as UserIcon } from 'lucide-react';

const profileFormSchema = z.object({
  name: z.string().min(2, { message: 'Le nom doit contenir au moins 2 caractères' }),
  email: z.string().email({ message: 'Adresse e-mail invalide' }),
  telephone: z.string().optional(),
  photo: z.instanceof(FileList).optional(),
});

const passwordFormSchema = z.object({
  currentPassword: z.string().min(6, { message: 'Le mot de passe actuel est requis' }),
  newPassword: z.string().min(6, { message: 'Le nouveau mot de passe doit contenir au moins 6 caractères' }),
  confirmPassword: z.string().min(6, { message: 'Veuillez confirmer votre nouveau mot de passe' }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;
type PasswordFormValues = z.infer<typeof passwordFormSchema>;

const UserProfile = () => {
  const { currentUser, updateUser } = useAuth();
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: currentUser?.name || '',
      email: currentUser?.email || '',
      telephone: '',
    },
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    if (currentUser) {
      profileForm.reset({
        name: currentUser.name,
        email: currentUser.email,
        telephone: currentUser.telephone || '',
      });
      setPhotoPreview(currentUser.avatar_url || null);
    }
  }, [currentUser, profileForm]);

  const handleProfileUpdate = async (data: ProfileFormValues) => {
    if (!currentUser) return;

    try {
      setIsLoading(true);
      
      const updatedUser: Partial<User> = {
        name: data.name,
        email: data.email,
        telephone: data.telephone,
      };
      
      if (data.photo && data.photo.length > 0) {
        const photoUrl = await uploadProfilePhoto(currentUser.id, data.photo[0]);
        if (photoUrl) {
          updatedUser.avatar_url = photoUrl;
        }
      }
      
      updateUser(currentUser.id, updatedUser);
      
      toast({
        title: "Profil mis à jour",
        description: "Vos informations personnelles ont été mises à jour avec succès.",
      });
    } catch (error) {
      console.error("Erreur lors de la mise à jour du profil:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur s'est produite lors de la mise à jour du profil.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordUpdate = async (data: PasswordFormValues) => {
    if (!currentUser) return;

    try {
      setIsLoading(true);
      
      // Simuler la mise à jour du mot de passe (à remplacer par l'appel API réel)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Dans un cas réel, vous utiliseriez supabase.auth.updateUser({ password: data.newPassword })
      
      toast({
        title: "Mot de passe mis à jour",
        description: "Votre mot de passe a été modifié avec succès.",
      });
      
      passwordForm.reset();
    } catch (error) {
      console.error("Erreur lors de la mise à jour du mot de passe:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur s'est produite lors de la mise à jour du mot de passe.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (!currentUser) {
    return (
      <Layout title="Profil utilisateur">
        <div className="bg-destructive/10 text-destructive p-4 rounded-md">
          Vous devez être connecté pour accéder à cette page.
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Profil utilisateur">
      <div className="container max-w-4xl mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Profil utilisateur</h1>
        
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="profile">Informations personnelles</TabsTrigger>
            <TabsTrigger value="security">Sécurité</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Informations personnelles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-32 h-32 relative">
                      <Avatar className="w-32 h-32">
                        {photoPreview ? (
                          <AvatarImage src={photoPreview} alt={currentUser.name} className="object-cover" />
                        ) : (
                          <AvatarFallback className="text-2xl">
                            {currentUser.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        )}
                      </Avatar>
                    </div>
                    <div>
                      <Label htmlFor="photo" className="cursor-pointer">
                        <div className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md">
                          <Upload size={16} />
                          <span>Changer la photo</span>
                        </div>
                        <Input
                          id="photo"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handlePhotoChange}
                        />
                      </Label>
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <Form {...profileForm}>
                      <form onSubmit={profileForm.handleSubmit(handleProfileUpdate)} className="space-y-4">
                        <FormField
                          control={profileForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nom complet</FormLabel>
                              <FormControl>
                                <div className="flex items-center border rounded-md focus-within:ring-1 focus-within:ring-ring">
                                  <div className="p-2 text-muted-foreground">
                                    <UserIcon size={18} />
                                  </div>
                                  <Input placeholder="Votre nom" {...field} className="border-0 focus-visible:ring-0" />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={profileForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <div className="flex items-center border rounded-md focus-within:ring-1 focus-within:ring-ring">
                                  <div className="p-2 text-muted-foreground">
                                    <Mail size={18} />
                                  </div>
                                  <Input placeholder="Votre email" {...field} className="border-0 focus-visible:ring-0" />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={profileForm.control}
                          name="telephone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Téléphone</FormLabel>
                              <FormControl>
                                <div className="flex items-center border rounded-md focus-within:ring-1 focus-within:ring-ring">
                                  <div className="p-2 text-muted-foreground">
                                    <Phone size={18} />
                                  </div>
                                  <Input placeholder="Votre numéro de téléphone" {...field} className="border-0 focus-visible:ring-0" />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="pt-4">
                          <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
                            {isLoading ? 'Chargement...' : (
                              <>
                                <Save className="mr-2 h-4 w-4" />
                                Enregistrer les modifications
                              </>
                            )}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Changer votre mot de passe</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...passwordForm}>
                  <form onSubmit={passwordForm.handleSubmit(handlePasswordUpdate)} className="space-y-4">
                    <FormField
                      control={passwordForm.control}
                      name="currentPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mot de passe actuel</FormLabel>
                          <FormControl>
                            <div className="flex items-center border rounded-md focus-within:ring-1 focus-within:ring-ring">
                              <div className="p-2 text-muted-foreground">
                                <KeyRound size={18} />
                              </div>
                              <Input type="password" placeholder="Votre mot de passe actuel" {...field} className="border-0 focus-visible:ring-0" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={passwordForm.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nouveau mot de passe</FormLabel>
                          <FormControl>
                            <div className="flex items-center border rounded-md focus-within:ring-1 focus-within:ring-ring">
                              <div className="p-2 text-muted-foreground">
                                <KeyRound size={18} />
                              </div>
                              <Input type="password" placeholder="Votre nouveau mot de passe" {...field} className="border-0 focus-visible:ring-0" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={passwordForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirmer le mot de passe</FormLabel>
                          <FormControl>
                            <div className="flex items-center border rounded-md focus-within:ring-1 focus-within:ring-ring">
                              <div className="p-2 text-muted-foreground">
                                <KeyRound size={18} />
                              </div>
                              <Input type="password" placeholder="Confirmez votre nouveau mot de passe" {...field} className="border-0 focus-visible:ring-0" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="pt-4">
                      <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
                        {isLoading ? 'Chargement...' : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Mettre à jour le mot de passe
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default UserProfile;
