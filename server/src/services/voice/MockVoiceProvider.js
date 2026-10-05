import { VoiceProvider } from './VoiceProvider.js';

export class MockVoiceProvider extends VoiceProvider {
  constructor(config) {
    super(config);
  }

  async connect() {
    return true;
  }

  async verifyConnection() {
    return true;
  }

  async createAgent(agentConfig) {
    return { id: 'mock-agent-id', ...agentConfig };
  }

  async updateAgent(agentId, agentConfig) {
    return { id: agentId, ...agentConfig };
  }

  async initiateCall(callConfig) {
    return { callId: 'mock-call-id', status: 'initiated' };
  }
}
export default MockVoiceProvider;
