'use client';

import dynamic from 'next/dynamic';
import type { AppointmentWithService } from '@/lib/types/appointment';

const AppointmentCalendar = dynamic(
  () => import('./appointment-calendar'),
  { ssr: false }
);

type Props = {
  appointments: AppointmentWithService[];
  readOnly?: boolean;
  height?: string;
};

export function AppointmentCalendarDynamic(props: Props) {
  return <AppointmentCalendar {...props} />;
}
