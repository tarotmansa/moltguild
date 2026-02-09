use anchor_lang::prelude::*;
use crate::state::{Guild, GuildVisibility};
use crate::errors::MoltGuildError;

pub fn create_guild(
    ctx: Context<CreateGuild>,
    name: String,
    description: String,
    visibility: GuildVisibility,
    contact: Option<String>,
) -> Result<()> {
    require!(
        name.len() <= Guild::MAX_NAME_LEN,
        MoltGuildError::GuildNameTooLong
    );
    require!(
        description.len() <= Guild::MAX_DESC_LEN,
        MoltGuildError::GuildDescriptionTooLong
    );
    
    if let Some(ref c) = contact {
        require!(
            c.len() <= Guild::MAX_CONTACT_LEN,
            MoltGuildError::ContactTooLong
        );
    }

    let guild = &mut ctx.accounts.guild;
    guild.authority = ctx.accounts.authority.key();
    guild.name = name.clone();
    guild.description = description;
    guild.member_count = 0;
    guild.project_count = 0;
    guild.reputation_score = 0;
    guild.visibility = visibility;
    guild.token_mint = None;
    guild.gig = None; // NEW: No gig by default
    guild.treasury = ctx.accounts.treasury.key(); // NEW: Treasury PDA
    guild.prize_splits = Vec::new(); // NEW: Empty splits initially
    guild.contact = contact.unwrap_or_default(); // NEW: Discord/Telegram link
    guild.submission_link = None; // NEW: No submission yet
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
    
    #[account(
        seeds = [b"treasury", guild.key().as_ref()],
        bump
    )]
    /// CHECK: Treasury PDA, validated by seeds
    pub treasury: AccountInfo<'info>,
    
    pub authority: Signer<'info>,
    
    #[account(mut)]
    pub payer: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}
