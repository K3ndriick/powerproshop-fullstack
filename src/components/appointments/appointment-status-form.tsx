'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { updateAppointmentStatus } from '@/lib/actions/admin/appointments';
import type { AppointmentStatus } from '@/lib/types/appointment';

type Props = {
  appointmentId: string;
  currentStatus: AppointmentStatus;
};

// Only show transitions that are valid from the current status.
// Mirrors the VALID_TRANSITIONS map in the server action - the UI
// presents only legal moves so the admin can't attempt invalid ones.
const NEXT_STATUSES: Record<AppointmentStatus, AppointmentStatus[]> = {
  pending:   ['confirmed', 'cancelled'],
  confirmed: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
};

export function AppointmentStatusForm({ appointmentId, currentStatus }: Props) {
  const router = useRouter();
  const options = NEXT_STATUSES[currentStatus];
  const [selected, setSelected] = useState<AppointmentStatus>(options[0]);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [success, setSuccess]   = useState(false);

  // Terminal states - no actions available
  if (options.length === 0) {
    return (
      <p className="text-sm text-muted-foreground italic">
        No further actions available.
      </p>
    );
  }

  async function handleSubmit() {
    setSaving(true);
    setError(null);
    setSuccess(false);

    const err = await updateAppointmentStatus(appointmentId, selected);
    setSaving(false);

    if (err) {
      setError(err);
      return;
    }

    setSuccess(true);
    router.refresh();
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <select
          value={selected}
          onChange={(e) => {
            setSelected(e.target.value as AppointmentStatus);
            setSuccess(false);
          }}
          className="border bg-background text-sm px-3 py-2 outline-none focus:ring-1 focus:ring-primary"
        >
          {options.map((status) => (
            <option key={status} value={status}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </option>
          ))}
        </select>

        <Button
          onClick={handleSubmit}
          disabled={saving || selected === currentStatus}
        >
          {saving ? 'Saving...' : 'Update status'}
        </Button>
      </div>

      {error   && <p className="text-sm text-destructive">{error}</p>}
      {success && <p className="text-sm text-green-600">Status updated.</p>}
    </div>
  );
}
