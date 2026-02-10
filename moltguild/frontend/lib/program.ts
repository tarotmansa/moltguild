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
 * Derive squad PDA
 */
export function getSquadPDA(authority: PublicKey, name: string): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("squad"), authority.toBuffer(), Buffer.from(name)],
    PROGRAM_ID
  );
}

/**
 * Derive membership PDA
 */
export function getMembershipPDA(squad: PublicKey, agent: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("membership"), squad.toBuffer(), agent.toBuffer()],
    PROGRAM_ID
  );
}

/**
 * Derive project PDA
 */
export function getProjectPDA(squad: PublicKey, name: string): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("project"), squad.toBuffer(), Buffer.from(name)],
    PROGRAM_ID
  );
}

/**
 * Derive escrow PDA
 */
export function getEscrowPDA(project: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("escrow"), project.toBuffer()],
    PROGRAM_ID
  );
}

/**
 * Derive treasury PDA for a guild/squad
 */
export function getTreasuryPDA(guild: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("treasury"), guild.toBuffer()],
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
 * Create squad on-chain (low-level, requires program instance)
 */
export async function createSquadWithProgram(
  program: Program<Moltguild>,
  authority: PublicKey,
  name: string,
  description: string,
  visibility: "Open" | "InviteOnly" | "TokenGated"
) {
  const [squadPDA] = getSquadPDA(authority, name);

  // Map string to enum format expected by Anchor
  const visibilityEnum = { [visibility.toLowerCase()]: {} };

  const tx = await program.methods
    .createGuild(name, description, visibilityEnum as any, null)
    .accountsPartial({
      guild: squadPDA,
      authority,
      payer: authority,
      systemProgram: web3.SystemProgram.programId,
    })
    .rpc();

  return { signature: tx, squadPDA };
}

/**
 * Fetch all squads
 */
export async function fetchAllSquads(program: Program<Moltguild>) {
  try {
    const squads = await program.account.guild.all();
    return squads.map((g) => ({
      publicKey: g.publicKey,
      account: g.account,
    }));
  } catch (error) {
    console.error("Failed to fetch squads:", error);
    return [];
  }
}

/**
 * Create squad (with wallet adapter support)
 */
export async function createSquad(
  connection: Connection,
  wallet: WalletContextState,
  name: string,
  description: string,
  visibility: "Open" | "InviteOnly" | "TokenGated"
) {
  if (!wallet.publicKey || !wallet.signTransaction) {
    throw new Error("Wallet not connected");
  }

  const program = getProgram(connection, wallet);
  const [squadPDA] = getSquadPDA(wallet.publicKey, name);

  // Map visibility to enum variant
  const visibilityVariant = visibility === "Open" 
    ? { open: {} }
    : visibility === "InviteOnly"
    ? { inviteOnly: {} }
    : { tokenGated: {} };

  const tx = await program.methods
    .createGuild(name, description, visibilityVariant, null)
    .accountsPartial({
      guild: squadPDA,
      authority: wallet.publicKey,
      payer: wallet.publicKey,
      systemProgram: web3.SystemProgram.programId,
    })
    .rpc();

  return tx;
}

/**
 * Join squad
 */
export async function joinSquad(
  program: Program<Moltguild>,
  owner: PublicKey,
  squadPDA: PublicKey
) {
  const [agentPDA] = getAgentProfilePDA(owner);
  const [membershipPDA] = getMembershipPDA(squadPDA, agentPDA);

  const tx = await program.methods
    .joinGuild()
    .accountsPartial({
      guild: squadPDA,
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

/**
 * Fetch all squads from on-chain
 */
export async function getAllSquads(connection: Connection) {
  const accounts = await connection.getProgramAccounts(PROGRAM_ID, {
    filters: [
      {
        // Filter by account discriminator for Squad (8 bytes)
        memcmp: {
          offset: 0,
          bytes: "3", // Squad discriminator (you may need to adjust based on Anchor's discriminator)
        },
      },
    ],
  });

  const squads = accounts.map((account) => {
    const data = account.account.data;
    
    // Parse Squad account (simplified - adjust based on actual layout)
    // Anchor accounts: [8 byte discriminator][data]
    const nameLen = data.readUInt32LE(8);
    const name = data.slice(12, 12 + nameLen).toString("utf-8");
    
    const descOffset = 12 + nameLen;
    const descLen = data.readUInt32LE(descOffset);
    const description = data.slice(descOffset + 4, descOffset + 4 + descLen).toString("utf-8");
    
    const authorityOffset = descOffset + 4 + descLen;
    const authority = new PublicKey(data.slice(authorityOffset, authorityOffset + 32));
    
    const treasuryOffset = authorityOffset + 32;
    const treasury = new PublicKey(data.slice(treasuryOffset, treasuryOffset + 32));
    
    const memberCountOffset = treasuryOffset + 32;
    const memberCount = data.readUInt32LE(memberCountOffset);
    
    const isOpenOffset = memberCountOffset + 4;
    const isOpen = data.readUInt8(isOpenOffset) === 1;
    
    const createdAtOffset = isOpenOffset + 1;
    const createdAt = Number(data.readBigInt64LE(createdAtOffset));
    
    return {
      pubkey: account.pubkey.toBase58(),
      name,
      description,
      authority: authority.toBase58(),
      treasury: treasury.toBase58(),
      memberCount,
      isOpen,
      createdAt,
    };
  });

  return squads;
}

/**
 * Distribute prize from guild treasury to members
 */
export async function distributePrize(
  connection: Connection,
  wallet: WalletContextState,
  guildPDA: PublicKey,
  recipientAddresses: PublicKey[]
) {
  if (!wallet.publicKey || !wallet.signTransaction) {
    throw new Error("Wallet not connected");
  }

  const program = getProgram(connection, wallet);
  const [treasuryPDA] = getTreasuryPDA(guildPDA);

  // Build transaction with remaining accounts for recipients
  const tx = await program.methods
    .distributePrize()
    .accountsPartial({
      guild: guildPDA,
      treasury: treasuryPDA,
      caller: wallet.publicKey,
      systemProgram: web3.SystemProgram.programId,
    })
    .remainingAccounts(
      recipientAddresses.map(addr => ({
        pubkey: addr,
        isWritable: true,
        isSigner: false,
      }))
    )
    .rpc();

  return tx;
}
