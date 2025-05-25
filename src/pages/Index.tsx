
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MessageCircle, Users, UserX, DollarSign, Clock, TrendingUp, Phone, Calendar, Ban } from 'lucide-react';
import ContactsSection from '../components/ContactsSection';
import MessagesSection from '../components/MessagesSection';
import BlockedUsersSection from '../components/BlockedUsersSection';
import SalarySection from '../components/SalarySection';
import AnalyticsSection from '../components/AnalyticsSection';
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [activeTab, setActiveTab] = useState("contacts");
  const [stats, setStats] = useState({
    totalContacts: 0,
    totalMessages: 0,
    blockedUsers: 0,
    monthlyEarnings: 0,
    avgChatDuration: "2.5",
    activeChats: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch contacts count
      const { count: contactsCount } = await supabase
        .from('contacts')
        .select('*', { count: 'exact', head: true });

      // Fetch blocked users count
      const { count: blockedCount } = await supabase
        .from('blocked_users')
        .select('*', { count: 'exact', head: true });

      // Fetch total salary payments
      const { data: salaryData } = await supabase
        .from('salary_records')
        .select('total_salary, status');

      const monthlyEarnings = salaryData
        ?.filter(record => record.status === 'Paid')
        .reduce((sum, record) => sum + (record.total_salary || 0), 0) || 0;

      // Get active contacts count
      const { count: activeChatsCount } = await supabase
        .from('contacts')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'Active');

      setStats({
        totalContacts: contactsCount || 0,
        totalMessages: 0, // This would be calculated from messages table
        blockedUsers: blockedCount || 0,
        monthlyEarnings: monthlyEarnings,
        avgChatDuration: "2.5",
        activeChats: activeChatsCount || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            WhatsApp Business Analytics
          </h1>
          <p className="text-lg text-gray-600">
            Apne WhatsApp business ko track aur manage kariye - Ab Supabase ke saath!
          </p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Contacts</p>
                  <p className="text-3xl font-bold text-green-600">
                    {loading ? "..." : stats.totalContacts}
                  </p>
                </div>
                <Users className="h-12 w-12 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Messages</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {loading ? "..." : stats.totalMessages}
                  </p>
                </div>
                <MessageCircle className="h-12 w-12 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Blocked Users</p>
                  <p className="text-3xl font-bold text-red-600">
                    {loading ? "..." : stats.blockedUsers}
                  </p>
                </div>
                <UserX className="h-12 w-12 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Monthly Earnings</p>
                  <p className="text-3xl font-bold text-emerald-600">
                    ₹{loading ? "..." : stats.monthlyEarnings.toLocaleString()}
                  </p>
                </div>
                <DollarSign className="h-12 w-12 text-emerald-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Chat Duration</p>
                  <p className="text-3xl font-bold text-purple-600">{stats.avgChatDuration} hrs</p>
                </div>
                <Clock className="h-12 w-12 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Chats</p>
                  <p className="text-3xl font-bold text-orange-600">
                    {loading ? "..." : stats.activeChats}
                  </p>
                </div>
                <TrendingUp className="h-12 w-12 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-white shadow-sm">
            <TabsTrigger value="contacts" className="data-[state=active]:bg-green-500 data-[state=active]:text-white">
              Contacts
            </TabsTrigger>
            <TabsTrigger value="messages" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              Messages
            </TabsTrigger>
            <TabsTrigger value="blocked" className="data-[state=active]:bg-red-500 data-[state=active]:text-white">
              Blocked
            </TabsTrigger>
            <TabsTrigger value="salary" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
              Salary
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white">
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="contacts" className="mt-6">
            <ContactsSection />
          </TabsContent>

          <TabsContent value="messages" className="mt-6">
            <MessagesSection />
          </TabsContent>

          <TabsContent value="blocked" className="mt-6">
            <BlockedUsersSection />
          </TabsContent>

          <TabsContent value="salary" className="mt-6">
            <SalarySection />
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <AnalyticsSection />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
