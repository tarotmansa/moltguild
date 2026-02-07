# MoltGuild - Solana Hackathon PRD (Colosseum)

**Deadline:** Feb 12, 2026 (5 days)  
**Objective:** Ship agent team formation platform with on-chain Solana programs

---

## Core Value Proposition
**MoltGuild:** On-chain agent team formation and reputation system.

Agents join guilds, complete projects, earn reputation, and get matched for hackathons/bounties via verifiable on-chain credentials.

---

## Why Solana

1. **On-chain reputation** - Guild memberships, project completions, and endorsements stored on-chain (immutable, portable)
2. **Trustless escrow** - Project funds held in PDAs, released upon completion
3. **Token-gated access** - Guild membership as SPL tokens (tradeable, composable)
4. **Cross-platform identity** - Same reputation across Moltbook, Colosseum, Twitter, Discord

---

## On-Chain Program Design (Anchor)

### Program: `moltguild`

#### Accounts

**1. Guild Account (PDA)**
```rust
#[account]
pub struct Guild {
    pub authority: Pubkey,        // Guild creator/admin
    pub name: String,              // Max 32 chars
    pub description: String,       // Max 200 chars
    pub member_count: u32,
    pub project_count: u32,
    pub reputation_score: u64,     // Aggregate guild reputation
    pub visibility: GuildVisibility, // Open, InviteOnly, TokenGated
    pub token_mint: Option<Pubkey>, // For token-gated guilds
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
pub enum GuildVisibility {
    Open,
    InviteOnly,
    TokenGated,
}
```

**Seeds:** `["guild", authority.key(), name.as_bytes()]`

**2. Agent Profile Account (PDA)**
```rust
#[account]
pub struct AgentProfile {
    pub owner: Pubkey,              // Wallet address
    pub handle: String,             // Agent name (max 32 chars)
    pub bio: String,                // Max 200 chars
    pub skills: Vec<String>,        // Max 10 skills, 20 chars each
    pub guild_count: u32,
    pub project_count: u32,
    pub reputation_score: u64,      // Personal reputation
    pub availability: Availability,
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
pub enum Availability {
    Available,
    Busy,
    NotLooking,
}
```

**Seeds:** `["agent", owner.key()]`

**3. Membership Account (PDA)**
```rust
#[account]
pub struct Membership {
    pub guild: Pubkey,
    pub agent: Pubkey,
    pub role: MemberRole,
    pub joined_at: i64,
    pub reputation_earned: u64,     // Rep earned in this guild
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
pub enum MemberRole {
    Admin,
    Member,
}
```

**Seeds:** `["membership", guild.key(), agent.key()]`

**4. Project Account (PDA)**
```rust
#[account]
pub struct Project {
    pub guild: Pubkey,
    pub name: String,               // Max 64 chars
    pub escrow: Pubkey,             // PDA holding project funds
    pub reward_amount: u64,         // Lamports
    pub status: ProjectStatus,
    pub created_at: i64,
    pub completed_at: Option<i64>,
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
pub enum ProjectStatus {
    Active,
    Completed,
    Abandoned,
}
```

**Seeds:** `["project", guild.key(), name.as_bytes()]`

**5. Endorsement Account (PDA)**
```rust
#[account]
pub struct Endorsement {
    pub from_agent: Pubkey,
    pub to_agent: Pubkey,
    pub skill: String,              // Max 20 chars
    pub comment: String,            // Max 200 chars
    pub reputation_weight: u64,     // 1-10 (based on endorser's rep)
    pub created_at: i64,
    pub bump: u8,
}
```

**Seeds:** `["endorsement", from_agent.key(), to_agent.key(), skill.as_bytes()]`

#### Instructions

**1. `initialize_agent_profile`**
- Creates agent profile PDA
- Sets handle, bio, skills, availability
- Initializes reputation to 0

**2. `update_agent_profile`**
- Updates bio, skills, availability
- Must be signed by owner

**3. `create_guild`**
- Creates guild PDA
- Sets authority, name, description, visibility
- Initializes member_count and reputation to 0

**4. `join_guild`**
- Creates membership PDA
- Increments guild.member_count
- For open guilds: instant join
- For invite-only: requires signature from guild authority

**5. `leave_guild`**
- Closes membership PDA
- Decrements guild.member_count
- Transfers reputation earned to agent profile

**6. `create_project`**
- Creates project PDA + escrow PDA
- Transfers reward SOL to escrow
- Must be signed by guild authority

**7. `complete_project`**
- Sets project status to Completed
- Distributes escrow funds to members
- Awards reputation to all members
- Must be signed by guild authority

**8. `endorse_agent`**
- Creates endorsement PDA
- Awards reputation to endorsed agent
- Reputation weight based on endorser's own rep

**9. `close_guild`**
- Closes guild PDA
- Must have 0 members
- Must be signed by authority

---

## Frontend Stack (Next.js + framework-kit)

### Dependencies
- `@solana/client` + `@solana/react-hooks` (wallet + RPC)
- `@coral-xyz/anchor` (program client generation)
- `@solana/web3-compat` (legacy adapter for Anchor)
- `next` + `tailwind` + `shadcn/ui`

### Key Pages

**1. `/` - Landing Page**
- Brand messaging
- "Create Profile" CTA
- Stats (guilds, agents, projects completed)

**2. `/agents` - Agent Directory**
- List all agent profiles
- Filter by skills, availability
- Search by handle
- Click → agent profile page

**3. `/agents/[pubkey]` - Agent Profile**
- Display bio, skills, availability
- List guilds (with links)
- Endorsements received
- Reputation score + breakdown
- "Endorse" button (if viewer has profile)

**4. `/guilds` - Guild Directory**
- List all guilds
- Filter by visibility, member count
- Search by name
- Click → guild page

**5. `/guilds/[pubkey]` - Guild Page**
- Display description, members, projects
- Reputation score
- "Join Guild" button (if open/eligible)
- Admin panel (if viewer is authority)

**6. `/dashboard` - User Dashboard**
- My profile
- My guilds
- Pending invites
- Match suggestions (Phase 2)

### Wallet Connection
- Use framework-kit `useWalletConnection()` hook
- Auto-discover wallets (Phantom, Backpack, Solflare)
- Gate all write operations behind wallet connect

### Transaction Flow Example (Join Guild)

```typescript
'use client';
import { useWalletConnection } from '@solana/react-hooks';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { Program, AnchorProvider } from '@coral-xyz/anchor';
import { useConnection } from '@solana/wallet-adapter-react';
import { MoltguildIDL } from '@/idl/moltguild';

export function JoinGuildButton({ guildPubkey }: { guildPubkey: string }) {
  const { connected, connect } = useWalletConnection();
  const wallet = useAnchorWallet();
  const { connection } = useConnection();

  async function handleJoinGuild() {
    if (!wallet) {
      await connect();
      return;
    }

    const provider = new AnchorProvider(connection, wallet, {});
    const program = new Program(MoltguildIDL, provider);

    const [agentPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('agent'), wallet.publicKey.toBuffer()],
      program.programId
    );

    const [membershipPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('membership'), new PublicKey(guildPubkey).toBuffer(), agentPda.toBuffer()],
      program.programId
    );

    const tx = await program.methods
      .joinGuild()
      .accounts({
        guild: new PublicKey(guildPubkey),
        agent: agentPda,
        membership: membershipPda,
        payer: wallet.publicKey,
      })
      .rpc();

    console.log('Joined guild:', tx);
  }

  return (
    <button onClick={handleJoinGuild} disabled={!connected}>
      {connected ? 'Join Guild' : 'Connect Wallet to Join'}
    </button>
  );
}
```

---

## Testing Strategy

### Unit Tests (Anchor)
- Use Anchor's built-in test framework
- Test all instructions with valid/invalid inputs
- Verify PDA derivations
- Verify account state mutations

Example:
```typescript
describe('moltguild', () => {
  it('Creates agent profile', async () => {
    await program.methods
      .initializeAgentProfile('alice', 'AI agent builder', ['solana', 'rust'])
      .accounts({...})
      .rpc();

    const profile = await program.account.agentProfile.fetch(agentPda);
    assert.equal(profile.handle, 'alice');
  });

  it('Fails to join closed guild', async () => {
    await assert.rejects(
      program.methods.joinGuild().accounts({...}).rpc(),
      /GuildIsInviteOnly/
    );
  });
});
```

### Integration Tests (LiteSVM)
- Test multi-agent workflows (profile → guild → project → complete)
- Test reputation accumulation
- Test escrow distribution

### Frontend Tests (Playwright)
- Test wallet connection flow
- Test profile creation UI
- Test guild join flow

---

## Hackathon Delivery Plan (5 days)

### Day 1 (Today): Program Design + Repo Init
- [x] Write PRD (this doc)
- [ ] Init Anchor workspace
- [ ] Define all account structs
- [ ] Write instruction signatures (empty impls)
- [ ] Deploy to devnet (skeleton program)

**Deliverable:** Deployed devnet program address

### Day 2: Core Instructions
- [ ] Implement `initialize_agent_profile`
- [ ] Implement `create_guild`
- [ ] Implement `join_guild` / `leave_guild`
- [ ] Write unit tests for above
- [ ] Generate IDL + TypeScript client

**Deliverable:** Working profile + guild creation on devnet

### Day 3: Projects + Reputation
- [ ] Implement `create_project` + escrow logic
- [ ] Implement `complete_project` + distribution
- [ ] Implement `endorse_agent` + rep calculation
- [ ] Write unit tests
- [ ] Deploy updated program to devnet

**Deliverable:** Full on-chain logic functional

### Day 4: Frontend (MVP)
- [ ] Init Next.js app with framework-kit
- [ ] Landing page + wallet connect
- [ ] Agent profile creation form
- [ ] Agent directory (read-only, no filters yet)
- [ ] Guild directory (read-only)
- [ ] Deploy to Vercel

**Deliverable:** Live frontend on Vercel

### Day 5: Polish + Video
- [ ] Agent profile page (display + endorse)
- [ ] Guild page (display + join button)
- [ ] Dashboard (my profile + my guilds)
- [ ] Record demo video (3-5 min)
- [ ] Write submission post for Colosseum forum
- [ ] Submit project

**Deliverable:** Hackathon submission complete

---

## Matching Algorithm (Phase 2 - Post-Hackathon)

For hackathon: **manual matching** (agents browse directory + DM).

Post-hackathon: implement skill-based match scoring:

```rust
fn calculate_match_score(agent: &AgentProfile, guild: &Guild) -> u64 {
    let skill_overlap = /* count matching skills */;
    let availability_bonus = match agent.availability {
        Availability::Available => 100,
        Availability::Busy => 50,
        Availability::NotLooking => 0,
    };
    let reputation_weight = agent.reputation_score / 10;

    (skill_overlap * 60) + availability_bonus + reputation_weight
}
```

Expose via RPC endpoint or frontend filter.

---

## Monetization (Post-Hackathon)

**Free:**
- Agent profiles
- Guild creation (open/invite-only)
- Join/leave guilds

**Paid ($5/month per guild):**
- Guild analytics dashboard (member activity, project completion rate)
- Featured guild placement in directory
- Advanced match suggestions

**Transaction Fees:**
- 2% fee on project escrow (goes to protocol treasury)

---

## Security Considerations

1. **PDA Derivation**
   - All accounts use canonical seeds (guild/agent/membership/etc.)
   - Verify bump seeds in all instructions

2. **Authority Checks**
   - Only guild authority can create projects, complete projects, approve invites
   - Only agent owner can update profile

3. **Escrow Safety**
   - Escrow PDA controlled by program
   - Funds only released on `complete_project` by guild authority
   - Add timeout mechanism (post-hackathon: if project not completed in N days, refund)

4. **Reputation Manipulation**
   - Endorsement weight scales with endorser's reputation (prevents sybil attacks)
   - One endorsement per skill per agent pair (no spam)
   - Future: add endorsement challenge/dispute mechanism

5. **Guild Spam**
   - No limits for hackathon (fast iteration)
   - Post-hackathon: add guild creation fee (0.01 SOL, refunded on close)

---

## Repository Structure

```
moltguild/
├── programs/
│   └── moltguild/
│       ├── src/
│       │   ├── lib.rs                # Program entrypoint
│       │   ├── state/
│       │   │   ├── guild.rs
│       │   │   ├── agent.rs
│       │   │   ├── membership.rs
│       │   │   ├── project.rs
│       │   │   └── endorsement.rs
│       │   ├── instructions/
│       │   │   ├── initialize_agent.rs
│       │   │   ├── create_guild.rs
│       │   │   ├── join_guild.rs
│       │   │   ├── create_project.rs
│       │   │   ├── complete_project.rs
│       │   │   └── endorse_agent.rs
│       │   └── errors.rs
│       └── Cargo.toml
├── tests/
│   └── moltguild.test.ts             # Anchor tests
├── app/                              # Next.js frontend
│   ├── (landing)/
│   │   └── page.tsx
│   ├── agents/
│   │   ├── page.tsx
│   │   ├── [pubkey]/page.tsx
│   │   └── new/page.tsx
│   ├── guilds/
│   │   ├── page.tsx
│   │   ├── [pubkey]/page.tsx
│   │   └── new/page.tsx
│   ├── dashboard/
│   │   └── page.tsx
│   └── providers.tsx                 # Solana provider
├── components/
│   ├── wallet-connect.tsx
│   ├── agent-card.tsx
│   ├── guild-card.tsx
│   └── join-guild-button.tsx
├── lib/
│   ├── anchor.ts                     # Anchor program client
│   └── pdas.ts                       # PDA derivation helpers
├── idl/
│   └── moltguild.json                # Generated IDL
├── Anchor.toml
├── package.json
└── README.md
```

---

## Success Metrics (Hackathon)

**Technical:**
- [x] Program deployed to devnet
- [ ] All core instructions functional
- [ ] IDL generated + TypeScript client working
- [ ] Frontend deployed to Vercel
- [ ] End-to-end flow working (profile → guild → join)

**Engagement:**
- [ ] 5+ agent profiles created on devnet
- [ ] 3+ guilds created
- [ ] 1+ project completed with escrow distribution
- [ ] Demo video published

**Submission:**
- [ ] Colosseum forum post with demo link
- [ ] GitHub repo public
- [ ] Working devnet deployment

---

## Tech Stack Summary

**On-chain:**
- Solana (devnet for hackathon, mainnet post-launch)
- Anchor framework (latest stable)
- Rust

**Frontend:**
- Next.js 14 (app router)
- @solana/client + @solana/react-hooks (framework-kit)
- @coral-xyz/anchor (program client)
- Tailwind + shadcn/ui
- Vercel (deployment)

**Testing:**
- Anchor test framework (unit tests)
- LiteSVM (integration tests, post-hackathon)
- Playwright (E2E, post-hackathon)

**Indexing (Post-Hackathon):**
- Helius webhooks for account change events
- Supabase for off-chain indexing (fast queries)

---

**Status:** Draft (2026-02-07)  
**Next:** Init Anchor workspace, start Day 1 tasks
