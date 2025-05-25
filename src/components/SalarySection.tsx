
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Plus, Edit, Trash2, TrendingUp, Calendar, User, Save, X } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SalaryRecord {
  id: string;
  employee_name: string;
  position: string;
  base_salary: number;
  bonus: number;
  total_salary: number;
  payment_date: string;
  status: 'Paid' | 'Pending' | 'Overdue';
  work_days: number;
}

const SalarySection = () => {
  const [salaryRecords, setSalaryRecords] = useState<SalaryRecord[]>([]);
  const [newRecord, setNewRecord] = useState({
    employee_name: "",
    position: "",
    base_salary: "",
    bonus: "",
    work_days: ""
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

      setSalaryRecords(data || []);
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
    if (newRecord.employee_name && newRecord.position && newRecord.base_salary) {
      try {
        const baseSalary = parseFloat(newRecord.base_salary);
        const bonus = parseFloat(newRecord.bonus) || 0;
        
        const { data, error } = await supabase
          .from('salary_records')
          .insert([{
            employee_name: newRecord.employee_name,
            position: newRecord.position,
            base_salary: baseSalary,
            bonus: bonus,
            status: 'Pending',
            work_days: parseInt(newRecord.work_days) || 30
          }])
          .select()
          .single();

        if (error) throw error;

        setSalaryRecords([data, ...salaryRecords]);
        setNewRecord({
          employee_name: "",
          position: "",
          base_salary: "",
          bonus: "",
          work_days: ""
        });
        setShowAddForm(false);
        toast({
          title: "Salary Record Added",
          description: `${newRecord.employee_name} ka salary record add ho gaya`,
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
      employee_name: record.employee_name,
      position: record.position,
      base_salary: record.base_salary,
      bonus: record.bonus,
      status: record.status,
      work_days: record.work_days
    });
  };

  const saveEdit = async () => {
    if (!editingRecord) return;

    try {
      const { error } = await supabase
        .from('salary_records')
        .update({
          employee_name: editForm.employee_name,
          position: editForm.position,
          base_salary: editForm.base_salary,
          bonus: editForm.bonus,
          status: editForm.status,
          work_days: editForm.work_days,
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
        .update({ status: newStatus })
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
    .reduce((sum, record) => sum + record.total_salary, 0);
  
  const totalPending = salaryRecords
    .filter(record => record.status === 'Pending')
    .reduce((sum, record) => sum + record.total_salary, 0);

  const statusColors = {
    'Paid': 'bg-green-100 text-green-800',
    'Pending': 'bg-yellow-100 text-yellow-800',
    'Overdue': 'bg-red-100 text-red-800'
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
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Paid</p>
                <p className="text-3xl font-bold text-green-600">₹{totalPaid.toLocaleString()}</p>
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
                <p className="text-3xl font-bold text-yellow-600">₹{totalPending.toLocaleString()}</p>
              </div>
              <TrendingUp className="h-12 w-12 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Employees</p>
                <p className="text-3xl font-bold text-blue-600">{salaryRecords.length}</p>
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
                Salary Management System
              </CardTitle>
              <CardDescription>
                Employee salaries aur payments ka complete record
              </CardDescription>
            </div>
            <Button 
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Salary
            </Button>
          </div>
        </CardHeader>

        {/* Add Salary Form */}
        {showAddForm && (
          <CardContent className="border-t">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 items-end">
              <div>
                <Label htmlFor="emp-name">Employee Name</Label>
                <Input
                  id="emp-name"
                  placeholder="Employee ka naam"
                  value={newRecord.employee_name}
                  onChange={(e) => setNewRecord({...newRecord, employee_name: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="position">Position</Label>
                <Input
                  id="position"
                  placeholder="Job title"
                  value={newRecord.position}
                  onChange={(e) => setNewRecord({...newRecord, position: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="base-salary">Base Salary</Label>
                <Input
                  id="base-salary"
                  type="number"
                  placeholder="Basic salary"
                  value={newRecord.base_salary}
                  onChange={(e) => setNewRecord({...newRecord, base_salary: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="bonus">Bonus</Label>
                <Input
                  id="bonus"
                  type="number"
                  placeholder="Extra bonus"
                  value={newRecord.bonus}
                  onChange={(e) => setNewRecord({...newRecord, bonus: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="work-days">Work Days</Label>
                <Input
                  id="work-days"
                  type="number"
                  placeholder="Days worked"
                  value={newRecord.work_days}
                  onChange={(e) => setNewRecord({...newRecord, work_days: e.target.value})}
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
                          <Label htmlFor="edit-emp-name">Employee Name</Label>
                          <Input
                            id="edit-emp-name"
                            value={editForm.employee_name || ''}
                            onChange={(e) => setEditForm({...editForm, employee_name: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit-position">Position</Label>
                          <Input
                            id="edit-position"
                            value={editForm.position || ''}
                            onChange={(e) => setEditForm({...editForm, position: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit-base-salary">Base Salary</Label>
                          <Input
                            id="edit-base-salary"
                            type="number"
                            value={editForm.base_salary || 0}
                            onChange={(e) => setEditForm({...editForm, base_salary: parseFloat(e.target.value) || 0})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit-bonus">Bonus</Label>
                          <Input
                            id="edit-bonus"
                            type="number"
                            value={editForm.bonus || 0}
                            onChange={(e) => setEditForm({...editForm, bonus: parseFloat(e.target.value) || 0})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit-work-days">Work Days</Label>
                          <Input
                            id="edit-work-days"
                            type="number"
                            value={editForm.work_days || 30}
                            onChange={(e) => setEditForm({...editForm, work_days: parseInt(e.target.value) || 30})}
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
                        <h3 className="text-lg font-semibold">{record.employee_name}</h3>
                        <Badge variant="outline">{record.position}</Badge>
                        <Badge className={statusColors[record.status]}>
                          {record.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-600">Base Salary:</span>
                          <p className="text-lg font-bold text-gray-900">₹{record.base_salary.toLocaleString()}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Bonus:</span>
                          <p className="text-lg font-bold text-green-600">₹{record.bonus.toLocaleString()}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Total Salary:</span>
                          <p className="text-lg font-bold text-blue-600">₹{record.total_salary.toLocaleString()}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Work Days:</span>
                          <p className="text-lg font-bold text-purple-600">{record.work_days}</p>
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
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No Salary Records</h3>
            <p className="text-gray-500">Add employee salary records to get started</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SalarySection;
