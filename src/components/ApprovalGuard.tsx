
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { useAuth } from "@/contexts/AuthContext";

const ApprovalGuard = ({ children }: { children: React.ReactNode }) => {
  const { userProfile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // If user is not approved (and not an owner), show pending approval message
  if (userProfile && !userProfile.is_approved && userProfile.role !== 'Owner') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-yellow-100 rounded-full w-fit">
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
            <CardTitle className="text-xl">Account Pending Approval</CardTitle>
            <CardDescription>
              Your account is waiting for approval from the system owner
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-yellow-800">What's Next?</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    The system owner will review your account and approve it soon. 
                    You'll receive access to all features once approved.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Account Status:</span>
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  Pending Approval
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Role:</span>
                <Badge variant="outline">
                  {userProfile.role}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Department:</span>
                <span className="text-sm font-medium">
                  {userProfile.department || 'Not specified'}
                </span>
              </div>
            </div>

            <div className="border-t pt-4">
              <p className="text-xs text-gray-500 text-center">
                Please contact your system administrator if you believe this is an error.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If approved or owner, show the main content
  return <>{children}</>;
};

export default ApprovalGuard;
