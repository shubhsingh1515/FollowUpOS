/**
 * Base AI Provider interface
 * All providers must implement these methods
 */
export class AIProvider {
  constructor(config = {}) {
    this.config = config;
    this.name = 'base';
  }

  /**
   * Analyze a lead and return structured scoring data
   * @param {Object} context - Lead context including messages, organization, services
   * @returns {Promise<Object>} - Structured lead analysis
   */
  async analyzeLead(context) {
    throw new Error('analyzeLead() must be implemented by provider');
  }

  /**
   * Generate a reply for a conversation
   * @param {Object} context - Conversation context
   * @returns {Promise<string>} - Generated reply text
   */
  async generateReply(context) {
    throw new Error('generateReply() must be implemented by provider');
  }

  /**
   * Generate a follow-up message
   * @param {Object} context - Follow-up context with previous messages
   * @returns {Promise<string>} - Generated follow-up text
   */
  async generateFollowUp(context) {
    throw new Error('generateFollowUp() must be implemented by provider');
  }

  /**
   * Summarize a conversation thread
   * @param {Array} messages - Array of message objects
   * @returns {Promise<string>} - Summary text
   */
  async summarizeConversation(messages) {
    throw new Error('summarizeConversation() must be implemented by provider');
  }

  /**
   * Generate a daily sales report
   * @param {Object} data - Sales data for the day
   * @returns {Promise<string>} - Report text
   */
  async generateDailyReport(data) {
    throw new Error('generateDailyReport() must be implemented by provider');
  }

  /**
   * Check if the provider is available
   * @returns {boolean}
   */
  isAvailable() {
    return false;
  }
}

export default AIProvider;
