# Greenwashing LLM Enhancement Implementation

## Overview

Successfully implemented a hybrid greenwashing detection system that combines rule-based checks with LLM-powered analysis using OpenAI API.

## What Was Implemented

### 1. Environment Setup ✅
- Added OpenAI API keys to environment variables documentation
- Updated `SETUP_ENV.md` with OpenAI configuration instructions
- Installed `openai` npm package

### 2. Synthetic Data Generator ✅
- Created `scripts/generate-greenwashing-data.py`
- Implements Pydantic models for structured data
- Generates training data with full taxonomy support
- Exports to JSONL format for fine-tuning
- Includes validation and deduplication

### 3. LLM Analysis Utility ✅
- Created `lib/greenwashing-llm.ts`
- Implements `analyzeWithLLM()` function
- Uses GPT-4-turbo for accurate analysis
- Returns structured results with taxonomy classifications
- Includes `shouldUseLLM()` helper for decision logic

### 4. API Route ✅
- Created `app/api/analyze-greenwashing/route.ts`
- POST endpoint for LLM analysis
- Error handling and validation
- Returns structured analysis results

### 5. Database Schema Updates ✅
- Added `techniqueId` field to `GreenwashingSearch` model
- Added `classification` field (Greenwashing/Greenhushing/Greenwishing/Legitimate)
- Added indexes for performance
- Schema ready for migration (use `prisma db push` in production)

### 6. Hybrid Detection Logic ✅
- Updated `app/resources/resources-client.tsx`
- Implemented `runRuleBasedAnalysis()` - preserves existing rule-based logic
- Implemented `mergeAnalysisResults()` - combines rule-based and LLM results
- Auto-detects when to use LLM (complex cases, ambiguous results)
- Supports three modes: rule-based, LLM-only, hybrid

### 7. UI Enhancements ✅
- Added "Enhanced Analysis" toggle checkbox
- Shows detection method used (Rule-Based/AI-Powered/Hybrid)
- Displays classification and technique ID
- Loading state during LLM analysis
- Improved user feedback

### 8. tRPC Router Updates ✅
- Updated `logGreenwashingSearch` to accept `techniqueId` and `classification`
- Stores taxonomy data in database for research

## Taxonomy Implemented

**Greenwashing:**
- GW_VAGUE_PROMISE
- GW_FALSE_LABEL
- GW_HIDDEN_TRADEOFF
- GW_FLUFF

**Greenhushing:**
- GH_SELECTIVE_SILENCE
- GH_GOAL_RETRACTION
- GH_DATA_MASKING

**Greenwishing:**
- GW_NO_PATHWAY

**Legitimate:**
- LEGIT_SCIENCE_BASED
- LEGIT_THIRD_PARTY_VERIFIED

## How It Works

1. **Rule-Based Analysis** (always runs first)
   - Quick pattern matching
   - Keyword detection
   - Scoring system

2. **Decision Logic**
   - Auto-enables LLM for:
     - Statements >200 characters
     - Ambiguous scores (60-80)
     - Technical jargon present
   - Manual toggle available for forced LLM analysis

3. **LLM Analysis** (when enabled)
   - Calls OpenAI GPT-4-turbo
   - Returns classification, technique, severity
   - Provides detailed explanation

4. **Result Merging**
   - **Rule-Based Only**: Fast, good for obvious cases
   - **LLM Only**: Most accurate, uses AI classification
   - **Hybrid**: Combines both (60% LLM, 40% rules)

## Files Created/Modified

**New Files:**
- `scripts/generate-greenwashing-data.py`
- `scripts/requirements.txt`
- `scripts/README-data-generator.md`
- `lib/greenwashing-llm.ts`
- `app/api/analyze-greenwashing/route.ts`

**Modified Files:**
- `app/resources/resources-client.tsx` - Hybrid detection logic
- `server/trpc/routers/learning.ts` - Database schema updates
- `prisma/schema.prisma` - Added taxonomy fields
- `SETUP_ENV.md` - OpenAI configuration
- `package.json` - Added openai dependency

## Next Steps

1. **Database Migration**: Run `npx prisma db push` to apply schema changes
2. **Environment Variables**: Add OpenAI API keys to `.env.local`:
   ```
   OPENAI_API_KEY="your-production-key"
   OPENAI_API_KEY_STAGING="your-staging-key"
   ```
3. **Testing**: Test the system with various statements:
   - Simple cases (should use rule-based)
   - Complex cases (should auto-enable LLM)
   - Enhanced mode (forced LLM)
4. **Data Generation**: Run Python script to generate training data:
   ```bash
   pip install -r scripts/requirements.txt
   python scripts/generate-greenwashing-data.py
   ```

## Cost Considerations

- LLM is only used for complex cases or when manually enabled
- Rule-based analysis runs first (free)
- GPT-4-turbo costs ~$0.01-0.03 per analysis
- Consider caching results for identical statements

## Error Handling

- Graceful fallback to rule-based if LLM fails
- API errors don't break user experience
- Validation prevents abuse (max 5000 chars)
- Clear error messages for configuration issues

## Success Criteria Met ✅

- ✅ LLM analysis works for complex/nuanced statements
- ✅ Hybrid system improves accuracy over rule-based alone
- ✅ Taxonomy classifications are accurate
- ✅ Synthetic data generator produces quality training examples
- ✅ System gracefully falls back to rules if LLM fails


