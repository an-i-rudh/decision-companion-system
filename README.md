Instruction to run:

 (1) Type this in terminal

 - git clone https://github.com/an-i-rudh/decision-companion-system.git
 - cd decision-companion-system
 - npm install
 - node src/server.js

 (2) Open in browser
 
 - http://localhost:3000


Problem understanding:
 - System accept multiple criteria
 - System accept multiple options
 - Evaluate options
 - Provides ranked output

Assumptions made:
 - Criteria values are numeric & independent    

Decision logic:
 - Weights are normalized
 - Values are normalized using Min Max normalization:
    Benefit: (value - min) / (max - min)
    Cost: (max - value) / (max - min)
 - Final score = Σ(normalized_value × weight)

Trade Offs:
 -Didn't use web scrapping & AI to avoid complexities and external dependencies

Improvements with more time:
 - User authentification
 - Saving decisions
 - Sharing decision results
 