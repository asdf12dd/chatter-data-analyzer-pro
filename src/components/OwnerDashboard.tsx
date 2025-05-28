
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Users, DollarSign, MessageCircle, UserX, Building, TrendingUp, Instagram } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";

interface SocialAccount {
  id: string;
  platform: 'Instagram' | 'TikTok';
  username: string;
  email?: string;
  followers_count?: number;
  is_active: boolean;
}

interface ProfileData {
  id: string;
  name: string;
  role: string;
  department: string;
  is_active: boolean;
  contacts_count: number;
  blocked_users_count: number;
  total_earnings: number;
  pending_earnings: number;
  social_accounts: SocialAccount[];
  social_accounts_count: number;
}

const OwnerDashboard = () => {
  const [profilesData, setProfilesData] = useState<ProfileData[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfilesData();
  }, []);

  const fetchProfilesData = async () => {
    try {
      // Fetch all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select('*');

      if (profilesError) throw profilesError;

      // Fetch data for each profile
      const profilesWithData = await Promise.all(
        (profiles || []).map(async (profile) => {
          // Get contacts count
          const { count: contactsCount } = await supabase
            .from('contacts')
            .select('*', { count: 'exact', head: true })
            .eq('profile_id', profile.id);

          // Get blocked users count
          const { count: blockedCount } = await supabase
            .from('blocked_users')
            .select('*', { count: 'exact', head: true })
            .eq('profile_id', profile.id);

          // Get salary data
          const { data: salaryData } = await supabase
            .from('salary_records')
            .select('base_salary, status')
            .eq('profile_id', profile.id);

          // Get social media accounts
          const { data: socialAccountsData } = await supabase
            .from('social_accounts')
            .select('*')
            .eq('profile_id', profile.id);

          const totalEarnings = salaryData
            ?.filter(record => record.status === 'Paid')
            .reduce((sum, record) => sum + (record.base_salary || 0), 0) || 0;

          const pendingEarnings = salaryData
            ?.filter(record => record.status === 'Pending')
            .reduce((sum, record) => sum + (record.base_salary || 0), 0) || 0;

          // Cast social accounts platform to correct type
          const typedSocialAccounts = socialAccountsData?.map(account => ({
            ...account,
            platform: account.platform as 'Instagram' | 'TikTok'
          })) || [];

          return {
            id: profile.id,
            name: profile.name,
            role: profile.role,
            department: profile.department,
            is_active: profile.is_active,
            contacts_count: contactsCount || 0,
            blocked_users_count: blockedCount || 0,
            total_earnings: totalEarnings,
            pending_earnings: pendingEarnings,
            social_accounts: typedSocialAccounts,
            social_accounts_count: typedSocialAccounts.length
          };
        })
      );

      setProfilesData(profilesWithData);
    } catch (error) {
      console.error('Error fetching profiles data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProfiles = selectedProfile === "all" 
    ? profilesData 
    : profilesData.filter(profile => profile.id === selectedProfile);

  const totalStats = profilesData.reduce(
    (acc, profile) => ({
      totalContacts: acc.totalContacts + profile.contacts_count,
      totalBlocked: acc.totalBlocked + profile.blocked_users_count,
      totalEarnings: acc.totalEarnings + profile.total_earnings,
      totalPending: acc.totalPending + profile.pending_earnings,
      totalSocialAccounts: acc.totalSocialAccounts + profile.social_accounts_count
    }),
    { totalContacts: 0, totalBlocked: 0, totalEarnings: 0, totalPending: 0, totalSocialAccounts: 0 }
  );

  const roleColors = {
    'Owner': 'bg-purple-100 text-purple-800',
    'Manager': 'bg-blue-100 text-blue-800',
    'Employee': 'bg-green-100 text-green-800'
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading owner dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Owner Dashboard
        </h1>
        <p className="text-lg text-gray-600">
          Complete overview of all team members and their performance
        </p>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Contacts</p>
                <p className="text-3xl font-bold text-green-600">{totalStats.totalContacts}</p>
              </div>
              <Users className="h-12 w-12 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Blocked</p>
                <p className="text-3xl font-bold text-red-600">{totalStats.totalBlocked}</p>
              </div>
              <UserX className="h-12 w-12 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                <p className="text-3xl font-bold text-emerald-600">₹{totalStats.totalEarnings.toLocaleString()}</p>
              </div>
              <DollarSign className="h-12 w-12 text-emerald-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Payments</p>
                <p className="text-3xl font-bold text-yellow-600">₹{totalStats.totalPending.toLocaleString()}</p>
              </div>
              <TrendingUp className="h-12 w-12 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Social Accounts</p>
                <p className="text-3xl font-bold text-pink-600">{totalStats.totalSocialAccounts}</p>
              </div>
              <Instagram className="h-12 w-12 text-pink-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Section */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Team Performance Overview
              </CardTitle>
              <CardDescription>
                Individual performance metrics for each team member
              </CardDescription>
            </div>
            <div className="w-full sm:w-auto">
              <Select value={selectedProfile} onValueChange={setSelectedProfile}>
                <SelectTrigger className="w-full sm:w-[250px]">
                  <SelectValue placeholder="Select profile" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Profiles</SelectItem>
                  {profilesData.map((profile) => (
                    <SelectItem key={profile.id} value={profile.id}>
                      {profile.name} ({profile.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Profiles Data */}
      <div className="grid gap-6">
        {filteredProfiles.map((profile) => (
          <Card key={profile.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <User className="h-6 w-6 text-gray-500" />
                  <div>
                    <h3 className="text-xl font-semibold">{profile.name}</h3>
                    <p className="text-sm text-gray-600">{profile.department}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge className={roleColors[profile.role as keyof typeof roleColors] || 'bg-gray-100 text-gray-800'}>
                    {profile.role}
                  </Badge>
                  <Badge variant={profile.is_active ? 'default' : 'secondary'}>
                    {profile.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
                <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                  <Users className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Contacts</p>
                    <p className="text-2xl font-bold text-green-600">{profile.contacts_count}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg">
                  <UserX className="h-8 w-8 text-red-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Blocked Users</p>
                    <p className="text-2xl font-bold text-red-600">{profile.blocked_users_count}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-lg">
                  <DollarSign className="h-8 w-8 text-emerald-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                    <p className="text-2xl font-bold text-emerald-600">₹{profile.total_earnings.toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-yellow-50 rounded-lg">
                  <TrendingUp className="h-8 w-8 text-yellow-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending</p>
                    <p className="text-2xl font-bold text-yellow-600">₹{profile.pending_earnings.toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-pink-50 rounded-lg">
                  <Instagram className="h-8 w-8 text-pink-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Social Accounts</p>
                    <p className="text-2xl font-bold text-pink-600">{profile.social_accounts_count}</p>
                  </div>
                </div>
              </div>

              {/* Social Media Accounts Details */}
              {profile.social_accounts.length > 0 && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Instagram className="h-4 w-4" />
                    Social Media Accounts
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {profile.social_accounts.map((account) => (
                      <div key={account.id} className="bg-white p-3 rounded border">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">{account.platform}</p>
                            <p className="text-sm text-gray-600">@{account.username}</p>
                            {account.email && (
                              <p className="text-xs text-gray-500">{account.email}</p>
                            )}
                          </div>
                          <Badge variant={account.is_active ? 'default' : 'secondary'} className="text-xs">
                            {account.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProfiles.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No Profiles Found</h3>
            <p className="text-gray-500">No profiles match the selected criteria</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default OwnerDashboard;
