use anchor_lang::prelude::*;

#[account]
pub struct Membership {
    pub guild: Pubkey,
    pub agent: Pubkey,
    pub role: MemberRole,
    pub joined_at: i64,
    pub reputation_earned: u64,     // Rep earned in this guild
    pub bump: u8,
}

impl Membership {
    pub const LEN: usize = 8 + // discriminator
        32 + // guild
        32 + // agent
        1 + // role
        8 + // joined_at
        8 + // reputation_earned
        1; // bump
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum MemberRole {
    Admin,
    Member,
}

impl Default for MemberRole {
    fn default() -> Self {
        MemberRole::Member
    }
}
