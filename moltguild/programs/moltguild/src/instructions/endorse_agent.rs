use anchor_lang::prelude::*;
use crate::state::{AgentProfile, Endorsement};
use crate::errors::MoltGuildError;

pub fn endorse_agent(
    ctx: Context<EndorseAgent>,
    skill: String,
    comment: String,
) -> Result<()> {
    require!(
        skill.len() <= Endorsement::MAX_SKILL_LEN,
        MoltGuildError::EndorsementSkillTooLong
    );
    require!(
        comment.len() <= Endorsement::MAX_COMMENT_LEN,
        MoltGuildError::EndorsementCommentTooLong
    );
    require!(
        ctx.accounts.from_agent.key() != ctx.accounts.to_agent.key(),
        MoltGuildError::CannotEndorseSelf
    );

    let endorsement = &mut ctx.accounts.endorsement;
    endorsement.from_agent = ctx.accounts.from_agent.key();
    endorsement.to_agent = ctx.accounts.to_agent.key();
    endorsement.skill = skill.clone();
    endorsement.comment = comment;
    endorsement.created_at = Clock::get()?.unix_timestamp;
    endorsement.bump = ctx.bumps.endorsement;

    // Calculate reputation weight based on endorser's reputation
    let from_rep = ctx.accounts.from_agent.reputation_score;
    let weight = if from_rep < 100 {
        1
    } else if from_rep < 500 {
        3
    } else if from_rep < 1000 {
        5
    } else {
        10
    };
    endorsement.reputation_weight = weight;

    // Award reputation to endorsed agent
    let to_agent = &mut ctx.accounts.to_agent;
    to_agent.reputation_score = to_agent
        .reputation_score
        .checked_add(weight)
        .unwrap();

    msg!(
        "{} endorsed {} for {} (weight: {})",
        ctx.accounts.from_agent.handle,
        to_agent.handle,
        skill,
        weight
    );
    Ok(())
}

#[derive(Accounts)]
#[instruction(skill: String)]
pub struct EndorseAgent<'info> {
    #[account(
        seeds = [b"agent", from_owner.key().as_ref()],
        bump = from_agent.bump
    )]
    pub from_agent: Account<'info, AgentProfile>,
    
    #[account(
        mut,
        seeds = [b"agent", to_owner.key().as_ref()],
        bump = to_agent.bump
    )]
    pub to_agent: Account<'info, AgentProfile>,
    
    #[account(
        init,
        payer = payer,
        space = Endorsement::LEN,
        seeds = [
            b"endorsement",
            from_agent.key().as_ref(),
            to_agent.key().as_ref(),
            skill.as_bytes()
        ],
        bump
    )]
    pub endorsement: Account<'info, Endorsement>,
    
    pub from_owner: Signer<'info>,
    
    /// CHECK: to_owner doesn't need to sign
    pub to_owner: AccountInfo<'info>,
    
    #[account(mut)]
    pub payer: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}
