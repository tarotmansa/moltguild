import { AnchorProvider, Program, web3 } from "@coral-xyz/anchor";
import { Connection, PublicKey } from "@solana/web3.js";
import type { WalletContextState } from "@solana/wallet-adapter-react";
import IDL from "../target/idl/moltguild.json";
import type { Moltguild } from "../target/types/moltguild";

export const PROGRAM_ID = new PublicKey("9qJDnBqmjyTFX1AYyChWyme4HZCtK5km6QqNKcfbyaEp");

/**
 * Get Anchor program instance
 */
export function getProgram(connection: Connection, wallet: WalletContextState) {
  const provider = new AnchorProvider(connection, wallet as any, {
    commitment: "confirmed",
  });
  return new Program<Moltguild>(IDL as Moltguild, provider);
}

/**
 * Derive agent profile PDA
 */
export function getAgentProfilePDA(owner: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("agent"), owner.toBuffer()],
    PROGRAM_ID
  );
}

/**
 * Derive guild PDA
 */
export function getGuildPDA(authority: PublicKey, name: string): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("guild"), authority.toBuffer(), Buffer.from(name)],
    PROGRAM_ID
  );
}

/**
 * Derive membership PDA
 */
export function getMembershipPDA(guild: PublicKey, agent: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("membership"), guild.toBuffer(), agent.toBuffer()],
    PROGRAM_ID
  );
}

/**
 * Create agent profile on-chain
 */
export async function createAgentProfile(
  program: Program<Moltguild>,
  owner: PublicKey,
  handle: string,
  bio: string,
  skills: string[]
) {
  const [profilePDA] = getAgentProfilePDA(owner);

  const tx = await program.methods
    .initializeAgentProfile(handle, bio, skills)
    .accountsPartial({
      profile: profilePDA,
      owner,
      payer: owner,
      systemProgram: web3.SystemProgram.programId,
    })
    .rpc();

  return { signature: tx, profilePDA };
}

/**
 * Fetch agent profile from on-chain
 */
export async function fetchAgentProfile(program: Program<Moltguild>, owner: PublicKey) {
  const [profilePDA] = getAgentProfilePDA(owner);
  try {
    const profile = await program.account.agentProfile.fetch(profilePDA);
    return { profile, profilePDA };
  } catch (error) {
    // Profile doesn't exist yet
    return null;
  }
}

/**
 * Fetch agent profile by PDA directly
 */
export async function getAgentProfile(connection: Connection, profilePDA: PublicKey) {
  try {
    // Create minimal provider for read-only operations
    const provider = new AnchorProvider(
      connection,
      {} as any, // No wallet needed for reading
      { commitment: "confirmed" }
    );
    const program = new Program<Moltguild>(IDL as Moltguild, provider);
    
    const profile = await program.account.agentProfile.fetch(profilePDA);
    return profile;
  } catch (error) {
    console.error("Failed to fetch agent profile:", error);
    return null;
  }
}

/**
 * Fetch all agent profiles
 */
export async function fetchAllAgentProfiles(program: Program<Moltguild>) {
  try {
    const profiles = await program.account.agentProfile.all();
    return profiles.map((p) => ({
      publicKey: p.publicKey,
      account: p.account,
    }));
  } catch (error) {
    console.error("Failed to fetch agent profiles:", error);
    return [];
  }
}

/**
 * Create guild on-chain
 */
export async function createGuild(
  program: Program<Moltguild>,
  authority: PublicKey,
  name: string,
  description: string,
  visibility: "Open" | "InviteOnly" | "TokenGated"
) {
  const [guildPDA] = getGuildPDA(authority, name);

  // Map string to enum format expected by Anchor
  const visibilityEnum = { [visibility.toLowerCase()]: {} };

  const tx = await program.methods
    .createGuild(name, description, visibilityEnum as any)
    .accountsPartial({
      guild: guildPDA,
      authority,
      payer: authority,
      systemProgram: web3.SystemProgram.programId,
    })
    .rpc();

  return { signature: tx, guildPDA };
}

/**
 * Fetch all guilds
 */
export async function fetchAllGuilds(program: Program<Moltguild>) {
  try {
    const guilds = await program.account.guild.all();
    return guilds.map((g) => ({
      publicKey: g.publicKey,
      account: g.account,
    }));
  } catch (error) {
    console.error("Failed to fetch guilds:", error);
    return [];
  }
}

/**
 * Join guild
 */
export async function joinGuild(
  program: Program<Moltguild>,
  owner: PublicKey,
  guildPDA: PublicKey
) {
  const [agentPDA] = getAgentProfilePDA(owner);
  const [membershipPDA] = getMembershipPDA(guildPDA, agentPDA);

  const tx = await program.methods
    .joinGuild()
    .accountsPartial({
      guild: guildPDA,
      agent: agentPDA,
      membership: membershipPDA,
      owner,
      payer: owner,
      systemProgram: web3.SystemProgram.programId,
    })
    .rpc();

  return { signature: tx, membershipPDA };
}

/**
 * Derive endorsement PDA
 */
export function getEndorsementPDA(
  fromAgent: PublicKey,
  toAgent: PublicKey,
  skill: string
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from("endorsement"),
      fromAgent.toBuffer(),
      toAgent.toBuffer(),
      Buffer.from(skill),
    ],
    PROGRAM_ID
  );
}

/**
 * Endorse another agent
 * Note: This requires the endorser to have an agent profile already
 */
export async function endorseAgent(
  connection: Connection,
  endorserWallet: PublicKey,
  toAgentProfilePDA: PublicKey,
  skill: string,
  comment: string,
  sendTransaction: (tx: any, connection: Connection) => Promise<string>
) {
  // Get the endorser's profile PDA
  const [fromAgentPDA] = getAgentProfilePDA(endorserWallet);
  
  // Create program with minimal provider
  const provider = new AnchorProvider(
    connection,
    {} as any,
    { commitment: "confirmed" }
  );
  const program = new Program<Moltguild>(IDL as Moltguild, provider);
  
  // Get the owner of the toAgent profile
  const toAgentProfile = await program.account.agentProfile.fetch(toAgentProfilePDA);
  const toOwner = toAgentProfile.owner;
  
  // Derive endorsement PDA
  const [endorsementPDA] = getEndorsementPDA(fromAgentPDA, toAgentProfilePDA, skill);
  
  // Build the transaction
  const tx = await program.methods
    .endorseAgent(skill, comment)
    .accountsPartial({
      fromAgent: fromAgentPDA,
      toAgent: toAgentProfilePDA,
      endorsement: endorsementPDA,
      fromOwner: endorserWallet,
      toOwner,
      payer: endorserWallet,
      systemProgram: web3.SystemProgram.programId,
    })
    .transaction();
  
  // Send transaction using wallet adapter
  const signature = await sendTransaction(tx, connection);
  await connection.confirmTransaction(signature, "confirmed");
  
  return signature;
}
