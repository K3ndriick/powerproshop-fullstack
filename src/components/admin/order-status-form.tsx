'use client';

import { updateOrderStatus } from "@/lib/actions/admin/orders";
import { useState } from "react";

type Props = {
  orderId: string,
  currentStatus: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled',
};

export function OrderStatusForm({ orderId, currentStatus }: Props) {
  const [selectedOrderStatus, setSelectedOrderStatus] = useState(currentStatus);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);


  async function handleSubmit() {
    setSaving(true);
    setError(null);

    const statusUpdateResult = await updateOrderStatus(orderId, selectedOrderStatus);

    if (statusUpdateResult) {
      setError(statusUpdateResult);
    }

    setSaving(false);
  }



  return(
    <div>
      <select 
        value={selectedOrderStatus} 
        onChange={(e) => setSelectedOrderStatus(e.target.value as 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled')}
      >
        <option value="pending">Pending</option>
        <option value="processing">Processing</option>
        <option value="shipped">Shipped</option>
        <option value="delivered">Delivered</option>
        <option value="cancelled">Cancelled</option>
      </select>
      
      <button onClick={() => handleSubmit()}>Update</button>


      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}

