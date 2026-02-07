use anchor_lang::prelude::*;

#[account]
pub struct Guild {
    pub authority: Pubkey,        // Guild creator/admin
    pub name: String,              // Max 32 chars
    pub description: String,       // Max 200 chars
    pub member_count: u32,
    pub project_count: u32,
    pub reputation_score: u64,     // Aggregate guild reputation
    pub visibility: GuildVisibility,
    pub token_mint: Option<Pubkey>, // For token-gated guilds (future)
    pub bump: u8,
}

impl Guild {
    pub const MAX_NAME_LEN: usize = 32;
    pub const MAX_DESC_LEN: usize = 200;
    
    pub const LEN: usize = 8 + // discriminator
        32 + // authority
        4 + Self::MAX_NAME_LEN + // name (string)
        4 + Self::MAX_DESC_LEN + // description
        4 + // member_count
        4 + // project_count
        8 + // reputation_score
        1 + // visibility
        1 + 32 + // token_mint (Option<Pubkey>)
        1; // bump
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum GuildVisibility {
    Open,
    InviteOnly,
    TokenGated,
}
