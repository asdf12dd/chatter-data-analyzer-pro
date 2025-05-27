
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from 'recharts';
import { TrendingUp, Users, MessageCircle, DollarSign, Clock, Target, Building, Home } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const AnalyticsSection = () => {
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    totalContacts: 0,
    seriousContacts: 0,
    platformData: [],
    salaryRanges: [],
    monthlyTrends: [],
    companyStats: [],
    houseRentStats: { withRent: 0, withoutRent: 0 },
    recentActivity: []
  });

  useEffect(() => {
    fetchAnalytics();
  }, [userProfile]);

  const fetchAnalytics = async () => {
    try {
      let contactsQuery = supabase.from('contacts').select('*');
      
      // Filter by user profile for non-owners
      if (userProfile && userProfile.role !== 'Owner') {
        contactsQuery = contactsQuery.eq('profile_id', userProfile.id);
      }

      const { data: contacts, error } = await contactsQuery;
      if (error) throw error;

      const contactsData = contacts || [];

      // Calculate platform distribution
      const platformCounts = contactsData.reduce((acc, contact) => {
        const platform = contact.last_message || 'Unknown';
        acc[platform] = (acc[platform] || 0) + 1;
        return acc;
      }, {});

      const platformData = Object.entries(platformCounts).map(([name, value]) => ({
        name,
        value,
        percentage: ((value as number / contactsData.length) * 100).toFixed(1)
      }));

      // Calculate salary ranges
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

      // Calculate monthly trends (last 6 months)
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

        monthlyTrends.push({
          month: monthYear,
          contacts: monthContacts,
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
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // House rent statistics
      const houseRentStats = {
        withRent: contactsData.filter(c => c.house_rent).length,
        withoutRent: contactsData.filter(c => !c.house_rent).length
      };

      setAnalytics({
        totalContacts: contactsData.length,
        seriousContacts: contactsData.filter(c => c.is_serious).length,
        platformData,
        salaryRanges,
        monthlyTrends,
        companyStats,
        houseRentStats,
        recentActivity: contactsData.slice(0, 5)
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
      {/* KPI Cards */}
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
                <p className="text-sm font-medium text-gray-600">Serious Contacts</p>
                <p className="text-3xl font-bold text-green-600">{analytics.seriousContacts}</p>
                <p className="text-xs text-gray-500">
                  {analytics.totalContacts > 0 ? 
                    `${((analytics.seriousContacts / analytics.totalContacts) * 100).toFixed(1)}% of total` : 
                    '0% of total'
                  }
                </p>
              </div>
              <Target className="h-12 w-12 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">With House Rent</p>
                <p className="text-3xl font-bold text-purple-600">{analytics.houseRentStats.withRent}</p>
                <p className="text-xs text-gray-500">
                  {analytics.totalContacts > 0 ? 
                    `${((analytics.houseRentStats.withRent / analytics.totalContacts) * 100).toFixed(1)}% get house rent` : 
                    '0% get house rent'
                  }
                </p>
              </div>
              <Home className="h-12 w-12 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                <p className="text-3xl font-bold text-orange-600">
                  {analytics.totalContacts > 0 ? 
                    `${((analytics.seriousContacts / analytics.totalContacts) * 100).toFixed(1)}%` : 
                    '0%'
                  }
                </p>
                <p className="text-xs text-gray-500">Serious vs Total</p>
              </div>
              <TrendingUp className="h-12 w-12 text-orange-500" />
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

        {/* Salary Range Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Salary Distribution</CardTitle>
            <CardDescription>Contact salary package ranges</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.salaryRanges}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Growth Trends</CardTitle>
          <CardDescription>Monthly contact acquisition over the last 6 months</CardDescription>
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
                name="Total Contacts"
              />
              <Area 
                type="monotone" 
                dataKey="serious" 
                stackId="2"
                stroke="#82ca9d" 
                fill="#82ca9d" 
                name="Serious Contacts"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

        {/* House Rent vs No Rent */}
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

              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'With House Rent', value: analytics.houseRentStats.withRent },
                      { name: 'Without House Rent', value: analytics.houseRentStats.withoutRent }
                    ]}
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    <Cell fill="#10B981" />
                    <Cell fill="#6B7280" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsSection;
