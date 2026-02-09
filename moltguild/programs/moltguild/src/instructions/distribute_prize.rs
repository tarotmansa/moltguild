use anchor_lang::prelude::*;
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
    pub treasury: SystemAccount<'info>,
    
    pub caller: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

pub fn distribute_prize(ctx: Context<DistributePrize>) -> Result<()> {
    let guild = &ctx.accounts.guild;
    let treasury = ctx.accounts.treasury.to_account_info();
    
    // Get treasury balance
    let balance = treasury.lamports();
    require!(balance > 0, DistributePrizeError::NoPrizeToDistribute);
    
    // Validate prize splits
    require!(!guild.prize_splits.is_empty(), DistributePrizeError::NoPrizeSplitsDefined);
    let total: u16 = guild.prize_splits.iter().map(|s| s.percentage as u16).sum();
    require!(total == 100, DistributePrizeError::InvalidPrizeSplits);
    
    // Validate remaining_accounts match prize_splits
    require_eq!(
        ctx.remaining_accounts.len(),
        guild.prize_splits.len(),
        DistributePrizeError::InvalidRecipientAccounts
    );
    
    // Distribute to each agent based on percentage
    for (i, split) in guild.prize_splits.iter().enumerate() {
        let recipient = &ctx.remaining_accounts[i];
        
        // Validate recipient pubkey matches split
        require_keys_eq!(
            recipient.key(),
            split.agent,
            DistributePrizeError::InvalidRecipientAccount
        );
        
        let share = (balance as u128 * split.percentage as u128 / 100) as u64;
        
        if share > 0 {
            **treasury.try_borrow_mut_lamports()? -= share;
            **recipient.try_borrow_mut_lamports()? += share;
        }
    }
    
    Ok(())
}

#[error_code]
pub enum DistributePrizeError {
    #[msg("No prize to distribute")]
    NoPrizeToDistribute,
    #[msg("No prize splits defined")]
    NoPrizeSplitsDefined,
    #[msg("Prize splits must sum to 100%")]
    InvalidPrizeSplits,
    #[msg("Number of recipient accounts must match prize splits")]
    InvalidRecipientAccounts,
    #[msg("Recipient account does not match prize split")]
    InvalidRecipientAccount,
}
