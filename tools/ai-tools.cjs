/**
 * AI-Powered MCP Tools for Context Processing
 * FIXED VERSION: Handles both direct array and paginated object responses
 */

const { ConvolutAPIClient } = require('../utils/api-client.cjs');

// Validation helpers
function validateConsolidateRequest(args) {
  if (!args.context_ids || !Array.isArray(args.context_ids) || args.context_ids.length < 2 || args.context_ids.length > 10) {
    throw new Error('context_ids must be an array of 2-10 context IDs');
  }

  if (!args.consolidation_type || !['summarize', 'compose'].includes(args.consolidation_type)) {
    throw new Error('consolidation_type must be either "summarize" or "compose"');
  }

  const request = {
    context_ids: args.context_ids,
    consolidation_type: args.consolidation_type
  };

  if (args.custom_prompt) {
    request.custom_prompt = args.custom_prompt;
  }

  return request;
}

function validatePlanRequest(args) {
  if (!args.context_ids || !Array.isArray(args.context_ids) || args.context_ids.length < 1 || args.context_ids.length > 20) {
    throw new Error('context_ids must be an array of 1-20 context IDs');
  }

  const request = {
    context_ids: args.context_ids
  };

  if (args.planning_prompt) {
    request.planning_prompt = args.planning_prompt;
  }

  return request;
}

// Tool implementations
async function handleConsolidateContexts(args, apiClient) {
  try {
    const request = validateConsolidateRequest(args);
    const result = await apiClient.consolidateContexts(request);

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          message: 'Contexts consolidated successfully',
          consolidation_type: request.consolidation_type,
          input_contexts: request.context_ids.length,
          result,
        }, null, 2),
      }],
    };
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: `Error consolidating contexts: ${error.message}`,
      }],
      isError: true,
    };
  }
}

async function handlePlanFromContexts(args, apiClient) {
  try {
    const request = validatePlanRequest(args);
    const result = await apiClient.planFromContexts(request);

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          message: 'Plan generated successfully from contexts',
          analyzed_contexts: request.context_ids.length,
          result,
        }, null, 2),
      }],
    };
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: `Error generating plan: ${error.message}`,
      }],
      isError: true,
    };
  }
}

async function handleSearchContexts(args, apiClient) {
  try {
    if (!args.query || typeof args.query !== 'string' || args.query.trim().length === 0) {
      throw new Error('query is required and must be a non-empty string');
    }

    const searchParams = {
      search: args.query,  // Changed from 'contain' to 'search' to match API wrapper
      limit: args.limit || 10,
    };

    if (args.category) searchParams.category = args.category;
    if (args.tags && Array.isArray(args.tags)) searchParams.tags = args.tags;

    const response = await apiClient.listContexts(searchParams);

    // FIXED: Handle both response formats
    const results = Array.isArray(response) ? response : response.items || [];

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          message: 'Context search completed',
          query: args.query,
          results: results,
          total_found: results.length,
        }, null, 2),
      }],
    };
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: `Error searching contexts: ${error.message}`,
      }],
      isError: true,
    };
  }
}

module.exports = {
  handleConsolidateContexts,
  handlePlanFromContexts,
  handleSearchContexts
};