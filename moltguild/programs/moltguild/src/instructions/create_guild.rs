use anchor_lang::prelude::*;
use crate::state::{Guild, GuildVisibility};
use crate::errors::MoltGuildError;

pub fn create_guild(
    ctx: Context<CreateGuild>,
    name: String,
    description: String,
    visibility: GuildVisibility,
) -> Result<()> {
    require!(
        name.len() <= Guild::MAX_NAME_LEN,
        MoltGuildError::GuildNameTooLong
    );
    require!(
        description.len() <= Guild::MAX_DESC_LEN,
        MoltGuildError::GuildDescriptionTooLong
    );

    let guild = &mut ctx.accounts.guild;
    guild.authority = ctx.accounts.authority.key();
    guild.name = name.clone();
    guild.description = description;
    guild.member_count = 0;
    guild.project_count = 0;
    guild.reputation_score = 0;
    guild.visibility = visibility;
    guild.token_mint = None;
    guild.bump = ctx.bumps.guild;

    msg!("Guild created: {}", name);
    Ok(())
}

#[derive(Accounts)]
#[instruction(name: String)]
pub struct CreateGuild<'info> {
    #[account(
        init,
        payer = payer,
        space = Guild::LEN,
        seeds = [b"guild", authority.key().as_ref(), name.as_bytes()],
        bump
    )]
    pub guild: Account<'info, Guild>,
    
    pub authority: Signer<'info>,
    
    #[account(mut)]
    pub payer: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}
