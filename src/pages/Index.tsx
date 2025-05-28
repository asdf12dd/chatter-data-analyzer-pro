
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageCircle, Users, UserX, DollarSign, Clock, TrendingUp, Phone, Calendar, Ban, LogOut, User, Bell } from 'lucide-react';
import ContactsSection from '../components/ContactsSection';
import BlockedUsersSection from '../components/BlockedUsersSection';
import SalarySection from '../components/SalarySection';
import AnalyticsSection from '../components/AnalyticsSection';
import ProfilesSection from '../components/ProfilesSection';
import OwnerDashboard from '../components/OwnerDashboard';
import ManagerSection from '../components/ManagerSection';
import SocialAccountsSection from '../components/SocialAccountsSection';
import NotificationBell from '../components/NotificationBell';
import ApprovalGuard from '../components/ApprovalGuard';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const { user, userProfile, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("contacts");
  const [stats, setStats] = useState({
    totalContacts: 0,
    blockedUsers: 0,
    monthlyEarnings: 0,
    todayEarnings: 0,
    avgChatDuration: "2.5",
    activeChats: 0
  });
  const [loading, setLoading] = useState(true);

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user && userProfile) {
      fetchStats();
    }
  }, [user, userProfile]);

  const fetchStats = async () => {
    if (!userProfile) return;
    
    try {
      const currentUserId = userProfile.id;
      
      // For Owner, get all data; for others, get only their data
      const isOwner = userProfile.role === 'Owner';
      
      // Fetch contacts count - always filter by current user unless owner
      let contactsQuery = supabase
        .from('contacts')
        .select('*', { count: 'exact', head: true });
      
      if (!isOwner) {
        contactsQuery = contactsQuery.eq('profile_id', currentUserId);
      }
      
      const { count: contactsCount } = await contactsQuery;

      // Fetch blocked users count
      let blockedQuery = supabase
        .from('blocked_users')
        .select('*', { count: 'exact', head: true });
      
      if (!isOwner) {
        blockedQuery = blockedQuery.eq('profile_id', currentUserId);
      }
      
      const { count: blockedCount } = await blockedQuery;

      // Fetch salary data for earnings
      let salaryQuery = supabase
        .from('salary_records')
        .select('base_salary, status');
      
      if (!isOwner) {
        salaryQuery = salaryQuery.eq('profile_id', currentUserId);
      }
      
      const { data: salaryData } = await salaryQuery;

      const monthlyEarnings = salaryData
        ?.filter(record => record.status === 'Paid')
        .reduce((sum, record) => sum + (record.base_salary || 0), 0) || 0;

      // Fetch today's earnings
      const today = new Date().toISOString().split('T')[0];
      let todayQuery = supabase
        .from('salary_records')
        .select('base_salary')
        .eq('status', 'Paid')
        .gte('updated_at', `${today}T00:00:00`)
        .lt('updated_at', `${today}T23:59:59`);
      
      if (!isOwner) {
        todayQuery = todayQuery.eq('profile_id', currentUserId);
      }
      
      const { data: todayPayments } = await todayQuery;

      const todayEarnings = todayPayments
        ?.reduce((sum, record) => sum + (record.base_salary || 0), 0) || 0;

      // Get active contacts count
      let activeQuery = supabase
        .from('contacts')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'Active');
      
      if (!isOwner) {
        activeQuery = activeQuery.eq('profile_id', currentUserId);
      }
      
      const { count: activeChatsCount } = await activeQuery;

      setStats({
        totalContacts: contactsCount || 0,
        blockedUsers: blockedCount || 0,
        monthlyEarnings: monthlyEarnings,
        todayEarnings: todayEarnings,
        avgChatDuration: "2.5",
        activeChats: activeChatsCount || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Show loading while authenticating
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // Don't render if no user (will redirect)
  if (!user || !userProfile) {
    return null;
  }

  const isOwner = userProfile.role === 'Owner';
  const isManager = userProfile.role === 'Manager';

  return (
    <ApprovalGuard>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <div className="max-w-7xl mx-auto">
          {/* Header with User Info */}
          <div className="mb-8 flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                WhatsApp Business Analytics
              </h1>
              <p className="text-lg text-gray-600">
                Welcome back, {userProfile.name}!
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={isOwner ? "default" : "secondary"}>
                  {userProfile.role}
                </Badge>
                {userProfile.department && (
                  <Badge variant="outline">
                    {userProfile.department}
                  </Badge>
                )}
                {userProfile.is_approved && (
                  <Badge className="bg-green-100 text-green-800">
                    Approved
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <NotificationBell />
              <div className="text-right">
                <p className="font-semibold">{userProfile.name}</p>
                <p className="text-sm text-gray-600">{userProfile.email}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={signOut}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
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
                    <p className="text-sm font-medium text-gray-600">Today's Earnings</p>
                    <p className="text-3xl font-bold text-blue-600">
                      ₹{loading ? "..." : stats.todayEarnings.toLocaleString()}
                    </p>
                  </div>
                  <TrendingUp className="h-12 w-12 text-blue-500" />
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
            <TabsList className={`grid w-full ${
              isOwner ? 'grid-cols-6' : 
              isManager ? 'grid-cols-5' : 
              'grid-cols-4'
            } bg-white shadow-sm`}>
              <TabsTrigger value="contacts" className="data-[state=active]:bg-green-500 data-[state=active]:text-white">
                Contacts
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
              {(isManager || isOwner) && (
                <TabsTrigger value="manager" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
                  Manager
                </TabsTrigger>
              )}
              {isOwner && (
                <TabsTrigger value="profiles" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                  Profiles
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="contacts" className="mt-6">
              <ContactsSection />
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

            {(isManager || isOwner) && (
              <TabsContent value="manager" className="mt-6">
                <ManagerSection />
              </TabsContent>
            )}

            {isOwner && (
              <TabsContent value="profiles" className="mt-6">
                <ProfilesSection />
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
    </ApprovalGuard>
  );
};

export default Index;
