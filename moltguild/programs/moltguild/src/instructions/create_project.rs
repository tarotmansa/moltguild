use anchor_lang::prelude::*;
use anchor_lang::system_program;
use crate::state::{Guild, Project, ProjectStatus};
use crate::errors::MoltGuildError;

pub fn create_project(
    ctx: Context<CreateProject>,
    name: String,
    reward_amount: u64,
) -> Result<()> {
    require!(
        name.len() <= Project::MAX_NAME_LEN,
        MoltGuildError::ProjectNameTooLong
    );

    let project = &mut ctx.accounts.project;
    project.guild = ctx.accounts.guild.key();
    project.name = name.clone();
    project.escrow = ctx.accounts.escrow.key();
    project.reward_amount = reward_amount;
    project.status = ProjectStatus::Active;
    project.created_at = Clock::get()?.unix_timestamp;
    project.completed_at = None;
    project.bump = ctx.bumps.project;

    // Transfer funds to escrow PDA
    system_program::transfer(
        CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            system_program::Transfer {
                from: ctx.accounts.authority.to_account_info(),
                to: ctx.accounts.escrow.to_account_info(),
            },
        ),
        reward_amount,
    )?;

    // Increment guild project count
    let guild = &mut ctx.accounts.guild;
    guild.project_count = guild.project_count.checked_add(1).unwrap();

    msg!("Project created: {} with {} lamports", name, reward_amount);
    Ok(())
}

#[derive(Accounts)]
#[instruction(name: String)]
pub struct CreateProject<'info> {
    #[account(
        mut,
        has_one = authority @ MoltGuildError::NotGuildAuthority
    )]
    pub guild: Account<'info, Guild>,
    
    #[account(
        init,
        payer = authority,
        space = Project::LEN,
        seeds = [b"project", guild.key().as_ref(), name.as_bytes()],
        bump
    )]
    pub project: Account<'info, Project>,
    
    /// CHECK: PDA escrow account
    #[account(
        mut,
        seeds = [b"escrow", project.key().as_ref()],
        bump
    )]
    pub escrow: AccountInfo<'info>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}
