
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Phone, MessageCircle, Calendar, Search, Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Contact {
  id: string;
  name: string;
  phone: string;
  last_message: string;
  message_count: number;
  chat_duration: string;
  status: 'Active' | 'Inactive';
  added_date: string;
}

const ContactsSection = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [newContact, setNewContact] = useState({ name: "", phone: "" });
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingContact, setEditingContact] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Contact>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setContacts(data || []);
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
    if (newContact.name && newContact.phone) {
      try {
        const { data, error } = await supabase
          .from('contacts')
          .insert([{
            name: newContact.name,
            phone: newContact.phone,
            last_message: "No messages yet",
            message_count: 0,
            chat_duration: "Just added",
            status: 'Active'
          }])
          .select()
          .single();

        if (error) throw error;

        setContacts([data, ...contacts]);
        setNewContact({ name: "", phone: "" });
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
      last_message: contact.last_message,
      message_count: contact.message_count,
      chat_duration: contact.chat_duration,
      status: contact.status
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
          last_message: editForm.last_message,
          message_count: editForm.message_count,
          chat_duration: editForm.chat_duration,
          status: editForm.status,
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
    contact.phone.includes(searchTerm)
  );

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
                WhatsApp Contacts Management
              </CardTitle>
              <CardDescription>
                Apne sare contacts ko manage kariye aur unki details track kariye
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
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
              <Button onClick={addContact} className="bg-green-600 hover:bg-green-700">
                Add Contact
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
              placeholder="Search contacts by name or phone..."
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
                          <Label htmlFor="edit-message-count">Message Count</Label>
                          <Input
                            id="edit-message-count"
                            type="number"
                            value={editForm.message_count || 0}
                            onChange={(e) => setEditForm({...editForm, message_count: parseInt(e.target.value) || 0})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit-chat-duration">Chat Duration</Label>
                          <Input
                            id="edit-chat-duration"
                            value={editForm.chat_duration || ''}
                            onChange={(e) => setEditForm({...editForm, chat_duration: e.target.value})}
                          />
                        </div>
                        <div className="md:col-span-2">
                          <Label htmlFor="edit-last-message">Last Message</Label>
                          <Input
                            id="edit-last-message"
                            value={editForm.last_message || ''}
                            onChange={(e) => setEditForm({...editForm, last_message: e.target.value})}
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
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{contact.name}</h3>
                        <Badge variant={contact.status === 'Active' ? 'default' : 'secondary'}>
                          {contact.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          {contact.phone}
                        </div>
                        <div className="flex items-center gap-2">
                          <MessageCircle className="h-4 w-4" />
                          {contact.message_count} messages
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Chat: {contact.chat_duration}
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Added: {contact.added_date}
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-gray-500 italic">
                        Last: "{contact.last_message}"
                      </p>
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
