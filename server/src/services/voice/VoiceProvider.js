export class VoiceProvider {
  constructor(config) {
    this.config = config;
  }

  async connect() {
    throw new Error('Not implemented');
  }

  async verifyConnection() {
    throw new Error('Not implemented');
  }

  async createAgent(agentConfig) {
    throw new Error('Not implemented');
  }

  async updateAgent(agentId, agentConfig) {
    throw new Error('Not implemented');
  }

  async initiateCall(callConfig) {
    throw new Error('Not implemented');
  }
}
export default VoiceProvider;
