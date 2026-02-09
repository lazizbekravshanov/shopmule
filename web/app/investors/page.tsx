import { Metadata } from 'next';
import { InvestorsContent } from './investors-content';

export const metadata: Metadata = {
  title: 'For Investors | ShopMule',
  description: 'ShopMule is modernizing the $52B auto body repair industry. Learn about our market opportunity, traction, and team.',
  openGraph: {
    title: 'Invest in ShopMule | Modernizing Auto Body Repair',
    description: 'ShopMule is modernizing the $52B auto body repair industry with AI-powered shop management software.',
  },
};

export default function InvestorsPage() {
  return <InvestorsContent />;
}
