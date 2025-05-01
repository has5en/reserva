
import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

const UserProfile = () => {
  const { currentUser, updateUser } = useAuth();
  const [fullName, setFullName] = useState('');
  const [rank, setRank] = useState('');
  const [unit, setUnit] = useState('');
  const [telephone, setTelephone] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setFullName(currentUser.name || '');
      setRank(currentUser.rank || '');
      setUnit(currentUser.unit || '');
      setTelephone(currentUser.telephone || '');
    }
  }, [currentUser]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Vous devez être connecté pour mettre à jour votre profil."
      });
      return;
    }
    
    setIsUpdating(true);
    
    try {
      // Mise à jour des données dans le contexte d'authentification
      updateUser(currentUser.id, {
        name: fullName,
        rank,
        unit,
        telephone
      });
      
      // Mise à jour des données dans Supabase
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          rank,
          unit,
          telephone
        })
        .eq('id', currentUser.id);
      
      if (error) throw error;
      
      toast({
        title: "Profil mis à jour",
        description: "Vos informations personnelles ont été mises à jour avec succès."
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour de votre profil."
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (!currentUser) {
    return (
      <Layout title="Profil">
        <div className="flex justify-center items-center h-[60vh]">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Non connecté</CardTitle>
              <CardDescription>
                Veuillez vous connecter pour accéder à votre profil.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Informations personnelles">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Informations personnelles</CardTitle>
            <CardDescription>
              Modifiez vos informations personnelles ci-dessous
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nom complet</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Votre nom complet"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="rank">Grade</Label>
                  <Input
                    id="rank"
                    value={rank}
                    onChange={(e) => setRank(e.target.value)}
                    placeholder="Votre grade"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="unit">Unité</Label>
                  <Input
                    id="unit"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="Votre unité"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="telephone">Téléphone</Label>
                  <Input
                    id="telephone"
                    value={telephone}
                    onChange={(e) => setTelephone(e.target.value)}
                    placeholder="Votre numéro de téléphone"
                  />
                </div>
                
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating ? 'Mise à jour...' : 'Mettre à jour'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default UserProfile;
