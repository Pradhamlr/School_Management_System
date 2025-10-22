import { useState, useEffect } from "react";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface FeeRecord {
  id: number;
  amount: number;
  dueDate: string;
  status: 'PENDING' | 'PAID' | 'OVERDUE';
  paidAt?: string;
  transactionId?: string;
}

const Payments = () => {
  const [fees, setFees] = useState<FeeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState<number | null>(null);

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    fetchFees();

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const fetchFees = async () => {
    try {
      // Mock data - replace with actual API call
      const mockFees: FeeRecord[] = [
        { id: 1, amount: 5000, dueDate: '2024-01-15', status: 'PENDING' },
        { id: 2, amount: 3000, dueDate: '2024-02-15', status: 'PAID', paidAt: '2024-01-10', transactionId: 'pay_123' },
        { id: 3, amount: 4500, dueDate: '2024-03-15', status: 'OVERDUE' },
      ];
      setFees(mockFees);
    } catch (error) {
      toast.error('Failed to fetch fees');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (feeId: number, amount: number) => {
    setPaymentLoading(feeId);
    
    try {
      // Create Razorpay order
      const orderResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/payments/${feeId}/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!orderResponse.ok) throw new Error('Failed to create order');
      
      const { order } = await orderResponse.json();

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "School Management System",
        description: `Fee Payment - ID: ${feeId}`,
        order_id: order.id,
        handler: async (response: any) => {
          try {
            // Verify payment
            const verifyResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/payments/${feeId}/verify-payment`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            if (verifyResponse.ok) {
              toast.success('Payment successful!');
              fetchFees(); // Refresh fees
            } else {
              toast.error('Payment verification failed');
            }
          } catch (error) {
            toast.error('Payment verification failed');
          }
        },
        prefill: {
          name: "Student Name",
          email: "student@example.com",
          contact: "9999999999"
        },
        theme: {
          color: "#3399cc"
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      toast.error('Failed to initiate payment');
    } finally {
      setPaymentLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return <Badge className="bg-green-500">Paid</Badge>;
      case 'OVERDUE':
        return <Badge className="bg-red-500">Overdue</Badge>;
      default:
        return <Badge className="bg-yellow-500">Pending</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <DashboardSidebar />
        <div className="flex-1">
          <DashboardHeader />
          <main className="p-8">
            <div className="text-center">Loading...</div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar />
      
      <div className="flex-1">
        <DashboardHeader />
        
        <main className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold gradient-text mb-2">Fee and Payments</h1>
            <p className="text-muted-foreground">Manage your fee payments securely</p>
          </div>

          <div className="grid gap-6">
            {fees.map((fee) => (
              <Card key={fee.id} className="glass-card">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Fee Payment #{fee.id}</CardTitle>
                    {getStatusBadge(fee.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Amount</p>
                      <p className="text-lg font-semibold">₹{fee.amount}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Due Date</p>
                      <p className="text-lg">{new Date(fee.dueDate).toLocaleDateString()}</p>
                    </div>
                    {fee.paidAt && (
                      <div>
                        <p className="text-sm text-muted-foreground">Paid On</p>
                        <p className="text-lg">{new Date(fee.paidAt).toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>
                  
                  {fee.transactionId && (
                    <div className="mb-4">
                      <p className="text-sm text-muted-foreground">Transaction ID</p>
                      <p className="text-sm font-mono">{fee.transactionId}</p>
                    </div>
                  )}

                  {fee.status === 'PENDING' || fee.status === 'OVERDUE' ? (
                    <Button 
                      onClick={() => handlePayment(fee.id, fee.amount)}
                      disabled={paymentLoading === fee.id}
                      className="w-full md:w-auto"
                    >
                      {paymentLoading === fee.id ? 'Processing...' : `Pay ₹${fee.amount}`}
                    </Button>
                  ) : (
                    <Button disabled className="w-full md:w-auto">
                      Payment Completed
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Payments;