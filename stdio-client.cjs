#!/usr/bin/env node

const readline = require('readline');
const { ConvolutAPIClient } = require('./utils/api-client.cjs');
const { handleListContexts, handleGetContext, handleCreateContext, handleUpdateContext, handleDeleteContext } = require('./tools/contexts.cjs');
const { handleConsolidateContexts, handlePlanFromContexts, handleSearchContexts } = require('./tools/ai-tools.cjs');
const { handleExportContexts, handleGetRawUrl, handleGetContextStats } = require('./tools/export.cjs');

// Configuration
const API_KEY = process.env.CONVOLUT_API_KEY;

if (!API_KEY) {
  console.error('Error: CONVOLUT_API_KEY environment variable is required');
  console.error('Please set your Convolut API key in the environment or Claude Desktop config');
  process.exit(1);
}

// Initialize the Convolut API client
const apiClient = new ConvolutAPIClient(API_KEY);

// MCP Tool definitions
const TOOLS = [
  {
    name: 'list_contexts',
    description: 'Search and filter contexts with advanced options including keywords, tags, categories, and date ranges',
    inputSchema: {
      type: 'object',
      properties: {
        limit: { type: 'number', description: 'Maximum number of contexts to return (1-100)', minimum: 1, maximum: 100, default: 20 },
        offset: { type: 'number', description: 'Number of contexts to skip for pagination', minimum: 0, default: 0 },
        contain: { type: 'string', description: 'Keyword to search for in context title and content' },
        category: { type: 'string', description: 'Filter by category', enum: ['personal', 'work', 'research', 'templates', 'prompts', 'other'] },
        tags: { type: 'array', items: { type: 'string' }, description: 'Filter by tags' },
        from: { type: 'string', format: 'date-time', description: 'Start date for filtering (ISO datetime)' },
        to: { type: 'string', format: 'date-time', description: 'End date for filtering (ISO datetime)' },
        is_favorite: { type: 'boolean', description: 'Filter by favorite status' }
      }
    }
  },
  {
    name: 'get_context',
    description: 'Retrieve a specific context by its ID, including full content and metadata',
    inputSchema: {
      type: 'object',
      properties: {
        context_id: { type: 'string', format: 'uuid', description: 'The unique identifier of the context to retrieve' }
      },
      required: ['context_id']
    }
  },
  {
    name: 'create_context',
    description: 'Create a new context with title, content, tags, and metadata',
    inputSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'The title of the context', minLength: 1, maxLength: 200 },
        content: { type: 'string', description: 'The main content of the context', minLength: 1 },
        tags: { type: 'array', items: { type: 'string' }, description: 'Tags to categorize the context' },
        category: { type: 'string', description: 'Category for the context', enum: ['personal', 'work', 'research', 'templates', 'prompts', 'other'], default: 'other' },
        is_favorite: { type: 'boolean', description: 'Whether to mark the context as favorite', default: false },
        files: { type: 'array', items: { type: 'object', properties: { name: { type: 'string' }, url: { type: 'string', format: 'uri' }, type: { type: 'string' } }, required: ['name', 'url', 'type'] }, description: 'File attachments for the context' }
      },
      required: ['title', 'content']
    }
  },
  {
    name: 'update_context',
    description: 'Update an existing context with new title, content, tags, or metadata',
    inputSchema: {
      type: 'object',
      properties: {
        context_id: { type: 'string', format: 'uuid', description: 'The unique identifier of the context to update' },
        title: { type: 'string', description: 'New title for the context', minLength: 1, maxLength: 200 },
        content: { type: 'string', description: 'New content for the context', minLength: 1 },
        tags: { type: 'array', items: { type: 'string' }, description: 'New tags for the context' },
        category: { type: 'string', description: 'New category for the context', enum: ['personal', 'work', 'research', 'templates', 'prompts', 'other'] },
        is_favorite: { type: 'boolean', description: 'Whether to mark the context as favorite' }
      },
      required: ['context_id']
    }
  },
  {
    name: 'delete_context',
    description: 'Delete a context permanently by its ID',
    inputSchema: {
      type: 'object',
      properties: {
        context_id: { type: 'string', format: 'uuid', description: 'The unique identifier of the context to delete' }
      },
      required: ['context_id']
    }
  },
  {
    name: 'search_contexts',
    description: 'Perform semantic search across contexts to find relevant information',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query to find semantically similar contexts', minLength: 1 },
        limit: { type: 'number', description: 'Maximum number of results to return', minimum: 1, maximum: 50, default: 10 },
        category: { type: 'string', description: 'Filter results by category', enum: ['personal', 'work', 'research', 'templates', 'prompts', 'other'] },
        tags: { type: 'array', items: { type: 'string' }, description: 'Filter results by tags' }
      },
      required: ['query']
    }
  },
  {
    name: 'consolidate_contexts',
    description: 'Merge multiple contexts using AI to create a consolidated summary or composition',
    inputSchema: {
      type: 'object',
      properties: {
        context_ids: { type: 'array', items: { type: 'string', format: 'uuid' }, description: 'Array of context IDs to consolidate (2-10 contexts)', minItems: 2, maxItems: 10 },
        consolidation_type: { type: 'string', enum: ['summarize', 'compose'], description: 'Type of consolidation', default: 'summarize' },
        custom_prompt: { type: 'string', description: 'Optional custom prompt to guide the consolidation process' }
      },
      required: ['context_ids', 'consolidation_type']
    }
  },
  {
    name: 'plan_from_contexts',
    description: 'Analyze contexts and generate actionable plans using AI',
    inputSchema: {
      type: 'object',
      properties: {
        context_ids: { type: 'array', items: { type: 'string', format: 'uuid' }, description: 'Array of context IDs to analyze for planning (1-20 contexts)', minItems: 1, maxItems: 20 },
        planning_prompt: { type: 'string', description: 'Optional custom prompt to guide the planning process' }
      },
      required: ['context_ids']
    }
  },
  {
    name: 'export_contexts',
    description: 'Export contexts in various formats (JSON, XML, TXT, Markdown) for integration with other systems',
    inputSchema: {
      type: 'object',
      properties: {
        context_ids: { type: 'array', items: { type: 'string', format: 'uuid' }, description: 'Array of context IDs to export (1-100 contexts)', minItems: 1, maxItems: 100 },
        format: { type: 'string', enum: ['json', 'xml', 'txt', 'markdown'], description: 'Export format', default: 'json' },
        include_metadata: { type: 'boolean', description: 'Whether to include metadata', default: true }
      },
      required: ['context_ids', 'format']
    }
  },
  {
    name: 'get_raw_url',
    description: 'Generate a temporary raw URL for a context that can be accessed without authentication (expires in 10 minutes)',
    inputSchema: {
      type: 'object',
      properties: {
        context_id: { type: 'string', format: 'uuid', description: 'The unique identifier of the context to generate raw URL for' }
      },
      required: ['context_id']
    }
  },
  {
    name: 'get_context_stats',
    description: 'Get statistical information about contexts including counts, categories, and usage metrics',
    inputSchema: {
      type: 'object',
      properties: {
        date_range: { type: 'string', enum: ['7d', '30d', '90d', '1y', 'all'], description: 'Time range for statistics', default: '30d' },
        group_by: { type: 'string', enum: ['category', 'tags', 'date', 'favorite'], description: 'How to group the statistics', default: 'category' }
      }
    }
  }
];

// Tool handler mapping
const TOOL_HANDLERS = {
  'list_contexts': handleListContexts,
  'get_context': handleGetContext,
  'create_context': handleCreateContext,
  'update_context': handleUpdateContext,
  'delete_context': handleDeleteContext,
  'search_contexts': handleSearchContexts,
  'consolidate_contexts': handleConsolidateContexts,
  'plan_from_contexts': handlePlanFromContexts,
  'export_contexts': handleExportContexts,
  'get_raw_url': handleGetRawUrl,
  'get_context_stats': handleGetContextStats
};

// MCP stdio protocol handler
async function handleMCPRequest(request) {
  // Ensure we have a valid request object
  if (!request || typeof request !== 'object') {
    return {
      jsonrpc: '2.0',
      id: null,
      error: {
        code: -32700,
        message: 'Invalid request object'
      }
    };
  }

  // Handle notifications (no id field)
  const isNotification = !('id' in request);
  const requestId = 'id' in request ? request.id : null;

  try {
    switch (request.method) {
      case 'initialize':
        return {
          jsonrpc: '2.0',
          id: requestId,
          result: {
            protocolVersion: '2024-11-05',
            capabilities: {
              tools: { listChanged: false },
              logging: {},
              experimental: {}
            },
            serverInfo: {
              name: 'convolut-mcp-server',
              version: '1.0.0'
            }
          }
        };

      case 'notifications/initialized':
        // Notification - no response needed
        return null;

      case 'tools/list':
        return {
          jsonrpc: '2.0',
          id: requestId,
          result: { 
            tools: TOOLS 
          }
        };

      case 'resources/list':
        // Return empty resources list (not supported by this client)
        return {
          jsonrpc: '2.0',
          id: requestId,
          result: { 
            resources: [] 
          }
        };

      case 'tools/call':
        if (!request.params?.name) {
          return {
            jsonrpc: '2.0',
            id: requestId,
            error: {
              code: -32602,
              message: 'Missing tool name'
            }
          };
        }

        const toolName = request.params.name;
        const toolHandler = TOOL_HANDLERS[toolName];
        
        if (!toolHandler) {
          return {
            jsonrpc: '2.0',
            id: requestId,
            error: {
              code: -32601,
              message: `Tool not found: ${toolName}`
            }
          };
        }

        try {
          const result = await toolHandler(request.params.arguments || {}, apiClient);
          
          return {
            jsonrpc: '2.0',
            id: requestId,
            result
          };
        } catch (error) {
          return {
            jsonrpc: '2.0',
            id: requestId,
            error: {
              code: -32603,
              message: error.message
            }
          };
        }

      case 'ping':
        return {
          jsonrpc: '2.0',
          id: requestId,
          result: { status: 'ok' }
        };

      default:
        return {
          jsonrpc: '2.0',
          id: requestId,
          error: {
            code: -32601,
            message: `Method not found: ${request.method}`
          }
        };
    }
  } catch (error) {
    return {
      jsonrpc: '2.0',
      id: requestId,
      error: {
        code: -32603,
        message: `Internal error: ${error.message}`
      }
    };
  }
}

// Main stdio loop
async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
  });

  // Log startup to stderr (visible in Claude Desktop logs)
  console.error('Convolut MCP server starting - direct API integration...');

  rl.on('line', async (line) => {
    if (!line.trim()) return;

    try {
      const request = JSON.parse(line);
      const response = await handleMCPRequest(request);
      
      if (response) {
        console.log(JSON.stringify(response));
      }
    } catch (error) {
      const errorResponse = {
        jsonrpc: '2.0',
        id: null,
        error: {
          code: -32700,
          message: `Parse error: ${error.message}`
        }
      };
      console.log(JSON.stringify(errorResponse));
    }
  });

  rl.on('close', () => {
    console.error('Convolut MCP server shutting down...');
    process.exit(0);
  });

  // Handle process termination
  process.on('SIGINT', () => {
    console.error('Received SIGINT, shutting down...');
    rl.close();
  });

  process.on('SIGTERM', () => {
    console.error('Received SIGTERM, shutting down...');
    rl.close();
  });
}

// Error handling
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

if (require.main === module) {
  main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { handleMCPRequest };