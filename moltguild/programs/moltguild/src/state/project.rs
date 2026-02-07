use anchor_lang::prelude::*;

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

impl Project {
    pub const MAX_NAME_LEN: usize = 64;
    
    pub const LEN: usize = 8 + // discriminator
        32 + // guild
        4 + Self::MAX_NAME_LEN + // name
        32 + // escrow
        8 + // reward_amount
        1 + // status
        8 + // created_at
        1 + 8 + // completed_at (Option<i64>)
        1; // bump
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum ProjectStatus {
    Active,
    Completed,
    Abandoned,
}

impl Default for ProjectStatus {
    fn default() -> Self {
        ProjectStatus::Active
    }
}
