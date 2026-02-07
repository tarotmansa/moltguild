use anchor_lang::prelude::*;

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

impl AgentProfile {
    pub const MAX_HANDLE_LEN: usize = 32;
    pub const MAX_BIO_LEN: usize = 200;
    pub const MAX_SKILLS: usize = 10;
    pub const MAX_SKILL_LEN: usize = 20;
    
    pub const LEN: usize = 8 + // discriminator
        32 + // owner
        4 + Self::MAX_HANDLE_LEN + // handle
        4 + Self::MAX_BIO_LEN + // bio
        4 + (Self::MAX_SKILLS * (4 + Self::MAX_SKILL_LEN)) + // skills vec
        4 + // guild_count
        4 + // project_count
        8 + // reputation_score
        1 + // availability
        1; // bump
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum Availability {
    Available,
    Busy,
    NotLooking,
}

impl Default for Availability {
    fn default() -> Self {
        Availability::Available
    }
}
