use anchor_lang::prelude::*;
use anchor_lang::solana_program::keccak;

declare_id!("2ZQqMy6V5cZjUpU8Y5F9MoJkXBLSLR2r1GiYuotMBhZu");

#[program]
pub mod tagged_summaries {
    use super::*;

    /// Initialize the global summary store
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let summary_store = &mut ctx.accounts.summary_store;
        summary_store.authority = ctx.accounts.authority.key();
        summary_store.total_summaries = 0;
        
        msg!("Summary store initialized by: {}", summary_store.authority);
        Ok(())
    }

    /// Store AI-generated metadata for a campus transaction
    pub fn store_tagged_summary(
        ctx: Context<StoreSummary>,
        transaction_hash: String,
        summary: String,
        tags: Vec<String>,
        category: String,
        confidence_score: u8,
    ) -> Result<()> {
        // Input validation
        require!(tags.len() <= 15, ErrorCode::TooManyTags);
        require!(summary.len() <= 800, ErrorCode::SummaryTooLong);
        require!(confidence_score <= 100, ErrorCode::InvalidConfidence);
        require!(transaction_hash.len() == 64, ErrorCode::InvalidHash);

        let summary_account = &mut ctx.accounts.tagged_summary;
        let summary_store = &mut ctx.accounts.summary_store;
        let clock = Clock::get()?;

        // Store the AI-generated metadata
        summary_account.id = summary_store.total_summaries;
        summary_account.transaction_hash = transaction_hash;
        summary_account.summary = summary;
        summary_account.tags = tags;
        summary_account.category = category;
        summary_account.confidence_score = confidence_score;
        summary_account.timestamp = clock.unix_timestamp;
        summary_account.student_wallet = ctx.accounts.student.key();

        // Update global counter
        summary_store.total_summaries += 1;

        msg!("Tagged summary stored for student: {}", ctx.accounts.student.key());
        msg!("ID: {}, Category: {}, Confidence: {}%", 
             summary_account.id, 
             summary_account.category, 
             summary_account.confidence_score);

        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 8, // discriminator + authority + total_summaries
        seeds = [b"summary_store"],
        bump
    )]
    pub summary_store: Account<'info, SummaryStore>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(transaction_hash: String)]
pub struct StoreSummary<'info> {
    #[account(
        init,
        payer = student,
        space = 8 + // discriminator
                8 + // id
                4 + 64 + // transaction_hash
                4 + 800 + // summary (increased)
                4 + (4 + 50) * 15 + // tags (15 max tags)
                4 + 80 + // category (increased)
                1 + // confidence_score
                8 + // timestamp
                32, // student_wallet
        seeds = [
            b"tagged_summary",
            &keccak::hash(transaction_hash.as_bytes()).to_bytes()[..8],
            student.key().as_ref()
        ],
        bump
    )]
    pub tagged_summary: Account<'info, TaggedSummary>,
    
    #[account(
        mut,
        seeds = [b"summary_store"],
        bump
    )]
    pub summary_store: Account<'info, SummaryStore>,
    
    #[account(mut)]
    pub student: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

// Data structures
#[account]
pub struct SummaryStore {
    pub authority: Pubkey,      // Who deployed this program
    pub total_summaries: u64,   // Total number of summaries stored
}

#[account]
pub struct TaggedSummary {
    pub id: u64,                    // Unique sequential ID
    pub transaction_hash: String,   // SHA256 hash of original transaction
    pub summary: String,            // AI-generated summary
    pub tags: Vec<String>,          // AI-generated tags
    pub category: String,           // Primary category
    pub confidence_score: u8,       // AI confidence (0-100)
    pub timestamp: i64,             // When stored on blockchain
    pub student_wallet: Pubkey,     // Student who owns this data
}

// Error handling
#[error_code]
pub enum ErrorCode {
    #[msg("Too many tags (maximum 15 allowed)")]
    TooManyTags,
    
    #[msg("Summary too long (maximum 800 characters)")]
    SummaryTooLong,
    
    #[msg("Invalid confidence score (0-100 only)")]
    InvalidConfidence,
    
    #[msg("Transaction hash must be 64 characters")]
    InvalidHash,
}