use anchor_lang::prelude::*;
use crate::state::*;

#[derive(Accounts)]
pub struct UpdatePrizeSplits<'info> {
    #[account(
        mut,
        has_one = authority
    )]
    pub guild: Account<'info, Guild>,
    
    pub authority: Signer<'info>,
}

pub fn update_prize_splits(
    ctx: Context<UpdatePrizeSplits>,
    prize_splits: Vec<PrizeSplit>,
) -> Result<()> {
    let guild = &mut ctx.accounts.guild;
    
    // Validate splits sum to 100%
    let total: u16 = prize_splits.iter().map(|s| s.percentage as u16).sum();
    require!(total == 100, ErrorCode::InvalidPrizeSplits);
    require!(prize_splits.len() <= Guild::MAX_MEMBERS, ErrorCode::TooManySplits);
    
    guild.prize_splits = prize_splits;
    
    Ok(())
}

#[error_code]
pub enum ErrorCode {
    #[msg("Prize splits must sum to 100%")]
    InvalidPrizeSplits,
    #[msg("Too many prize splits")]
    TooManySplits,
}
