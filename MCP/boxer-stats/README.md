# Boxer Stats MCP

MCP tool for fetching any boxer's statistics from <https://mrboxhist.se/boxare/[boxer-name>]

## Features

- Fetches total win-loss record for any boxer on mrboxhist.se
- Retrieves latest 3 matches with full details (opponent, club/nation, result, location, date, competition, comments)
- Formats data in readable table format
- Error handling for non-existent boxers
- Natural language name processing (converts "Name Surname" to "name-surname" URL format)

## Installation

1. Install dependencies:

```bash
npm install
```

2. Add to Claude Code MCP configuration.

## Claude Code Configuration

Add this MCP server to your Claude Code settings:

```json
{
  "mcpServers": {
    "boxer-stats": {
      "command": "node",
      "args": ["./MCP/boxer-stats/index.js"],
      "cwd": "PATH"
    }
  }
}
```

## Usage

Once configured, you can ask Claude Code about any boxer:

- "How's Mike Tyson doing?"
- "What are Mike Tyson boxing stats?"
- "Show me Mike Tyson latest boxing results"

The fetch-boxer-stats agent will automatically:

1. Extract the boxer name from your query
2. Convert it to the correct URL format (e.g., "Mike Tyson" → "mike-tyson")
3. Invoke this MCP tool to get the current statistics

## MCP Tool

- **Tool Name**: `get_boxer_stats`
- **Parameters**:
  - `boxer_name` (string): URL-formatted boxer name (e.g., "Mike Tyson", "mike-tyson")
- **Returns**: Formatted text with win-loss record and latest 3 matches, or error message if boxer doesn't exist

## Name Format Examples

- "Mike Tyson" → "mike-tyson"  
- "Floyd Mayweather" → "floyd-mayweather"

```

## Error Handling

If a boxer doesn't exist on mrboxhist.se:

```

Sorry, fake boxer does not exist on mrboxhist

```

