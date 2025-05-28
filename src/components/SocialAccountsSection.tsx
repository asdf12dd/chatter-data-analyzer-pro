
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Instagram, TrendingUp, Plus, Trash2, Edit2 } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface SocialAccount {
  id: string;
  platform: 'Instagram' | 'TikTok';
  account_id: string;
  username: string;
  followers_count?: number;
  is_active: boolean;
  profile_id: string;
  created_at: string;
}

const SocialAccountsSection = () => {
  const { userProfile } = useAuth();
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [newAccount, setNewAccount] = useState({
    platform: 'Instagram' as 'Instagram' | 'TikTok',
    account_id: '',
    username: '',
    followers_count: 0
  });
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchSocialAccounts();
  }, []);

  const fetchSocialAccounts = async () => {
    if (!userProfile) return;

    try {
      const { data, error } = await (supabase as any)
        .from('social_accounts')
        .select('*')
        .eq('profile_id', userProfile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAccounts(data || []);
    } catch (error) {
      console.error('Error fetching social accounts:', error);
    }
  };

  const addAccount = async () => {
    if (!userProfile || !newAccount.account_id || !newAccount.username) {
      toast({
        title: "خرابی",
        description: "برائے کرم تمام فیلڈز بھریں",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await (supabase as any)
        .from('social_accounts')
        .insert({
          platform: newAccount.platform,
          account_id: newAccount.account_id,
          username: newAccount.username,
          followers_count: newAccount.followers_count || 0,
          is_active: true,
          profile_id: userProfile.id
        })
        .select()
        .single();

      if (error) throw error;

      setAccounts([data, ...accounts]);
      setNewAccount({
        platform: 'Instagram',
        account_id: '',
        username: '',
        followers_count: 0
      });

      toast({
        title: "کامیابی",
        description: "سوشل میڈیا اکاؤنٹ شامل کر دیا گیا",
      });
    } catch (error) {
      console.error('Error adding account:', error);
      toast({
        title: "خرابی",
        description: "اکاؤنٹ شامل کرنے میں خرابی",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteAccount = async (id: string) => {
    try {
      const { error } = await (supabase as any)
        .from('social_accounts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setAccounts(accounts.filter(acc => acc.id !== id));
      toast({
        title: "کامیابی",
        description: "اکاؤنٹ حذف کر دیا گیا",
      });
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        title: "خرابی",
        description: "اکاؤنٹ حذف کرنے میں خرابی",
        variant: "destructive"
      });
    }
  };

  const toggleAccountStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await (supabase as any)
        .from('social_accounts')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      setAccounts(accounts.map(acc => 
        acc.id === id ? { ...acc, is_active: !currentStatus } : acc
      ));

      toast({
        title: "کامیابی",
        description: "اکاؤنٹ کی حالت تبدیل کر دی گئی",
      });
    } catch (error) {
      console.error('Error updating account status:', error);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Instagram className="h-5 w-5 text-pink-500" />
            میرے سوشل میڈیا اکاؤنٹس
          </CardTitle>
          <CardDescription className="text-sm">
            اپنے Instagram اور TikTok اکاؤنٹس کا انتظام کریں
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Add New Account */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Plus className="h-4 w-4" />
            نیا اکاؤنٹ شامل کریں
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="platform" className="text-sm">پلیٹ فارم</Label>
              <select
                className="w-full mt-1 p-2 border rounded-md text-sm"
                value={newAccount.platform}
                onChange={(e) => setNewAccount({
                  ...newAccount,
                  platform: e.target.value as 'Instagram' | 'TikTok'
                })}
              >
                <option value="Instagram">Instagram</option>
                <option value="TikTok">TikTok</option>
              </select>
            </div>
            
            <div>
              <Label htmlFor="username" className="text-sm">یوزر نیم</Label>
              <Input
                id="username"
                placeholder="@username"
                value={newAccount.username}
                onChange={(e) => setNewAccount({
                  ...newAccount,
                  username: e.target.value
                })}
                className="text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="account_id" className="text-sm">اکاؤنٹ ID</Label>
              <Input
                id="account_id"
                placeholder="Account ID"
                value={newAccount.account_id}
                onChange={(e) => setNewAccount({
                  ...newAccount,
                  account_id: e.target.value
                })}
                className="text-sm"
              />
            </div>
            
            <div>
              <Label htmlFor="followers" className="text-sm">فالوورز</Label>
              <Input
                id="followers"
                type="number"
                placeholder="0"
                value={newAccount.followers_count || ''}
                onChange={(e) => setNewAccount({
                  ...newAccount,
                  followers_count: parseInt(e.target.value) || 0
                })}
                className="text-sm"
              />
            </div>
          </div>

          <Button 
            onClick={addAccount} 
            disabled={loading}
            className="w-full sm:w-auto"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            {loading ? 'شامل کر رہے ہیں...' : 'اکاؤنٹ شامل کریں'}
          </Button>
        </CardContent>
      </Card>

      {/* Accounts List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">آپ کے اکاؤنٹس ({accounts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {accounts.map((account) => (
              <div 
                key={account.id} 
                className="border rounded-lg p-3 sm:p-4 bg-gray-50 space-y-2"
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                  <div className="flex items-center gap-2">
                    {account.platform === 'Instagram' ? (
                      <Instagram className="h-5 w-5 text-pink-500" />
                    ) : (
                      <TrendingUp className="h-5 w-5 text-black" />
                    )}
                    <div>
                      <p className="font-semibold text-sm sm:text-base">{account.username}</p>
                      <p className="text-xs sm:text-sm text-gray-600">ID: {account.account_id}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge 
                      variant={account.is_active ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {account.is_active ? 'فعال' : 'غیر فعال'}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {account.followers_count?.toLocaleString()} فالوورز
                    </Badge>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-2 border-t">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleAccountStatus(account.id, account.is_active)}
                    className="text-xs"
                  >
                    {account.is_active ? 'غیر فعال کریں' : 'فعال کریں'}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteAccount(account.id)}
                    className="text-xs"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    حذف
                  </Button>
                </div>
              </div>
            ))}

            {accounts.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Instagram className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-sm sm:text-base">ابھی تک کوئی اکاؤنٹ شامل نہیں کیا گیا</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SocialAccountsSection;
