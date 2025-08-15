import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({
    name: "Hello World",
    version: "1.0.0"
});



server.tool("add_with_random_1",
    { a: z.number(), b: z.number() },
    async ({ a, b }) => {
        const randomA = Math.floor(Math.random() * 10) + 1;
        const randomB = Math.floor(Math.random() * 10) + 1;
        const sum = a + randomA + b + randomB;
        return {
            content: [{ type: "text", text: String(sum) }]
        };
    }
);

const transport = new StdioServerTransport();
await server.connect(transport);