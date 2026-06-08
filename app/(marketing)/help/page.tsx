import { Metadata } from 'next';
import { HelpCenter } from '@/components/features/help';

export const metadata: Metadata = {
  title: 'Help Center | Upsolve.it',
  description: 'Get help and learn how to use Upsolve.it effectively. Find tutorials, FAQs, and support resources.',
};

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <HelpCenter />
      </div>
    </div>
  );
}







