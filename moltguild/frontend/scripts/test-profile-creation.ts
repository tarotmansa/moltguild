/**
 * Test script for profile creation on devnet
 * 
 * Usage:
 *   npx tsx scripts/test-profile-creation.ts
 * 
 * Make sure you have a keypair at ~/.config/solana/id.json
 */

import { AnchorProvider, Program, Wallet } from "@coral-xyz/anchor";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import IDL from "../target/idl/moltguild.json";
import type { Moltguild } from "../target/types/moltguild";

const PROGRAM_ID = new PublicKey("9qJDnBqmjyTFX1AYyChWyme4HZCtK5km6QqNKcfbyaEp");
const RPC_URL = "https://api.devnet.solana.com";

function getAgentProfilePDA(owner: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("agent"), owner.toBuffer()],
    PROGRAM_ID
  );
}

async function main() {
  console.log("🧪 Testing MoltGuild Profile Creation on Devnet\n");

  // Load wallet from filesystem
  const keypairPath = path.join(os.homedir(), ".config/solana/id.json");
  if (!fs.existsSync(keypairPath)) {
    console.error("❌ Keypair not found at", keypairPath);
    console.log("   Create one with: solana-keygen new");
    process.exit(1);
  }

  const keypairData = JSON.parse(fs.readFileSync(keypairPath, "utf-8"));
  const keypair = Keypair.fromSecretKey(new Uint8Array(keypairData));
  console.log("✅ Loaded wallet:", keypair.publicKey.toBase58());

  // Setup connection and provider
  const connection = new Connection(RPC_URL, "confirmed");
  const wallet = new Wallet(keypair);
  const provider = new AnchorProvider(connection, wallet, {
    commitment: "confirmed",
  });

  // Get program
  const program = new Program<Moltguild>(IDL as Moltguild, provider);
  console.log("✅ Connected to program:", PROGRAM_ID.toBase58());

  // Check SOL balance
  const balance = await connection.getBalance(keypair.publicKey);
  console.log(`✅ Balance: ${(balance / 1e9).toFixed(4)} SOL\n`);

  if (balance < 0.01 * 1e9) {
    console.log("⚠️  Low balance! Request airdrop with:");
    console.log(`   solana airdrop 1 ${keypair.publicKey.toBase58()} --url devnet\n`);
  }

  // Test data
  const testProfile = {
    handle: `test_agent_${Date.now()}`,
    bio: "Test agent profile created by MoltGuild test script",
    skills: ["Testing", "TypeScript", "Solana"],
  };

  console.log("📝 Creating profile with data:");
  console.log("   Handle:", testProfile.handle);
  console.log("   Bio:", testProfile.bio);
  console.log("   Skills:", testProfile.skills.join(", "));
  console.log();

  // Derive PDA
  const [profilePDA] = getAgentProfilePDA(keypair.publicKey);
  console.log("🔑 Profile PDA:", profilePDA.toBase58());

  try {
    // Check if profile already exists
    try {
      const existingProfile = await program.account.agentProfile.fetch(profilePDA);
      console.log("⚠️  Profile already exists!");
      console.log("   Handle:", existingProfile.handle);
      console.log("   Bio:", existingProfile.bio);
      console.log("   Skills:", existingProfile.skills.join(", "));
      console.log("\n✅ Test passed - profile exists and is readable!");
      return;
    } catch (e) {
      // Profile doesn't exist, continue with creation
      console.log("✅ Profile PDA is available (doesn't exist yet)\n");
    }

    // Create profile
    console.log("🚀 Sending transaction...");
    const tx = await program.methods
      .initializeAgentProfile(
        testProfile.handle,
        testProfile.bio,
        testProfile.skills
      )
      .accountsPartial({
        profile: profilePDA,
        owner: keypair.publicKey,
        payer: keypair.publicKey,
        systemProgram: PublicKey.default,
      })
      .rpc();

    console.log("✅ Transaction successful!");
    console.log("   Signature:", tx);
    console.log("   Explorer:", `https://explorer.solana.com/tx/${tx}?cluster=devnet`);
    console.log();

    // Fetch and verify
    console.log("🔍 Fetching created profile...");
    const createdProfile = await program.account.agentProfile.fetch(profilePDA);
    console.log("✅ Profile created successfully!");
    console.log("   Handle:", createdProfile.handle);
    console.log("   Bio:", createdProfile.bio);
    console.log("   Skills:", createdProfile.skills.join(", "));
    console.log("   Reputation:", createdProfile.reputationScore.toString());
    console.log("   Availability:", Object.keys(createdProfile.availability)[0]);
    console.log("\n🎉 All tests passed!");
  } catch (error: any) {
    console.error("\n❌ Error creating profile:");
    console.error(error);
    
    if (error.logs) {
      console.log("\n📋 Program logs:");
      error.logs.forEach((log: string) => console.log("  ", log));
    }
    
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
