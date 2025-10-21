import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface RazorpayButtonProps {
  amount: number;
  feeId: number;
  onSuccess?: () => void;
  disabled?: boolean;
  loading?: boolean;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

const RazorpayButton = ({ amount, feeId, onSuccess, disabled, loading }: RazorpayButtonProps) => {
  const handlePayment = async () => {
    try {
      // Create order
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
              onSuccess?.();
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
    }
  };

  return (
    <Button 
      onClick={handlePayment}
      disabled={disabled || loading}
    >
      {loading ? 'Processing...' : `Pay ₹${amount}`}
    </Button>
  );
};

export default RazorpayButton;