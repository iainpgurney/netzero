# Greenwashing Data Generator

This Python script generates synthetic training data for fine-tuning LLM models to detect greenwashing, greenhushing, greenwishing, and legitimate sustainability claims.

## Setup

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

2. Set OpenAI API key:
```bash
export OPENAI_API_KEY="your-api-key-here"
```

Or on Windows:
```powershell
$env:OPENAI_API_KEY="your-api-key-here"
```

## Usage

Run the script:
```bash
python scripts/generate-greenwashing-data.py
```

This will generate 5 example Greenhushing claims for the Energy industry.

## Customization

Edit the `__main__` block at the bottom of the script to:
- Change the number of examples (`n=5`)
- Change the industry (`'Fashion'`, `'Energy'`, `'Finance'`, `'FMCG'`)
- Change the classification (`'Greenwashing'`, `'Greenhushing'`, `'Greenwishing'`, `'Legitimate'`)
- Change the source type (`'Annual Report'`, `'Social Ad'`, `'Press Release'`, `'Packaging'`)

## Output

The script generates:
- Console output showing the generated claims as a pandas DataFrame
- Validation statistics
- A JSONL file (`greenwashing_data_TIMESTAMP.jsonl`) ready for fine-tuning

## Example

```python
# Generate 10 Greenwashing examples for Fashion industry
claims = generator.generate_batch(
    n=10,
    industry='Fashion',
    classification='Greenwashing',
    source_type='Social Ad'
)
```

## Taxonomy

The script uses the following taxonomy:

**Greenwashing Techniques:**
- `GW_VAGUE_PROMISE` - Vague, unsubstantiated promises
- `GW_FALSE_LABEL` - Misleading certifications
- `GW_HIDDEN_TRADEOFF` - Highlighting one aspect while ignoring others
- `GW_FLUFF` - Meaningless claims

**Greenhushing Techniques:**
- `GH_SELECTIVE_SILENCE` - Omitting negative data
- `GH_GOAL_RETRACTION` - Quietly reducing goals
- `GH_DATA_MASKING` - Hiding impact data

**Greenwishing Techniques:**
- `GW_NO_PATHWAY` - Goals without implementation plan

**Legitimate Techniques:**
- `LEGIT_SCIENCE_BASED` - Backed by science
- `LEGIT_THIRD_PARTY_VERIFIED` - Verified by auditors


