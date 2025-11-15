# Bargain Hunter (Prototype)

Prototype Craigslist bargain finder focused on the Denver market. Built with Next.js and a modular agent pipeline to keep iteration fast and extensible.

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Provide an LLM API key (optional for the prototype):

   ```bash
   cp .env.example .env.local
   # edit .env.local and add LLM_API_KEY
   ```

3. Run the development server:

   ```bash
   npm run dev
   ```

4. Run tests:

   ```bash
   npm test
   ```

## Project Structure

```
app/                # Next.js App Router pages & API routes
src/agents/         # Agent orchestrators (LLM + services)
src/models/         # Shared TypeScript domain models
src/services/       # Tool implementations (Craigslist mock, MSRP, scoring)
src/utils/          # Utilities (logging, time helpers)
tests/unit/         # Vitest unit tests for critical logic
```

## Notes

- The Craigslist service returns deterministic mock data for now. Replace `searchDenver` with a real crawler or API client in future iterations.
- LLM integration is stubbed: if `LLM_API_KEY` is missing the app falls back to heuristic parsing, but the `llmService` keeps a dedicated interface to be swapped later.
- MSRP lookups use a hardcoded map and ratio-based fallback until a real search API is integrated.
- Bargain scores are designed for transparency; adjust the weighting constants in `scoringService` to tune scoring in later versions.

## Pushing to GitHub

The prototype ships without a configured remote. To push your local work to a GitHub repository:

1. [Create a new repository on GitHub](https://github.com/new) (or reuse an existing empty repo).
2. Add the remote to this project:

   ```bash
   git remote add origin git@github.com:<your-username>/<your-repo>.git
   ```

   If you prefer HTTPS, use `https://github.com/<your-username>/<your-repo>.git` instead.
3. Push the current branch:

   ```bash
   git push -u origin work
   ```

   Replace `work` with the branch name you are pushing. Subsequent pushes can use `git push`.

If you receive authentication errors, ensure that you have an SSH key or HTTPS credentials configured for GitHub on this machine.
