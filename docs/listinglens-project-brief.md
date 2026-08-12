# ListingLens: technical project brief

## Product thesis

Listing portals optimize discovery. ListingLens supports the next decision: understanding one
property and comparing a shortlist without losing the evidence contained in the original listings.

The first release should answer three question types:

1. **Factual property Q&A:** “Does this listing mention storage or sound insulation?”
2. **Deterministic comparisons:** “Which home has the lowest known monthly cost per square metre?”
3. **Evidence-based synthesis:** “Summarize the trade-off between commute, space, and outdoor area.”

The system must distinguish “not mentioned,” “ambiguous,” and “not applicable.” It should never
convert missing listing data into an affirmative claim.

## MVP boundary

### In scope

- A user-provided URL, saved HTML/PDF, or permitted listing fixture
- A shortlist of two to ten homes
- A common property schema for renting and buying
- Questions grounded only in captured listing content and deterministic derived fields
- Field- and passage-level citations
- Freshness timestamps and source links
- Explicit abstention when evidence is absent or conflicting

### Out of scope for v1

- Autonomous crawling of listing platforms
- Price prediction or investment advice
- Mortgage eligibility or personalized financial advice
- Neighborhood safety scores inferred from sensitive or proxy attributes
- Recommendations learned from opaque user profiling

## Proposed architecture

```text
Listing input
  → immutable source snapshot + metadata
  → structured extraction and validation
  → normalized property record
  → semantic sections and evidence chunks
  → lexical + dense indexes
  → query router
      ↳ structured calculation
      ↳ hybrid passage retrieval and reranking
  → answer generation with claim-level citations
  → support checker / abstention gate
```

Use the structured path for arithmetic, sorting, filtering, and exact comparisons. Use retrieval for
descriptive evidence and ambiguous concepts. The final prompt receives a compact evidence pack, not
the entire listing.

## Core data contract

Every extracted value should retain provenance.

```json
{
  "listing_id": "stable-source-id",
  "source": {
    "url": "https://example.invalid/listing/123",
    "captured_at": "ISO-8601 timestamp",
    "content_hash": "sha256:..."
  },
  "transaction_type": "rent | buy",
  "address": {
    "display": "source value",
    "locality": "normalized value"
  },
  "price": {
    "amount": 2180,
    "currency": "EUR",
    "period": "month",
    "source_span_id": "field:advertised-price"
  },
  "area_m2": {
    "value": 82,
    "source_span_id": "field:living-area"
  },
  "recurring_costs": [],
  "rooms": {},
  "amenities": [],
  "description_sections": [],
  "missing_fields": [],
  "extraction_version": "v0.1.0"
}
```

Do not store a scalar without its source span, extraction method, and validation status.

## Retrieval baseline

Start with a baseline that is easy to understand and inspect:

- Section-aware chunks, preserving listing and field identity
- BM25 or another lexical retriever
- Top-k evidence returned with stable chunk identifiers
- A small hand-labeled question/evidence set

Then test whether dense retrieval and reranking provide a meaningful lift. Hybrid retrieval should be
earned through measured evidence recall, not selected by default.

## Query routing

| Question | Route | Expected output |
| --- | --- | --- |
| “Which is cheapest per m²?” | Structured | Calculation with inputs and field citations |
| “Does it sound quiet?” | Retrieval | Evidence passages plus uncertainty |
| “Compare commute and total cost.” | Mixed | Structured table plus cited narrative |
| “Is this a good investment?” | Refuse/reframe | Explain boundary and offer listing-grounded facts |

## Evaluation set

Create a versioned fixture set with different listing formats, missing fields, contradictions, and
adversarial description text. Label:

- expected normalized fields and source spans;
- answer-bearing passages for each question;
- deterministic comparison outputs;
- claims that should abstain;
- stale or conflicting values.

Track at least:

- attribute extraction precision, recall, and exact match;
- evidence recall@k and mean reciprocal rank;
- citation entailment / claim support rate;
- deterministic comparison accuracy;
- unsupported-claim and correct-abstention rates;
- p50/p95 latency and cost per question type.

Publish error slices, not only aggregate metrics: listing template, language, question type, missingness,
and shortlist size.

## Four milestones

### 1. Data contract and lexical baseline

- Build 20–30 permitted or synthetic listing fixtures.
- Implement snapshotting, parsing, normalized schema, and provenance.
- Label 50–75 questions with answer-bearing evidence.
- Publish a lexical retrieval baseline and failure analysis.

### 2. Grounded property Q&A

- Add dense retrieval only if it improves recall on difficult paraphrases.
- Generate answers from retrieved evidence with stable citations.
- Add claim support checks and abstention behavior.
- Evaluate faithfulness, latency, and cost.

### 3. Shortlist comparison

- Implement typed calculations over normalized fields.
- Add a query router and mixed structured/retrieval answers.
- Surface missing and non-comparable values in the UI.
- Test pairwise and multi-property comparison correctness.

### 4. Reproducible release

- Add automated tests and continuous evaluation.
- Containerize the API and UI.
- Deploy a monitored public demo using safe fixtures or user-provided data.
- Publish the case study with real metrics, limitations, and next steps.

## Repository structure

```text
listinglens/
├── app/                  # user interface
├── src/listinglens/
│   ├── ingest/           # source adapters and snapshots
│   ├── extract/          # schema extraction and validation
│   ├── retrieval/        # lexical, dense, reranking
│   ├── answering/        # routing, generation, citations
│   └── evaluation/       # metrics and evaluation runner
├── fixtures/             # permitted/synthetic listings
├── evals/                # versioned questions and labels
├── tests/
├── docs/
└── pyproject.toml
```

## Portfolio evidence to publish

The project becomes credible when the repository shows the reasoning behind it. Publish:

- the data contract and provenance model;
- the baseline before adding dense retrieval;
- the versioned evaluation set and scoring code;
- a failure-analysis notebook or report;
- latency/cost measurements;
- screenshots of citations, missing-data handling, and comparison output;
- a short section on source permissions, privacy, and deletion behavior.
