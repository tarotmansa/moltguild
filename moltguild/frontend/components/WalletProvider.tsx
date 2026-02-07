"use client";

import { FC, ReactNode, useMemo, useState, useEffect } from "react";
import dynamic from "next/dynamic";

// Lazy load wallet components to avoid SSR issues
const ConnectionProvider = dynamic(
  () => import("@solana/wallet-adapter-react").then((mod) => mod.ConnectionProvider),
  { ssr: false }
);

const WalletProvider = dynamic(
  () => import("@solana/wallet-adapter-react").then((mod) => mod.WalletProvider),
  { ssr: false }
);

const WalletModalProvider = dynamic(
  () => import("@solana/wallet-adapter-react-ui").then((mod) => mod.WalletModalProvider),
  { ssr: false }
);

// Dynamic import for wallet adapters
const useWallets = () => {
  return useMemo(() => {
    if (typeof window === "undefined") return [];
    
    try {
      const { PhantomWalletAdapter, SolflareWalletAdapter } = require("@solana/wallet-adapter-wallets");
      return [new PhantomWalletAdapter(), new SolflareWalletAdapter()];
    } catch (e) {
      console.warn("Failed to load wallet adapters:", e);
      return [];
    }
  }, []);
};

export const AppWalletProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [mounted, setMounted] = useState(false);
  const wallets = useWallets();
  const endpoint = "https://api.devnet.solana.com";

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render anything until mounted on client
  if (!mounted) {
    return null;
  }

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect={false}>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};
