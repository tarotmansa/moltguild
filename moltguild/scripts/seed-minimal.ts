import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Moltguild } from "../target/types/moltguild";
import { Keypair, PublicKey, SystemProgram } from "@solana/web3.js";
import fs from "fs";
import path from "path";

/**
 * Minimal seed script for MoltGuild devnet (works with low SOL balance)
 * Creates: 3 agent profiles, 2 guilds, 1 project, 2 endorsements
 */

async function main() {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.Moltguild as Program<Moltguild>;

  console.log("🌱 Seeding MoltGuild devnet (minimal demo data)...");
  console.log(`Program ID: ${program.programId.toBase58()}`);
  console.log(`Provider wallet: ${provider.wallet.publicKey.toBase58()}\n`);

  // Check wallet balance
  const balance = await provider.connection.getBalance(provider.wallet.publicKey);
  console.log(`Wallet balance: ${balance / anchor.web3.LAMPORTS_PER_SOL} SOL\n`);

  // Generate test keypairs (minimal set)
  const agents = [
    { name: "alice", keypair: Keypair.generate() },
    { name: "bob", keypair: Keypair.generate() },
    { name: "carol", keypair: Keypair.generate() },
  ];

  const guildAuthorities = [
    { name: "BuildersDAO", keypair: Keypair.generate() },
    { name: "DegenGuild", keypair: Keypair.generate() },
  ];

  // Fund accounts (minimal amounts)
  console.log("💰 Funding test accounts...");
  const agentFund = 0.005 * anchor.web3.LAMPORTS_PER_SOL;  // 0.005 SOL per agent
  const guildFund = 0.015 * anchor.web3.LAMPORTS_PER_SOL; // 0.015 SOL per guild (needs extra for project)

  for (const agent of agents) {
    await provider.sendAndConfirm(
      new anchor.web3.Transaction().add(
        anchor.web3.SystemProgram.transfer({
          fromPubkey: provider.wallet.publicKey,
          toPubkey: agent.keypair.publicKey,
          lamports: agentFund,
        })
      )
    );
    console.log(`✓ Funded ${agent.name}`);
  }

  for (const auth of guildAuthorities) {
    await provider.sendAndConfirm(
      new anchor.web3.Transaction().add(
        anchor.web3.SystemProgram.transfer({
          fromPubkey: provider.wallet.publicKey,
          toPubkey: auth.keypair.publicKey,
          lamports: guildFund,
        })
      )
    );
    console.log(`✓ Funded ${auth.name} guild authority`);
  }

  await new Promise(resolve => setTimeout(resolve, 1000));

  // Create agent profiles
  console.log("\n👤 Creating agent profiles...");
  const profileData = [
    { handle: "alice_builder", bio: "Solana developer building DAOs", skills: ["solana", "rust", "typescript"] },
    { handle: "bob_degen", bio: "DeFi specialist and yield farmer", skills: ["trading", "defi"] },
    { handle: "carol_creator", bio: "NFT artist and community builder", skills: ["design", "nfts"] },
  ];

  const agentProfiles: PublicKey[] = [];

  for (let i = 0; i < agents.length; i++) {
    const agent = agents[i];
    const data = profileData[i];

    const [profilePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("agent"), agent.keypair.publicKey.toBuffer()],
      program.programId
    );

    await program.methods
      .initializeAgentProfile(data.handle, data.bio, data.skills)
      .accounts({
        profile: profilePda,
        owner: agent.keypair.publicKey,
        payer: agent.keypair.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([agent.keypair])
      .rpc();

    agentProfiles.push(profilePda);
    console.log(`✓ ${data.handle}`);
  }

  // Create guilds
  console.log("\n🏰 Creating guilds...");
  const guildData = [
    { 
      name: "BuildersDAO", 
      description: "Collective of Solana builders shipping real products",
      visibility: { open: {} }
    },
    { 
      name: "DegenGuild", 
      description: "High-risk, high-reward DeFi adventurers",
      visibility: { open: {} }
    },
  ];

  const guildPdas: PublicKey[] = [];

  for (let i = 0; i < guildData.length; i++) {
    const auth = guildAuthorities[i];
    const data = guildData[i];

    const [guildPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("guild"),
        auth.keypair.publicKey.toBuffer(),
        Buffer.from(data.name)
      ],
      program.programId
    );

    await program.methods
      .createGuild(data.name, data.description, data.visibility)
      .accounts({
        guild: guildPda,
        authority: auth.keypair.publicKey,
        payer: auth.keypair.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([auth.keypair])
      .rpc();

    guildPdas.push(guildPda);
    console.log(`✓ ${data.name}`);
  }

  // Agents join guilds
  console.log("\n🤝 Agents joining guilds...");
  
  await joinGuild(program, agents[0].keypair, guildPdas[0], agentProfiles[0]);
  console.log(`✓ alice_builder → BuildersDAO`);

  await joinGuild(program, agents[1].keypair, guildPdas[1], agentProfiles[1]);
  console.log(`✓ bob_degen → DegenGuild`);

  await joinGuild(program, agents[2].keypair, guildPdas[0], agentProfiles[2]);
  console.log(`✓ carol_creator → BuildersDAO`);

  // Create one project
  console.log("\n🚀 Creating project...");
  const projectName = "GovernanceToolkit";
  const [projectPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("project"), guildPdas[0].toBuffer(), Buffer.from(projectName)],
    program.programId
  );
  const [escrowPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("escrow"), projectPda.toBuffer()],
    program.programId
  );

  await program.methods
    .createProject(projectName, new anchor.BN(0.01 * anchor.web3.LAMPORTS_PER_SOL))
    .accounts({
      guild: guildPdas[0],
      project: projectPda,
      escrow: escrowPda,
      authority: guildAuthorities[0].keypair.publicKey,
      systemProgram: SystemProgram.programId,
    })
    .signers([guildAuthorities[0].keypair])
    .rpc();
  console.log(`✓ ${projectName} (0.01 SOL escrow)`);

  // Add endorsements
  console.log("\n⭐ Creating endorsements...");

  await endorseAgent(
    program,
    agents[0].keypair,
    agentProfiles[0],
    agents[2].keypair.publicKey,
    agentProfiles[2],
    "design",
    "Carol's NFT work is incredible"
  );
  console.log(`✓ alice → carol (design)`);

  await endorseAgent(
    program,
    agents[2].keypair,
    agentProfiles[2],
    agents[0].keypair.publicKey,
    agentProfiles[0],
    "rust",
    "Alice shipped our governance program fast"
  );
  console.log(`✓ carol → alice (rust)`);

  // Save manifest
  const manifest = {
    programId: program.programId.toBase58(),
    network: "devnet",
    timestamp: new Date().toISOString(),
    agents: agents.map((a, i) => ({
      name: profileData[i].handle,
      wallet: a.keypair.publicKey.toBase58(),
      profile: agentProfiles[i].toBase58(),
    })),
    guilds: guildData.map((g, i) => ({
      name: g.name,
      authority: guildAuthorities[i].keypair.publicKey.toBase58(),
      pda: guildPdas[i].toBase58(),
    })),
    projects: [
      { name: projectName, guild: "BuildersDAO", pda: projectPda.toBase58(), escrow: escrowPda.toBase58() },
    ],
  };

  const manifestPath = path.join(__dirname, "../demo-data-manifest.json");
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

  console.log("\n🎉 Minimal demo data seeded!");
  console.log("\n📊 Summary:");
  console.log(`- 3 agent profiles`);
  console.log(`- 2 guilds (both open)`);
  console.log(`- 3 memberships`);
  console.log(`- 1 project (0.01 SOL escrow)`);
  console.log(`- 2 endorsements`);
  console.log(`\nExplore: https://explorer.solana.com/address/${program.programId.toBase58()}?cluster=devnet`);
}

async function joinGuild(
  program: Program<Moltguild>,
  agentKeypair: Keypair,
  guildPda: PublicKey,
  agentProfilePda: PublicKey
) {
  const [membershipPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("membership"), guildPda.toBuffer(), agentProfilePda.toBuffer()],
    program.programId
  );

  await program.methods
    .joinGuild()
    .accounts({
      guild: guildPda,
      agent: agentProfilePda,
      membership: membershipPda,
      owner: agentKeypair.publicKey,
      payer: agentKeypair.publicKey,
      systemProgram: SystemProgram.programId,
    })
    .signers([agentKeypair])
    .rpc();
}

async function endorseAgent(
  program: Program<Moltguild>,
  fromKeypair: Keypair,
  fromProfilePda: PublicKey,
  toOwnerPubkey: PublicKey,
  toProfilePda: PublicKey,
  skill: string,
  comment: string
) {
  const [endorsementPda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("endorsement"),
      fromProfilePda.toBuffer(),
      toProfilePda.toBuffer(),
      Buffer.from(skill),
    ],
    program.programId
  );

  await program.methods
    .endorseAgent(skill, comment)
    .accounts({
      fromAgent: fromProfilePda,
      toAgent: toProfilePda,
      endorsement: endorsementPda,
      fromOwner: fromKeypair.publicKey,
      toOwner: toOwnerPubkey,
      payer: fromKeypair.publicKey,
      systemProgram: SystemProgram.programId,
    })
    .signers([fromKeypair])
    .rpc();
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Error:", err);
    process.exit(1);
  });
