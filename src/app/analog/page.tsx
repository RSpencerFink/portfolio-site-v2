import { LegacyRedirect, legacyMeta } from '@/components/LegacyRedirect';

export const metadata = legacyMeta('/visual-arts/analog/');
export default function Page() {
  return <LegacyRedirect to="/visual-arts/analog/" />;
}
