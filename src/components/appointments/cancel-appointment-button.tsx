'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { cancelAppointment } from '@/lib/actions/appointments';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';

type Props = {
  appointmentId: string;
};

export function CancelAppointmentButton({ appointmentId }: Props) {
  const router = useRouter();
  const [open, setOpen]       = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  async function handleConfirm() {
    setLoading(true);
    setError(null);
    const err = await cancelAppointment(appointmentId);
    setLoading(false);

    if (err) {
      setError(err);
      setOpen(false);
      return;
    }

    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-sm text-destructive hover:underline"
      >
        Cancel appointment
      </button>

      {error && <p className="text-xs text-destructive mt-1">{error}</p>}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md rounded-none">
          <DialogHeader>
            <DialogTitle>Cancel appointment</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this appointment? This cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose asChild>
              <Button variant="outline" disabled={loading}>
                Keep appointment
              </Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={handleConfirm}
              disabled={loading}
            >
              {loading ? 'Cancelling...' : 'Yes, cancel'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
