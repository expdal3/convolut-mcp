/**
 * Export and Integration MCP Tools
 */

const { ConvolutAPIClient } = require('../utils/api-client.cjs');

// Validation helpers
function validateExportRequest(args) {
  if (!args.context_ids || !Array.isArray(args.context_ids) || args.context_ids.length < 1 || args.context_ids.length > 100) {
    throw new Error('context_ids must be an array of 1-100 context IDs');
  }
  
  if (!args.format || !['json', 'xml', 'txt', 'markdown'].includes(args.format)) {
    throw new Error('format must be one of: json, xml, txt, markdown');
  }
  
  const request = {
    context_ids: args.context_ids,
    format: args.format,
    include_metadata: args.include_metadata !== undefined ? args.include_metadata : true
  };
  
  return request;
}

function validateRawUrlRequest(args) {
  if (!args.context_id || typeof args.context_id !== 'string') {
    throw new Error('context_id is required and must be a string');
  }
  return { context_id: args.context_id };
}

// Tool implementations
async function handleExportContexts(args, apiClient) {
  try {
    const request = validateExportRequest(args);
    const result = await apiClient.exportContexts(request);
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          message: 'Contexts exported successfully',
          format: request.format,
          exported_contexts: request.context_ids.length,
          include_metadata: request.include_metadata,
          result,
        }, null, 2),
      }],
    };
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: `Error exporting contexts: ${error.message}`,
      }],
      isError: true,
    };
  }
}

async function handleGetRawUrl(args, apiClient) {
  try {
    const request = validateRawUrlRequest(args);
    const result = await apiClient.generateRawUrl(request);
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          message: 'Raw URL generated successfully',
          context_id: request.context_id,
          raw_url: result.raw_url,
          expires_in_seconds: result.expires_in_seconds,
          expires_at: new Date(Date.now() + result.expires_in_seconds * 1000).toISOString(),
        }, null, 2),
      }],
    };
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: `Error generating raw URL: ${error.message}`,
      }],
      isError: true,
    };
  }
}

async function handleGetContextStats(args, apiClient) {
  try {
    const { date_range = '30d', group_by = 'category' } = args;
    
    // Get contexts for statistics (simplified implementation)
    const allContexts = await apiClient.listContexts({ limit: 100 });
    
    // Calculate statistics based on group_by parameter
    let stats = {};
    
    if (group_by === 'category') {
      stats = allContexts.items.reduce((acc, context) => {
        acc[context.category] = (acc[context.category] || 0) + 1;
        return acc;
      }, {});
    } else if (group_by === 'favorite') {
      stats = {
        favorites: allContexts.items.filter(c => c.is_favorite).length,
        non_favorites: allContexts.items.filter(c => !c.is_favorite).length,
      };
    } else if (group_by === 'tags') {
      const tagCounts = {};
      allContexts.items.forEach(context => {
        context.tags.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      });
      stats = tagCounts;
    }

    const result = {
      total_contexts: allContexts.total_count,
      date_range,
      group_by,
      statistics: stats,
      total_words: allContexts.items.reduce((sum, ctx) => sum + (ctx.word_count || 0), 0),
      avg_words_per_context: allContexts.items.length > 0 
        ? Math.round(allContexts.items.reduce((sum, ctx) => sum + (ctx.word_count || 0), 0) / allContexts.items.length)
        : 0,
    };
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify(result, null, 2),
      }],
    };
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: `Error generating statistics: ${error.message}`,
      }],
      isError: true,
    };
  }
}

module.exports = {
  handleExportContexts,
  handleGetRawUrl,
  handleGetContextStats
};