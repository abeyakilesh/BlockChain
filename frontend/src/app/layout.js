import './globals.css';

export const metadata = {
  title: 'CreatorChain — Blockchain-Powered Content Ownership',
  description: 'A hybrid DRM platform where AI ensures content authenticity, Web2 ensures usability, and blockchain provides immutable ownership and royalty enforcement.',
  keywords: 'blockchain, content ownership, DRM, NFT, royalty, copyright, AI fingerprinting',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
