import './globals.css';
import Providers from '@/components/Providers';

export const metadata = {
  title: 'CreatorChain — Blockchain-Powered Content Ownership',
  description: 'A hybrid DRM platform where AI ensures content authenticity, Web2 ensures usability, and blockchain provides immutable ownership and royalty enforcement.',
  keywords: 'blockchain, content ownership, DRM, NFT, royalty, copyright, AI fingerprinting, Polygon',
  openGraph: {
    title: 'CreatorChain — Own Your Digital Legacy',
    description: 'AI-verified content. Blockchain-notarized ownership. Automated royalties.',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
