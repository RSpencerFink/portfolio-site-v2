import { LegacyRedirect, legacyMeta } from '@/components/LegacyRedirect';

export const metadata = legacyMeta('/visual-arts/digital/');
export default function Page() {
  return <LegacyRedirect to="/visual-arts/digital/" />;
}
