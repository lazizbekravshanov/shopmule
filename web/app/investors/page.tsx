import { Metadata } from 'next';
import { InvestorsContent } from './investors-content';

export const metadata: Metadata = {
  title: 'For Investors | ShopMule',
  description: 'ShopMule is modernizing the $52B commercial repair industry. Learn about our market opportunity, traction, and team.',
  openGraph: {
    title: 'Invest in ShopMule | Modernizing Commercial Repair',
    description: 'ShopMule is modernizing the $52B commercial repair industry with AI-powered shop management software for all repair shops.',
  },
};

export default function InvestorsPage() {
  return <InvestorsContent />;
}
