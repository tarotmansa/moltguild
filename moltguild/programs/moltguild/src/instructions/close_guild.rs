use anchor_lang::prelude::*;
use crate::state::Guild;
use crate::errors::MoltGuildError;

pub fn close_guild(ctx: Context<CloseGuild>) -> Result<()> {
    let guild = &ctx.accounts.guild;
    
    require!(
        guild.member_count == 0,
        MoltGuildError::GuildHasMembers
    );

    msg!("Guild {} closed", guild.name);
    Ok(())
}

#[derive(Accounts)]
pub struct CloseGuild<'info> {
    #[account(
        mut,
        close = authority,
        has_one = authority @ MoltGuildError::NotGuildAuthority
    )]
    pub guild: Account<'info, Guild>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
}
