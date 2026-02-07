import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Moltguild } from "../target/types/moltguild";
import { Keypair, PublicKey, SystemProgram } from "@solana/web3.js";
import { assert } from "chai";

describe("moltguild", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Moltguild as Program<Moltguild>;
  
  // Test accounts
  const agent1 = Keypair.generate();
  const agent2 = Keypair.generate();
  const guildAuthority = Keypair.generate();

  let agent1ProfilePda: PublicKey;
  let agent2ProfilePda: PublicKey;
  let guildPda: PublicKey;
  let membershipPda: PublicKey;

  before(async () => {
    // Fund test accounts from provider wallet instead of airdrops
    const fundAmount = 1.5 * anchor.web3.LAMPORTS_PER_SOL;
    
    // Transfer SOL to agent1
    await provider.sendAndConfirm(
      new anchor.web3.Transaction().add(
        anchor.web3.SystemProgram.transfer({
          fromPubkey: provider.wallet.publicKey,
          toPubkey: agent1.publicKey,
          lamports: fundAmount,
        })
      )
    );
    
    // Transfer SOL to agent2
    await provider.sendAndConfirm(
      new anchor.web3.Transaction().add(
        anchor.web3.SystemProgram.transfer({
          fromPubkey: provider.wallet.publicKey,
          toPubkey: agent2.publicKey,
          lamports: fundAmount,
        })
      )
    );
    
    // Transfer SOL to guildAuthority
    await provider.sendAndConfirm(
      new anchor.web3.Transaction().add(
        anchor.web3.SystemProgram.transfer({
          fromPubkey: provider.wallet.publicKey,
          toPubkey: guildAuthority.publicKey,
          lamports: fundAmount,
        })
      )
    );

    // Wait for transactions to confirm
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Derive PDAs
    [agent1ProfilePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("agent"), agent1.publicKey.toBuffer()],
      program.programId
    );

    [agent2ProfilePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("agent"), agent2.publicKey.toBuffer()],
      program.programId
    );
  });

  it("Creates an agent profile", async () => {
    const handle = "alice";
    const bio = "AI agent builder";
    const skills = ["solana", "rust", "typescript"];

    await program.methods
      .initializeAgentProfile(handle, bio, skills)
      .accounts({
        profile: agent1ProfilePda,
        owner: agent1.publicKey,
        payer: agent1.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([agent1])
      .rpc();

    const profile = await program.account.agentProfile.fetch(agent1ProfilePda);
    
    assert.equal(profile.handle, handle);
    assert.equal(profile.bio, bio);
    assert.deepEqual(profile.skills, skills);
    assert.equal(profile.guildCount, 0);
    assert.equal(profile.projectCount, 0);
    assert.equal(profile.reputationScore.toNumber(), 0);
  });

  it("Updates an agent profile", async () => {
    const newBio = "Updated bio";
    const newSkills = ["solana", "anchor"];

    await program.methods
      .updateAgentProfile(newBio, newSkills, { available: {} })
      .accounts({
        profile: agent1ProfilePda,
        owner: agent1.publicKey,
      })
      .signers([agent1])
      .rpc();

    const profile = await program.account.agentProfile.fetch(agent1ProfilePda);
    
    assert.equal(profile.bio, newBio);
    assert.deepEqual(profile.skills, newSkills);
  });

  it("Creates a guild", async () => {
    const guildName = "BuildersDAO";
    const description = "Agent collective building on Solana";
    const visibility = { open: {} };

    [guildPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("guild"),
        guildAuthority.publicKey.toBuffer(),
        Buffer.from(guildName)
      ],
      program.programId
    );

    await program.methods
      .createGuild(guildName, description, visibility)
      .accounts({
        guild: guildPda,
        authority: guildAuthority.publicKey,
        payer: guildAuthority.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([guildAuthority])
      .rpc();

    const guild = await program.account.guild.fetch(guildPda);
    
    assert.equal(guild.name, guildName);
    assert.equal(guild.description, description);
    assert.equal(guild.memberCount, 0);
    assert.equal(guild.projectCount, 0);
    assert.equal(guild.reputationScore.toNumber(), 0);
  });

  it("Agent joins a guild", async () => {
    [membershipPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("membership"),
        guildPda.toBuffer(),
        agent1ProfilePda.toBuffer()
      ],
      program.programId
    );

    await program.methods
      .joinGuild()
      .accounts({
        guild: guildPda,
        agent: agent1ProfilePda,
        membership: membershipPda,
        owner: agent1.publicKey,
        payer: agent1.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([agent1])
      .rpc();

    const membership = await program.account.membership.fetch(membershipPda);
    const guild = await program.account.guild.fetch(guildPda);
    const agent = await program.account.agentProfile.fetch(agent1ProfilePda);
    
    assert.equal(membership.guild.toBase58(), guildPda.toBase58());
    assert.equal(membership.agent.toBase58(), agent1ProfilePda.toBase58());
    assert.equal(guild.memberCount, 1);
    assert.equal(agent.guildCount, 1);
  });

  it("Creates a second agent profile", async () => {
    await program.methods
      .initializeAgentProfile("bob", "DeFi specialist", ["trading", "defi"])
      .accounts({
        profile: agent2ProfilePda,
        owner: agent2.publicKey,
        payer: agent2.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([agent2])
      .rpc();

    const profile = await program.account.agentProfile.fetch(agent2ProfilePda);
    assert.equal(profile.handle, "bob");
  });

  it("Agent1 endorses agent2", async () => {
    const skill = "trading";
    const comment = "Excellent DeFi knowledge";

    const [endorsementPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("endorsement"),
        agent1ProfilePda.toBuffer(),
        agent2ProfilePda.toBuffer(),
        Buffer.from(skill)
      ],
      program.programId
    );

    await program.methods
      .endorseAgent(skill, comment)
      .accounts({
        fromAgent: agent1ProfilePda,
        toAgent: agent2ProfilePda,
        endorsement: endorsementPda,
        fromOwner: agent1.publicKey,
        toOwner: agent2.publicKey,
        payer: agent1.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([agent1])
      .rpc();

    const endorsement = await program.account.endorsement.fetch(endorsementPda);
    const agent2Profile = await program.account.agentProfile.fetch(agent2ProfilePda);
    
    assert.equal(endorsement.skill, skill);
    assert.equal(endorsement.comment, comment);
    assert.isAbove(agent2Profile.reputationScore.toNumber(), 0);
  });

  it("Creates a project with escrow", async () => {
    const projectName = "BuildToken";
    const rewardAmount = 1 * anchor.web3.LAMPORTS_PER_SOL;

    const [projectPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("project"),
        guildPda.toBuffer(),
        Buffer.from(projectName)
      ],
      program.programId
    );

    const [escrowPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("escrow"), projectPda.toBuffer()],
      program.programId
    );

    await program.methods
      .createProject(projectName, new anchor.BN(rewardAmount))
      .accounts({
        guild: guildPda,
        project: projectPda,
        escrow: escrowPda,
        authority: guildAuthority.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([guildAuthority])
      .rpc();

    const project = await program.account.project.fetch(projectPda);
    const guild = await program.account.guild.fetch(guildPda);
    
    assert.equal(project.name, projectName);
    assert.equal(project.rewardAmount.toNumber(), rewardAmount);
    assert.equal(guild.projectCount, 1);

    // Check escrow balance
    const escrowBalance = await provider.connection.getBalance(escrowPda);
    assert.equal(escrowBalance, rewardAmount);
  });

  it("Completes a project", async () => {
    const projectName = "BuildToken";

    const [projectPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("project"),
        guildPda.toBuffer(),
        Buffer.from(projectName)
      ],
      program.programId
    );

    const [escrowPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("escrow"), projectPda.toBuffer()],
      program.programId
    );

    const guildBefore = await program.account.guild.fetch(guildPda);
    const repBefore = guildBefore.reputationScore.toNumber();

    await program.methods
      .completeProject()
      .accounts({
        guild: guildPda,
        project: projectPda,
        escrow: escrowPda,
        authority: guildAuthority.publicKey,
      })
      .signers([guildAuthority])
      .rpc();

    const project = await program.account.project.fetch(projectPda);
    const guildAfter = await program.account.guild.fetch(guildPda);
    
    assert.deepEqual(project.status, { completed: {} });
    assert.isNotNull(project.completedAt);
    assert.isAbove(guildAfter.reputationScore.toNumber(), repBefore);
  });

  it("Agent leaves guild", async () => {
    await program.methods
      .leaveGuild()
      .accounts({
        guild: guildPda,
        agent: agent1ProfilePda,
        membership: membershipPda,
        owner: agent1.publicKey,
      })
      .signers([agent1])
      .rpc();

    const guild = await program.account.guild.fetch(guildPda);
    const agent = await program.account.agentProfile.fetch(agent1ProfilePda);
    
    assert.equal(guild.memberCount, 0);
    assert.equal(agent.guildCount, 0);

    // Verify membership account is closed
    try {
      await program.account.membership.fetch(membershipPda);
      assert.fail("Membership should be closed");
    } catch (err) {
      assert.include(err.toString(), "Account does not exist");
    }
  });

  it("Closes an empty guild", async () => {
    await program.methods
      .closeGuild()
      .accounts({
        guild: guildPda,
        authority: guildAuthority.publicKey,
      })
      .signers([guildAuthority])
      .rpc();

    // Verify guild account is closed
    try {
      await program.account.guild.fetch(guildPda);
      assert.fail("Guild should be closed");
    } catch (err) {
      assert.include(err.toString(), "Account does not exist");
    }
  });

  it("Fails to join invite-only guild without approval", async () => {
    const inviteOnlyGuildName = "PrivateDAO";
    
    const [inviteGuildPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("guild"),
        guildAuthority.publicKey.toBuffer(),
        Buffer.from(inviteOnlyGuildName)
      ],
      program.programId
    );

    // Create invite-only guild
    await program.methods
      .createGuild(inviteOnlyGuildName, "Private guild", { inviteOnly: {} })
      .accounts({
        guild: inviteGuildPda,
        authority: guildAuthority.publicKey,
        payer: guildAuthority.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([guildAuthority])
      .rpc();

    const [inviteMembershipPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("membership"),
        inviteGuildPda.toBuffer(),
        agent1ProfilePda.toBuffer()
      ],
      program.programId
    );

    // Try to join (should fail)
    try {
      await program.methods
        .joinGuild()
        .accounts({
          guild: inviteGuildPda,
          agent: agent1ProfilePda,
          membership: inviteMembershipPda,
          owner: agent1.publicKey,
          payer: agent1.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([agent1])
        .rpc();
      
      assert.fail("Should not be able to join invite-only guild");
    } catch (err) {
      assert.include(err.toString(), "GuildIsInviteOnly");
    }
  });
});
