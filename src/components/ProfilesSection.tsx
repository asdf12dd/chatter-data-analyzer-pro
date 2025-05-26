
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Plus, Edit, Trash2, Save, X, Search, Users, Building } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  is_active: boolean;
  created_at: string;
}

const ProfilesSection = () => {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [newProfile, setNewProfile] = useState({
    name: "",
    email: "",
    phone: "",
    role: "Employee",
    department: ""
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProfile, setEditingProfile] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<UserProfile>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error('Error fetching profiles:', error);
      toast({
        title: "Error",
        description: "Failed to load profiles",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addProfile = async () => {
    if (newProfile.name && newProfile.email && newProfile.role) {
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .insert([{
            name: newProfile.name,
            email: newProfile.email,
            phone: newProfile.phone,
            role: newProfile.role,
            department: newProfile.department
          }])
          .select()
          .single();

        if (error) throw error;

        setProfiles([data, ...profiles]);
        setNewProfile({ name: "", email: "", phone: "", role: "Employee", department: "" });
        setShowAddForm(false);
        toast({
          title: "Profile Added",
          description: `${newProfile.name} successfully added to profiles`,
        });
      } catch (error) {
        console.error('Error adding profile:', error);
        toast({
          title: "Error",
          description: "Failed to add profile",
          variant: "destructive"
        });
      }
    }
  };

  const startEdit = (profile: UserProfile) => {
    setEditingProfile(profile.id);
    setEditForm({
      name: profile.name,
      email: profile.email,
      phone: profile.phone,
      role: profile.role,
      department: profile.department,
      is_active: profile.is_active
    });
  };

  const saveEdit = async () => {
    if (!editingProfile) return;

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          name: editForm.name,
          email: editForm.email,
          phone: editForm.phone,
          role: editForm.role,
          department: editForm.department,
          is_active: editForm.is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingProfile);

      if (error) throw error;

      setProfiles(profiles.map(profile => 
        profile.id === editingProfile 
          ? { ...profile, ...editForm } as UserProfile
          : profile
      ));

      setEditingProfile(null);
      setEditForm({});
      toast({
        title: "Profile Updated",
        description: "Profile details have been updated successfully",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      });
    }
  };

  const cancelEdit = () => {
    setEditingProfile(null);
    setEditForm({});
  };

  const deleteProfile = async (id: string) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setProfiles(profiles.filter(profile => profile.id !== id));
      toast({
        title: "Profile Deleted",
        description: "Profile has been removed",
      });
    } catch (error) {
      console.error('Error deleting profile:', error);
      toast({
        title: "Error",
        description: "Failed to delete profile",
        variant: "destructive"
      });
    }
  };

  const filteredProfiles = profiles.filter(profile =>
    profile.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profile.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profile.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const roleColors = {
    'Owner': 'bg-purple-100 text-purple-800',
    'Manager': 'bg-blue-100 text-blue-800',
    'Employee': 'bg-green-100 text-green-800'
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading profiles...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Profiles</p>
                <p className="text-3xl font-bold text-blue-600">{profiles.length}</p>
              </div>
              <Users className="h-12 w-12 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-3xl font-bold text-green-600">
                  {profiles.filter(p => p.is_active).length}
                </p>
              </div>
              <User className="h-12 w-12 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Departments</p>
                <p className="text-3xl font-bold text-purple-600">
                  {new Set(profiles.map(p => p.department).filter(Boolean)).size}
                </p>
              </div>
              <Building className="h-12 w-12 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Header Section */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                User Profiles Management
              </CardTitle>
              <CardDescription>
                Manage team members and their roles
              </CardDescription>
            </div>
            <Button 
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Profile
            </Button>
          </div>
        </CardHeader>

        {/* Add Profile Form */}
        {showAddForm && (
          <CardContent className="border-t">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
              <div>
                <Label htmlFor="profile-name">Name</Label>
                <Input
                  id="profile-name"
                  placeholder="Full Name"
                  value={newProfile.name}
                  onChange={(e) => setNewProfile({...newProfile, name: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="profile-email">Email</Label>
                <Input
                  id="profile-email"
                  type="email"
                  placeholder="email@example.com"
                  value={newProfile.email}
                  onChange={(e) => setNewProfile({...newProfile, email: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="profile-phone">Phone</Label>
                <Input
                  id="profile-phone"
                  placeholder="+92 300 1234567"
                  value={newProfile.phone}
                  onChange={(e) => setNewProfile({...newProfile, phone: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="profile-role">Role</Label>
                <Select value={newProfile.role} onValueChange={(value) => setNewProfile({...newProfile, role: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Owner">Owner</SelectItem>
                    <SelectItem value="Manager">Manager</SelectItem>
                    <SelectItem value="Employee">Employee</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="profile-department">Department</Label>
                <Input
                  id="profile-department"
                  placeholder="Department"
                  value={newProfile.department}
                  onChange={(e) => setNewProfile({...newProfile, department: e.target.value})}
                />
              </div>
            </div>
            <div className="mt-4">
              <Button onClick={addProfile} className="bg-blue-600 hover:bg-blue-700">
                Add Profile
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
              placeholder="Search profiles by name, email, or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Profiles List */}
      <div className="grid gap-4">
        {filteredProfiles.map((profile) => (
          <Card key={profile.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div className="flex-1">
                  {editingProfile === profile.id ? (
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
                          <Label htmlFor="edit-email">Email</Label>
                          <Input
                            id="edit-email"
                            value={editForm.email || ''}
                            onChange={(e) => setEditForm({...editForm, email: e.target.value})}
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
                          <Label htmlFor="edit-role">Role</Label>
                          <Select value={editForm.role} onValueChange={(value) => setEditForm({...editForm, role: value})}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Owner">Owner</SelectItem>
                              <SelectItem value="Manager">Manager</SelectItem>
                              <SelectItem value="Employee">Employee</SelectItem>
                            </SelectContent>
                          </Select>
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
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{profile.name}</h3>
                        <Badge className={roleColors[profile.role as keyof typeof roleColors] || 'bg-gray-100 text-gray-800'}>
                          {profile.role}
                        </Badge>
                        <Badge variant={profile.is_active ? 'default' : 'secondary'}>
                          {profile.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Email:</span> {profile.email}
                        </div>
                        <div>
                          <span className="font-medium">Phone:</span> {profile.phone}
                        </div>
                        <div>
                          <span className="font-medium">Department:</span> {profile.department}
                        </div>
                      </div>
                    </>
                  )}
                </div>
                
                {editingProfile !== profile.id && (
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => startEdit(profile)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => deleteProfile(profile.id)}
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

      {filteredProfiles.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No Profiles Found</h3>
            <p className="text-gray-500">Try adjusting your search or add new profiles</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProfilesSection;
