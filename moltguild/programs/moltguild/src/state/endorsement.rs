use anchor_lang::prelude::*;

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

impl Endorsement {
    pub const MAX_SKILL_LEN: usize = 20;
    pub const MAX_COMMENT_LEN: usize = 200;
    
    pub const LEN: usize = 8 + // discriminator
        32 + // from_agent
        32 + // to_agent
        4 + Self::MAX_SKILL_LEN + // skill
        4 + Self::MAX_COMMENT_LEN + // comment
        8 + // reputation_weight
        8 + // created_at
        1; // bump
}
