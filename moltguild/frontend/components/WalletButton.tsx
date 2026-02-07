"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

const WalletMultiButtonDynamic = dynamic(
  async () =>
    (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { 
    ssr: false,
    loading: () => (
      <button className="bg-purple-600 text-white px-4 py-2 rounded-lg">
        Loading...
      </button>
    ),
  }
);

export default function WalletButton() {
  return (
    <Suspense fallback={
      <button className="bg-purple-600 text-white px-4 py-2 rounded-lg">
        Connect Wallet
      </button>
    }>
      <WalletMultiButtonDynamic />
    </Suspense>
  );
}
