
import { useState, useEffect } from 'react';
import { Department } from '@/data/models';
import { getDepartments, createDepartment, updateDepartment, deleteDepartment } from '@/services/departments/departmentService';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader,
  DialogTitle, DialogTrigger, DialogClose
} from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { Pencil, Trash2, Plus } from 'lucide-react';

interface DepartmentManagementTableProps {
  onDepartmentChange?: (departments: Department[]) => void;
}

const DepartmentManagementTable = ({ onDepartmentChange }: DepartmentManagementTableProps) => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newDepartment, setNewDepartment] = useState<Omit<Department, 'id' | 'created_at' | 'updated_at'>>({
    name: '',
    description: '',
  });
  const [editForm, setEditForm] = useState<Partial<Department>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const data = await getDepartments();
      setDepartments(data);
      if (onDepartmentChange) onDepartmentChange(data);
    } catch (error) {
      console.error('Error fetching departments:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de charger les départements.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleEditClick = (department: Department) => {
    setEditingDepartment(department);
    setEditForm({ ...department });
  };

  const handleEditChange = (field: keyof Department, value: any) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  const handleEditSubmit = async () => {
    if (!editingDepartment || !editForm.name) return;
    setIsSubmitting(true);
    
    try {
      await updateDepartment(editingDepartment.id, editForm);
      toast({
        title: 'Département mis à jour',
        description: `Le département ${editForm.name} a été mis à jour avec succès.`,
      });
      setEditingDepartment(null);
      fetchDepartments();
    } catch (error) {
      console.error('Error updating department:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de mettre à jour le département.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddChange = (field: keyof Omit<Department, 'id' | 'created_at' | 'updated_at'>, value: any) => {
    setNewDepartment(prev => ({ ...prev, [field]: value }));
  };

  const handleAddSubmit = async () => {
    if (!newDepartment.name) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Veuillez entrer un nom pour le département.',
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      await createDepartment(newDepartment);
      toast({
        title: 'Département ajouté',
        description: `Le département ${newDepartment.name} a été ajouté avec succès.`,
      });
      setNewDepartment({
        name: '',
        description: '',
      });
      setShowAddDialog(false);
      fetchDepartments();
    } catch (error) {
      console.error('Error adding department:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible d\'ajouter le département.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = async (id: string, name: string) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer le département "${name}" ?`)) {
      try {
        await deleteDepartment(id);
        toast({
          title: 'Département supprimé',
          description: `Le département ${name} a été supprimé avec succès.`,
        });
        fetchDepartments();
      } catch (error) {
        console.error('Error deleting department:', error);
        toast({
          variant: 'destructive',
          title: 'Erreur',
          description: 'Impossible de supprimer le département.',
        });
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Gestion des départements</h2>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Ajouter un département
        </Button>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-4">
                  Chargement des départements...
                </TableCell>
              </TableRow>
            ) : departments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                  Aucun département trouvé.
                </TableCell>
              </TableRow>
            ) : (
              departments.map((department) => (
                <TableRow key={department.id}>
                  <TableCell className="font-medium">{department.name}</TableCell>
                  <TableCell>{department.description || 'Aucune description'}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEditClick(department)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDeleteClick(department.id, department.name)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Edit department dialog */}
      {editingDepartment && (
        <Dialog open={!!editingDepartment} onOpenChange={(open) => !open && setEditingDepartment(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Modifier le département</DialogTitle>
              <DialogDescription>
                Modifiez les détails du département {editingDepartment.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">
                  Nom
                </Label>
                <Input
                  id="edit-name"
                  value={editForm.name || ''}
                  onChange={(e) => handleEditChange('name', e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="edit-description" className="text-right pt-2">
                  Description
                </Label>
                <Textarea
                  id="edit-description"
                  value={editForm.description || ''}
                  onChange={(e) => handleEditChange('description', e.target.value)}
                  className="col-span-3"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditingDepartment(null)}>
                Annuler
              </Button>
              <Button type="button" onClick={handleEditSubmit} disabled={isSubmitting}>
                {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Add department dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ajouter un nouveau département</DialogTitle>
            <DialogDescription>
              Entrez les détails du nouveau département
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-name" className="text-right">
                Nom
              </Label>
              <Input
                id="new-name"
                value={newDepartment.name}
                onChange={(e) => handleAddChange('name', e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="new-description" className="text-right pt-2">
                Description
              </Label>
              <Textarea
                id="new-description"
                value={newDepartment.description || ''}
                onChange={(e) => handleAddChange('description', e.target.value)}
                className="col-span-3"
                rows={3}
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

export default DepartmentManagementTable;
