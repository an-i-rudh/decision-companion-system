Initially considered building a static comparison tool but since the the requirements are dynamic and needed decision engine.

I also considered using AI but rejected it to maintain deterministic logic.

I also considered using webscrapping but rejected it to avoid inconsistant results.

Architectural Evolution:

 - Phase 1:
    Simple in-memory evaluation.

 - Phase 2:
    Separated decision logic into its own module to ensure purity.

 - Phase 3:
    Added SQLite persistence layer.

 - Phase 4:
    Added validation and normalization safeguards.

Mistakes and Corrections:
 - Initially forgot to normalize weights.
 - Encountered division by zero error
 