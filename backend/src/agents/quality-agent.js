/**
 * Quality Agent
 *
 * Specialized AI agent for code quality analysis:
 * - Cyclomatic complexity
 * - Maintainability index
 * - Performance patterns
 * - Best practices
 */

import { logger } from '../utils/logger.js';

export class QualityAgent {
  constructor(anthropic, bedrockClient) {
    this.anthropic = anthropic;
    this.bedrockClient = bedrockClient;
    this.name = 'QualityAgent';
  }

  async initialize() {
    logger.info(`Initializing ${this.name}...`);
  }

  /**
   * Analyze code quality
   */
  async analyze({ code, language, filepath, repository, context }) {
    logger.info(`${this.name}: Analyzing ${filepath || 'code'} for quality issues`);

    const prompt = `You are a senior software engineer conducting a code quality review.

Analyze the following ${language} code:

\`\`\`${language}
${code}
\`\`\`

Evaluate:
1. Code Complexity:
   - Cyclomatic complexity
   - Cognitive complexity
   - Nesting depth

2. Maintainability:
   - Function/method length
   - Variable naming
   - Comments and documentation
   - DRY violations

3. Performance:
   - N+1 query patterns
   - Inefficient algorithms
   - Memory leaks
   - Unnecessary computations

4. Best Practices:
   - SOLID principles
   - Design patterns usage
   - Error handling
   - Test coverage indicators

5. Code Smells:
   - God objects/functions
   - Feature envy
   - Data clumps
   - Long parameter lists

Respond in JSON format:
{
  "issues": [
    {
      "category": "complexity|maintainability|performance|best-practices|code-smell",
      "type": "string",
      "severity": "high|medium|low",
      "line": number,
      "description": "string",
      "suggestion": "string",
      "codeSnippet": "string"
    }
  ],
  "metrics": {
    "cyclomaticComplexity": number,
    "cognitiveComplexity": number,
    "maintainabilityIndex": number (0-100),
    "linesOfCode": number,
    "commentRatio": number (0-1)
  },
  "score": 0-100 (100 = excellent quality),
  "summary": "string",
  "recommendations": ["string"]
}`;

    try {
      const response = await this.invokeClaude(prompt);
      const result = JSON.parse(response);

      return {
        ...result,
        agent: this.name,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error(`${this.name}: Analysis failed:`, error);
      throw error;
    }
  }

  /**
   * Generate improved code
   */
  async generateImprovement({ code, language, filepath, issue, context }) {
    logger.info(`${this.name}: Generating improvement for ${issue.type}`);

    const prompt = `You are a senior software engineer refactoring code.

Original code:
\`\`\`${language}
${code}
\`\`\`

Issue: ${issue.type}
Category: ${issue.category}
Description: ${issue.description}

Provide an improved version that addresses this issue while maintaining functionality.

Respond in JSON format:
{
  "improvedCode": "string",
  "explanation": "string",
  "improvements": ["string"],
  "tradeoffs": ["string"]
}`;

    try {
      const response = await this.invokeClaude(prompt);
      const improvement = JSON.parse(response);

      return {
        ...improvement,
        agent: this.name,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error(`${this.name}: Improvement generation failed:`, error);
      throw error;
    }
  }

  /**
   * Invoke Claude model
   * @private
   */
  async invokeClaude(prompt, options = {}) {
    if (this.anthropic) {
      const message = await this.anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: options.maxTokens || 4096,
        temperature: options.temperature || 0.5,
        messages: [{ role: 'user', content: prompt }]
      });

      return message.content[0].text;
    } else if (this.bedrockClient) {
      const { InvokeModelCommand } = await import('@aws-sdk/client-bedrock-runtime');

      const payload = {
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: options.maxTokens || 4096,
        temperature: options.temperature || 0.5,
        messages: [{ role: 'user', content: prompt }]
      };

      const command = new InvokeModelCommand({
        modelId: 'anthropic.claude-3-5-sonnet-20241022-v2:0',
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify(payload)
      });

      const response = await this.bedrockClient.send(command);
      const responseBody = JSON.parse(new TextDecoder().decode(response.body));
      return responseBody.content[0].text;
    } else {
      throw new Error('No AI client available');
    }
  }
}
