'use client';

import { Shield, Code, Zap, FileSearch, CheckCircle, AlertTriangle } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              DevSecOps AI Guardian
            </h1>
          </div>
          <nav className="flex gap-6">
            <a href="#features" className="text-gray-600 hover:text-blue-600 transition">Features</a>
            <a href="#demo" className="text-gray-600 hover:text-blue-600 transition">Demo</a>
            <a href="#docs" className="text-gray-600 hover:text-blue-600 transition">Docs</a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            AI-Powered DevSecOps Platform
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Revolutionary security scanning, code quality analysis, and DevOps automation
            using Amazon Kiro's agentic AI capabilities
          </p>
          <div className="flex gap-4 justify-center">
            <button className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold">
              Get Started
            </button>
            <button className="px-8 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition font-semibold">
              Watch Demo
            </button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-blue-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">95%+</div>
              <div className="text-blue-100">Vulnerability Detection</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">60%</div>
              <div className="text-blue-100">Faster PR Reviews</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">$700K+</div>
              <div className="text-blue-100">Prize Pool Hackathon</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">100%</div>
              <div className="text-blue-100">Automated Fixes</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-center mb-12">Core Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Intelligent Security Scanner</h3>
            <p className="text-gray-600">
              Real-time vulnerability detection with OWASP Top 10 coverage,
              dependency analysis, and auto-fix capabilities
            </p>
          </div>

          {/* Feature 2 */}
          <div className="p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Code className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">AI-Powered Code Review</h3>
            <p className="text-gray-600">
              Architecture analysis, performance optimization, and best practices
              enforcement with contextual learning
            </p>
          </div>

          {/* Feature 3 */}
          <div className="p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Zap className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">DevOps Automation</h3>
            <p className="text-gray-600">
              Auto-generate CI/CD pipelines, Infrastructure as Code, and
              deployment strategies with cost optimization
            </p>
          </div>

          {/* Feature 4 */}
          <div className="p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <FileSearch className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Living Documentation</h3>
            <p className="text-gray-600">
              Auto-updated API docs, architecture diagrams, and knowledge bases
              using agent hooks
            </p>
          </div>

          {/* Feature 5 */}
          <div className="p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
              <CheckCircle className="h-6 w-6 text-yellow-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Compliance Monitoring</h3>
            <p className="text-gray-600">
              SOC2, GDPR, HIPAA compliance checking with real-time alerts
              and audit trails
            </p>
          </div>

          {/* Feature 6 */}
          <div className="p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition">
            <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
              <AlertTriangle className="h-6 w-6 text-pink-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Team Intelligence</h3>
            <p className="text-gray-600">
              Skill assessment, code ownership maps, and AI mentorship
              for team growth
            </p>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">See It In Action</h2>
          <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
            <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <div className="text-white text-center">
                <Shield className="h-16 w-16 mx-auto mb-4" />
                <p className="text-2xl font-bold">Demo Video Coming Soon</p>
                <p className="text-blue-100 mt-2">Watch how DevSecOps AI Guardian transforms your workflow</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-center mb-12">Built With Cutting-Edge Technology</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {['Amazon Kiro', 'Amazon Q Developer', 'Amazon Bedrock', 'AWS ECS',
            'Next.js 14', 'TypeScript', 'PostgreSQL', 'Redis'].map((tech) => (
            <div key={tech} className="p-4 bg-white rounded-lg shadow text-center font-semibold">
              {tech}
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Transform Your DevSecOps?</h2>
          <p className="text-xl mb-8 text-blue-100">
            Join the AWS Global Vibe Hackathon and experience the future of secure development
          </p>
          <button className="px-8 py-3 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition font-semibold text-lg">
            Start Free Trial
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Shield className="h-6 w-6" />
                <span className="font-bold">DevSecOps AI Guardian</span>
              </div>
              <p className="text-gray-400">
                Built for AWS Global Vibe: AI Coding Hackathon 2025
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition">GitHub</a></li>
                <li><a href="#" className="hover:text-white transition">API Reference</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Powered By</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Amazon Kiro</li>
                <li>Amazon Q Developer</li>
                <li>Amazon Bedrock</li>
                <li>AWS Cloud Services</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>© 2025 DevSecOps AI Guardian. Built with ❤️ using Amazon Kiro & AWS</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
