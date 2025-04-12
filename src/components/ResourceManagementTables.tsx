
import { useState, useEffect } from 'react';
import { 
  Room, 
  Equipment, 
  RoomType 
} from '@/data/models';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogClose
} from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { Pencil, Trash2, Plus, Building2, Package, Check } from 'lucide-react';

interface RoomManagementTableProps {
  rooms: Room[];
  onEditRoom: (id: string, updates: Partial<Room>) => Promise<void>;
  onAddRoom: (room: Omit<Room, 'id'>) => Promise<void>;
  onDeleteRoom: (id: string) => Promise<void>;
}

interface EquipmentManagementTableProps {
  equipment: Equipment[];
  onEditEquipment: (id: string, updates: Partial<Equipment>) => Promise<void>;
  onAddEquipment: (equipment: Omit<Equipment, 'id'>) => Promise<void>;
  onDeleteEquipment: (id: string) => Promise<void>;
}

const roomTypeOptions = [
  { value: 'classroom', label: 'Salle de cours' },
  { value: 'computer_lab', label: 'Laboratoire informatique' },
  { value: 'science_lab', label: 'Laboratoire scientifique' },
  { value: 'meeting_room', label: 'Salle de réunion' }
];

export const RoomManagementTable = ({ 
  rooms, 
  onEditRoom, 
  onAddRoom, 
  onDeleteRoom 
}: RoomManagementTableProps) => {
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<Room>>({});
  const [newRoom, setNewRoom] = useState<Omit<Room, 'id'>>({
    name: '',
    capacity: 0,
    available: true,
    type: 'classroom',
  });
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEditClick = (room: Room) => {
    setEditingRoom(room);
    setEditFormData({ ...room });
  };

  const handleEditChange = (field: keyof Room, value: any) => {
    setEditFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleEditSubmit = async () => {
    if (!editingRoom) return;
    
    setIsSubmitting(true);
    try {
      await onEditRoom(editingRoom.id, editFormData);
      toast({
        title: 'Salle mise à jour',
        description: `La salle ${editingRoom.name} a été mise à jour avec succès.`,
      });
      setEditingRoom(null);
    } catch (error) {
      console.error('Failed to update room:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: `Impossible de mettre à jour la salle.`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddChange = (field: keyof Omit<Room, 'id'>, value: any) => {
    setNewRoom(prev => ({ ...prev, [field]: value }));
  };

  const handleAddSubmit = async () => {
    if (!newRoom.name || newRoom.capacity <= 0) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Veuillez remplir tous les champs requis.',
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      await onAddRoom(newRoom);
      toast({
        title: 'Salle ajoutée',
        description: `La salle ${newRoom.name} a été ajoutée avec succès.`,
      });
      setNewRoom({
        name: '',
        capacity: 0,
        available: true,
        type: 'classroom',
      });
      setShowAddDialog(false);
    } catch (error) {
      console.error('Failed to add room:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: `Impossible d'ajouter la salle.`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = async (id: string, name: string) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer la salle "${name}" ?`)) {
      try {
        await onDeleteRoom(id);
        toast({
          title: 'Salle supprimée',
          description: `La salle ${name} a été supprimée avec succès.`,
        });
      } catch (error) {
        console.error('Failed to delete room:', error);
        toast({
          variant: 'destructive',
          title: 'Erreur',
          description: `Impossible de supprimer la salle.`,
        });
      }
    }
  };

  const getRoomTypeName = (type: RoomType): string => {
    const option = roomTypeOptions.find(opt => opt.value === type);
    return option ? option.label : type;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Gestion des salles</h2>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Ajouter une salle
        </Button>
      </div>
      
      {/* Room table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Capacité</TableHead>
              <TableHead>Disponibilité</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rooms.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                  Aucune salle disponible
                </TableCell>
              </TableRow>
            ) : (
              rooms.map((room) => (
                <TableRow key={room.id}>
                  <TableCell className="font-medium">{room.name}</TableCell>
                  <TableCell>{getRoomTypeName(room.type)}</TableCell>
                  <TableCell>{room.capacity} personnes</TableCell>
                  <TableCell>
                    {room.available ? (
                      <Badge variant="outline" className="bg-green-100 text-green-800">Disponible</Badge>
                    ) : (
                      <Badge variant="outline" className="bg-red-100 text-red-800">Non disponible</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEditClick(room)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDeleteClick(room.id, room.name)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Edit room dialog */}
      {editingRoom && (
        <Dialog open={!!editingRoom} onOpenChange={(open) => !open && setEditingRoom(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Modifier la salle</DialogTitle>
              <DialogDescription>
                Modifiez les détails de la salle {editingRoom.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">
                  Nom
                </Label>
                <Input
                  id="edit-name"
                  value={editFormData.name || ''}
                  onChange={(e) => handleEditChange('name', e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-type" className="text-right">
                  Type
                </Label>
                <Select
                  value={editFormData.type}
                  onValueChange={(value) => handleEditChange('type', value as RoomType)}
                >
                  <SelectTrigger id="edit-type" className="col-span-3">
                    <SelectValue placeholder="Sélectionner un type" />
                  </SelectTrigger>
                  <SelectContent>
                    {roomTypeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-capacity" className="text-right">
                  Capacité
                </Label>
                <Input
                  id="edit-capacity"
                  type="number"
                  value={editFormData.capacity || 0}
                  onChange={(e) => handleEditChange('capacity', parseInt(e.target.value) || 0)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-available" className="text-right">
                  Disponible
                </Label>
                <div className="col-span-3 flex items-center space-x-2">
                  <Switch
                    id="edit-available"
                    checked={editFormData.available}
                    onCheckedChange={(checked) => handleEditChange('available', checked)}
                  />
                  <Label htmlFor="edit-available" className="cursor-pointer">
                    {editFormData.available ? 'Disponible' : 'Non disponible'}
                  </Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditingRoom(null)}>
                Annuler
              </Button>
              <Button type="button" onClick={handleEditSubmit} disabled={isSubmitting}>
                {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Add room dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ajouter une nouvelle salle</DialogTitle>
            <DialogDescription>
              Entrez les détails de la nouvelle salle
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-name" className="text-right">
                Nom
              </Label>
              <Input
                id="new-name"
                value={newRoom.name}
                onChange={(e) => handleAddChange('name', e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-type" className="text-right">
                Type
              </Label>
              <Select
                value={newRoom.type}
                onValueChange={(value) => handleAddChange('type', value as RoomType)}
              >
                <SelectTrigger id="new-type" className="col-span-3">
                  <SelectValue placeholder="Sélectionner un type" />
                </SelectTrigger>
                <SelectContent>
                  {roomTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-capacity" className="text-right">
                Capacité
              </Label>
              <Input
                id="new-capacity"
                type="number"
                value={newRoom.capacity || ''}
                onChange={(e) => handleAddChange('capacity', parseInt(e.target.value) || 0)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-available" className="text-right">
                Disponible
              </Label>
              <div className="col-span-3 flex items-center space-x-2">
                <Switch
                  id="new-available"
                  checked={newRoom.available}
                  onCheckedChange={(checked) => handleAddChange('available', checked)}
                />
                <Label htmlFor="new-available" className="cursor-pointer">
                  {newRoom.available ? 'Disponible' : 'Non disponible'}
                </Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
              Annuler
            </Button>
            <Button type="button" onClick={handleAddSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Ajout...' : 'Ajouter'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export const EquipmentManagementTable = ({
  equipment,
  onEditEquipment,
  onAddEquipment,
  onDeleteEquipment
}: EquipmentManagementTableProps) => {
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<Equipment>>({});
  const [newEquipment, setNewEquipment] = useState<Omit<Equipment, 'id'>>({
    name: '',
    category: '',
    available: 0,
  });
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEditClick = (item: Equipment) => {
    setEditingEquipment(item);
    setEditFormData({ ...item });
  };

  const handleEditChange = (field: keyof Equipment, value: any) => {
    setEditFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleEditSubmit = async () => {
    if (!editingEquipment) return;
    
    setIsSubmitting(true);
    try {
      await onEditEquipment(editingEquipment.id, editFormData);
      toast({
        title: 'Matériel mis à jour',
        description: `Le matériel ${editingEquipment.name} a été mis à jour avec succès.`,
      });
      setEditingEquipment(null);
    } catch (error) {
      console.error('Failed to update equipment:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: `Impossible de mettre à jour le matériel.`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddChange = (field: keyof Omit<Equipment, 'id'>, value: any) => {
    setNewEquipment(prev => ({ ...prev, [field]: value }));
  };

  const handleAddSubmit = async () => {
    if (!newEquipment.name || !newEquipment.category || newEquipment.available <= 0) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Veuillez remplir tous les champs requis.',
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      await onAddEquipment(newEquipment);
      toast({
        title: 'Matériel ajouté',
        description: `Le matériel ${newEquipment.name} a été ajouté avec succès.`,
      });
      setNewEquipment({
        name: '',
        category: '',
        available: 0,
      });
      setShowAddDialog(false);
    } catch (error) {
      console.error('Failed to add equipment:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: `Impossible d'ajouter le matériel.`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = async (id: string, name: string) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer le matériel "${name}" ?`)) {
      try {
        await onDeleteEquipment(id);
        toast({
          title: 'Matériel supprimé',
          description: `Le matériel ${name} a été supprimé avec succès.`,
        });
      } catch (error) {
        console.error('Failed to delete equipment:', error);
        toast({
          variant: 'destructive',
          title: 'Erreur',
          description: `Impossible de supprimer le matériel.`,
        });
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Gestion du matériel</h2>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Ajouter du matériel
        </Button>
      </div>
      
      {/* Equipment table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Catégorie</TableHead>
              <TableHead>Quantité disponible</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {equipment.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                  Aucun matériel disponible
                </TableCell>
              </TableRow>
            ) : (
              equipment.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>{item.available} unités</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEditClick(item)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDeleteClick(item.id, item.name)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Edit equipment dialog */}
      {editingEquipment && (
        <Dialog open={!!editingEquipment} onOpenChange={(open) => !open && setEditingEquipment(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Modifier le matériel</DialogTitle>
              <DialogDescription>
                Modifiez les détails du matériel {editingEquipment.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">
                  Nom
                </Label>
                <Input
                  id="edit-name"
                  value={editFormData.name || ''}
                  onChange={(e) => handleEditChange('name', e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-category" className="text-right">
                  Catégorie
                </Label>
                <Input
                  id="edit-category"
                  value={editFormData.category || ''}
                  onChange={(e) => handleEditChange('category', e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-available" className="text-right">
                  Disponible
                </Label>
                <Input
                  id="edit-available"
                  type="number"
                  value={editFormData.available || 0}
                  onChange={(e) => handleEditChange('available', parseInt(e.target.value) || 0)}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditingEquipment(null)}>
                Annuler
              </Button>
              <Button type="button" onClick={handleEditSubmit} disabled={isSubmitting}>
                {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Add equipment dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ajouter un nouveau matériel</DialogTitle>
            <DialogDescription>
              Entrez les détails du nouveau matériel
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-name" className="text-right">
                Nom
              </Label>
              <Input
                id="new-name"
                value={newEquipment.name}
                onChange={(e) => handleAddChange('name', e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-category" className="text-right">
                Catégorie
              </Label>
              <Input
                id="new-category"
                value={newEquipment.category}
                onChange={(e) => handleAddChange('category', e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-available" className="text-right">
                Disponible
              </Label>
              <Input
                id="new-available"
                type="number"
                value={newEquipment.available || ''}
                onChange={(e) => handleAddChange('available', parseInt(e.target.value) || 0)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
              Annuler
            </Button>
            <Button type="button" onClick={handleAddSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Ajout...' : 'Ajouter'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
