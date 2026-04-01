import Link from 'next/link';
import { getUserAppointments } from '@/lib/actions/appointments';
import { CancelAppointmentButton } from '@/components/appointments/cancel-appointment-button';
import type { AppointmentStatus } from '@/lib/types/appointment';

// Maps appointment status to the project's badge-status CSS classes
const statusStyles: Record<AppointmentStatus, string> = {
  pending:   'badge-status-pending',
  confirmed: 'badge-status-processing',
  completed: 'badge-status-delivered',
  cancelled: 'badge-status-cancelled',
};

export default async function DashboardAppointmentsPage() {
  const appointments = await getUserAppointments();

  if (appointments.length === 0) {
    return (
      <div className="text-center py-16 space-y-4">
        <p className="text-muted-foreground">You have no appointments yet.</p>
        <Link
          href="/services"
          className="inline-block bg-primary text-primary-foreground px-5 py-2.5 text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          Book a Service
        </Link>
      </div>
    );
  }

  // Split into upcoming and past for separate sections
  const today = new Date().toISOString().split('T')[0];
  const upcoming = appointments.filter(
    (a) => a.appointment_date >= today && a.status !== 'cancelled'
  );
  const past = appointments.filter(
    (a) => a.appointment_date < today || a.status === 'cancelled'
  );

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-semibold">My Appointments</h2>

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Upcoming</h3>
          {upcoming.map((appt) => (
            <div key={appt.id} className="border bg-card p-5 space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{appt.services.name}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {new Date(appt.appointment_date + 'T00:00:00').toLocaleDateString('en-AU', {
                      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                    })}
                    {' at '}
                    {appt.appointment_time.substring(0, 5)}
                  </p>
                </div>
                <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${statusStyles[appt.status]}`}>
                  {appt.status.charAt(0).toUpperCase() + appt.status.slice(1)}
                </span>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span>{appt.services.duration_minutes} min</span>
                <span>${Number(appt.services.price).toFixed(2)}</span>
                {appt.equipment_type && <span>{appt.equipment_type}{appt.equipment_brand ? ` · ${appt.equipment_brand}` : ''}</span>}
              </div>

              {['pending', 'confirmed'].includes(appt.status) && (
                <CancelAppointmentButton appointmentId={appt.id} />
              )}
            </div>
          ))}
        </section>
      )}

      {/* Past / cancelled */}
      {past.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Past &amp; Cancelled</h3>
          {past.map((appt) => (
            <div key={appt.id} className="border bg-card p-5 space-y-2 opacity-70">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{appt.services.name}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {new Date(appt.appointment_date + 'T00:00:00').toLocaleDateString('en-AU', {
                      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                    })}
                    {' at '}
                    {appt.appointment_time.substring(0, 5)}
                  </p>
                </div>
                <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${statusStyles[appt.status]}`}>
                  {appt.status.charAt(0).toUpperCase() + appt.status.slice(1)}
                </span>
              </div>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
