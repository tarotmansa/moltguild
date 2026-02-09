use anchor_lang::prelude::*;

#[account]
pub struct Gig {
    pub id: Pubkey,
    pub name: String,
    pub organizer: Pubkey,
    pub prize_pool: u64,
    pub deadline: i64,
    pub submission_url: String,
    pub status: GigStatus,
    pub created_at: i64,
}

impl Gig {
    pub const MAX_NAME_LEN: usize = 100;
    pub const MAX_URL_LEN: usize = 200;
    
    pub const SPACE: usize = 8 + // discriminator
        32 + // id
        (4 + Self::MAX_NAME_LEN) + // name
        32 + // organizer
        8 + // prize_pool
        8 + // deadline
        (4 + Self::MAX_URL_LEN) + // submission_url
        1 + // status
        8; // created_at
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum GigStatus {
    Active,
    Completed,
    Cancelled,
}
