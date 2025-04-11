
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
  Cell,
  LineChart,
  Line
} from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Building2, Package, Printer } from 'lucide-react';

const SupervisorStats = () => {
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
    const groupedData: { [key: string]: { total: number, approved: number, rejected: number, admin_approved: number } } = {};
    
    requests.forEach(request => {
      // Filtrer uniquement les demandes qui ont été approuvées par l'admin
      if (request.status === 'approved' || request.status === 'rejected' || request.status === 'admin_approved') {
        const date = new Date(request.date);
        const periodKey = period === 'week' ? getWeekNumber(date) : getMonthName(date);
        
        if (!groupedData[periodKey]) {
          groupedData[periodKey] = { total: 0, approved: 0, rejected: 0, admin_approved: 0 };
        }
        
        if (request.status === 'admin_approved') {
          groupedData[periodKey].admin_approved += 1;
          groupedData[periodKey].total += 1;
        } else if (request.status === 'approved') {
          groupedData[periodKey].approved += 1;
          groupedData[periodKey].total += 1;
        } else if (request.status === 'rejected') {
          groupedData[periodKey].rejected += 1;
          groupedData[periodKey].total += 1;
        }
      }
    });
    
    return Object.entries(groupedData).map(([period, data]) => ({
      period,
      ...data
    }));
  };

  const getApprovalRateData = () => {
    const groupedData = groupRequestsByPeriod();
    
    return groupedData.map(item => ({
      period: item.period,
      rate: item.total > 0 ? (item.approved / item.total) * 100 : 0
    }));
  };

  const getRequestTypeData = () => {
    const typeCount = {
      room: 0,
      equipment: 0,
      printing: 0
    };
    
    // Filtrer uniquement pour inclure les demandes finalisées (approuvées ou rejetées)
    requests
      .filter(req => req.status === 'approved' || req.status === 'rejected')
      .forEach(request => {
        typeCount[request.type] += 1;
      });
    
    return [
      { name: 'Salles', value: typeCount.room, color: '#0088FE' },
      { name: 'Matériel', value: typeCount.equipment, color: '#00C49F' },
      { name: 'Impression', value: typeCount.printing, color: '#FFBB28' }
    ];
  };

  const getFinalStatusData = () => {
    const statusCount = {
      approved: 0,
      rejected: 0,
      admin_approved: 0
    };
    
    requests
      .filter(req => req.status === 'approved' || req.status === 'rejected' || req.status === 'admin_approved')
      .forEach(request => {
        statusCount[request.status] += 1;
      });
    
    return [
      { name: 'Approuvé', value: statusCount.approved, color: STATUS_COLORS.approved },
      { name: 'Rejeté', value: statusCount.rejected, color: STATUS_COLORS.rejected },
      { name: 'En attente (approuvé admin)', value: statusCount.admin_approved, color: STATUS_COLORS.admin_approved }
    ];
  };

  const chartData = groupRequestsByPeriod();
  const typeData = getRequestTypeData();
  const statusData = getFinalStatusData();
  const approvalRateData = getApprovalRateData();

  const config = {
    total: { label: 'Total' },
    approved: { label: 'Approuvé', theme: { light: '#0088FE' } },
    rejected: { label: 'Rejeté', theme: { light: '#FF8042' } },
    admin_approved: { label: 'Approuvé admin', theme: { light: '#00C49F' } },
    rate: { label: 'Taux d\'approbation', theme: { light: '#9c27b0' } }
  };

  return (
    <Layout title="Statistiques des approbations">
      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Statistiques des approbations finales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row justify-between items-center mb-6">
              <Tabs defaultValue="overview" onValueChange={setViewType} className="w-full md:w-auto">
                <TabsList>
                  <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
                  <TabsTrigger value="approval-rate">Taux d'approbation</TabsTrigger>
                  <TabsTrigger value="details">Détails</TabsTrigger>
                </TabsList>
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
                        <Bar dataKey="approved" name="Approuvé" fill="#0088FE" />
                        <Bar dataKey="rejected" name="Rejeté" fill="#FF8042" />
                        <Bar dataKey="admin_approved" name="En attente d'approbation finale" fill="#00C49F" />
                      </BarChart>
                    </ChartContainer>
                  </div>
                </TabsContent>

                <TabsContent value="approval-rate" className="mt-0">
                  <div className="h-[400px]">
                    <ChartContainer config={config}>
                      <LineChart data={approvalRateData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="period" angle={-45} textAnchor="end" height={60} />
                        <YAxis domain={[0, 100]} label={{ value: 'Taux (%)', angle: -90, position: 'insideLeft' }} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Legend />
                        <Line type="monotone" dataKey="rate" name="Taux d'approbation (%)" stroke="#9c27b0" />
                      </LineChart>
                    </ChartContainer>
                  </div>
                  
                  <div className="mt-6">
                    <Card>
                      <CardContent className="p-4">
                        <h3 className="text-lg font-medium mb-2">Taux d'approbation moyen</h3>
                        <div className="text-3xl font-bold">
                          {approvalRateData.length > 0 
                            ? (approvalRateData.reduce((acc, curr) => acc + curr.rate, 0) / approvalRateData.length).toFixed(1) + '%'
                            : '0%'
                          }
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="details" className="mt-0">
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
                  </div>
                </TabsContent>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default SupervisorStats;
