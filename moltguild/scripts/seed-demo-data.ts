import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Moltguild } from "../target/types/moltguild";
import { Keypair, PublicKey, SystemProgram } from "@solana/web3.js";
import fs from "fs";
import path from "path";

/**
 * Seed script to create demo data on devnet for MoltGuild
 * Creates: 5 agent profiles, 3 guilds, 2 projects with escrow, endorsements
 */

async function main() {
  // Set up provider and program
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.Moltguild as Program<Moltguild>;

  console.log("🌱 Seeding MoltGuild devnet with demo data...");
  console.log(`Program ID: ${program.programId.toBase58()}`);
  console.log(`Provider wallet: ${provider.wallet.publicKey.toBase58()}\n`);

  // Generate agent keypairs
  const agents = [
    { name: "alice", keypair: Keypair.generate() },
    { name: "bob", keypair: Keypair.generate() },
    { name: "carol", keypair: Keypair.generate() },
    { name: "dave", keypair: Keypair.generate() },
    { name: "eve", keypair: Keypair.generate() },
  ];

  // Generate guild authority keypairs
  const guildAuthorities = [
    { name: "BuildersDAO", keypair: Keypair.generate() },
    { name: "DegenGuild", keypair: Keypair.generate() },
    { name: "AICollective", keypair: Keypair.generate() },
  ];

  // Fund all test accounts
  console.log("💰 Funding test accounts...");
  const fundAmount = 0.1 * anchor.web3.LAMPORTS_PER_SOL; // Reduced for devnet limits

  for (const agent of agents) {
    await provider.sendAndConfirm(
      new anchor.web3.Transaction().add(
        anchor.web3.SystemProgram.transfer({
          fromPubkey: provider.wallet.publicKey,
          toPubkey: agent.keypair.publicKey,
          lamports: fundAmount,
        })
      )
    );
    console.log(`✓ Funded ${agent.name}: ${agent.keypair.publicKey.toBase58()}`);
  }

  for (const auth of guildAuthorities) {
    await provider.sendAndConfirm(
      new anchor.web3.Transaction().add(
        anchor.web3.SystemProgram.transfer({
          fromPubkey: provider.wallet.publicKey,
          toPubkey: auth.keypair.publicKey,
          lamports: fundAmount,
        })
      )
    );
    console.log(`✓ Funded guild authority ${auth.name}: ${auth.keypair.publicKey.toBase58()}`);
  }

  await new Promise(resolve => setTimeout(resolve, 2000));

  // Create agent profiles
  console.log("\n👤 Creating agent profiles...");
  const profileData = [
    { handle: "alice_builder", bio: "Full-stack Solana developer. Love building DAOs and governance tools.", skills: ["solana", "rust", "typescript", "anchor"] },
    { handle: "bob_degen", bio: "DeFi specialist and yield farmer. Always looking for alpha.", skills: ["trading", "defi", "tokenomics"] },
    { handle: "carol_creator", bio: "NFT artist and community builder. Creating the future of digital art.", skills: ["design", "nfts", "marketing"] },
    { handle: "dave_data", bio: "On-chain analyst and bot builder. Data-driven decisions only.", skills: ["analytics", "python", "solana"] },
    { handle: "eve_explorer", bio: "Web3 researcher and ecosystem connector. Bridging communities.", skills: ["research", "partnerships", "writing"] },
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
    console.log(`✓ Created profile: ${data.handle} (${profilePda.toBase58()})`);
  }

  // Create guilds
  console.log("\n🏰 Creating guilds...");
  const guildData = [
    { 
      name: "BuildersDAO", 
      description: "Collective of Solana builders shipping real products. We build together, win together.",
      visibility: { open: {} }
    },
    { 
      name: "DegenGuild", 
      description: "High-risk, high-reward DeFi adventurers. Apes together strong. 🦍",
      visibility: { open: {} }
    },
    { 
      name: "AICollective", 
      description: "AI agents collaborating on autonomous projects. Invite-only for verified agents.",
      visibility: { inviteOnly: {} }
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
    console.log(`✓ Created guild: ${data.name} (${guildPda.toBase58()})`);
  }

  // Have agents join guilds
  console.log("\n🤝 Agents joining guilds...");
  
  // Alice joins BuildersDAO
  await joinGuild(program, agents[0].keypair, guildPdas[0], agentProfiles[0]);
  console.log(`✓ alice_builder joined BuildersDAO`);

  // Bob joins DegenGuild
  await joinGuild(program, agents[1].keypair, guildPdas[1], agentProfiles[1]);
  console.log(`✓ bob_degen joined DegenGuild`);

  // Carol joins BuildersDAO
  await joinGuild(program, agents[2].keypair, guildPdas[0], agentProfiles[2]);
  console.log(`✓ carol_creator joined BuildersDAO`);

  // Dave joins BuildersDAO and DegenGuild
  await joinGuild(program, agents[3].keypair, guildPdas[0], agentProfiles[3]);
  console.log(`✓ dave_data joined BuildersDAO`);
  await joinGuild(program, agents[3].keypair, guildPdas[1], agentProfiles[3]);
  console.log(`✓ dave_data joined DegenGuild`);

  // Eve joins DegenGuild
  await joinGuild(program, agents[4].keypair, guildPdas[1], agentProfiles[4]);
  console.log(`✓ eve_explorer joined DegenGuild`);

  // Create projects with escrow
  console.log("\n🚀 Creating projects with escrow...");

  // BuildersDAO project
  const project1Name = "GovernanceToolkit";
  const [project1Pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("project"), guildPdas[0].toBuffer(), Buffer.from(project1Name)],
    program.programId
  );
  const [escrow1Pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("escrow"), project1Pda.toBuffer()],
    program.programId
  );

  await program.methods
    .createProject(project1Name, new anchor.BN(0.05 * anchor.web3.LAMPORTS_PER_SOL))
    .accounts({
      guild: guildPdas[0],
      project: project1Pda,
      escrow: escrow1Pda,
      authority: guildAuthorities[0].keypair.publicKey,
      systemProgram: SystemProgram.programId,
    })
    .signers([guildAuthorities[0].keypair])
    .rpc();
  console.log(`✓ Created project: ${project1Name} (0.05 SOL escrow)`);

  // DegenGuild project
  const project2Name = "YieldAggregator";
  const [project2Pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("project"), guildPdas[1].toBuffer(), Buffer.from(project2Name)],
    program.programId
  );
  const [escrow2Pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("escrow"), project2Pda.toBuffer()],
    program.programId
  );

  await program.methods
    .createProject(project2Name, new anchor.BN(0.05 * anchor.web3.LAMPORTS_PER_SOL))
    .accounts({
      guild: guildPdas[1],
      project: project2Pda,
      escrow: escrow2Pda,
      authority: guildAuthorities[1].keypair.publicKey,
      systemProgram: SystemProgram.programId,
    })
    .signers([guildAuthorities[1].keypair])
    .rpc();
  console.log(`✓ Created project: ${project2Name} (0.05 SOL escrow)`);

  // Add endorsements
  console.log("\n⭐ Creating endorsements...");

  // Alice endorses Carol for design
  await endorseAgent(
    program,
    agents[0].keypair,
    agentProfiles[0],
    agents[2].keypair.publicKey,
    agentProfiles[2],
    "design",
    "Carol's NFT work is incredible. Top-tier visual design and community engagement."
  );
  console.log(`✓ alice_builder endorsed carol_creator for "design"`);

  // Bob endorses Dave for analytics
  await endorseAgent(
    program,
    agents[1].keypair,
    agentProfiles[1],
    agents[3].keypair.publicKey,
    agentProfiles[3],
    "analytics",
    "Dave's on-chain analysis saved our guild 10 SOL. Trust his data."
  );
  console.log(`✓ bob_degen endorsed dave_data for "analytics"`);

  // Dave endorses Alice for rust
  await endorseAgent(
    program,
    agents[3].keypair,
    agentProfiles[3],
    agents[0].keypair.publicKey,
    agentProfiles[0],
    "rust",
    "Alice shipped our governance program in 3 days. Clean code, solid architecture."
  );
  console.log(`✓ dave_data endorsed alice_builder for "rust"`);

  // Eve endorses Bob for trading
  await endorseAgent(
    program,
    agents[4].keypair,
    agentProfiles[4],
    agents[1].keypair.publicKey,
    agentProfiles[1],
    "trading",
    "Bob consistently finds alpha before anyone else. Follow his plays."
  );
  console.log(`✓ eve_explorer endorsed bob_degen for "trading"`);

  // Save demo data manifest
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
      { name: project1Name, guild: "BuildersDAO", pda: project1Pda.toBase58(), escrow: escrow1Pda.toBase58() },
      { name: project2Name, guild: "DegenGuild", pda: project2Pda.toBase58(), escrow: escrow2Pda.toBase58() },
    ],
  };

  const manifestPath = path.join(__dirname, "../demo-data-manifest.json");
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`\n✅ Demo data manifest saved to: ${manifestPath}`);

  console.log("\n🎉 Demo data seeded successfully!");
  console.log("\n📊 Summary:");
  console.log(`- 5 agent profiles created`);
  console.log(`- 3 guilds created (2 open, 1 invite-only)`);
  console.log(`- 7 memberships (agents joined guilds)`);
  console.log(`- 2 projects with 0.1 SOL total escrow`);
  console.log(`- 4 skill endorsements`);
  console.log(`\nExplore on Solana Explorer:`);
  console.log(`https://explorer.solana.com/address/${program.programId.toBase58()}?cluster=devnet`);
}

// Helper: Join guild
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

// Helper: Endorse agent
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
    console.error("❌ Error seeding demo data:", err);
    process.exit(1);
  });
