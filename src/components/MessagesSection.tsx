
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MessageCircle, Clock, User, Search, TrendingUp } from 'lucide-react';

interface Message {
  id: number;
  contactName: string;
  phone: string;
  message: string;
  timestamp: string;
  type: 'received' | 'sent';
  status: 'delivered' | 'read' | 'pending';
}

const MessagesSection = () => {
  const [searchTerm, setSearchTerm] = useState("");
  
  const [messages] = useState<Message[]>([
    {
      id: 1,
      contactName: "Ahmad Ali",
      phone: "+92 300 1234567",
      message: "Order delivery ka time kya hai bhai?",
      timestamp: "2024-01-25 10:30 AM",
      type: 'received',
      status: 'read'
    },
    {
      id: 2,
      contactName: "Ahmad Ali",
      phone: "+92 300 1234567",
      message: "Delivery 2-3 hours mein ho jayegi",
      timestamp: "2024-01-25 10:32 AM",
      type: 'sent',
      status: 'delivered'
    },
    {
      id: 3,
      contactName: "Fatima Khan",
      phone: "+92 301 9876543",
      message: "Payment online kar sakti hun?",
      timestamp: "2024-01-25 11:15 AM",
      type: 'received',
      status: 'read'
    },
    {
      id: 4,
      contactName: "Fatima Khan",
      phone: "+92 301 9876543",
      message: "Han bilkul, link bhej raha hun",
      timestamp: "2024-01-25 11:16 AM",
      type: 'sent',
      status: 'read'
    },
    {
      id: 5,
      contactName: "Hassan Sheikh",
      phone: "+92 302 5555555",
      message: "Service ke liye thanks!",
      timestamp: "2024-01-25 12:00 PM",
      type: 'received',
      status: 'read'
    }
  ]);

  const filteredMessages = messages.filter(message =>
    message.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.phone.includes(searchTerm)
  );

  const messageStats = {
    total: messages.length,
    received: messages.filter(m => m.type === 'received').length,
    sent: messages.filter(m => m.type === 'sent').length,
    today: messages.filter(m => m.timestamp.includes('2024-01-25')).length
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Messages</p>
                <p className="text-2xl font-bold text-blue-600">{messageStats.total}</p>
              </div>
              <MessageCircle className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Received</p>
                <p className="text-2xl font-bold text-green-600">{messageStats.received}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Sent</p>
                <p className="text-2xl font-bold text-purple-600">{messageStats.sent}</p>
              </div>
              <MessageCircle className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today</p>
                <p className="text-2xl font-bold text-orange-600">{messageStats.today}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Messages History
          </CardTitle>
          <CardDescription>
            Apne sare WhatsApp messages ka record
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search messages by contact or content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Messages List */}
      <div className="space-y-4">
        {filteredMessages.map((message) => (
          <Card key={message.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <User className="h-5 w-5 text-gray-400" />
                    <h3 className="font-semibold">{message.contactName}</h3>
                    <span className="text-sm text-gray-500">{message.phone}</span>
                    <Badge 
                      variant={message.type === 'received' ? 'default' : 'secondary'}
                      className={message.type === 'received' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}
                    >
                      {message.type === 'received' ? 'Received' : 'Sent'}
                    </Badge>
                    <Badge 
                      variant="outline"
                      className={
                        message.status === 'read' ? 'border-green-300 text-green-600' :
                        message.status === 'delivered' ? 'border-blue-300 text-blue-600' :
                        'border-orange-300 text-orange-600'
                      }
                    >
                      {message.status}
                    </Badge>
                  </div>
                  <p className="text-gray-700 mb-2 bg-gray-50 p-3 rounded-lg">
                    "{message.message}"
                  </p>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="h-4 w-4" />
                    {message.timestamp}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredMessages.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No Messages Found</h3>
            <p className="text-gray-500">Try adjusting your search filters</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MessagesSection;
