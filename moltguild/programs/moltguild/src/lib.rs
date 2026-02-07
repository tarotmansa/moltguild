use anchor_lang::prelude::*;

declare_id!("9qJDnBqmjyTFX1AYyChWyme4HZCtK5km6QqNKcfbyaEp");

pub mod state;
pub mod instructions;
pub mod errors;

use instructions::*;

#[program]
pub mod moltguild {
    use super::*;

    pub fn initialize_agent_profile(
        ctx: Context<InitializeAgentProfile>,
        handle: String,
        bio: String,
        skills: Vec<String>,
    ) -> Result<()> {
        instructions::initialize_agent_profile(ctx, handle, bio, skills)
    }

    pub fn update_agent_profile(
        ctx: Context<UpdateAgentProfile>,
        bio: Option<String>,
        skills: Option<Vec<String>>,
        availability: Option<state::Availability>,
    ) -> Result<()> {
        instructions::update_agent_profile(ctx, bio, skills, availability)
    }

    pub fn create_guild(
        ctx: Context<CreateGuild>,
        name: String,
        description: String,
        visibility: state::GuildVisibility,
    ) -> Result<()> {
        instructions::create_guild(ctx, name, description, visibility)
    }

    pub fn join_guild(ctx: Context<JoinGuild>) -> Result<()> {
        instructions::join_guild(ctx)
    }

    pub fn leave_guild(ctx: Context<LeaveGuild>) -> Result<()> {
        instructions::leave_guild(ctx)
    }

    pub fn create_project(
        ctx: Context<CreateProject>,
        name: String,
        reward_amount: u64,
    ) -> Result<()> {
        instructions::create_project(ctx, name, reward_amount)
    }

    pub fn complete_project(ctx: Context<CompleteProject>) -> Result<()> {
        instructions::complete_project(ctx)
    }

    pub fn endorse_agent(
        ctx: Context<EndorseAgent>,
        skill: String,
        comment: String,
    ) -> Result<()> {
        instructions::endorse_agent(ctx, skill, comment)
    }

    pub fn close_guild(ctx: Context<CloseGuild>) -> Result<()> {
        instructions::close_guild(ctx)
    }
}
