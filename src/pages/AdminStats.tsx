
import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { getRequests, formatDate } from '@/services/dataService';
import { Request } from '@/data/models';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Building2, Package, Printer } from 'lucide-react';

const AdminStats = () => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');
  const [viewType, setViewType] = useState('overview');
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
  const STATUS_COLORS = {
    pending: '#FFBB28',
    admin_approved: '#00C49F',
    approved: '#0088FE',
    rejected: '#FF8042'
  };

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const allRequests = await getRequests();
        setRequests(allRequests);
      } catch (error) {
        console.error('Failed to fetch requests:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const getWeekNumber = (d: Date) => {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return `Semaine ${weekNo}`;
  };

  const getMonthName = (d: Date) => {
    return new Intl.DateTimeFormat('fr-FR', { month: 'long' }).format(d);
  };

  const groupRequestsByPeriod = () => {
    const groupedData: { [key: string]: { total: number, approved: number, rejected: number, pending: number, admin_approved: number } } = {};
    
    requests.forEach(request => {
      const date = new Date(request.date);
      const periodKey = period === 'week' ? getWeekNumber(date) : getMonthName(date);
      
      if (!groupedData[periodKey]) {
        groupedData[periodKey] = { total: 0, approved: 0, rejected: 0, pending: 0, admin_approved: 0 };
      }
      
      groupedData[periodKey].total += 1;
      
      if (request.status === 'approved') {
        groupedData[periodKey].approved += 1;
      } else if (request.status === 'rejected') {
        groupedData[periodKey].rejected += 1;
      } else if (request.status === 'pending') {
        groupedData[periodKey].pending += 1;
      } else if (request.status === 'admin_approved') {
        groupedData[periodKey].admin_approved += 1;
      }
    });
    
    return Object.entries(groupedData).map(([period, data]) => ({
      period,
      ...data
    }));
  };

  const getRequestTypeData = () => {
    const typeCount = {
      room: 0,
      equipment: 0,
      printing: 0
    };
    
    requests.forEach(request => {
      typeCount[request.type] += 1;
    });
    
    return [
      { name: 'Salles', value: typeCount.room, color: '#0088FE' },
      { name: 'Matériel', value: typeCount.equipment, color: '#00C49F' },
      { name: 'Impression', value: typeCount.printing, color: '#FFBB28' }
    ];
  };

  const getStatusData = () => {
    const statusCount = {
      pending: 0,
      admin_approved: 0,
      approved: 0,
      rejected: 0
    };
    
    requests.forEach(request => {
      statusCount[request.status] += 1;
    });
    
    return [
      { name: 'En attente', value: statusCount.pending, color: STATUS_COLORS.pending },
      { name: 'Approuvé admin', value: statusCount.admin_approved, color: STATUS_COLORS.admin_approved },
      { name: 'Approuvé', value: statusCount.approved, color: STATUS_COLORS.approved },
      { name: 'Rejeté', value: statusCount.rejected, color: STATUS_COLORS.rejected }
    ];
  };

  const chartData = groupRequestsByPeriod();
  const typeData = getRequestTypeData();
  const statusData = getStatusData();

  const config = {
    total: { label: 'Total' },
    approved: { label: 'Approuvé', theme: { light: '#0088FE', dark: '#0088FE' } },
    rejected: { label: 'Rejeté', theme: { light: '#FF8042', dark: '#FF8042' } },
    pending: { label: 'En attente', theme: { light: '#FFBB28', dark: '#FFBB28' } },
    admin_approved: { label: 'Approuvé admin', theme: { light: '#00C49F', dark: '#00C49F' } },
  };

  return (
    <Layout title="Statistiques des demandes">
      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Statistiques des demandes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row justify-between items-center mb-6">
              <Tabs defaultValue="overview" onValueChange={setViewType} className="w-full md:w-auto">
                <TabsList>
                  <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
                  <TabsTrigger value="by-type">Par type</TabsTrigger>
                  <TabsTrigger value="by-status">Par statut</TabsTrigger>
                </TabsList>
              
                {loading ? (
                  <div className="text-center py-8">Chargement des statistiques...</div>
                ) : (
                  <>
                    <TabsContent value="overview" className="mt-0">
                      <div className="h-[400px]">
                        <ChartContainer config={config}>
                          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="period" angle={-45} textAnchor="end" height={60} />
                            <YAxis />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Legend />
                            <Bar dataKey="total" name="Total" fill="#8884d8" />
                            <Bar dataKey="approved" name="Approuvé" fill="#0088FE" />
                            <Bar dataKey="rejected" name="Rejeté" fill="#FF8042" />
                          </BarChart>
                        </ChartContainer>
                      </div>
                    </TabsContent>

                    <TabsContent value="by-type" className="mt-0">
                      <div className="flex flex-col md:flex-row gap-6">
                        <div className="md:w-1/2">
                          <h3 className="text-lg font-medium mb-2">Distribution par type de demande</h3>
                          <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={typeData}
                                  cx="50%"
                                  cy="50%"
                                  labelLine={false}
                                  outerRadius={100}
                                  fill="#8884d8"
                                  dataKey="value"
                                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                >
                                  {typeData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                  ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                        <div className="md:w-1/2">
                          <h3 className="text-lg font-medium mb-2">Statistiques par type</h3>
                          <div className="space-y-4">
                            <div className="flex items-center p-3 border rounded-md">
                              <div className="bg-[#0088FE] h-10 w-10 rounded-full flex items-center justify-center text-white mr-3">
                                <Building2 size={20} />
                              </div>
                              <div>
                                <h4 className="font-medium">Réservations de salle</h4>
                                <p className="text-2xl font-bold">{typeData[0].value}</p>
                              </div>
                            </div>
                            <div className="flex items-center p-3 border rounded-md">
                              <div className="bg-[#00C49F] h-10 w-10 rounded-full flex items-center justify-center text-white mr-3">
                                <Package size={20} />
                              </div>
                              <div>
                                <h4 className="font-medium">Demandes de matériel</h4>
                                <p className="text-2xl font-bold">{typeData[1].value}</p>
                              </div>
                            </div>
                            <div className="flex items-center p-3 border rounded-md">
                              <div className="bg-[#FFBB28] h-10 w-10 rounded-full flex items-center justify-center text-white mr-3">
                                <Printer size={20} />
                              </div>
                              <div>
                                <h4 className="font-medium">Demandes d'impression</h4>
                                <p className="text-2xl font-bold">{typeData[2].value}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="by-status" className="mt-0">
                      <div className="flex flex-col md:flex-row gap-6">
                        <div className="md:w-1/2">
                          <h3 className="text-lg font-medium mb-2">Distribution par statut</h3>
                          <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={statusData}
                                  cx="50%"
                                  cy="50%"
                                  labelLine={false}
                                  outerRadius={100}
                                  fill="#8884d8"
                                  dataKey="value"
                                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                >
                                  {statusData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                  ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                        <div className="md:w-1/2">
                          <h3 className="text-lg font-medium mb-2">Statistiques par statut</h3>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col p-3 border rounded-md">
                              <div className="text-yellow-500 font-medium">En attente</div>
                              <div className="text-2xl font-bold">{statusData[0].value}</div>
                            </div>
                            <div className="flex flex-col p-3 border rounded-md">
                              <div className="text-green-500 font-medium">Approuvé admin</div>
                              <div className="text-2xl font-bold">{statusData[1].value}</div>
                            </div>
                            <div className="flex flex-col p-3 border rounded-md">
                              <div className="text-blue-500 font-medium">Approuvé</div>
                              <div className="text-2xl font-bold">{statusData[2].value}</div>
                            </div>
                            <div className="flex flex-col p-3 border rounded-md">
                              <div className="text-red-500 font-medium">Rejeté</div>
                              <div className="text-2xl font-bold">{statusData[3].value}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </>
                )}
              </Tabs>
              
              <div className="w-full md:w-48 mt-4 md:mt-0">
                <Label htmlFor="period">Période</Label>
                <Select
                  value={period}
                  onValueChange={setPeriod}
                >
                  <SelectTrigger id="period">
                    <SelectValue placeholder="Sélectionnez la période" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">Par semaine</SelectItem>
                    <SelectItem value="month">Par mois</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default AdminStats;
