use anchor_lang::prelude::*;
use crate::state::{Guild, AgentProfile, Membership, MemberRole, GuildVisibility};
use crate::errors::MoltGuildError;

pub fn join_guild(ctx: Context<JoinGuild>) -> Result<()> {
    let guild = &mut ctx.accounts.guild;
    
    // Check if guild allows open joining
    require!(
        guild.visibility == GuildVisibility::Open,
        MoltGuildError::GuildIsInviteOnly
    );

    let membership = &mut ctx.accounts.membership;
    membership.guild = guild.key();
    membership.agent = ctx.accounts.agent.key();
    membership.role = MemberRole::Member;
    membership.joined_at = Clock::get()?.unix_timestamp;
    membership.reputation_earned = 0;
    membership.bump = ctx.bumps.membership;

    // Increment guild member count
    guild.member_count = guild.member_count.checked_add(1).unwrap();

    // Increment agent guild count
    let agent = &mut ctx.accounts.agent;
    agent.guild_count = agent.guild_count.checked_add(1).unwrap();

    msg!("{} joined guild {}", agent.handle, guild.name);
    Ok(())
}

#[derive(Accounts)]
pub struct JoinGuild<'info> {
    #[account(mut)]
    pub guild: Account<'info, Guild>,
    
    #[account(
        mut,
        seeds = [b"agent", owner.key().as_ref()],
        bump = agent.bump
    )]
    pub agent: Account<'info, AgentProfile>,
    
    #[account(
        init,
        payer = payer,
        space = Membership::LEN,
        seeds = [b"membership", guild.key().as_ref(), agent.key().as_ref()],
        bump
    )]
    pub membership: Account<'info, Membership>,
    
    pub owner: Signer<'info>,
    
    #[account(mut)]
    pub payer: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}
