
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Phone, MessageCircle, Calendar, Search, Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from "@/hooks/use-toast";

interface Contact {
  id: number;
  name: string;
  phone: string;
  lastMessage: string;
  messageCount: number;
  chatDuration: string;
  status: 'Active' | 'Inactive';
  addedDate: string;
}

const ContactsSection = () => {
  const [contacts, setContacts] = useState<Contact[]>([
    {
      id: 1,
      name: "Ahmad Ali",
      phone: "+92 300 1234567",
      lastMessage: "Order delivery ka time kya hai?",
      messageCount: 45,
      chatDuration: "3 days",
      status: 'Active',
      addedDate: "2024-01-15"
    },
    {
      id: 2,
      name: "Fatima Khan",
      phone: "+92 301 9876543",
      lastMessage: "Payment kaise karna hai?",
      messageCount: 23,
      chatDuration: "1 day",
      status: 'Active',
      addedDate: "2024-01-20"
    },
    {
      id: 3,
      name: "Hassan Sheikh",
      phone: "+92 302 5555555",
      lastMessage: "Thanks for the service",
      messageCount: 12,
      chatDuration: "2 weeks",
      status: 'Inactive',
      addedDate: "2024-01-10"
    }
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [newContact, setNewContact] = useState({ name: "", phone: "" });
  const [showAddForm, setShowAddForm] = useState(false);

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.phone.includes(searchTerm)
  );

  const addContact = () => {
    if (newContact.name && newContact.phone) {
      const contact: Contact = {
        id: Date.now(),
        name: newContact.name,
        phone: newContact.phone,
        lastMessage: "No messages yet",
        messageCount: 0,
        chatDuration: "Just added",
        status: 'Active',
        addedDate: new Date().toISOString().split('T')[0]
      };
      setContacts([...contacts, contact]);
      setNewContact({ name: "", phone: "" });
      setShowAddForm(false);
      toast({
        title: "Contact Added",
        description: `${newContact.name} successfully added to contacts`,
      });
    }
  };

  const deleteContact = (id: number) => {
    setContacts(contacts.filter(contact => contact.id !== id));
    toast({
      title: "Contact Deleted",
      description: "Contact has been removed from your list",
    });
  };

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
                      {contact.messageCount} messages
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Chat: {contact.chatDuration}
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Added: {contact.addedDate}
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-gray-500 italic">
                    Last: "{contact.lastMessage}"
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
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
