
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { UserX, Search, Plus, Trash2, AlertTriangle, Clock, Edit, Save, X } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface BlockedUser {
  id: string;
  name: string;
  phone: string;
  reason: string;
  blocked_date: string;
  last_seen: string;
  message_count: number;
}

const BlockedUsersSection = () => {
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [newBlockedUser, setNewBlockedUser] = useState({ 
    name: "", 
    phone: "", 
    reason: "" 
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<BlockedUser>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlockedUsers();
  }, []);

  const fetchBlockedUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('blocked_users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setBlockedUsers(data || []);
    } catch (error) {
      console.error('Error fetching blocked users:', error);
      toast({
        title: "Error",
        description: "Failed to load blocked users",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addBlockedUser = async () => {
    if (newBlockedUser.name && newBlockedUser.phone && newBlockedUser.reason) {
      try {
        const { data, error } = await supabase
          .from('blocked_users')
          .insert([{
            name: newBlockedUser.name,
            phone: newBlockedUser.phone,
            reason: newBlockedUser.reason,
            last_seen: new Date().toISOString().split('T')[0],
            message_count: 0
          }])
          .select()
          .single();

        if (error) throw error;

        setBlockedUsers([data, ...blockedUsers]);
        setNewBlockedUser({ name: "", phone: "", reason: "" });
        setShowAddForm(false);
        toast({
          title: "User Blocked",
          description: `${newBlockedUser.name} has been added to blocked list`,
        });
      } catch (error) {
        console.error('Error blocking user:', error);
        toast({
          title: "Error",
          description: "Failed to block user",
          variant: "destructive"
        });
      }
    }
  };

  const startEdit = (user: BlockedUser) => {
    setEditingUser(user.id);
    setEditForm({
      name: user.name,
      phone: user.phone,
      reason: user.reason,
      message_count: user.message_count,
      last_seen: user.last_seen
    });
  };

  const saveEdit = async () => {
    if (!editingUser) return;

    try {
      const { error } = await supabase
        .from('blocked_users')
        .update({
          name: editForm.name,
          phone: editForm.phone,
          reason: editForm.reason,
          message_count: editForm.message_count,
          last_seen: editForm.last_seen
        })
        .eq('id', editingUser);

      if (error) throw error;

      setBlockedUsers(blockedUsers.map(user => 
        user.id === editingUser 
          ? { ...user, ...editForm } as BlockedUser
          : user
      ));

      setEditingUser(null);
      setEditForm({});
      toast({
        title: "User Updated",
        description: "Blocked user details have been updated successfully",
      });
    } catch (error) {
      console.error('Error updating blocked user:', error);
      toast({
        title: "Error",
        description: "Failed to update blocked user",
        variant: "destructive"
      });
    }
  };

  const cancelEdit = () => {
    setEditingUser(null);
    setEditForm({});
  };

  const unblockUser = async (id: string) => {
    try {
      const { error } = await supabase
        .from('blocked_users')
        .delete()
        .eq('id', id);

      if (error) throw error;

      const user = blockedUsers.find(u => u.id === id);
      setBlockedUsers(blockedUsers.filter(user => user.id !== id));
      toast({
        title: "User Unblocked",
        description: `${user?.name} has been removed from blocked list`,
      });
    } catch (error) {
      console.error('Error unblocking user:', error);
      toast({
        title: "Error",
        description: "Failed to unblock user",
        variant: "destructive"
      });
    }
  };

  const filteredUsers = blockedUsers.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone.includes(searchTerm) ||
    user.reason.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const reasonColors = {
    "Spam messages": "bg-red-100 text-red-800",
    "Abusive language": "bg-orange-100 text-orange-800",
    "Fake profile/scam": "bg-purple-100 text-purple-800",
    "Other": "bg-gray-100 text-gray-800"
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading blocked users...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Blocked Users</p>
              <p className="text-3xl font-bold text-red-600">{blockedUsers.length}</p>
            </div>
            <UserX className="h-12 w-12 text-red-500" />
          </div>
        </CardContent>
      </Card>

      {/* Header Section */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <UserX className="h-5 w-5" />
                Blocked Users Management
              </CardTitle>
              <CardDescription>
                Jo users block kiye hain unka record aur management
              </CardDescription>
            </div>
            <Button 
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-red-600 hover:bg-red-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Block User
            </Button>
          </div>
        </CardHeader>

        {/* Add Blocked User Form */}
        {showAddForm && (
          <CardContent className="border-t">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <Label htmlFor="block-name">Name</Label>
                <Input
                  id="block-name"
                  placeholder="User ka naam"
                  value={newBlockedUser.name}
                  onChange={(e) => setNewBlockedUser({...newBlockedUser, name: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="block-phone">Phone Number</Label>
                <Input
                  id="block-phone"
                  placeholder="+92 300 1234567"
                  value={newBlockedUser.phone}
                  onChange={(e) => setNewBlockedUser({...newBlockedUser, phone: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="block-reason">Reason</Label>
                <Input
                  id="block-reason"
                  placeholder="Block karne ki wajah"
                  value={newBlockedUser.reason}
                  onChange={(e) => setNewBlockedUser({...newBlockedUser, reason: e.target.value})}
                />
              </div>
              <Button onClick={addBlockedUser} className="bg-red-600 hover:bg-red-700">
                Block User
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search blocked users by name, phone, or reason..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Blocked Users List */}
      <div className="grid gap-4">
        {filteredUsers.map((user) => (
          <Card key={user.id} className="hover:shadow-md transition-shadow border-l-4 border-l-red-500">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div className="flex-1">
                  {editingUser === user.id ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="edit-name">Name</Label>
                          <Input
                            id="edit-name"
                            value={editForm.name || ''}
                            onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit-phone">Phone</Label>
                          <Input
                            id="edit-phone"
                            value={editForm.phone || ''}
                            onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit-reason">Reason</Label>
                          <Input
                            id="edit-reason"
                            value={editForm.reason || ''}
                            onChange={(e) => setEditForm({...editForm, reason: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit-message-count">Message Count</Label>
                          <Input
                            id="edit-message-count"
                            type="number"
                            value={editForm.message_count || 0}
                            onChange={(e) => setEditForm({...editForm, message_count: parseInt(e.target.value) || 0})}
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={saveEdit} size="sm" className="bg-green-600 hover:bg-green-700">
                          <Save className="h-4 w-4 mr-2" />
                          Save
                        </Button>
                        <Button onClick={cancelEdit} variant="outline" size="sm">
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-3 mb-3">
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                        <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
                        <Badge className={reasonColors[user.reason as keyof typeof reasonColors] || reasonColors["Other"]}>
                          {user.reason}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Phone:</span>
                          {user.phone}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Messages:</span>
                          {user.message_count}
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span className="font-medium">Blocked:</span>
                          {user.blocked_date}
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span className="font-medium">Last Seen:</span>
                          {user.last_seen}
                        </div>
                      </div>
                    </>
                  )}
                </div>
                
                {editingUser !== user.id && (
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => startEdit(user)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => unblockUser(user.id)}
                      className="text-green-600 border-green-300 hover:bg-green-50"
                    >
                      Unblock
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => unblockUser(user.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <UserX className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No Blocked Users Found</h3>
            <p className="text-gray-500">Try adjusting your search or the list is empty</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BlockedUsersSection;
