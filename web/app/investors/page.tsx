import { Metadata } from 'next';
import { InvestorsContent } from './investors-content';

export const metadata: Metadata = {
  title: 'For Investors | ShopMule',
  description: 'ShopMule is modernizing the $89.6B auto repair industry with AI-powered shop management software. Learn about our market opportunity and team.',
  openGraph: {
    title: 'Invest in ShopMule | Modernizing Auto Repair',
    description: 'ShopMule is modernizing the $89.6B auto repair industry with AI-powered shop management software for all repair shops.',
  },
};

export default function InvestorsPage() {
  return <InvestorsContent />;
}
