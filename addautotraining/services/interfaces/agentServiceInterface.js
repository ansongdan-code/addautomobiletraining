class AgentServiceInterface {
  async processQuery() {
    throw new Error('processQuery must be implemented');
  }

  async getAgentContext() {
    throw new Error('getAgentContext must be implemented');
  }
}

module.exports = AgentServiceInterface;
