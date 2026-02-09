use anchor_lang::prelude::*;
use crate::state::*;

#[derive(Accounts)]
#[instruction(name: String)]
pub struct CreateGig<'info> {
    #[account(
        init,
        payer = organizer,
        space = Gig::SPACE,
        seeds = [b"gig", name.as_bytes()],
        bump
    )]
    pub gig: Account<'info, Gig>,
    
    #[account(mut)]
    pub organizer: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

pub fn create_gig(
    ctx: Context<CreateGig>,
    name: String,
    prize_pool: u64,
    deadline: i64,
    submission_url: String,
) -> Result<()> {
    require!(name.len() <= Gig::MAX_NAME_LEN, CreateGigError::NameTooLong);
    require!(submission_url.len() <= Gig::MAX_URL_LEN, CreateGigError::UrlTooLong);
    
    let gig_key = ctx.accounts.gig.key();
    let gig = &mut ctx.accounts.gig;
    
    gig.id = gig_key;
    gig.name = name;
    gig.organizer = ctx.accounts.organizer.key();
    gig.prize_pool = prize_pool;
    gig.deadline = deadline;
    gig.submission_url = submission_url;
    gig.status = GigStatus::Active;
    gig.created_at = Clock::get()?.unix_timestamp;
    
    Ok(())
}

#[error_code]
pub enum CreateGigError {
    #[msg("Gig name is too long")]
    NameTooLong,
    #[msg("URL is too long")]
    UrlTooLong,
}
