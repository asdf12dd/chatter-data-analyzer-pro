import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Phone, MessageCircle, Calendar, Search, Plus, Edit, Trash2, Save, X, Building, DollarSign, Home } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Contact {
  id: string;
  name: string;
  phone: string;
  platform: 'WhatsApp' | 'Instagram' | 'TikTok';
  chat_duration: string;
  status: 'Active' | 'Inactive';
  added_date: string;
  salary_package: string;
  house_rent: boolean;
  is_serious: boolean;
  company_name: string;
  designation: string;
}

const ContactsSection = () => {
  const { userProfile } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [newContact, setNewContact] = useState({ 
    name: "", 
    phone: "", 
    platform: "",
    chat_duration: "",
    salary_package: "",
    house_rent: false,
    is_serious: true,
    company_name: "",
    designation: ""
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingContact, setEditingContact] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Contact>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      let query = supabase
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: false });

      // Filter by user profile for non-owners
      if (userProfile && userProfile.role !== 'Owner') {
        query = query.eq('profile_id', userProfile.id);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Type cast the data to match our Contact interface
      const typedContacts: Contact[] = (data || []).map(contact => ({
        id: contact.id,
        name: contact.name,
        phone: contact.phone,
        platform: contact.last_message as 'WhatsApp' | 'Instagram' | 'TikTok' || 'WhatsApp',
        chat_duration: contact.chat_duration || 'Just added',
        status: contact.status as 'Active' | 'Inactive',
        added_date: contact.added_date,
        salary_package: contact.salary_package || '',
        house_rent: contact.house_rent || false,
        is_serious: contact.is_serious !== undefined ? contact.is_serious : true,
        company_name: contact.company_name || '',
        designation: contact.designation || ''
      }));

      setContacts(typedContacts);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      toast({
        title: "Error",
        description: "Failed to load contacts",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addContact = async () => {
    if (newContact.name && newContact.phone && newContact.platform && newContact.chat_duration) {
      try {
        const { data, error } = await supabase
          .from('contacts')
          .insert([{
            name: newContact.name,
            phone: newContact.phone,
            last_message: newContact.platform,
            message_count: 0,
            chat_duration: newContact.chat_duration,
            status: 'Active',
            profile_id: userProfile?.id,
            salary_package: newContact.salary_package,
            house_rent: newContact.house_rent,
            is_serious: newContact.is_serious,
            company_name: newContact.company_name,
            designation: newContact.designation
          }])
          .select()
          .single();

        if (error) throw error;

        const typedContact: Contact = {
          id: data.id,
          name: data.name,
          phone: data.phone,
          platform: data.last_message as 'WhatsApp' | 'Instagram' | 'TikTok',
          chat_duration: data.chat_duration,
          status: data.status as 'Active' | 'Inactive',
          added_date: data.added_date,
          salary_package: data.salary_package || '',
          house_rent: data.house_rent || false,
          is_serious: data.is_serious !== undefined ? data.is_serious : true,
          company_name: data.company_name || '',
          designation: data.designation || ''
        };

        setContacts([typedContact, ...contacts]);
        setNewContact({ 
          name: "", 
          phone: "", 
          platform: "", 
          chat_duration: "",
          salary_package: "",
          house_rent: false,
          is_serious: true,
          company_name: "",
          designation: ""
        });
        setShowAddForm(false);
        toast({
          title: "Contact Added",
          description: `${newContact.name} successfully added to contacts`,
        });
      } catch (error) {
        console.error('Error adding contact:', error);
        toast({
          title: "Error",
          description: "Failed to add contact",
          variant: "destructive"
        });
      }
    }
  };

  const startEdit = (contact: Contact) => {
    setEditingContact(contact.id);
    setEditForm({
      name: contact.name,
      phone: contact.phone,
      platform: contact.platform,
      chat_duration: contact.chat_duration,
      status: contact.status,
      salary_package: contact.salary_package,
      house_rent: contact.house_rent,
      is_serious: contact.is_serious,
      company_name: contact.company_name,
      designation: contact.designation
    });
  };

  const saveEdit = async () => {
    if (!editingContact) return;

    try {
      const { error } = await supabase
        .from('contacts')
        .update({
          name: editForm.name,
          phone: editForm.phone,
          last_message: editForm.platform,
          chat_duration: editForm.chat_duration,
          status: editForm.status,
          salary_package: editForm.salary_package,
          house_rent: editForm.house_rent,
          is_serious: editForm.is_serious,
          company_name: editForm.company_name,
          designation: editForm.designation,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingContact);

      if (error) throw error;

      setContacts(contacts.map(contact => 
        contact.id === editingContact 
          ? { ...contact, ...editForm } as Contact
          : contact
      ));

      setEditingContact(null);
      setEditForm({});
      toast({
        title: "Contact Updated",
        description: "Contact details have been updated successfully",
      });
    } catch (error) {
      console.error('Error updating contact:', error);
      toast({
        title: "Error",
        description: "Failed to update contact",
        variant: "destructive"
      });
    }
  };

  const cancelEdit = () => {
    setEditingContact(null);
    setEditForm({});
  };

  const deleteContact = async (id: string) => {
    try {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setContacts(contacts.filter(contact => contact.id !== id));
      toast({
        title: "Contact Deleted",
        description: "Contact has been removed from your list",
      });
    } catch (error) {
      console.error('Error deleting contact:', error);
      toast({
        title: "Error",
        description: "Failed to delete contact",
        variant: "destructive"
      });
    }
  };

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.phone.includes(searchTerm) ||
    contact.company_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const platformColors = {
    'WhatsApp': 'bg-green-100 text-green-800',
    'Instagram': 'bg-pink-100 text-pink-800',
    'TikTok': 'bg-black text-white'
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading contacts...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Contact Management
              </CardTitle>
              <CardDescription>
                Apne sare contacts ko manage kariye with detailed information
              </CardDescription>
            </div>
            <Button 
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Contact
            </Button>
          </div>
        </CardHeader>

        {/* Add Contact Form */}
        {showAddForm && (
          <CardContent className="border-t">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="Contact ka naam"
                  value={newContact.name}
                  onChange={(e) => setNewContact({...newContact, name: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  placeholder="+92 300 1234567"
                  value={newContact.phone}
                  onChange={(e) => setNewContact({...newContact, phone: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="platform">Platform</Label>
                <Select value={newContact.platform} onValueChange={(value) => setNewContact({...newContact, platform: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                    <SelectItem value="Instagram">Instagram</SelectItem>
                    <SelectItem value="TikTok">TikTok</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="chat-duration">Chat Duration</Label>
                <Input
                  id="chat-duration"
                  placeholder="2 days, 1 week etc"
                  value={newContact.chat_duration}
                  onChange={(e) => setNewContact({...newContact, chat_duration: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="company">Company Name</Label>
                <Input
                  id="company"
                  placeholder="Company name"
                  value={newContact.company_name}
                  onChange={(e) => setNewContact({...newContact, company_name: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="designation">Designation</Label>
                <Input
                  id="designation"
                  placeholder="Job title"
                  value={newContact.designation}
                  onChange={(e) => setNewContact({...newContact, designation: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="salary">Salary Package</Label>
                <Input
                  id="salary"
                  placeholder="₹50,000 per month"
                  value={newContact.salary_package}
                  onChange={(e) => setNewContact({...newContact, salary_package: e.target.value})}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="house-rent"
                  checked={newContact.house_rent}
                  onCheckedChange={(checked) => setNewContact({...newContact, house_rent: checked})}
                />
                <Label htmlFor="house-rent">House Rent Provided</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="serious"
                  checked={newContact.is_serious}
                  onCheckedChange={(checked) => setNewContact({...newContact, is_serious: checked})}
                />
                <Label htmlFor="serious">Serious Contact</Label>
              </div>
            </div>
            <Button onClick={addContact} className="bg-green-600 hover:bg-green-700">
              Add Contact
            </Button>
          </CardContent>
        )}
      </Card>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search contacts by name, phone, or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Contacts List */}
      <div className="grid gap-4">
        {filteredContacts.map((contact) => (
          <Card key={contact.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div className="flex-1">
                  {editingContact === contact.id ? (
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
                          <Label htmlFor="edit-company">Company</Label>
                          <Input
                            id="edit-company"
                            value={editForm.company_name || ''}
                            onChange={(e) => setEditForm({...editForm, company_name: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit-designation">Designation</Label>
                          <Input
                            id="edit-designation"
                            value={editForm.designation || ''}
                            onChange={(e) => setEditForm({...editForm, designation: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit-salary">Salary Package</Label>
                          <Input
                            id="edit-salary"
                            value={editForm.salary_package || ''}
                            onChange={(e) => setEditForm({...editForm, salary_package: e.target.value})}
                          />
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={editForm.house_rent || false}
                              onCheckedChange={(checked) => setEditForm({...editForm, house_rent: checked})}
                            />
                            <Label>House Rent</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={editForm.is_serious !== undefined ? editForm.is_serious : true}
                              onCheckedChange={(checked) => setEditForm({...editForm, is_serious: checked})}
                            />
                            <Label>Serious</Label>
                          </div>
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
                        <h3 className="text-lg font-semibold">{contact.name}</h3>
                        <Badge className={platformColors[contact.platform]}>
                          {contact.platform}
                        </Badge>
                        <Badge variant={contact.status === 'Active' ? 'default' : 'secondary'}>
                          {contact.status}
                        </Badge>
                        {contact.is_serious ? (
                          <Badge className="bg-green-100 text-green-800">Serious</Badge>
                        ) : (
                          <Badge className="bg-yellow-100 text-yellow-800">Non-Serious</Badge>
                        )}
                        {contact.house_rent && (
                          <Badge className="bg-blue-100 text-blue-800">
                            <Home className="h-3 w-3 mr-1" />
                            House Rent
                          </Badge>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          {contact.phone}
                        </div>
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4" />
                          {contact.company_name || 'No company'}
                        </div>
                        <div className="flex items-center gap-2">
                          <MessageCircle className="h-4 w-4" />
                          {contact.designation || 'No designation'}
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          {contact.salary_package || 'No salary info'}
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Chat: {contact.chat_duration}
                        </div>
                      </div>
                    </>
                  )}
                </div>
                
                {editingContact !== contact.id && (
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => startEdit(contact)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => deleteContact(contact.id)}
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

      {filteredContacts.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Phone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No Contacts Found</h3>
            <p className="text-gray-500">Try adjusting your search or add new contacts</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ContactsSection;
