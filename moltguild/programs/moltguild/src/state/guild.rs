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
    pub gig: Option<Pubkey>,       // NEW: Which gig this squad is for
    pub treasury: Pubkey,          // NEW: PDA for prize receiving
    pub prize_splits: Vec<PrizeSplit>, // NEW: Prize distribution (adjustable)
    pub contact: String,           // NEW: Discord/Telegram link (max 100 chars)
    pub submission_link: Option<String>, // NEW: Project URL (max 200 chars)
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct PrizeSplit {
    pub agent: Pubkey,
    pub percentage: u8, // 0-100
}

impl Guild {
    pub const MAX_NAME_LEN: usize = 32;
    pub const MAX_DESC_LEN: usize = 200;
    pub const MAX_CONTACT_LEN: usize = 100;
    pub const MAX_SUBMISSION_LEN: usize = 200;
    pub const MAX_MEMBERS: usize = 10;
    
    pub const LEN: usize = 8 + // discriminator
        32 + // authority
        4 + Self::MAX_NAME_LEN + // name (string)
        4 + Self::MAX_DESC_LEN + // description
        4 + // member_count
        4 + // project_count
        8 + // reputation_score
        1 + // visibility
        1 + 32 + // token_mint (Option<Pubkey>)
        1 + 32 + // gig (Option<Pubkey>)
        32 + // treasury
        4 + (Self::MAX_MEMBERS * (32 + 1)) + // prize_splits vec
        4 + Self::MAX_CONTACT_LEN + // contact
        1 + (4 + Self::MAX_SUBMISSION_LEN) + // submission_link (Option<String>)
        1; // bump
    
    pub fn validate_prize_splits(&self) -> Result<()> {
        let total: u16 = self.prize_splits.iter().map(|s| s.percentage as u16).sum();
        require!(total == 100, ErrorCode::InvalidPrizeSplits);
        Ok(())
    }
}

#[error_code]
pub enum ErrorCode {
    #[msg("Prize splits must sum to 100%")]
    InvalidPrizeSplits,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum GuildVisibility {
    Open,
    InviteOnly,
    TokenGated,
}
