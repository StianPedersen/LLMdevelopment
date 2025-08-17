import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import * as cheerio from "cheerio";

const server = new McpServer({
    name: "Boxer Stats",
    version: "1.0.0"
});

// Helper function to fetch and parse boxer's boxing stats
async function fetchBoxerStats(boxerName) {
    try {
        // Format boxer name: convert to lowercase and replace spaces with hyphens
        const formattedBoxerName = boxerName.toLowerCase().replace(/\s+/g, '-');
        const response = await fetch(`https://mrboxhist.se/boxare/${formattedBoxerName}`);
        
        // Check if boxer exists
        if (!response.ok) {
            throw new Error(`Sorry, ${boxerName.replace(/-/g, ' ')} does not exist on mrboxhist`);
        }
        const html = await response.text();
        const $ = cheerio.load(html);
        
        // Extract match data from table rows
        const matches = [];
        let wins = 0, losses = 0;
        
        // Find table rows with match data
        $('table tr').each((index, row) => {
            const cells = $(row).find('td');
            if (cells.length >= 6) {
                const matchNumber = $(cells[0]).text().trim();
                const opponent = $(cells[1]).text().trim();
                const clubNation = $(cells[2]).text().trim();
                const result = $(cells[3]).text().trim();
                const location = $(cells[4]).text().trim();
                const date = $(cells[5]).text().trim();
                const competition = $(cells[6]).text().trim() || '';
                const comment = $(cells[7]).text().trim() || '';
                
                // Skip header rows and empty rows
                if (matchNumber && !isNaN(parseInt(matchNumber))) {
                    matches.push({
                        matchNumber: parseInt(matchNumber),
                        opponent,
                        clubNation,
                        result,
                        location,
                        date,
                        competition,
                        comment
                    });
                    
                    // Count wins/losses based on result format (e.g., "3 - 0")
                    if (result.includes(' - ')) {
                        const [boxerScore, opponentScore] = result.split(' - ').map(s => parseInt(s.trim()));
                        if (boxerScore > opponentScore) wins++;
                        else if (opponentScore > boxerScore) losses++;
                    }
                }
            }
        });
        
        // Sort matches by match number (descending for latest first)
        matches.sort((a, b) => b.matchNumber - a.matchNumber);
        
        return {
            totalWins: wins,
            totalLosses: losses,
            latestMatches: matches.slice(0, 3),
            boxerName: boxerName.replace(/-/g, ' ')
        };
    } catch (error) {
        throw new Error(error.message.includes('does not exist') ? error.message : `Failed to fetch stats: ${error.message}`);
    }
}

server.tool("get_boxer_stats",
    { boxer_name: z.string() },
    async ({ boxer_name }) => {
        const stats = await fetchBoxerStats(boxer_name);
        
        // Format the response
        let response = `${stats.boxerName} Boxing Stats:\n\n`;
        response += `Total Record: ${stats.totalWins} wins - ${stats.totalLosses} losses\n\n`;
        response += `Latest 3 Matches:\n`;
        response += `Match#  Opponent                   Club/Nation         Result  Location           Date        Competition     Comment\n`;
        response += `-----  -------------------------  ------------------  ------  -----------------  ----------  --------------  -----------\n`;
        
        stats.latestMatches.forEach(match => {
            response += `${match.matchNumber.toString().padEnd(6)} `;
            response += `${match.opponent.padEnd(25)} `;
            response += `${match.clubNation.padEnd(18)} `;
            response += `${match.result.padEnd(6)} `;
            response += `${match.location.padEnd(17)} `;
            response += `${match.date.padEnd(10)} `;
            response += `${match.competition.padEnd(14)} `;
            response += `${match.comment}\n`;
        });
        
        return {
            content: [{ type: "text", text: response }]
        };
    }
);

const transport = new StdioServerTransport();
await server.connect(transport);