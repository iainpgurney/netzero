"""
Synthetic Data Generator for Greenwashing Detection Training Dataset

This script generates high-quality synthetic training examples for fine-tuning
an LLM to detect greenwashing, greenhushing, greenwishing, and legitimate claims.
"""

import json
import os
from typing import Literal, Optional
from datetime import datetime

try:
    from pydantic import BaseModel, Field
    import pandas as pd
    from openai import OpenAI
except ImportError as e:
    print(f"Missing required dependencies: {e}")
    print("Install with: pip install pydantic pandas openai")
    exit(1)


# Taxonomy Definitions
GREENWASHING_TECHNIQUES = [
    "GW_VAGUE_PROMISE",  # Vague, unsubstantiated environmental promises
    "GW_FALSE_LABEL",    # Misleading certifications or labels
    "GW_HIDDEN_TRADEOFF", # Highlighting one green aspect while ignoring others
    "GW_FLUFF",          # Meaningless or irrelevant environmental claims
]

GREENHUSHING_TECHNIQUES = [
    "GH_SELECTIVE_SILENCE",  # Deliberately omitting negative environmental data
    "GH_GOAL_RETRACTION",    # Quietly removing or reducing sustainability goals
    "GH_DATA_MASKING",       # Hiding or obscuring environmental impact data
]

GREENWISHING_TECHNIQUES = [
    "GW_NO_PATHWAY",  # Aspirational goals without clear implementation plan
]

LEGITIMATE_TECHNIQUES = [
    "LEGIT_SCIENCE_BASED",        # Claims backed by scientific evidence
    "LEGIT_THIRD_PARTY_VERIFIED", # Claims verified by independent third parties
]


class GreenClaim(BaseModel):
    """Pydantic model for greenwashing claim data structure"""
    text_snippet: str = Field(..., description="The actual claim text")
    source_type: Literal['Annual Report', 'Social Ad', 'Press Release', 'Packaging'] = Field(
        ..., description="Type of source material"
    )
    industry: Literal['Fashion', 'Energy', 'Finance', 'FMCG'] = Field(
        ..., description="Industry sector"
    )
    classification: Literal['Greenwashing', 'Greenhushing', 'Greenwishing', 'Legitimate'] = Field(
        ..., description="Primary classification"
    )
    technique_id: str = Field(..., description="Specific technique identifier from taxonomy")
    severity_score: float = Field(
        ..., ge=0.0, le=1.0, description="Severity score from 0.0 (low) to 1.0 (high)"
    )
    explanation: str = Field(..., description="Chain of thought reasoning for classification")


class SyntheticDataGenerator:
    """Generates synthetic greenwashing detection training data using OpenAI"""
    
    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize the generator with OpenAI API key
        
        Args:
            api_key: OpenAI API key. If None, reads from OPENAI_API_KEY env var
        """
        api_key = api_key or os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("OpenAI API key required. Set OPENAI_API_KEY env var or pass as argument.")
        
        self.client = OpenAI(api_key=api_key)
        
        self.system_prompt = """You are a Forensic ESG Auditor with 20+ years of experience detecting corporate greenwashing, greenhushing, greenwishing, and legitimate sustainability claims.

Your task is to generate realistic, nuanced examples of corporate environmental claims that would appear in real business communications.

CRITICAL REQUIREMENTS:
1. Generate SUBTLE examples - avoid obvious red flags. Real greenwashing is sophisticated.
2. Use industry-specific language and financial jargon when appropriate.
3. Make legitimate claims sound credible with specific metrics and certifications.
4. Make greenwashing claims sound plausible - they're designed to deceive.
5. Avoid using the word "green" excessively - real greenwashing uses euphemisms.
6. Include subtle omissions and data masking for greenhushing examples.
7. Show aspirational goals without clear pathways for greenwishing.

TAXONOMY:
- Greenwashing Techniques:
  * GW_VAGUE_PROMISE: Vague, unsubstantiated environmental promises without proof
  * GW_FALSE_LABEL: Misleading certifications, labels, or third-party endorsements
  * GW_HIDDEN_TRADEOFF: Highlighting one green aspect while ignoring negative impacts
  * GW_FLUFF: Meaningless or irrelevant environmental claims

- Greenhushing Techniques:
  * GH_SELECTIVE_SILENCE: Deliberately omitting negative environmental data or impacts
  * GH_GOAL_RETRACTION: Quietly removing or reducing previously stated sustainability goals
  * GH_DATA_MASKING: Hiding or obscuring environmental impact data (e.g., Scope 3 emissions)

- Greenwishing Techniques:
  * GW_NO_PATHWAY: Aspirational goals without clear implementation plan or timeline

- Legitimate Techniques:
  * LEGIT_SCIENCE_BASED: Claims backed by peer-reviewed scientific evidence
  * LEGIT_THIRD_PARTY_VERIFIED: Claims verified by independent third-party auditors

Generate examples that require expert analysis to detect - not obvious violations."""

    def generate_batch(
        self,
        n: int = 10,
        industry: Literal['Fashion', 'Energy', 'Finance', 'FMCG'] = 'Fashion',
        classification: Optional[Literal['Greenwashing', 'Greenhushing', 'Greenwishing', 'Legitimate']] = None,
        source_type: Optional[Literal['Annual Report', 'Social Ad', 'Press Release', 'Packaging']] = None
    ) -> list[GreenClaim]:
        """
        Generate a batch of synthetic greenwashing claims
        
        Args:
            n: Number of examples to generate
            industry: Industry sector
            classification: Specific classification to generate (None = random mix)
            source_type: Specific source type (None = random mix)
        
        Returns:
            List of GreenClaim objects
        """
        source_types = ['Annual Report', 'Social Ad', 'Press Release', 'Packaging']
        classifications = ['Greenwashing', 'Greenhushing', 'Greenwishing', 'Legitimate']
        
        if source_type is None:
            source_type = source_types[0]  # Default to first, will vary in prompt
        
        if classification is None:
            classification = classifications[0]  # Default to first, will vary in prompt
        
        user_prompt = f"""Generate {n} realistic examples of environmental claims from the {industry} industry.

Requirements:
- Source Type: {source_type}
- Classification: {classification}
- Industry: {industry}
- Make examples subtle and realistic - they should require expert analysis
- Include appropriate technique_id from the taxonomy
- Provide severity_score (0.0-1.0) based on how problematic the claim is
- Write detailed explanation showing chain of thought reasoning

Return ONLY valid JSON array of objects matching this exact structure:
{{
  "text_snippet": "the actual claim text",
  "source_type": "{source_type}",
  "industry": "{industry}",
  "classification": "{classification}",
  "technique_id": "one of the technique IDs from taxonomy",
  "severity_score": 0.0-1.0,
  "explanation": "detailed reasoning for why this is classified as such"
}}

Generate diverse examples - vary the techniques used and severity levels."""

        try:
            response = self.client.chat.completions.create(
                model="gpt-4-turbo-preview",  # Use GPT-4 for better quality
                messages=[
                    {"role": "system", "content": self.system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.8,  # Higher temperature for diversity
                response_format={"type": "json_object"} if n == 1 else None
            )
            
            content = response.choices[0].message.content
            
            # Parse JSON response
            try:
                if n == 1:
                    data = json.loads(content)
                    if "claims" in data:
                        claims_data = data["claims"]
                    else:
                        claims_data = [data]
                else:
                    # Try parsing as JSON array
                    claims_data = json.loads(content)
                    if not isinstance(claims_data, list):
                        claims_data = [claims_data]
            except json.JSONDecodeError:
                # Try extracting JSON from markdown code blocks
                import re
                json_match = re.search(r'```(?:json)?\s*(\[.*?\])\s*```', content, re.DOTALL)
                if json_match:
                    claims_data = json.loads(json_match.group(1))
                else:
                    raise ValueError(f"Could not parse JSON from response: {content[:200]}")
            
            # Validate and create GreenClaim objects
            claims = []
            for claim_data in claims_data[:n]:  # Limit to n examples
                try:
                    claim = GreenClaim(**claim_data)
                    claims.append(claim)
                except Exception as e:
                    print(f"Warning: Skipping invalid claim: {e}")
                    print(f"Data: {claim_data}")
                    continue
            
            return claims
            
        except Exception as e:
            print(f"Error generating batch: {e}")
            raise


def export_to_jsonl(claims: list[GreenClaim], filename: str = "greenwashing_training_data.jsonl"):
    """
    Export claims to JSONL format for fine-tuning
    
    Args:
        claims: List of GreenClaim objects
        filename: Output filename
    """
    # Remove duplicates based on text_snippet
    seen_texts = set()
    unique_claims = []
    for claim in claims:
        text_lower = claim.text_snippet.lower().strip()
        if text_lower not in seen_texts:
            seen_texts.add(text_lower)
            unique_claims.append(claim)
    
    print(f"Exporting {len(unique_claims)} unique claims (removed {len(claims) - len(unique_claims)} duplicates)")
    
    with open(filename, 'w', encoding='utf-8') as f:
        for claim in unique_claims:
            f.write(claim.model_dump_json() + '\n')
    
    print(f"✅ Exported to {filename}")


def validate_data(claims: list[GreenClaim]) -> dict:
    """
    Validate generated data for quality and completeness
    
    Returns:
        Dictionary with validation statistics
    """
    stats = {
        "total": len(claims),
        "by_classification": {},
        "by_technique": {},
        "by_industry": {},
        "by_source": {},
        "avg_severity": 0.0,
        "errors": []
    }
    
    for claim in claims:
        # Count by classification
        stats["by_classification"][claim.classification] = stats["by_classification"].get(claim.classification, 0) + 1
        
        # Count by technique
        stats["by_technique"][claim.technique_id] = stats["by_technique"].get(claim.technique_id, 0) + 1
        
        # Count by industry
        stats["by_industry"][claim.industry] = stats["by_industry"].get(claim.industry, 0) + 1
        
        # Count by source
        stats["by_source"][claim.source_type] = stats["by_source"].get(claim.source_type, 0) + 1
        
        # Validate severity score
        if not (0.0 <= claim.severity_score <= 1.0):
            stats["errors"].append(f"Invalid severity_score: {claim.severity_score}")
        
        # Validate technique_id matches classification
        if claim.classification == "Greenwashing" and not claim.technique_id.startswith("GW_"):
            stats["errors"].append(f"Mismatch: {claim.classification} but technique {claim.technique_id}")
        elif claim.classification == "Greenhushing" and not claim.technique_id.startswith("GH_"):
            stats["errors"].append(f"Mismatch: {claim.classification} but technique {claim.technique_id}")
        elif claim.classification == "Greenwishing" and claim.technique_id != "GW_NO_PATHWAY":
            stats["errors"].append(f"Mismatch: {claim.classification} but technique {claim.technique_id}")
        elif claim.classification == "Legitimate" and not claim.technique_id.startswith("LEGIT_"):
            stats["errors"].append(f"Mismatch: {claim.classification} but technique {claim.technique_id}")
    
    if stats["total"] > 0:
        stats["avg_severity"] = sum(c.severity_score for c in claims) / stats["total"]
    
    return stats


if __name__ == "__main__":
    # Example: Generate 5 rows of Greenhushing data for Energy sector
    print("🌱 Generating synthetic greenwashing detection training data...")
    print("=" * 60)
    
    # Initialize generator
    try:
        generator = SyntheticDataGenerator()
    except ValueError as e:
        print(f"❌ Error: {e}")
        print("\nSet OPENAI_API_KEY environment variable:")
        print("  export OPENAI_API_KEY='your-key-here'")
        exit(1)
    
    # Generate example batch
    print("\n📊 Generating 5 Greenhushing examples for Energy industry...")
    try:
        claims = generator.generate_batch(
            n=5,
            industry='Energy',
            classification='Greenhushing',
            source_type='Annual Report'
        )
        
        # Display as DataFrame
        df = pd.DataFrame([claim.model_dump() for claim in claims])
        print("\n" + "=" * 60)
        print("Generated Claims:")
        print("=" * 60)
        print(df.to_string(index=False))
        
        # Validate
        print("\n" + "=" * 60)
        print("Validation Statistics:")
        print("=" * 60)
        stats = validate_data(claims)
        print(f"Total: {stats['total']}")
        print(f"Average Severity: {stats['avg_severity']:.2f}")
        print(f"\nBy Classification: {stats['by_classification']}")
        print(f"By Technique: {stats['by_technique']}")
        print(f"By Industry: {stats['by_industry']}")
        print(f"By Source: {stats['by_source']}")
        
        if stats['errors']:
            print(f"\n⚠️  Errors found: {len(stats['errors'])}")
            for error in stats['errors'][:5]:  # Show first 5 errors
                print(f"  - {error}")
        else:
            print("\n✅ No validation errors!")
        
        # Export to JSONL
        print("\n" + "=" * 60)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"greenwashing_data_{timestamp}.jsonl"
        export_to_jsonl(claims, filename)
        
    except Exception as e:
        print(f"\n❌ Error generating data: {e}")
        import traceback
        traceback.print_exc()
        exit(1)


