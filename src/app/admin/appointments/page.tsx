import { getAdminAppointments } from '@/lib/actions/admin/appointments';
import { AppointmentStatusForm } from '@/components/appointments/appointment-status-form';
import { AppointmentCalendarDynamic } from '@/components/appointments/appointment-calendar-dynamic';
import type { AppointmentStatus } from '@/lib/types/appointment';

const statusStyles: Record<AppointmentStatus, string> = {
  pending:   'badge-status-pending',
  confirmed: 'badge-status-processing',
  completed: 'badge-status-delivered',
  cancelled: 'badge-status-cancelled',
};

export default async function AdminAppointmentsPage() {
  const appointments = await getAdminAppointments();

  if (appointments.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">No appointments have been booked yet.</p>
      </div>
    );
  }

  // Group by date for a calendar-like layout
  const grouped = appointments.reduce<Record<string, typeof appointments>>((acc, appt) => {
    const key = appt.appointment_date;
    if (!acc[key]) acc[key] = [];
    acc[key].push(appt);
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-semibold">Appointments</h2>

      <AppointmentCalendarDynamic appointments={appointments} readOnly height="640px" />

      {Object.entries(grouped).map(([date, appts]) => (
        <section key={date} className="space-y-3">

          {/* Date heading */}
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            {new Date(date + 'T00:00:00').toLocaleDateString('en-AU', {
              weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
            })}
          </h3>

          {appts.map((appt) => (
            <div key={appt.id} className="border bg-card p-5 space-y-4">

              {/* Header row */}
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{appt.services.name}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {appt.appointment_time.substring(0, 5)}
                    {' - '}
                    {appt.end_time.substring(0, 5)}
                    {' · '}
                    {appt.services.duration_minutes} min
                    {' · '}
                    ${Number(appt.services.price).toFixed(2)}
                  </p>
                </div>
                <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${statusStyles[appt.status]}`}>
                  {appt.status.charAt(0).toUpperCase() + appt.status.slice(1)}
                </span>
              </div>

              {/* Customer details */}
              <div className="text-sm space-y-0.5">
                <p className="font-medium">{appt.customer_name}</p>
                <p className="text-muted-foreground">{appt.customer_email} · {appt.customer_phone}</p>
                {appt.equipment_type && (
                  <p className="text-muted-foreground">
                    {appt.equipment_type}
                    {appt.equipment_brand ? ` · ${appt.equipment_brand}` : ''}
                  </p>
                )}
                {appt.issue_description && (
                  <p className="text-muted-foreground italic mt-1">&ldquo;{appt.issue_description}&rdquo;</p>
                )}
              </div>

              {/* Status update */}
              <AppointmentStatusForm
                appointmentId={appt.id}
                currentStatus={appt.status}
              />

            </div>
          ))}
        </section>
      ))}
    </div>
  );
}
