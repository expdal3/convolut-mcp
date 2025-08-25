# Convolut MCP Server

[![npm version](https://badge.fury.io/js/@convolut%2Fconvolut-mcp.svg)](https://www.npmjs.com/package/@convolut/convolut-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Official Model Context Protocol (MCP) server for [Convolut Context Bank](https://convolut.app), enabling seamless integration with Claude Desktop and other MCP clients.

## Features

🚀 **11 Powerful Tools** for context management and AI-powered operations:

### Context Management
- **`list_contexts`** - Search and filter contexts with advanced options
- **`get_context`** - Retrieve specific context by ID  
- **`create_context`** - Create new context with content and metadata
- **`update_context`** - Update existing contexts
- **`delete_context`** - Delete contexts by ID

### AI-Powered Operations  
- **`search_contexts`** - Semantic search across your contexts
- **`consolidate_contexts`** - AI-powered context consolidation and summarization
- **`plan_from_contexts`** - Generate actionable plans from multiple contexts

### Export & Integration
- **`export_contexts`** - Export to JSON, XML, TXT, or Markdown formats
- **`get_raw_url`** - Generate temporary shareable URLs
- **`get_context_stats`** - Statistical analysis of your contexts

## Quick Start

### Installation

```bash
npm install -g @convolut/convolut-mcp
```

### Claude Desktop Setup

1. Get your Convolut API key from [https://convolut.app](https://convolut.app)

2. Add to your Claude Desktop configuration file:

**Windows:** `%APPDATA%\\Claude\\claude_desktop_config.json`
**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "convolut": {
      "command": "npx",
      "args": ["@convolut/convolut-mcp"],
      "env": {
        "CONVOLUT_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

3. Restart Claude Desktop

4. Start using Convolut tools in your conversations! 🎉

## Usage Examples

### Search Your Contexts
```
"Search for contexts about machine learning"
```
Claude will use the `search_contexts` tool to find relevant contexts in your Convolut library.

### Create New Context  
```
"Save this conversation as a new context titled 'API Integration Discussion'"
```
Claude will use `create_context` to save the conversation to your Convolut account.

### Generate Plans
```
"Analyze these project contexts and create an actionable plan"
```
Claude will use `consolidate_contexts` and `plan_from_contexts` to analyze multiple contexts and generate structured plans.

## Manual Installation

If you prefer to install locally:

```bash
# Clone or download the package
git clone https://github.com/expdal3/convolut-mcp.git
cd convolut-mcp

# Install dependencies (none required - pure Node.js!)
npm install

# Test the installation
CONVOLUT_API_KEY=your_key_here node stdio-client.cjs
```

Then use the full path in your Claude Desktop config:
```json
{
  "mcpServers": {
    "convolut": {
      "command": "node", 
      "args": ["/full/path/to/convolut-mcp/stdio-client.cjs"],
      "env": {
        "CONVOLUT_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

## API Key Setup

### Get Your API Key
1. Sign up at [https://convolut.app](https://convolut.app)
2. Navigate to Settings → API Keys  
3. Generate a new API key
4. Copy the key (format: `convolut_sk_...`)

### Environment Variables
You can also set the API key as an environment variable:

```bash
# Windows
set CONVOLUT_API_KEY=your_api_key_here

# macOS/Linux  
export CONVOLUT_API_KEY=your_api_key_here
```

## Architecture

```
Claude Desktop (or other MCP Client) → stdio → convolut-mcp (MCP Server) → HTTPS → api.convolut.app
```

This MCP server provides a direct, efficient bridge between Claude Desktop and the Convolut API, with no intermediate servers required.

## Requirements

- Node.js 18.0.0 or higher
- Convolut API key
- Claude Desktop (or any MCP-compatible client)

## Supported Platforms

- ✅ Windows 10/11
- ✅ macOS 12+  
- ✅ Linux (Ubuntu 20.04+)

## Troubleshooting

### Claude Desktop Not Seeing Tools
1. Verify your `claude_desktop_config.json` syntax is correct
2. Check that your API key is valid
3. Restart Claude Desktop completely
4. Check Claude Desktop logs for errors

### API Key Issues
```
Error: CONVOLUT_API_KEY environment variable is required
```
- Ensure your API key is set in the Claude Desktop config
- Verify the API key format starts with `conair_sk_`
- Check for typos in the configuration file

### Connection Issues
- Verify internet connectivity
- Check if your firewall blocks HTTPS requests
- Ensure Node.js version is 18.0.0 or higher

## Development

### Project Structure
```
convolut-mcp/
├── stdio-client.cjs       # Main MCP server entry point
├── utils/
│   └── api-client.cjs     # Convolut API client
├── tools/
│   ├── contexts.cjs       # Context management tools
│   ├── ai-tools.cjs       # AI-powered operations  
│   └── export.cjs         # Export and statistics
├── types/
│   └── convolut.cjs       # Type definitions
└── README.md
```

### Contributing
1. Fork the repository
2. Create a feature branch  
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Support

- **Documentation:** [https://docs.convolut.app/mcp](https://convolut.app/mcp)
- **Issues:** [https://github.com/expdal3/convolut-mcp/issues](https://github.com/expdal3/convolut-mcp/issues)
- **Discord:** [https://discord.gg/convolut-ai](https://discord.gg/nptmrvEE)

## Related Projects

- [Convolut Web App](https://convolut.app) - Main context management platform
- [Convolut API Documentation](https://convolut.app/apis-mcp) - REST API reference
- [MCP Specification](https://modelcontextprotocol.io) - Model Context Protocol standard

---

**Made with ❤️ by the Convolut team**