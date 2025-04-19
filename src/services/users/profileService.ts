import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

// Télécharger une photo de profil
export const uploadProfilePhoto = async (userId: string, file: File): Promise<string | null> => {
  try {
    // Vérifier si le fichier est une image
    if (!file.type.startsWith('image/')) {
      toast({
        variant: "destructive",
        title: "Type de fichier non valide",
        description: "Veuillez sélectionner une image (JPG, PNG, etc.)."
      });
      return null;
    }
    
    // Limiter la taille du fichier (5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast({
        variant: "destructive",
        title: "Fichier trop volumineux",
        description: "La taille de l'image ne doit pas dépasser 5MB."
      });
      return null;
    }
    
    // Créer un nom de fichier unique
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `profile-photos/${fileName}`;
    
    // Télécharger le fichier
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('profiles')
      .upload(filePath, file);
    
    if (uploadError) {
      console.error('Error uploading profile photo:', uploadError);
      toast({
        variant: "destructive",
        title: "Erreur lors du téléchargement",
        description: uploadError.message
      });
      return null;
    }
    
    // Obtenir l'URL publique
    const { data: urlData } = supabase.storage
      .from('profiles')
      .getPublicUrl(filePath);
    
    // Mettre à jour le profil de l'utilisateur avec l'URL de la photo
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        avatar_url: urlData.publicUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);
    
    if (updateError) {
      console.error('Error updating profile with photo URL:', updateError);
      toast({
        variant: "destructive",
        title: "Erreur lors de la mise à jour du profil",
        description: updateError.message
      });
      return null;
    }
    
    toast({
      title: "Photo de profil mise à jour",
      description: "Votre photo de profil a été mise à jour avec succès."
    });
    
    return urlData.publicUrl;
  } catch (error) {
    console.error('Error in profile photo upload process:', error);
    toast({
      variant: "destructive",
      title: "Erreur",
      description: "Une erreur est survenue lors du téléchargement de la photo."
    });
    return null;
  }
};

// Récupérer les données d'un profil utilisateur
export const getUserProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};
