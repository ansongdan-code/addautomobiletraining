const AgentServiceInterface = require('./interfaces/agentServiceInterface');
const Course = require('../models/Course');
const HttpError = require('../utils/httpError');
const logger = require('../utils/logger');
const axios = require('axios');

class AgentService extends AgentServiceInterface {
  async processQuery({ query, userId, userRole }) {
    if (!query) {
      throw new HttpError(400, 'Query is required');
    }

    logger.info(`AI Agent processing query from user ${userId}: ${query}`);

    // Fetch context to make the agent "smart"
    const context = await this.getAgentContext();

    // Prepare prompt for AI (If API key exists)
    const apiKey = process.env.OPENAI_API_KEY;

    if (apiKey) {
      return await this.getAIResponse(query, context, userRole);
    }

    // Fallback: Rule-based response for demo if no API key
    return this.getFallbackResponse(query, context);
  }

  async getAgentContext() {
    // Fetch top 5 published courses to help the student
    const courses = await Course.find({ status: 'published' })
      .limit(5)
      .select('title description price level category');

    return {
      availableCourses: courses,
      platformName: 'AddAuto Training Academy',
      capabilities: ['course information', 'account help', 'general automotive advice']
    };
  }

  async getAIResponse(query, context, userRole) {
    try {
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are the AddAuto Training Academy Assistant.
            Context: ${JSON.stringify(context)}.
            User Role: ${userRole}.
            Be helpful, professional, and encourage enrollment. If you don't know something, suggest contacting support.`
          },
          { role: 'user', content: query }
        ]
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        answer: response.data.choices[0].message.content,
        source: 'ai'
      };
    } catch (error) {
      logger.error('Error calling OpenAI API:', error.message);
      return this.getFallbackResponse(query, context);
    }
  }

  getFallbackResponse(query, context) {
    const lowerQuery = query.toLowerCase();

    if (lowerQuery.includes('course') || lowerQuery.includes('learn')) {
      const courseList = context.availableCourses.map(c => c.title).join(', ');
      return {
        answer: `We have some great courses available, including: ${courseList}. Which area are you interested in?`,
        source: 'rule-engine'
      };
    }

    if (lowerQuery.includes('price') || lowerQuery.includes('cost')) {
      return {
        answer: "Our courses are affordably priced. You can see individual prices on our Course Catalog page. We accept PayPal and Paystack.",
        source: 'rule-engine'
      };
    }

    return {
      answer: "I'm the AddAuto Assistant. I can help you with course information or general questions about our academy. How can I assist you today?",
      source: 'rule-engine'
    };
  }
}

module.exports = new AgentService();
