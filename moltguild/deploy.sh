#!/bin/bash
set -e

echo "🚀 MoltGuild Deployment Script"
echo "================================"

# Export Solana path
export PATH="/Users/vitalii/.local/share/solana/install/active_release/bin:$PATH"

# Check balance
BALANCE=$(solana balance FHMaY8e2RRhqHnyegph4xLyS1tnWsaTb1RTUWBZfiVVx)
echo "Current balance: $BALANCE"

if [[ "$BALANCE" == "0 SOL" ]]; then
    echo "❌ No SOL in wallet. Please fund the wallet first:"
    echo "   Wallet: FHMaY8e2RRhqHnyegph4xLyS1tnWsaTb1RTUWBZfiVVx"
    echo "   Faucet: https://faucet.solana.com"
    exit 1
fi

echo "✅ Wallet funded"
echo ""

# Set cluster
echo "📡 Setting cluster to devnet..."
solana config set --url devnet

# Build if needed
if [ ! -f "target/deploy/moltguild.so" ]; then
    echo "🔨 Building program..."
    source "$HOME/.cargo/env"
    anchor build
fi

echo "✅ Program built"
echo ""

# Deploy
echo "🚀 Deploying to devnet..."
anchor deploy

echo ""
echo "✅ Deployment complete!"
echo ""
echo "Program ID: 9qJDnBqmjyTFX1AYyChWyme4HZCtK5km6QqNKcfbyaEp"
echo "Cluster: devnet"
echo ""
echo "Next steps:"
echo "1. Verify deployment: anchor idl fetch 9qJDnBqmjyTFX1AYyChWyme4HZCtK5km6QqNKcfbyaEp"
echo "2. Run tests: anchor test --skip-local-validator"
echo "3. Build frontend: cd app && npm install && npm run dev"
