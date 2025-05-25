
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Plus, Edit, Trash2, TrendingUp, Calendar, User } from 'lucide-react';
import { toast } from "@/hooks/use-toast";

interface SalaryRecord {
  id: number;
  employeeName: string;
  position: string;
  baseSalary: number;
  bonus: number;
  totalSalary: number;
  paymentDate: string;
  status: 'Paid' | 'Pending' | 'Overdue';
  workDays: number;
}

const SalarySection = () => {
  const [salaryRecords, setSalaryRecords] = useState<SalaryRecord[]>([
    {
      id: 1,
      employeeName: "Muhammad Hassan",
      position: "WhatsApp Manager",
      baseSalary: 45000,
      bonus: 5000,
      totalSalary: 50000,
      paymentDate: "2024-01-25",
      status: 'Paid',
      workDays: 30
    },
    {
      id: 2,
      employeeName: "Ayesha Khan",
      position: "Customer Support",
      baseSalary: 35000,
      bonus: 3000,
      totalSalary: 38000,
      paymentDate: "2024-01-25",
      status: 'Paid',
      workDays: 28
    },
    {
      id: 3,
      employeeName: "Ali Ahmad",
      position: "Sales Representative",
      baseSalary: 40000,
      bonus: 8000,
      totalSalary: 48000,
      paymentDate: "2024-02-01",
      status: 'Pending',
      workDays: 30
    }
  ]);

  const [newRecord, setNewRecord] = useState({
    employeeName: "",
    position: "",
    baseSalary: "",
    bonus: "",
    workDays: ""
  });
  const [showAddForm, setShowAddForm] = useState(false);

  const addSalaryRecord = () => {
    if (newRecord.employeeName && newRecord.position && newRecord.baseSalary) {
      const baseSalary = parseFloat(newRecord.baseSalary);
      const bonus = parseFloat(newRecord.bonus) || 0;
      const record: SalaryRecord = {
        id: Date.now(),
        employeeName: newRecord.employeeName,
        position: newRecord.position,
        baseSalary: baseSalary,
        bonus: bonus,
        totalSalary: baseSalary + bonus,
        paymentDate: new Date().toISOString().split('T')[0],
        status: 'Pending',
        workDays: parseInt(newRecord.workDays) || 30
      };
      setSalaryRecords([...salaryRecords, record]);
      setNewRecord({
        employeeName: "",
        position: "",
        baseSalary: "",
        bonus: "",
        workDays: ""
      });
      setShowAddForm(false);
      toast({
        title: "Salary Record Added",
        description: `${newRecord.employeeName} ka salary record add ho gaya`,
      });
    }
  };

  const updateStatus = (id: number, newStatus: 'Paid' | 'Pending' | 'Overdue') => {
    setSalaryRecords(records => 
      records.map(record => 
        record.id === id ? { ...record, status: newStatus } : record
      )
    );
    toast({
      title: "Status Updated",
      description: `Payment status has been updated to ${newStatus}`,
    });
  };

  const deleteRecord = (id: number) => {
    setSalaryRecords(records => records.filter(record => record.id !== id));
    toast({
      title: "Record Deleted",
      description: "Salary record has been removed",
    });
  };

  const totalPaid = salaryRecords
    .filter(record => record.status === 'Paid')
    .reduce((sum, record) => sum + record.totalSalary, 0);
  
  const totalPending = salaryRecords
    .filter(record => record.status === 'Pending')
    .reduce((sum, record) => sum + record.totalSalary, 0);

  const statusColors = {
    'Paid': 'bg-green-100 text-green-800',
    'Pending': 'bg-yellow-100 text-yellow-800',
    'Overdue': 'bg-red-100 text-red-800'
  };

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
                  value={newRecord.employeeName}
                  onChange={(e) => setNewRecord({...newRecord, employeeName: e.target.value})}
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
                  value={newRecord.baseSalary}
                  onChange={(e) => setNewRecord({...newRecord, baseSalary: e.target.value})}
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
                  value={newRecord.workDays}
                  onChange={(e) => setNewRecord({...newRecord, workDays: e.target.value})}
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
                  <div className="flex items-center gap-3 mb-3">
                    <User className="h-5 w-5 text-gray-500" />
                    <h3 className="text-lg font-semibold">{record.employeeName}</h3>
                    <Badge variant="outline">{record.position}</Badge>
                    <Badge className={statusColors[record.status]}>
                      {record.status}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">Base Salary:</span>
                      <p className="text-lg font-bold text-gray-900">₹{record.baseSalary.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Bonus:</span>
                      <p className="text-lg font-bold text-green-600">₹{record.bonus.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Total Salary:</span>
                      <p className="text-lg font-bold text-blue-600">₹{record.totalSalary.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Work Days:</span>
                      <p className="text-lg font-bold text-purple-600">{record.workDays}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="font-medium text-gray-600">Date:</span>
                      <span>{record.paymentDate}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
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
