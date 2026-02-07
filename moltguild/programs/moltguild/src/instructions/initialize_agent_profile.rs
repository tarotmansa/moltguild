use anchor_lang::prelude::*;
use crate::state::{AgentProfile, Availability};
use crate::errors::MoltGuildError;

pub fn initialize_agent_profile(
    ctx: Context<InitializeAgentProfile>,
    handle: String,
    bio: String,
    skills: Vec<String>,
) -> Result<()> {
    require!(
        handle.len() <= AgentProfile::MAX_HANDLE_LEN,
        MoltGuildError::HandleTooLong
    );
    require!(
        bio.len() <= AgentProfile::MAX_BIO_LEN,
        MoltGuildError::BioTooLong
    );
    require!(
        skills.len() <= AgentProfile::MAX_SKILLS,
        MoltGuildError::TooManySkills
    );
    for skill in &skills {
        require!(
            skill.len() <= AgentProfile::MAX_SKILL_LEN,
            MoltGuildError::SkillTooLong
        );
    }

    let profile = &mut ctx.accounts.profile;
    profile.owner = ctx.accounts.owner.key();
    profile.handle = handle;
    profile.bio = bio;
    profile.skills = skills;
    profile.guild_count = 0;
    profile.project_count = 0;
    profile.reputation_score = 0;
    profile.availability = Availability::Available;
    profile.bump = ctx.bumps.profile;

    msg!("Agent profile created: {}", profile.handle);
    Ok(())
}

#[derive(Accounts)]
pub struct InitializeAgentProfile<'info> {
    #[account(
        init,
        payer = payer,
        space = AgentProfile::LEN,
        seeds = [b"agent", owner.key().as_ref()],
        bump
    )]
    pub profile: Account<'info, AgentProfile>,
    
    /// CHECK: owner of the profile
    pub owner: AccountInfo<'info>,
    
    #[account(mut)]
    pub payer: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}
