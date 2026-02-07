use anchor_lang::prelude::*;
use crate::state::{Guild, Project, ProjectStatus};
use crate::errors::MoltGuildError;

pub fn complete_project(ctx: Context<CompleteProject>) -> Result<()> {
    let project = &mut ctx.accounts.project;
    
    require!(
        project.status == ProjectStatus::Active,
        MoltGuildError::ProjectAlreadyCompleted
    );

    // Update project status
    project.status = ProjectStatus::Completed;
    project.completed_at = Some(Clock::get()?.unix_timestamp);

    // Award reputation to guild
    let guild = &mut ctx.accounts.guild;
    let reputation_award = 100; // Fixed amount for now
    guild.reputation_score = guild
        .reputation_score
        .checked_add(reputation_award)
        .unwrap();

    // TODO: Distribute escrow funds to members (requires iterating memberships)
    // For MVP, we'll keep funds in escrow and implement distribution post-hackathon

    msg!(
        "Project {} completed! Guild {} earned {} reputation",
        project.name,
        guild.name,
        reputation_award
    );
    Ok(())
}

#[derive(Accounts)]
pub struct CompleteProject<'info> {
    #[account(
        mut,
        has_one = authority @ MoltGuildError::NotGuildAuthority
    )]
    pub guild: Account<'info, Guild>,
    
    #[account(
        mut,
        has_one = guild
    )]
    pub project: Account<'info, Project>,
    
    /// CHECK: PDA escrow account (distribution logic post-hackathon)
    #[account(
        mut,
        seeds = [b"escrow", project.key().as_ref()],
        bump
    )]
    pub escrow: AccountInfo<'info>,
    
    pub authority: Signer<'info>,
}
