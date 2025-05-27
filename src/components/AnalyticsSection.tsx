
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from 'recharts';
import { TrendingUp, Users, MessageCircle, DollarSign, Clock, Target, Building, Home, UserCheck, UserX, Shield } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const AnalyticsSection = () => {
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    totalContacts: 0,
    activeContacts: 0,
    blockedContacts: 0,
    seriousContacts: 0,
    totalSalaryPaid: 0,
    totalSalaryPending: 0,
    platformData: [],
    salaryRanges: [],
    monthlyTrends: [],
    companyStats: [],
    houseRentStats: { withRent: 0, withoutRent: 0 },
    statusBreakdown: { active: 0, inactive: 0 }
  });

  useEffect(() => {
    fetchAnalytics();
  }, [userProfile]);

  const fetchAnalytics = async () => {
    try {
      // Fetch contacts
      let contactsQuery = supabase.from('contacts').select('*');
      if (userProfile && userProfile.role !== 'Owner') {
        contactsQuery = contactsQuery.eq('profile_id', userProfile.id);
      }
      const { data: contacts, error: contactsError } = await contactsQuery;
      if (contactsError) throw contactsError;

      // Fetch blocked users
      let blockedQuery = supabase.from('blocked_users').select('*');
      if (userProfile && userProfile.role !== 'Owner') {
        blockedQuery = blockedQuery.eq('profile_id', userProfile.id);
      }
      const { data: blockedUsers, error: blockedError } = await blockedQuery;
      if (blockedError) throw blockedError;

      // Fetch salary records
      const { data: salaryRecords, error: salaryError } = await supabase
        .from('salary_records')
        .select('*');
      if (salaryError) throw salaryError;

      const contactsData = contacts || [];
      const blockedData = blockedUsers || [];
      const salaryData = salaryRecords || [];

      // Calculate basic stats
      const totalContacts = contactsData.length;
      const activeContacts = contactsData.filter(c => c.status === 'Active').length;
      const blockedContacts = blockedData.length;
      const seriousContacts = contactsData.filter(c => c.is_serious).length;
      
      // Calculate salary totals
      const totalSalaryPaid = salaryData
        .filter(record => record.status === 'Paid')
        .reduce((sum, record) => sum + (Number(record.base_salary) || 0), 0);
      
      const totalSalaryPending = salaryData
        .filter(record => record.status === 'Pending')
        .reduce((sum, record) => sum + (Number(record.base_salary) || 0), 0);

      // Platform distribution
      const platformCounts = contactsData.reduce((acc, contact) => {
        const platform = contact.last_message || 'Unknown';
        acc[platform] = (acc[platform] || 0) + 1;
        return acc;
      }, {});

      const platformData = Object.entries(platformCounts).map(([name, value]) => ({
        name,
        value: Number(value),
        percentage: totalContacts > 0 ? ((Number(value) / totalContacts) * 100).toFixed(1) : '0'
      }));

      // Salary ranges
      const salaryRanges = [
        { range: '0-25K', count: 0 },
        { range: '25K-50K', count: 0 },
        { range: '50K-100K', count: 0 },
        { range: '100K+', count: 0 },
        { range: 'Unknown', count: 0 }
      ];

      contactsData.forEach(contact => {
        const salaryStr = contact.salary_package || '';
        const salaryNum = parseInt(salaryStr.replace(/[^\d]/g, '')) || 0;
        
        if (!salaryStr || salaryNum === 0) {
          salaryRanges[4].count++;
        } else if (salaryNum <= 25000) {
          salaryRanges[0].count++;
        } else if (salaryNum <= 50000) {
          salaryRanges[1].count++;
        } else if (salaryNum <= 100000) {
          salaryRanges[2].count++;
        } else {
          salaryRanges[3].count++;
        }
      });

      // Monthly trends
      const monthlyTrends = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthYear = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        
        const monthContacts = contactsData.filter(contact => {
          const contactDate = new Date(contact.created_at);
          return contactDate.getMonth() === date.getMonth() && 
                 contactDate.getFullYear() === date.getFullYear();
        }).length;

        const monthSalaries = salaryData.filter(record => {
          const recordDate = new Date(record.created_at);
          return recordDate.getMonth() === date.getMonth() && 
                 recordDate.getFullYear() === date.getFullYear();
        }).length;

        monthlyTrends.push({
          month: monthYear,
          contacts: monthContacts,
          salaries: monthSalaries,
          serious: contactsData.filter(contact => {
            const contactDate = new Date(contact.created_at);
            return contactDate.getMonth() === date.getMonth() && 
                   contactDate.getFullYear() === date.getFullYear() &&
                   contact.is_serious;
          }).length
        });
      }

      // Company statistics
      const companyCounts = contactsData.reduce((acc, contact) => {
        const company = contact.company_name || 'Freelancer/Unknown';
        acc[company] = (acc[company] || 0) + 1;
        return acc;
      }, {});

      const companyStats = Object.entries(companyCounts)
        .map(([name, count]) => ({ name, count: Number(count) }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // House rent statistics
      const houseRentStats = {
        withRent: contactsData.filter(c => c.house_rent).length,
        withoutRent: contactsData.filter(c => !c.house_rent).length
      };

      // Status breakdown
      const statusBreakdown = {
        active: activeContacts,
        inactive: totalContacts - activeContacts
      };

      setAnalytics({
        totalContacts,
        activeContacts,
        blockedContacts,
        seriousContacts,
        totalSalaryPaid,
        totalSalaryPending,
        platformData,
        salaryRanges,
        monthlyTrends,
        companyStats,
        houseRentStats,
        statusBreakdown
      });

    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Contacts</p>
                <p className="text-3xl font-bold text-blue-600">{analytics.totalContacts}</p>
                <p className="text-xs text-gray-500">All platform contacts</p>
              </div>
              <Users className="h-12 w-12 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Contacts</p>
                <p className="text-3xl font-bold text-green-600">{analytics.activeContacts}</p>
                <p className="text-xs text-gray-500">Currently active</p>
              </div>
              <UserCheck className="h-12 w-12 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Blocked Contacts</p>
                <p className="text-3xl font-bold text-red-600">{analytics.blockedContacts}</p>
                <p className="text-xs text-gray-500">Blocked users</p>
              </div>
              <UserX className="h-12 w-12 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Serious Contacts</p>
                <p className="text-3xl font-bold text-purple-600">{analytics.seriousContacts}</p>
                <p className="text-xs text-gray-500">Potential leads</p>
              </div>
              <Target className="h-12 w-12 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Salary Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Salary Paid</p>
                <p className="text-3xl font-bold text-green-600">₨{analytics.totalSalaryPaid.toLocaleString()}</p>
                <p className="text-xs text-gray-500">Pakistani Rupees</p>
              </div>
              <DollarSign className="h-12 w-12 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Payments</p>
                <p className="text-3xl font-bold text-orange-600">₨{analytics.totalSalaryPending.toLocaleString()}</p>
                <p className="text-xs text-gray-500">Pakistani Rupees</p>
              </div>
              <Clock className="h-12 w-12 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Platform Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Platform Distribution</CardTitle>
            <CardDescription>Contacts across different platforms</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.platformData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name}: ${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analytics.platformData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Contact Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Status</CardTitle>
            <CardDescription>Active vs Inactive contacts</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Active', value: analytics.statusBreakdown.active },
                    { name: 'Inactive', value: analytics.statusBreakdown.inactive }
                  ]}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  <Cell fill="#10B981" />
                  <Cell fill="#EF4444" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Overview</CardTitle>
          <CardDescription>Contacts and salary additions over the last 6 months</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={analytics.monthlyTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Area 
                type="monotone" 
                dataKey="contacts" 
                stackId="1"
                stroke="#8884d8" 
                fill="#8884d8" 
                name="Contacts Added"
              />
              <Area 
                type="monotone" 
                dataKey="salaries" 
                stackId="2"
                stroke="#82ca9d" 
                fill="#82ca9d" 
                name="Salaries Added"
              />
              <Area 
                type="monotone" 
                dataKey="serious" 
                stackId="3"
                stroke="#ffc658" 
                fill="#ffc658" 
                name="Serious Contacts"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Salary Range Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Salary Distribution</CardTitle>
            <CardDescription>Contact salary package ranges (PKR)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.salaryRanges}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} contacts`, 'Count']} />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* House Rent Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>House Rent Analysis</CardTitle>
            <CardDescription>Contacts with vs without house rent benefits</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Home className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="font-semibold text-green-800">With House Rent</p>
                    <p className="text-sm text-green-600">Better compensation package</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">{analytics.houseRentStats.withRent}</p>
                  <p className="text-sm text-green-500">
                    {analytics.totalContacts > 0 ? 
                      `${((analytics.houseRentStats.withRent / analytics.totalContacts) * 100).toFixed(1)}%` : 
                      '0%'
                    }
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Building className="h-8 w-8 text-gray-600" />
                  <div>
                    <p className="font-semibold text-gray-800">Without House Rent</p>
                    <p className="text-sm text-gray-600">Standard package only</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-600">{analytics.houseRentStats.withoutRent}</p>
                  <p className="text-sm text-gray-500">
                    {analytics.totalContacts > 0 ? 
                      `${((analytics.houseRentStats.withoutRent / analytics.totalContacts) * 100).toFixed(1)}%` : 
                      '0%'
                    }
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Companies */}
      <Card>
        <CardHeader>
          <CardTitle>Top Companies</CardTitle>
          <CardDescription>Companies with most contacts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.companyStats.map((company, index) => (
              <div key={company.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                    index === 0 ? 'bg-yellow-500' :
                    index === 1 ? 'bg-gray-400' :
                    index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{company.name}</p>
                    <p className="text-sm text-gray-500">{company.count} contacts</p>
                  </div>
                </div>
                <Building className="h-5 w-5 text-gray-400" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsSection;
