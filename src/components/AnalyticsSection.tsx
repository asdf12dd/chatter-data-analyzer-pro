
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, MessageCircle, Users, Clock, Calendar, DollarSign } from 'lucide-react';

const AnalyticsSection = () => {
  // Mock data for charts
  const messageData = [
    { name: 'Mon', messages: 45, responses: 42 },
    { name: 'Tue', messages: 52, responses: 48 },
    { name: 'Wed', messages: 38, responses: 35 },
    { name: 'Thu', messages: 67, responses: 61 },
    { name: 'Fri', messages: 71, responses: 68 },
    { name: 'Sat', messages: 34, responses: 30 },
    { name: 'Sun', messages: 28, responses: 25 }
  ];

  const monthlyData = [
    { month: 'Jan', contacts: 120, revenue: 45000 },
    { month: 'Feb', contacts: 135, revenue: 52000 },
    { month: 'Mar', contacts: 148, revenue: 48000 },
    { month: 'Apr', contacts: 156, revenue: 55000 },
    { month: 'May', contacts: 162, revenue: 58000 }
  ];

  const chatDurationData = [
    { name: '0-1 hr', value: 35, color: '#8884d8' },
    { name: '1-3 hrs', value: 45, color: '#82ca9d' },
    { name: '3-6 hrs', value: 25, color: '#ffc658' },
    { name: '6+ hrs', value: 15, color: '#ff7c7c' }
  ];

  const responseTimeData = [
    { time: '9 AM', avgResponse: 2.5 },
    { time: '12 PM', avgResponse: 4.2 },
    { time: '3 PM', avgResponse: 3.8 },
    { time: '6 PM', avgResponse: 2.1 },
    { time: '9 PM', avgResponse: 5.3 }
  ];

  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
                <p className="text-3xl font-bold text-blue-600">3.2 min</p>
                <p className="text-xs text-green-600 mt-1">↑ 12% better</p>
              </div>
              <Clock className="h-12 w-12 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Daily Messages</p>
                <p className="text-3xl font-bold text-green-600">67</p>
                <p className="text-xs text-green-600 mt-1">↑ 8% from yesterday</p>
              </div>
              <MessageCircle className="h-12 w-12 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Conversations</p>
                <p className="text-3xl font-bold text-purple-600">23</p>
                <p className="text-xs text-red-600 mt-1">↓ 3% from last week</p>
              </div>
              <Users className="h-12 w-12 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                <p className="text-3xl font-bold text-orange-600">68%</p>
                <p className="text-xs text-green-600 mt-1">↑ 5% this month</p>
              </div>
              <TrendingUp className="h-12 w-12 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Messages Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Daily Messages Activity
            </CardTitle>
            <CardDescription>
              Weekly messages aur responses ka comparison
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={messageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="messages" fill="#3b82f6" name="Received" />
                <Bar dataKey="responses" fill="#10b981" name="Sent" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Chat Duration Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Chat Duration Distribution
            </CardTitle>
            <CardDescription>
              Conversation length ka breakdown
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chatDurationData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chatDurationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Growth */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Monthly Growth Trends
            </CardTitle>
            <CardDescription>
              Contacts aur revenue ka monthly growth
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Line 
                  yAxisId="left" 
                  type="monotone" 
                  dataKey="contacts" 
                  stroke="#8884d8" 
                  strokeWidth={3}
                  name="Contacts"
                />
                <Line 
                  yAxisId="right" 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#82ca9d" 
                  strokeWidth={3}
                  name="Revenue (₹)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Response Time Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Response Time Analysis
            </CardTitle>
            <CardDescription>
              Different times pe response speed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={responseTimeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} min`, 'Avg Response Time']} />
                <Bar dataKey="avgResponse" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Performance Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Performance Summary
          </CardTitle>
          <CardDescription>
            Is mahine ka overall performance analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">Best Performance</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Response time improved by 12%</li>
                <li>• 68% conversion rate achieved</li>
                <li>• 156 new contacts added</li>
              </ul>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="font-semibold text-yellow-800 mb-2">Needs Attention</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Weekend activity is low</li>
                <li>• Long chat durations increasing</li>
                <li>• Peak hour response delays</li>
              </ul>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">Recommendations</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Add weekend coverage</li>
                <li>• Use quick replies more</li>
                <li>• Set auto-responses for FAQs</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsSection;
