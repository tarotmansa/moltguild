use anchor_lang::prelude::*;

#[error_code]
pub enum MoltGuildError {
    #[msg("Handle too long (max 32 chars)")]
    HandleTooLong,
    
    #[msg("Bio too long (max 200 chars)")]
    BioTooLong,
    
    #[msg("Too many skills (max 10)")]
    TooManySkills,
    
    #[msg("Skill name too long (max 20 chars)")]
    SkillTooLong,
    
    #[msg("Guild name too long (max 32 chars)")]
    GuildNameTooLong,
    
    #[msg("Guild description too long (max 200 chars)")]
    GuildDescriptionTooLong,
    
    #[msg("Guild is invite-only")]
    GuildIsInviteOnly,
    
    #[msg("Guild has members, cannot close")]
    GuildHasMembers,
    
    #[msg("Not guild authority")]
    NotGuildAuthority,
    
    #[msg("Project name too long (max 64 chars)")]
    ProjectNameTooLong,
    
    #[msg("Project already completed")]
    ProjectAlreadyCompleted,
    
    #[msg("Endorsement skill too long (max 20 chars)")]
    EndorsementSkillTooLong,
    
    #[msg("Endorsement comment too long (max 200 chars)")]
    EndorsementCommentTooLong,
    
    #[msg("Cannot endorse yourself")]
    CannotEndorseSelf,
}
