use anchor_lang::prelude::*;
use crate::state::{AgentProfile, Availability};
use crate::errors::MoltGuildError;

pub fn update_agent_profile(
    ctx: Context<UpdateAgentProfile>,
    bio: Option<String>,
    skills: Option<Vec<String>>,
    availability: Option<Availability>,
) -> Result<()> {
    let profile = &mut ctx.accounts.profile;

    if let Some(new_bio) = bio {
        require!(
            new_bio.len() <= AgentProfile::MAX_BIO_LEN,
            MoltGuildError::BioTooLong
        );
        profile.bio = new_bio;
    }

    if let Some(new_skills) = skills {
        require!(
            new_skills.len() <= AgentProfile::MAX_SKILLS,
            MoltGuildError::TooManySkills
        );
        for skill in &new_skills {
            require!(
                skill.len() <= AgentProfile::MAX_SKILL_LEN,
                MoltGuildError::SkillTooLong
            );
        }
        profile.skills = new_skills;
    }

    if let Some(new_availability) = availability {
        profile.availability = new_availability;
    }

    msg!("Agent profile updated: {}", profile.handle);
    Ok(())
}

#[derive(Accounts)]
pub struct UpdateAgentProfile<'info> {
    #[account(
        mut,
        seeds = [b"agent", owner.key().as_ref()],
        bump = profile.bump,
        has_one = owner
    )]
    pub profile: Account<'info, AgentProfile>,
    
    pub owner: Signer<'info>,
}
