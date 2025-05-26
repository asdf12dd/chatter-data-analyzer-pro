
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Phone, Plus, Image, Send, User, Calendar } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
}

interface AssignedNumber {
  id: string;
  employee_id: string;
  employee_name: string;
  phone_number: string;
  screenshot_url: string;
  notes: string;
  assigned_date: string;
  assigned_by: string;
}

const ManagerSection = () => {
  const { userProfile } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [assignedNumbers, setAssignedNumbers] = useState<AssignedNumber[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchEmployees();
    fetchAssignedNumbers();
  }, []);

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, name, email, role, department')
        .eq('role', 'Employee')
        .eq('is_active', true);

      if (error) throw error;
      setEmployees(data || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const fetchAssignedNumbers = async () => {
    try {
      const { data, error } = await supabase
        .from('assigned_numbers')
        .select('*')
        .order('assigned_date', { ascending: false });

      if (error) throw error;
      setAssignedNumbers(data || []);
    } catch (error) {
      console.error('Error fetching assigned numbers:', error);
    }
  };

  const uploadScreenshot = async (file: File): Promise<string> => {
    const fileName = `screenshots/${Date.now()}-${file.name}`;
    
    const { data, error } = await supabase.storage
      .from('screenshots')
      .upload(fileName, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('screenshots')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const assignNumber = async () => {
    if (!selectedEmployee || !phoneNumber) {
      toast({
        title: "Error",
        description: "Please select an employee and enter a phone number",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      let screenshotUrl = "";
      
      if (screenshot) {
        screenshotUrl = await uploadScreenshot(screenshot);
      }

      const selectedEmp = employees.find(emp => emp.id === selectedEmployee);
      
      const { data, error } = await supabase
        .from('assigned_numbers')
        .insert({
          employee_id: selectedEmployee,
          employee_name: selectedEmp?.name,
          phone_number: phoneNumber,
          screenshot_url: screenshotUrl,
          notes: notes,
          assigned_by: userProfile?.name || 'Manager',
          assigned_date: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      // Create notification for the employee
      await supabase
        .from('notifications')
        .insert({
          user_id: selectedEmployee,
          title: 'New Phone Number Assigned',
          message: `Manager has assigned you phone number: ${phoneNumber}`,
          type: 'assignment',
          is_read: false
        });

      setAssignedNumbers([data, ...assignedNumbers]);
      
      // Reset form
      setSelectedEmployee("");
      setPhoneNumber("");
      setNotes("");
      setScreenshot(null);

      toast({
        title: "Success",
        description: `Phone number assigned to ${selectedEmp?.name} successfully`,
      });
    } catch (error) {
      console.error('Error assigning number:', error);
      toast({
        title: "Error",
        description: "Failed to assign phone number",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Phone Number Management
          </CardTitle>
          <CardDescription>
            Assign phone numbers to employees with screenshots and notes
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Assignment Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Assign New Number
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="employee">Select Employee</Label>
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.name} - {employee.department}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                placeholder="+92 300 1234567"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="screenshot">Screenshot (Optional)</Label>
            <Input
              id="screenshot"
              type="file"
              accept="image/*"
              onChange={(e) => setScreenshot(e.target.files?.[0] || null)}
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any additional information about this assignment..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <Button onClick={assignNumber} disabled={loading} className="w-full">
            <Send className="h-4 w-4 mr-2" />
            {loading ? 'Assigning...' : 'Assign Number'}
          </Button>
        </CardContent>
      </Card>

      {/* Assigned Numbers List */}
      <Card>
        <CardHeader>
          <CardTitle>Assigned Numbers History</CardTitle>
          <CardDescription>
            View all previously assigned phone numbers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {assignedNumbers.map((assignment) => (
              <div key={assignment.id} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="font-semibold">{assignment.employee_name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="h-4 w-4" />
                    {new Date(assignment.assigned_date).toLocaleDateString()}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Phone Number:</p>
                    <p className="font-mono text-lg">{assignment.phone_number}</p>
                  </div>
                  
                  {assignment.notes && (
                    <div>
                      <p className="text-sm text-gray-600">Notes:</p>
                      <p className="text-sm">{assignment.notes}</p>
                    </div>
                  )}
                </div>

                {assignment.screenshot_url && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-600 mb-2">Screenshot:</p>
                    <img
                      src={assignment.screenshot_url}
                      alt="Assignment screenshot"
                      className="max-w-xs rounded border shadow-sm"
                    />
                  </div>
                )}
                
                <div className="mt-3 pt-3 border-t">
                  <p className="text-xs text-gray-500">
                    Assigned by: {assignment.assigned_by}
                  </p>
                </div>
              </div>
            ))}

            {assignedNumbers.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Phone className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No phone numbers assigned yet</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManagerSection;
