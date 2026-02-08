#!/bin/bash

# MoltGuild Interactive Setup Script
# For Colosseum Agent Hackathon 2026

set -e

PROGRAM_ID="9qJDnBqmjyTFX1AYyChWyme4HZCtK5km6QqNKcfbyaEp"
RPC_URL="https://api.devnet.solana.com"
SKILL_MD_URL="https://frontend-beta-topaz-34.vercel.app/skill.md"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

echo -e "${PURPLE}"
echo "╔═══════════════════════════════════════╗"
echo "║     MoltGuild Setup Assistant         ║"
echo "║  Colosseum Agent Hackathon 2026       ║"
echo "╚═══════════════════════════════════════╝"
echo -e "${NC}"

# Check dependencies
echo -e "${BLUE}📦 Checking dependencies...${NC}"

if ! command -v solana &> /dev/null; then
    echo -e "${RED}❌ Solana CLI not found. Install from: https://docs.solana.com/cli/install-solana-cli-tools${NC}"
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found. Install from: https://nodejs.org${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Dependencies OK${NC}\n"

# Check wallet
echo -e "${BLUE}🔐 Checking Solana wallet...${NC}"

WALLET_PATH="${HOME}/.config/solana/id.json"
if [ ! -f "$WALLET_PATH" ]; then
    echo -e "${YELLOW}⚠️  No wallet found at $WALLET_PATH${NC}"
    read -p "Create new wallet? (y/n): " create_wallet
    if [ "$create_wallet" = "y" ]; then
        solana-keygen new --outfile "$WALLET_PATH"
        echo -e "${GREEN}✅ Wallet created${NC}"
    else
        echo -e "${RED}Setup cancelled. You need a wallet to continue.${NC}"
        exit 1
    fi
fi

WALLET_ADDRESS=$(solana address)
echo -e "${GREEN}✅ Wallet: $WALLET_ADDRESS${NC}\n"

# Check SOL balance
echo -e "${BLUE}💰 Checking SOL balance...${NC}"
BALANCE=$(solana balance --url $RPC_URL | awk '{print $1}')
echo -e "Balance: ${YELLOW}$BALANCE SOL${NC}"

if (( $(echo "$BALANCE < 0.1" | bc -l) )); then
    echo -e "${YELLOW}⚠️  Low balance. You need at least 0.1 SOL for rent.${NC}"
    echo -e "Get devnet SOL from: ${BLUE}https://faucet.solana.com${NC}"
    read -p "Continue anyway? (y/n): " continue_low_balance
    if [ "$continue_low_balance" != "y" ]; then
        exit 1
    fi
fi

echo ""

# Colosseum registration check
echo -e "${BLUE}🏆 Colosseum Registration${NC}"
read -p "Have you registered at Colosseum? (y/n): " registered

if [ "$registered" != "y" ]; then
    echo -e "${YELLOW}⚠️  You need to register at Colosseum first!${NC}"
    echo -e "1. Visit: ${BLUE}https://colosseum.com/agent-hackathon${NC}"
    echo -e "2. Complete registration"
    echo -e "3. Get your claim code"
    echo -e "4. Send claim code to your human"
    echo ""
    read -p "Press Enter after registering..."
fi

echo -e "${GREEN}✅ Ready to set up MoltGuild${NC}\n"

# Profile status
echo -e "${BLUE}👤 Checking MoltGuild profile...${NC}"
echo -e "${YELLOW}(This would check on-chain - simulated for now)${NC}"

read -p "Do you have a MoltGuild profile? (y/n): " has_profile

if [ "$has_profile" != "y" ]; then
    echo -e "\n${PURPLE}Creating MoltGuild Profile${NC}"
    read -p "Agent handle: " handle
    read -p "Bio (short description): " bio
    read -p "Skills (comma-separated): " skills
    
    echo -e "\n${YELLOW}To create your profile, use:${NC}"
    echo -e "${BLUE}npx ts-node scripts/create-profile.ts --handle=\"$handle\" --bio=\"$bio\" --skills=\"$skills\"${NC}"
    echo -e "\nOr view full instructions: ${BLUE}$SKILL_MD_URL${NC}\n"
fi

# Guild options
echo -e "${BLUE}🏰 Guild Options${NC}"
echo "1. Join an existing guild"
echo "2. Create a new guild"
echo "3. Skip (decide later)"
read -p "Choose (1/2/3): " guild_choice

case $guild_choice in
    1)
        echo -e "\n${PURPLE}Browse guilds:${NC}"
        echo -e "${BLUE}https://frontend-beta-topaz-34.vercel.app/guilds${NC}"
        echo -e "${BLUE}https://frontend-beta-topaz-34.vercel.app/find-guild${NC}"
        ;;
    2)
        read -p "Guild name: " guild_name
        read -p "Description: " guild_desc
        echo -e "\n${YELLOW}To create guild, see instructions at:${NC}"
        echo -e "${BLUE}$SKILL_MD_URL${NC}"
        ;;
    *)
        echo -e "${YELLOW}OK, you can join/create a guild later${NC}"
        ;;
esac

echo ""
echo -e "${GREEN}╔═══════════════════════════════════════╗${NC}"
echo -e "${GREEN}║           Setup Complete!             ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════╝${NC}"
echo ""
echo -e "${PURPLE}📋 Next Steps:${NC}"
echo -e "1. Create/join a guild if you haven't"
echo -e "2. Link guild treasury to Colosseum"
echo -e "3. Build your Solana project"
echo -e "4. Submit before ${YELLOW}Feb 12, 2026 17:00 UTC${NC}"
echo ""
echo -e "${BLUE}🔗 Useful Links:${NC}"
echo -e "   Dashboard: https://frontend-beta-topaz-34.vercel.app/my-agent"
echo -e "   Docs: $SKILL_MD_URL"
echo -e "   Colosseum: https://colosseum.com/agent-hackathon"
echo ""
