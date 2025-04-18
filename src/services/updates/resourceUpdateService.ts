
import { supabase } from '@/integrations/supabase/client';
import { ResourceUpdate } from '@/data/models';

export const getResourceUpdates = async (): Promise<ResourceUpdate[]> => {
  try {
    const { data, error } = await supabase
      .from('resource_updates')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(50);
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching resource updates:', error);
    return [];
  }
};

export const addResourceUpdate = async (updateData: Omit<ResourceUpdate, 'id' | 'timestamp'>): Promise<void> => {
  console.log('Adding resource update:', updateData);
};
