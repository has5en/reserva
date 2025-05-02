
import { supabase } from '@/integrations/supabase/client';
import { Room, RoomType } from '@/data/models';

export const getRooms = async (): Promise<Room[]> => {
  try {
    const { data, error } = await supabase.from('rooms').select('*');
    if (error) throw error;
    return data.map(room => ({
      id: room.id,
      name: room.name,
      capacity: room.capacity,
      available: room.is_available || false,
      type: room.type,
      equipment: room.equipment,
      floor: room.floor,
      building: room.building,
      description: room.description,
      software: room.software
    })) || [];
  } catch (error) {
    console.error('Error fetching rooms:', error);
    return [];
  }
};

export const getRoomById = async (id: string): Promise<Room | null> => {
  try {
    const { data, error } = await supabase.from('rooms').select('*').eq('id', id).single();
    if (error) throw error;
    if (!data) return null;
    
    return {
      id: data.id,
      name: data.name,
      capacity: data.capacity,
      available: data.is_available || false,
      type: data.type,
      equipment: data.equipment,
      floor: data.floor,
      building: data.building,
      description: data.description,
      software: data.software
    };
  } catch (error) {
    console.error(`Error fetching room ${id}:`, error);
    return null;
  }
};

export const getAvailableRoomsByType = async (type: RoomType, date: string, startTime: string, endTime: string): Promise<Room[]> => {
  try {
    // Construire la requête de base pour obtenir toutes les salles du type demandé
    let query = supabase
      .from('rooms')
      .select('*')
      .eq('is_available', true);
    
    // Si le type n'est pas "all", filtrer par le type spécifique
    if (type !== 'all') {
      query = query.eq('type', type);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    // Filtrer les salles par disponibilité temporelle (à implémenter avec les réservations)
    // Pour l'instant, retourne toutes les salles disponibles du type spécifié
    
    return data.map(room => ({
      id: room.id,
      name: room.name,
      capacity: room.capacity,
      available: room.is_available || false,
      type: room.type,
      equipment: room.equipment,
      floor: room.floor,
      building: room.building,
      description: room.description,
      software: room.software
    })) || [];
  } catch (error) {
    console.error('Error fetching available rooms:', error);
    return [];
  }
};

export const updateRoom = async (room: Room): Promise<void> => {
  try {
    const dbRoom = {
      id: room.id,
      name: room.name,
      capacity: room.capacity,
      is_available: room.available,
      type: room.type,
      equipment: room.equipment,
      floor: room.floor,
      building: room.building,
      description: room.description,
      software: room.software
    };
    
    const { error } = await supabase.from('rooms').update(dbRoom).eq('id', room.id);
    if (error) throw error;
  } catch (error) {
    console.error('Error updating room:', error);
    throw error;
  }
};

export const addRoom = async (room: Omit<Room, 'id'>): Promise<Room> => {
  try {
    const dbRoom = {
      name: room.name,
      capacity: room.capacity,
      is_available: room.available,
      type: room.type,
      equipment: room.equipment,
      floor: room.floor,
      building: room.building,
      description: room.description,
      software: room.software
    };
    
    const { data, error } = await supabase.from('rooms').insert(dbRoom).select().single();
    if (error) throw error;
    
    return {
      id: data.id,
      name: data.name,
      capacity: data.capacity,
      available: data.is_available || false,
      type: data.type,
      equipment: data.equipment,
      floor: data.floor,
      building: data.building,
      description: data.description,
      software: data.software
    };
  } catch (error) {
    console.error('Error adding room:', error);
    throw error;
  }
};

export const deleteRoom = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase.from('rooms').delete().eq('id', id);
    if (error) throw error;
  } catch (error) {
    console.error('Error deleting room:', error);
    throw error;
  }
};
