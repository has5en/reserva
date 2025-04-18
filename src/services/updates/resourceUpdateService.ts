
import { supabase } from '@/integrations/supabase/client';
import { ResourceUpdate } from '@/data/models';

export const getResourceUpdates = async (): Promise<ResourceUpdate[]> => {
  try {
    return [
      {
        id: '1',
        resourceType: 'room',
        resourceId: '1',
        resourceName: 'Classroom A',
        updaterId: '1',
        updaterName: 'Admin',
        timestamp: new Date().toISOString(),
        details: 'Equipment updated',
        previousState: { equipment: ['Computer'] },
        newState: { equipment: ['Computer', 'Projector'] }
      }
    ];
  } catch (error) {
    console.error('Error fetching resource updates:', error);
    return [];
  }
};
