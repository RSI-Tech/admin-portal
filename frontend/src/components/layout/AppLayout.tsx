import { type ReactNode } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from '../Footer';

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 min-h-0">
          <div className="h-full">
            {children}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}