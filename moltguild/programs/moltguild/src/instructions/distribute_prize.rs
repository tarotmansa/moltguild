use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer, Transfer};
use crate::state::*;

#[derive(Accounts)]
pub struct DistributePrize<'info> {
    #[account(mut)]
    pub guild: Account<'info, Guild>,
    
    #[account(
        mut,
        seeds = [b"treasury", guild.key().as_ref()],
        bump
    )]
    /// CHECK: Treasury PDA, validated by seeds
    pub treasury: AccountInfo<'info>,
    
    pub caller: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

pub fn distribute_prize(ctx: Context<DistributePrize>) -> Result<()> {
    let guild = &ctx.accounts.guild;
    let treasury = &ctx.accounts.treasury;
    
    // Get treasury balance
    let balance = treasury.lamports();
    require!(balance > 0, ErrorCode::NoPrizeToDistribute);
    
    // Validate prize splits
    require!(!guild.prize_splits.is_empty(), ErrorCode::NoPrizeSplitsDefined);
    let total: u16 = guild.prize_splits.iter().map(|s| s.percentage as u16).sum();
    require!(total == 100, ErrorCode::InvalidPrizeSplits);
    
    // Distribute to each agent based on percentage
    for split in &guild.prize_splits {
        let share = (balance as u128 * split.percentage as u128 / 100) as u64;
        
        if share > 0 {
            // Transfer from treasury to agent
            let guild_key = guild.key();
            let seeds = &[
                b"treasury",
                guild_key.as_ref(),
                &[ctx.bumps.treasury],
            ];
            let signer_seeds = &[&seeds[..]];
            
            let cpi_ctx = CpiContext::new_with_signer(
                ctx.accounts.system_program.to_account_info(),
                Transfer {
                    from: treasury.to_account_info(),
                    to: split.agent.to_account_info(),
                },
                signer_seeds,
            );
            
            transfer(cpi_ctx, share)?;
        }
    }
    
    Ok(())
}

#[error_code]
pub enum ErrorCode {
    #[msg("No prize to distribute")]
    NoPrizeToDistribute,
    #[msg("No prize splits defined")]
    NoPrizeSplitsDefined,
    #[msg("Prize splits must sum to 100%")]
    InvalidPrizeSplits,
}
