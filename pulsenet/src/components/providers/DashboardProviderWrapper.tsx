'use client';

import { HealthcareProvider } from '@/context/HealthcareContext';

export default function DashboardProviderWrapper({ children }: { children: React.ReactNode }) {
  return <HealthcareProvider>{children}</HealthcareProvider>;
}
