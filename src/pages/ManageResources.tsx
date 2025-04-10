
import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { Room, Class, Equipment } from '@/data/models';
import { getRooms, getClasses, getEquipment } from '@/services/dataService';
import { Plus, Edit, Trash } from 'lucide-react';

const ManageResources = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [roomsData, classesData, equipmentData] = await Promise.all([
          getRooms(),
          getClasses(),
          getEquipment()
        ]);
        
        setRooms(roomsData);
        setClasses(classesData);
        setEquipment(equipmentData);
      } catch (error) {
        console.error('Failed to fetch resources:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <Layout title="Gestion des ressources">
      <Tabs defaultValue="rooms">
        <TabsList className="mb-6">
          <TabsTrigger value="rooms">Salles et Labs</TabsTrigger>
          <TabsTrigger value="classes">Classes</TabsTrigger>
          <TabsTrigger value="equipment">Matériel</TabsTrigger>
        </TabsList>
        
        <TabsContent value="rooms">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Salles et Laboratoires</CardTitle>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-1">
                    <Plus className="h-4 w-4" />
                    Ajouter une salle
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Ajouter une nouvelle salle</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nom</Label>
                      <Input id="name" placeholder="Ex: Lab A" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="capacity">Capacité</Label>
                      <Input id="capacity" type="number" placeholder="Nombre de places" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="department">Département</Label>
                      <Input id="department" placeholder="Ex: Informatique" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="software">Logiciels installés (séparés par virgule)</Label>
                      <Input id="software" placeholder="Ex: Python, MATLAB, Excel" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="equipment">Équipements (séparés par virgule)</Label>
                      <Input id="equipment" placeholder="Ex: Projecteur, Tableau interactif" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">Enregistrer</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom</TableHead>
                      <TableHead>Capacité</TableHead>
                      <TableHead>Département</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center">
                          Chargement des salles...
                        </TableCell>
                      </TableRow>
                    ) : rooms.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center">
                          Aucune salle trouvée.
                        </TableCell>
                      </TableRow>
                    ) : (
                      rooms.map((room) => (
                        <TableRow key={room.id}>
                          <TableCell className="font-medium">{room.name}</TableCell>
                          <TableCell>{room.capacity} places</TableCell>
                          <TableCell>{room.department || 'N/A'}</TableCell>
                          <TableCell>
                            {room.available ? (
                              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                                Disponible
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
                                Indisponible
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="icon">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon">
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="classes">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Classes</CardTitle>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-1">
                    <Plus className="h-4 w-4" />
                    Ajouter une classe
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Ajouter une nouvelle classe</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="class-name">Nom</Label>
                      <Input id="class-name" placeholder="Ex: Classe 3A" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="student-count">Nombre d'étudiants</Label>
                      <Input id="student-count" type="number" placeholder="Effectif" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="class-department">Département</Label>
                      <Input id="class-department" placeholder="Ex: Informatique" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">Enregistrer</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom</TableHead>
                      <TableHead>Effectif</TableHead>
                      <TableHead>Département</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center">
                          Chargement des classes...
                        </TableCell>
                      </TableRow>
                    ) : classes.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center">
                          Aucune classe trouvée.
                        </TableCell>
                      </TableRow>
                    ) : (
                      classes.map((cls) => (
                        <TableRow key={cls.id}>
                          <TableCell className="font-medium">{cls.name}</TableCell>
                          <TableCell>{cls.studentCount} étudiants</TableCell>
                          <TableCell>{cls.department}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="icon">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon">
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="equipment">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Matériel</CardTitle>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-1">
                    <Plus className="h-4 w-4" />
                    Ajouter du matériel
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Ajouter un nouveau matériel</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="equipment-name">Nom</Label>
                      <Input id="equipment-name" placeholder="Ex: Ordinateur portable" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Catégorie</Label>
                      <Input id="category" placeholder="Ex: Informatique" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="available">Quantité disponible</Label>
                      <Input id="available" type="number" placeholder="Nombre d'unités" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="equipment-department">Département</Label>
                      <Input id="equipment-department" placeholder="Ex: IT" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">Enregistrer</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom</TableHead>
                      <TableHead>Catégorie</TableHead>
                      <TableHead>Disponible</TableHead>
                      <TableHead>Département</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center">
                          Chargement du matériel...
                        </TableCell>
                      </TableRow>
                    ) : equipment.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center">
                          Aucun matériel trouvé.
                        </TableCell>
                      </TableRow>
                    ) : (
                      equipment.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell>{item.category}</TableCell>
                          <TableCell>{item.available} unités</TableCell>
                          <TableCell>{item.department || 'N/A'}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="icon">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon">
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </Layout>
  );
};

export default ManageResources;
