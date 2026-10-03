import { LegacyRedirect, legacyMeta } from '@/components/LegacyRedirect';
import { paintings } from '@/content/paintings';

type Props = { params: Promise<{ id: string }> };

export const dynamicParams = false;
export const generateStaticParams = () => paintings.map((p) => ({ id: p.legacyId }));

const target = async ({ params }: Props) => {
  const { id } = await params;
  return `/visual-arts/analog/${paintings.find((p) => p.legacyId === id)!.slug}/`;
};

export const generateMetadata = async (props: Props) => legacyMeta(await target(props));
export default async function Page(props: Props) {
  return <LegacyRedirect to={await target(props)} />;
}
