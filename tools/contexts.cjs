/**
 * MCP Tools for Context Management
 */

const { ConvolutAPIClient } = require('../utils/api-client.cjs');

// Validation helpers
function validateContextSearch(args) {
  const params = {};
  if (args.limit !== undefined) {
    if (typeof args.limit !== 'number' || args.limit < 1 || args.limit > 100) {
      throw new Error('limit must be a number between 1 and 100');
    }
    params.limit = args.limit;
  }
  if (args.offset !== undefined) {
    if (typeof args.offset !== 'number' || args.offset < 0) {
      throw new Error('offset must be a non-negative number');
    }
    params.offset = args.offset;
  }
  if (args.contain) params.contain = args.contain;
  if (args.category) params.category = args.category;
  if (args.tags && Array.isArray(args.tags)) params.tags = args.tags;
  if (args.from) params.from = args.from;
  if (args.to) params.to = args.to;
  if (args.is_favorite !== undefined) params.is_favorite = args.is_favorite;
  
  return params;
}

function validateContextId(args) {
  if (!args.context_id || typeof args.context_id !== 'string') {
    throw new Error('context_id is required and must be a string');
  }
  return { context_id: args.context_id };
}

function validateCreateContext(args) {
  if (!args.title || typeof args.title !== 'string' || args.title.trim().length === 0) {
    throw new Error('title is required and must be a non-empty string');
  }
  if (!args.content || typeof args.content !== 'string' || args.content.trim().length === 0) {
    throw new Error('content is required and must be a non-empty string');
  }
  
  const data = {
    title: args.title.trim(),
    content: args.content.trim(),
    category: args.category || 'other',
    is_favorite: args.is_favorite || false
  };
  
  if (args.tags && Array.isArray(args.tags)) {
    data.tags = args.tags;
  }
  if (args.files && Array.isArray(args.files)) {
    data.files = args.files;
  }
  
  return data;
}

function validateUpdateContext(args) {
  const data = {};
  if (args.title !== undefined) {
    if (typeof args.title !== 'string' || args.title.trim().length === 0) {
      throw new Error('title must be a non-empty string');
    }
    data.title = args.title.trim();
  }
  if (args.content !== undefined) {
    if (typeof args.content !== 'string' || args.content.trim().length === 0) {
      throw new Error('content must be a non-empty string');
    }
    data.content = args.content.trim();
  }
  if (args.category !== undefined) data.category = args.category;
  if (args.is_favorite !== undefined) data.is_favorite = args.is_favorite;
  if (args.tags !== undefined) data.tags = args.tags;
  if (args.files !== undefined) data.files = args.files;
  
  return data;
}

// Tool implementations
async function handleListContexts(args, apiClient) {
  try {
    const params = validateContextSearch(args);
    const response = await apiClient.listContexts(params);
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          contexts: response.items,
          pagination: {
            total: response.total_count,
            limit: response.limit,
            offset: response.offset,
            hasMore: (response.offset || 0) + response.items.length < response.total_count,
          },
        }, null, 2),
      }],
    };
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: `Error listing contexts: ${error.message}`,
      }],
      isError: true,
    };
  }
}

async function handleGetContext(args, apiClient) {
  try {
    const { context_id } = validateContextId(args);
    const context = await apiClient.getContext(context_id);
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify(context, null, 2),
      }],
    };
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: `Error retrieving context: ${error.message}`,
      }],
      isError: true,
    };
  }
}

async function handleCreateContext(args, apiClient) {
  try {
    const contextData = validateCreateContext(args);
    const context = await apiClient.createContext(contextData);
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          message: 'Context created successfully',
          context,
        }, null, 2),
      }],
    };
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: `Error creating context: ${error.message}`,
      }],
      isError: true,
    };
  }
}

async function handleUpdateContext(args, apiClient) {
  try {
    const { context_id, ...updates } = args;
    validateContextId({ context_id });
    const updateData = validateUpdateContext(updates);
    
    const context = await apiClient.updateContext(context_id, updateData);
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          message: 'Context updated successfully',
          context,
        }, null, 2),
      }],
    };
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: `Error updating context: ${error.message}`,
      }],
      isError: true,
    };
  }
}

async function handleDeleteContext(args, apiClient) {
  try {
    const { context_id } = validateContextId(args);
    await apiClient.deleteContext(context_id);
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          message: 'Context deleted successfully',
          context_id,
        }, null, 2),
      }],
    };
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: `Error deleting context: ${error.message}`,
      }],
      isError: true,
    };
  }
}

module.exports = {
  handleListContexts,
  handleGetContext,
  handleCreateContext,
  handleUpdateContext,
  handleDeleteContext
};