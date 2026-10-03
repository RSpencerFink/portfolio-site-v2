import { LegacyRedirect, legacyMeta } from '@/components/LegacyRedirect';
import { films } from '@/content/films';

type Props = { params: Promise<{ id: string }> };

export const dynamicParams = false;
export const generateStaticParams = () => films.map((f) => ({ id: f.legacyId }));

const target = async ({ params }: Props) => {
  const { id } = await params;
  return `/visual-arts/digital/${films.find((f) => f.legacyId === id)!.slug}/`;
};

export const generateMetadata = async (props: Props) => legacyMeta(await target(props));
export default async function Page(props: Props) {
  return <LegacyRedirect to={await target(props)} />;
}
