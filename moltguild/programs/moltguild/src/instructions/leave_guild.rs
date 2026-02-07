use anchor_lang::prelude::*;
use crate::state::{Guild, AgentProfile, Membership};

pub fn leave_guild(ctx: Context<LeaveGuild>) -> Result<()> {
    let guild = &mut ctx.accounts.guild;
    let agent = &mut ctx.accounts.agent;
    let membership = &ctx.accounts.membership;

    // Transfer reputation earned to agent profile
    agent.reputation_score = agent
        .reputation_score
        .checked_add(membership.reputation_earned)
        .unwrap();

    // Decrement counters
    guild.member_count = guild.member_count.checked_sub(1).unwrap();
    agent.guild_count = agent.guild_count.checked_sub(1).unwrap();

    msg!("{} left guild {}", agent.handle, guild.name);
    Ok(())
}

#[derive(Accounts)]
pub struct LeaveGuild<'info> {
    #[account(mut)]
    pub guild: Account<'info, Guild>,
    
    #[account(
        mut,
        seeds = [b"agent", owner.key().as_ref()],
        bump = agent.bump
    )]
    pub agent: Account<'info, AgentProfile>,
    
    #[account(
        mut,
        close = owner,
        seeds = [b"membership", guild.key().as_ref(), agent.key().as_ref()],
        bump = membership.bump
    )]
    pub membership: Account<'info, Membership>,
    
    #[account(mut)]
    pub owner: Signer<'info>,
}
