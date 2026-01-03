import SharePage from '@/components/share/SharePage';

export const metadata = {
  title: 'Shared Loadout | ComboScout',
  description: 'Check out this CS2 loadout on ComboScout',
};

export default function ShareRoute({ searchParams }) {
  const encodedData = searchParams?.d || null;

  return <SharePage encodedData={encodedData} />;
}
