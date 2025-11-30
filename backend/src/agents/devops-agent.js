/**
 * DevOps Agent
 *
 * Specialized AI agent for DevOps automation:
 * - CI/CD pipeline generation
 * - Infrastructure as Code
 * - Deployment strategies
 * - Cost optimization
 */

import { logger } from '../utils/logger.js';

export class DevOpsAgent {
  constructor(anthropic, bedrockClient) {
    this.anthropic = anthropic;
    this.bedrockClient = bedrockClient;
    this.name = 'DevOpsAgent';
  }

  async initialize() {
    logger.info(`Initializing ${this.name}...`);
  }

  /**
   * Analyze repository for DevOps recommendations
   */
  async analyze({ code, language, filepath, repository, context }) {
    logger.info(`${this.name}: Analyzing ${repository || 'code'} for DevOps optimization`);

    const prompt = `You are a DevOps expert analyzing a project.

Project details:
- Language: ${language}
- Repository: ${repository || 'unknown'}
- Context: ${JSON.stringify(context)}

Code sample:
\`\`\`${language}
${code}
\`\`\`

Analyze and provide:
1. CI/CD recommendations
2. Deployment strategy suggestions
3. Infrastructure requirements
4. Monitoring and logging needs
5. Security best practices for deployment

Respond in JSON format:
{
  "recommendations": [
    {
      "category": "ci-cd|deployment|infrastructure|monitoring|security",
      "priority": "high|medium|low",
      "description": "string",
      "implementation": "string"
    }
  ],
  "score": 0-100,
  "summary": "string"
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
   * Generate CI/CD pipeline configuration
   */
  async generatePipeline({ language, framework, platform = 'github', deployTarget = 'aws' }) {
    logger.info(`${this.name}: Generating ${platform} pipeline for ${language}`);

    const prompt = `You are a DevOps expert creating a CI/CD pipeline.

Requirements:
- Language/Framework: ${language}/${framework}
- Platform: ${platform} (GitHub Actions, GitLab CI, etc.)
- Deploy Target: ${deployTarget}

Generate a complete, production-ready CI/CD pipeline that includes:
1. Dependency installation
2. Linting and code quality checks
3. Security scanning
4. Unit and integration tests
5. Build process
6. Docker image creation (if applicable)
7. Deployment to ${deployTarget}
8. Environment-specific configurations (dev, staging, prod)
9. Rollback strategy
10. Notifications

Respond in JSON format:
{
  "pipelineConfig": "string (YAML/JSON configuration)",
  "platform": "string",
  "explanation": "string",
  "prerequisites": ["string"],
  "environmentVariables": [
    {
      "name": "string",
      "description": "string",
      "required": boolean
    }
  ],
  "deploymentStrategy": "string (blue-green, canary, rolling)"
}`;

    try {
      const response = await this.invokeClaude(prompt);
      const pipeline = JSON.parse(response);

      return {
        ...pipeline,
        agent: this.name,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error(`${this.name}: Pipeline generation failed:`, error);
      throw error;
    }
  }

  /**
   * Generate Infrastructure as Code
   */
  async generateInfrastructure({ service, provider = 'aws', tool = 'terraform' }) {
    logger.info(`${this.name}: Generating ${tool} configuration for ${service}`);

    const prompt = `You are an infrastructure expert.

Generate ${tool} configuration for:
- Service: ${service}
- Cloud Provider: ${provider}

Include:
1. All necessary resources
2. Security best practices (encryption, IAM, security groups)
3. High availability setup
4. Monitoring and logging
5. Cost optimization
6. Backup and disaster recovery

Respond in JSON format:
{
  "infrastructureCode": "string (Terraform/CloudFormation)",
  "tool": "string",
  "provider": "string",
  "resources": ["string"],
  "estimatedMonthlyCost": "string",
  "securityFeatures": ["string"],
  "scalingStrategy": "string"
}`;

    try {
      const response = await this.invokeClaude(prompt);
      const infrastructure = JSON.parse(response);

      return {
        ...infrastructure,
        agent: this.name,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error(`${this.name}: Infrastructure generation failed:`, error);
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
        max_tokens: options.maxTokens || 8192,
        temperature: options.temperature || 0.5,
        messages: [{ role: 'user', content: prompt }]
      });

      return message.content[0].text;
    } else if (this.bedrockClient) {
      const { InvokeModelCommand } = await import('@aws-sdk/client-bedrock-runtime');

      const payload = {
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: options.maxTokens || 8192,
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
