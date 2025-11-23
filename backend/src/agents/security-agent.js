/**
 * Security Agent
 *
 * Specialized AI agent for detecting security vulnerabilities
 * using OWASP Top 10 and CVE databases.
 */

import { logger } from '../utils/logger.js';

export class SecurityAgent {
  constructor(anthropic, bedrockClient) {
    this.anthropic = anthropic;
    this.bedrockClient = bedrockClient;
    this.name = 'SecurityAgent';
  }

  async initialize() {
    logger.info(`Initializing ${this.name}...`);
    // Load security patterns, CVE database, etc.
  }

  /**
   * Analyze code for security vulnerabilities
   */
  async analyze({ code, language, filepath, repository, context }) {
    logger.info(`${this.name}: Analyzing ${filepath || 'code'} for security issues`);

    const prompt = `You are a security expert analyzing code for vulnerabilities.

Analyze the following ${language} code for OWASP Top 10 and other security vulnerabilities:

\`\`\`${language}
${code}
\`\`\`

Filepath: ${filepath || 'unknown'}
Repository: ${repository || 'unknown'}

Check for:
1. SQL Injection (A03:2021-Injection)
2. XSS - Cross-Site Scripting (A03:2021-Injection)
3. CSRF - Cross-Site Request Forgery
4. Authentication/Authorization flaws (A07:2021-Identification and Authentication Failures)
5. Hardcoded secrets, API keys, passwords (A05:2021-Security Misconfiguration)
6. Insecure deserialization (A08:2021-Software and Data Integrity Failures)
7. Using components with known vulnerabilities (A06:2021-Vulnerable and Outdated Components)
8. Insufficient logging & monitoring (A09:2021-Security Logging and Monitoring Failures)
9. SSRF - Server-Side Request Forgery (A10:2021-Server-Side Request Forgery)
10. Insecure cryptography
11. Path traversal
12. Command injection
13. Improper error handling exposing sensitive data

For each vulnerability found, provide:
- Type (SQL injection, XSS, etc.)
- Severity (critical, high, medium, low)
- Line numbers (if applicable)
- Description
- CWE ID (if applicable)
- Exploitation scenario
- Remediation steps

Respond in JSON format:
{
  "vulnerabilities": [
    {
      "type": "string",
      "severity": "critical|high|medium|low",
      "line": number,
      "description": "string",
      "cwe": "string",
      "owasp": "string",
      "exploitation": "string",
      "remediation": "string",
      "codeSnippet": "string"
    }
  ],
  "score": 0-100 (100 = perfect security),
  "summary": "string"
}`;

    try {
      const response = await this.invokeClaude(prompt);
      const result = JSON.parse(response);

      // Enrich with additional security checks
      await this.checkSecrets(code, result);
      await this.checkDependencies(code, language, result);

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
   * Check for hardcoded secrets
   * @private
   */
  async checkSecrets(code, result) {
    const secretPatterns = [
      { pattern: /(api[_-]?key|apikey)\s*=\s*['"][^'"]+['"]/gi, type: 'API Key' },
      { pattern: /(password|passwd|pwd)\s*=\s*['"][^'"]+['"]/gi, type: 'Password' },
      { pattern: /(secret|token)\s*=\s*['"][^'"]+['"]/gi, type: 'Secret/Token' },
      { pattern: /AKIA[0-9A-Z]{16}/g, type: 'AWS Access Key' },
      { pattern: /sk_live_[0-9a-zA-Z]{24,}/g, type: 'Stripe Live Key' },
      { pattern: /ghp_[0-9a-zA-Z]{36}/g, type: 'GitHub Personal Access Token' },
      { pattern: /-----BEGIN (RSA |EC )?PRIVATE KEY-----/g, type: 'Private Key' }
    ];

    for (const { pattern, type } of secretPatterns) {
      const matches = code.match(pattern);
      if (matches) {
        result.vulnerabilities.push({
          type: 'Hardcoded Secret',
          severity: 'critical',
          description: `Found hardcoded ${type}`,
          cwe: 'CWE-798',
          owasp: 'A05:2021-Security Misconfiguration',
          exploitation: `Attacker can extract ${type} from source code or binaries`,
          remediation: `Move ${type} to environment variables or secret management service (AWS Secrets Manager, HashiCorp Vault)`,
          codeSnippet: matches[0].substring(0, 50) + '...'
        });
      }
    }
  }

  /**
   * Check dependencies for known vulnerabilities
   * @private
   */
  async checkDependencies(code, language, result) {
    // Detect package manager files
    const hasPackageJson = code.includes('package.json') || language === 'javascript';
    const hasRequirementsTxt = code.includes('requirements.txt') || language === 'python';

    if (hasPackageJson || hasRequirementsTxt) {
      result.vulnerabilities.push({
        type: 'Dependency Check Required',
        severity: 'medium',
        description: 'Dependencies should be scanned for CVE vulnerabilities',
        cwe: 'CWE-1035',
        owasp: 'A06:2021-Vulnerable and Outdated Components',
        exploitation: 'Vulnerable dependencies can be exploited if not updated',
        remediation: 'Run `npm audit` or `pip-audit` and update vulnerable packages'
      });
    }
  }

  /**
   * Generate secure code fix for a vulnerability
   */
  async generateFix({ code, language, filepath, issue, context }) {
    logger.info(`${this.name}: Generating fix for ${issue.type}`);

    const prompt = `You are a security expert fixing code vulnerabilities.

Original code:
\`\`\`${language}
${code}
\`\`\`

Vulnerability: ${issue.type}
Severity: ${issue.severity}
Description: ${issue.description}

Generate SECURE code that fixes this vulnerability. Provide:
1. Fixed code snippet
2. Explanation of the fix
3. Any additional security considerations

Respond in JSON format:
{
  "fixedCode": "string (complete fixed code)",
  "explanation": "string",
  "additionalConsiderations": ["string"],
  "testCode": "string (optional unit test)"
}`;

    try {
      const response = await this.invokeClaude(prompt);
      const fix = JSON.parse(response);

      return {
        ...fix,
        agent: this.name,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error(`${this.name}: Fix generation failed:`, error);
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
        temperature: options.temperature || 0.3,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      return message.content[0].text;
    } else if (this.bedrockClient) {
      // Use Bedrock if Anthropic not available
      const { InvokeModelCommand } = await import('@aws-sdk/client-bedrock-runtime');

      const payload = {
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: options.maxTokens || 4096,
        temperature: options.temperature || 0.3,
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
