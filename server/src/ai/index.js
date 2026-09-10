import { OpenAIProvider } from './OpenAIProvider.js';
import { MockAIProvider } from './MockAIProvider.js';
import { config } from '../config/config.js';
import { logger } from '../utils/logger.js';

let _provider = null;

/**
 * Get the active AI provider.
 * Uses OpenAI if credentials are available, otherwise falls back to Mock.
 */
export function getAIProvider() {
  if (_provider) return _provider;

  const openai = new OpenAIProvider();
  if (openai.isAvailable() && !config.demo.enabled) {
    logger.info('AI Provider: OpenAI initialized');
    _provider = openai;
  } else {
    logger.info(`AI Provider: Mock initialized (demo=${config.demo.enabled}, openai=${openai.isAvailable()})`);
    _provider = new MockAIProvider();
  }

  return _provider;
}

/**
 * Reset the provider (useful for testing)
 */
export function resetAIProvider() {
  _provider = null;
}

export default getAIProvider;
