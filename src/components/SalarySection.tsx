import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, Plus, Edit, Trash2, TrendingUp, Calendar, User, Save, X } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SalaryRecord {
  id: string;
  client_name: string;
  platform: 'WhatsApp' | 'Instagram' | 'TikTok';
  salary: number;
  payment_date: string;
  status: 'Paid' | 'Pending' | 'Overdue';
}

const SalarySection = () => {
  const [salaryRecords, setSalaryRecords] = useState<SalaryRecord[]>([]);
  const [newRecord, setNewRecord] = useState({
    client_name: "",
    platform: "",
    salary: ""
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<SalaryRecord>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSalaryRecords();
  }, []);

  const fetchSalaryRecords = async () => {
    try {
      const { data, error } = await supabase
        .from('salary_records')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const typedRecords: SalaryRecord[] = (data || []).map(record => ({
        id: record.id,
        client_name: record.employee_name,
        platform: record.position as 'WhatsApp' | 'Instagram' | 'TikTok',
        salary: record.base_salary,
        payment_date: record.payment_date,
        status: record.status as 'Paid' | 'Pending' | 'Overdue'
      }));

      setSalaryRecords(typedRecords);
    } catch (error) {
      console.error('Error fetching salary records:', error);
      toast({
        title: "Error",
        description: "Failed to load salary records",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addSalaryRecord = async () => {
    if (newRecord.client_name && newRecord.platform && newRecord.salary) {
      try {
        const salary = parseFloat(newRecord.salary);
        
        const { data, error } = await supabase
          .from('salary_records')
          .insert([{
            employee_name: newRecord.client_name,
            position: newRecord.platform,
            base_salary: salary,
            bonus: 0,
            status: 'Pending',
            work_days: 30
          }])
          .select()
          .single();

        if (error) throw error;

        const typedRecord: SalaryRecord = {
          id: data.id,
          client_name: data.employee_name,
          platform: data.position as 'WhatsApp' | 'Instagram' | 'TikTok',
          salary: data.base_salary,
          payment_date: data.payment_date,
          status: data.status as 'Paid' | 'Pending' | 'Overdue'
        };

        setSalaryRecords([typedRecord, ...salaryRecords]);
        setNewRecord({
          client_name: "",
          platform: "",
          salary: ""
        });
        setShowAddForm(false);
        toast({
          title: "Salary Record Added",
          description: `${newRecord.client_name} ka salary record add ho gaya`,
        });
      } catch (error) {
        console.error('Error adding salary record:', error);
        toast({
          title: "Error",
          description: "Failed to add salary record",
          variant: "destructive"
        });
      }
    }
  };

  const startEdit = (record: SalaryRecord) => {
    setEditingRecord(record.id);
    setEditForm({
      client_name: record.client_name,
      platform: record.platform,
      salary: record.salary,
      status: record.status
    });
  };

  const saveEdit = async () => {
    if (!editingRecord) return;

    try {
      const { error } = await supabase
        .from('salary_records')
        .update({
          employee_name: editForm.client_name,
          position: editForm.platform,
          base_salary: editForm.salary,
          status: editForm.status,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingRecord);

      if (error) throw error;

      setSalaryRecords(salaryRecords.map(record => 
        record.id === editingRecord 
          ? { ...record, ...editForm } as SalaryRecord
          : record
      ));

      setEditingRecord(null);
      setEditForm({});
      toast({
        title: "Record Updated",
        description: "Salary record has been updated successfully",
      });
    } catch (error) {
      console.error('Error updating salary record:', error);
      toast({
        title: "Error",
        description: "Failed to update salary record",
        variant: "destructive"
      });
    }
  };

  const cancelEdit = () => {
    setEditingRecord(null);
    setEditForm({});
  };

  const updateStatus = async (id: string, newStatus: 'Paid' | 'Pending' | 'Overdue') => {
    try {
      const { error } = await supabase
        .from('salary_records')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      setSalaryRecords(records => 
        records.map(record => 
          record.id === id ? { ...record, status: newStatus } : record
        )
      );
      toast({
        title: "Status Updated",
        description: `Payment status has been updated to ${newStatus}`,
      });
      
      if (newStatus === 'Paid') {
        window.location.reload();
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive"
      });
    }
  };

  const deleteRecord = async (id: string) => {
    try {
      const { error } = await supabase
        .from('salary_records')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setSalaryRecords(records => records.filter(record => record.id !== id));
      toast({
        title: "Record Deleted",
        description: "Salary record has been removed",
      });
    } catch (error) {
      console.error('Error deleting record:', error);
      toast({
        title: "Error",
        description: "Failed to delete record",
        variant: "destructive"
      });
    }
  };

  const totalPaid = salaryRecords
    .filter(record => record.status === 'Paid')
    .reduce((sum, record) => sum + record.salary, 0);
  
  const totalPending = salaryRecords
    .filter(record => record.status === 'Pending')
    .reduce((sum, record) => sum + record.salary, 0);

  const statusColors = {
    'Paid': 'bg-green-100 text-green-800',
    'Pending': 'bg-yellow-100 text-yellow-800',
    'Overdue': 'bg-red-100 text-red-800'
  };

  const platformColors = {
    'WhatsApp': 'bg-green-100 text-green-800',
    'Instagram': 'bg-pink-100 text-pink-800',
    'TikTok': 'bg-black text-white'
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading salary records...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards with PKR */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Paid</p>
                <p className="text-3xl font-bold text-green-600">₨{totalPaid.toLocaleString()}</p>
                <p className="text-xs text-gray-500">Pakistani Rupees</p>
              </div>
              <DollarSign className="h-12 w-12 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Payments</p>
                <p className="text-3xl font-bold text-yellow-600">₨{totalPending.toLocaleString()}</p>
                <p className="text-xs text-gray-500">Pakistani Rupees</p>
              </div>
              <TrendingUp className="h-12 w-12 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Clients</p>
                <p className="text-3xl font-bold text-blue-600">{salaryRecords.length}</p>
                <p className="text-xs text-gray-500">Active salary records</p>
              </div>
              <User className="h-12 w-12 text-blue-500" />
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
                <DollarSign className="h-5 w-5" />
                Client Salary Management
              </CardTitle>
              <CardDescription>
                Client payments aur platform tracking ka complete record (PKR)
              </CardDescription>
            </div>
            <Button 
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Client
            </Button>
          </div>
        </CardHeader>

        {/* Add Client Form */}
        {showAddForm && (
          <CardContent className="border-t">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <Label htmlFor="client-name">Client Name</Label>
                <Input
                  id="client-name"
                  placeholder="Client ka naam"
                  value={newRecord.client_name}
                  onChange={(e) => setNewRecord({...newRecord, client_name: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="platform">Platform</Label>
                <Select value={newRecord.platform} onValueChange={(value) => setNewRecord({...newRecord, platform: value})}>
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
                <Label htmlFor="salary">Salary (PKR)</Label>
                <Input
                  id="salary"
                  type="number"
                  placeholder="Salary amount in PKR"
                  value={newRecord.salary}
                  onChange={(e) => setNewRecord({...newRecord, salary: e.target.value})}
                />
              </div>
              <Button onClick={addSalaryRecord} className="bg-emerald-600 hover:bg-emerald-700">
                Add Record
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Salary Records List */}
      <div className="grid gap-4">
        {salaryRecords.map((record) => (
          <Card key={record.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div className="flex-1">
                  {editingRecord === record.id ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="edit-client-name">Client Name</Label>
                          <Input
                            id="edit-client-name"
                            value={editForm.client_name || ''}
                            onChange={(e) => setEditForm({...editForm, client_name: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit-platform">Platform</Label>
                          <Select value={editForm.platform} onValueChange={(value) => setEditForm({...editForm, platform: value as 'WhatsApp' | 'Instagram' | 'TikTok'})}>
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
                          <Label htmlFor="edit-salary">Salary (PKR)</Label>
                          <Input
                            id="edit-salary"
                            type="number"
                            value={editForm.salary || 0}
                            onChange={(e) => setEditForm({...editForm, salary: parseFloat(e.target.value) || 0})}
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
                        <User className="h-5 w-5 text-gray-500" />
                        <h3 className="text-lg font-semibold">{record.client_name}</h3>
                        <Badge className={platformColors[record.platform]}>
                          {record.platform}
                        </Badge>
                        <Badge className={statusColors[record.status]}>
                          {record.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-600">Salary:</span>
                          <p className="text-lg font-bold text-blue-600">₨{record.salary.toLocaleString()}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Platform:</span>
                          <p className="text-lg font-bold text-purple-600">{record.platform}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="font-medium text-gray-600">Date:</span>
                          <span>{record.payment_date}</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
                
                {editingRecord !== record.id && (
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => startEdit(record)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    {record.status === 'Pending' && (
                      <Button 
                        size="sm" 
                        onClick={() => updateStatus(record.id, 'Paid')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Mark Paid
                      </Button>
                    )}
                    {record.status === 'Paid' && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => updateStatus(record.id, 'Pending')}
                      >
                        Mark Pending
                      </Button>
                    )}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => deleteRecord(record.id)}
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

      {salaryRecords.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No Client Records</h3>
            <p className="text-gray-500">Add client salary records to get started</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SalarySection;
