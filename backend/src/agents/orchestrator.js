/**
 * AI Agent Orchestrator
 *
 * Manages the multi-agent system using Amazon Kiro's capabilities.
 * Coordinates specialized agents for security, quality, DevOps, etc.
 */

import Anthropic from '@anthropic-ai/sdk';
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { logger } from '../utils/logger.js';
import { SecurityAgent } from './security-agent.js';
import { QualityAgent } from './quality-agent.js';
import { DevOpsAgent } from './devops-agent.js';
import { DocumentationAgent } from './documentation-agent.js';
import { ComplianceAgent } from './compliance-agent.js';
import { LearningAgent } from './learning-agent.js';

class AgentOrchestratorClass {
  constructor() {
    this.agents = new Map();
    this.anthropic = null;
    this.bedrockClient = null;
    this.initialized = false;
  }

  /**
   * Initialize the orchestrator and all agents
   */
  async initialize() {
    if (this.initialized) {
      logger.warn('Agent Orchestrator already initialized');
      return;
    }

    try {
      logger.info('Initializing AI Agent Orchestrator...');

      // Initialize Anthropic client (for Kiro integration)
      if (process.env.ANTHROPIC_API_KEY) {
        this.anthropic = new Anthropic({
          apiKey: process.env.ANTHROPIC_API_KEY
        });
        logger.info('✓ Anthropic client initialized');
      }

      // Initialize AWS Bedrock client
      if (process.env.AWS_REGION) {
        this.bedrockClient = new BedrockRuntimeClient({
          region: process.env.AWS_REGION
        });
        logger.info('✓ AWS Bedrock client initialized');
      }

      // Initialize specialized agents
      this.agents.set('security', new SecurityAgent(this.anthropic, this.bedrockClient));
      this.agents.set('quality', new QualityAgent(this.anthropic, this.bedrockClient));
      this.agents.set('devops', new DevOpsAgent(this.anthropic, this.bedrockClient));
      this.agents.set('documentation', new DocumentationAgent(this.anthropic, this.bedrockClient));
      this.agents.set('compliance', new ComplianceAgent(this.anthropic, this.bedrockClient));
      this.agents.set('learning', new LearningAgent(this.anthropic, this.bedrockClient));

      // Initialize each agent
      for (const [name, agent] of this.agents.entries()) {
        await agent.initialize();
        logger.info(`✓ ${name} agent initialized`);
      }

      this.initialized = true;
      logger.info('✓ Agent Orchestrator fully initialized');
    } catch (error) {
      logger.error('Failed to initialize Agent Orchestrator:', error);
      throw error;
    }
  }

  /**
   * Execute a comprehensive scan on code
   * @param {Object} options - Scan options
   * @returns {Promise<Object>} - Scan results from all agents
   */
  async executeScan(options) {
    const {
      code,
      language,
      filepath,
      repository,
      enabledAgents = ['security', 'quality'],
      context = {}
    } = options;

    logger.info(`Executing scan for ${filepath || 'code snippet'}`);

    const results = {
      timestamp: new Date().toISOString(),
      filepath,
      language,
      repository,
      agents: {}
    };

    // Execute agents in parallel for speed
    const agentPromises = enabledAgents.map(async (agentName) => {
      const agent = this.agents.get(agentName);
      if (!agent) {
        logger.warn(`Agent ${agentName} not found`);
        return;
      }

      try {
        const startTime = Date.now();
        const agentResult = await agent.analyze({
          code,
          language,
          filepath,
          repository,
          context
        });
        const duration = Date.now() - startTime;

        results.agents[agentName] = {
          ...agentResult,
          duration,
          status: 'success'
        };

        logger.info(`${agentName} agent completed in ${duration}ms`);
      } catch (error) {
        logger.error(`${agentName} agent failed:`, error);
        results.agents[agentName] = {
          status: 'error',
          error: error.message
        };
      }
    });

    await Promise.all(agentPromises);

    // Calculate overall risk score
    results.overallScore = this.calculateOverallScore(results.agents);

    logger.info('Scan completed', { score: results.overallScore });

    return results;
  }

  /**
   * Execute auto-fix for detected issues
   * @param {Object} options - Fix options
   * @returns {Promise<Object>} - Fix results
   */
  async executeAutoFix(options) {
    const {
      code,
      language,
      issues,
      filepath,
      context = {}
    } = options;

    logger.info(`Executing auto-fix for ${issues.length} issues`);

    const fixes = [];

    for (const issue of issues) {
      const agent = this.agents.get(issue.agentType);
      if (!agent || !agent.generateFix) {
        continue;
      }

      try {
        const fix = await agent.generateFix({
          code,
          language,
          filepath,
          issue,
          context
        });

        fixes.push({
          issue: issue.id,
          type: issue.type,
          severity: issue.severity,
          fix,
          status: 'success'
        });
      } catch (error) {
        logger.error(`Failed to generate fix for issue ${issue.id}:`, error);
        fixes.push({
          issue: issue.id,
          status: 'error',
          error: error.message
        });
      }
    }

    return {
      timestamp: new Date().toISOString(),
      filepath,
      totalIssues: issues.length,
      fixedIssues: fixes.filter(f => f.status === 'success').length,
      fixes
    };
  }

  /**
   * Generate DevOps pipeline configuration
   * @param {Object} options - Pipeline options
   * @returns {Promise<Object>} - Generated pipeline configuration
   */
  async generatePipeline(options) {
    const devopsAgent = this.agents.get('devops');
    if (!devopsAgent) {
      throw new Error('DevOps agent not available');
    }

    return await devopsAgent.generatePipeline(options);
  }

  /**
   * Generate documentation
   * @param {Object} options - Documentation options
   * @returns {Promise<Object>} - Generated documentation
   */
  async generateDocumentation(options) {
    const docAgent = this.agents.get('documentation');
    if (!docAgent) {
      throw new Error('Documentation agent not available');
    }

    return await docAgent.generateDocumentation(options);
  }

  /**
   * Check compliance against standards
   * @param {Object} options - Compliance options
   * @returns {Promise<Object>} - Compliance check results
   */
  async checkCompliance(options) {
    const complianceAgent = this.agents.get('compliance');
    if (!complianceAgent) {
      throw new Error('Compliance agent not available');
    }

    return await complianceAgent.checkCompliance(options);
  }

  /**
   * Calculate overall risk score from agent results
   * @private
   */
  calculateOverallScore(agentResults) {
    const weights = {
      security: 0.4,
      quality: 0.3,
      compliance: 0.2,
      documentation: 0.1
    };

    let totalScore = 0;
    let totalWeight = 0;

    for (const [agentName, result] of Object.entries(agentResults)) {
      if (result.status === 'success' && result.score !== undefined) {
        const weight = weights[agentName] || 0.1;
        totalScore += result.score * weight;
        totalWeight += weight;
      }
    }

    return totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
  }

  /**
   * Invoke Claude model via Bedrock
   * @private
   */
  async invokeClaude(prompt, options = {}) {
    const {
      model = process.env.BEDROCK_MODEL_ID || 'anthropic.claude-3-5-sonnet-20241022-v2:0',
      maxTokens = 4096,
      temperature = 0.7
    } = options;

    const payload = {
      anthropic_version: 'bedrock-2023-05-31',
      max_tokens: maxTokens,
      temperature,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    };

    const command = new InvokeModelCommand({
      modelId: model,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify(payload)
    });

    const response = await this.bedrockClient.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));

    return responseBody.content[0].text;
  }

  /**
   * Gracefully shutdown the orchestrator
   */
  async shutdown() {
    logger.info('Shutting down Agent Orchestrator...');

    for (const [name, agent] of this.agents.entries()) {
      if (agent.shutdown) {
        await agent.shutdown();
        logger.info(`✓ ${name} agent shutdown`);
      }
    }

    this.initialized = false;
    logger.info('✓ Agent Orchestrator shutdown complete');
  }
}

// Export singleton instance
export const AgentOrchestrator = new AgentOrchestratorClass();
