import { lookupInventory, lookupOrderStatus } from "@/lib/googleSheets";

function xmlEscape(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function buildTwiml(message: string) {
  const body = xmlEscape(message);
  const xml = `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${body}</Message></Response>`;
  return new Response(xml, {
    headers: {
      "Content-Type": "text/xml",
    },
  });
}

function buildHelpMessage() {
  return [
    "Hi! I'm your order and inventory assistant.",
    "• Order status: send 'order 12345'",
    "• Inventory: send 'inventory SKU123' or 'inventory widget'",
  ].join("\n");
}

function extractCommand(body: string) {
  const sanitized = body.trim();
  if (!sanitized) return { type: "help" as const };

  const [rawCommand, ...rest] = sanitized.split(/\s+/);
  const command = rawCommand.toLowerCase();
  const value = rest.join(" ").trim();

  if (["order", "status"].includes(command) && value) {
    return { type: "order" as const, value };
  }

  if (["inventory", "stock"].includes(command) && value) {
    return { type: "inventory" as const, value };
  }

  if (["help", "menu"].includes(command)) {
    return { type: "help" as const };
  }

  return { type: "unknown" as const };
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const params = new URLSearchParams(rawBody);
  const incomingBody = params.get("Body") ?? "";

  const command = extractCommand(incomingBody);

  try {
    switch (command.type) {
      case "order": {
        const result = await lookupOrderStatus(command.value);
        if (!result) {
          return buildTwiml(
            `I couldn't find order ${command.value}. Double-check the order ID or reply 'help'.`,
          );
        }
        const pieces = [
          `Order ${result.orderId}`,
          result.customer ? `Customer: ${result.customer}` : undefined,
          result.status ? `Status: ${result.status}` : undefined,
          result.updatedAt ? `Updated: ${result.updatedAt}` : undefined,
        ].filter(Boolean);
        return buildTwiml(pieces.join("\n"));
      }
      case "inventory": {
        const result = await lookupInventory(command.value);
        if (!result) {
          return buildTwiml(
            `I couldn't find any inventory result for "${command.value}". Try another SKU or name.`,
          );
        }
        const pieces = [
          `Item: ${result.name}`,
          `SKU: ${result.sku}`,
          `Quantity: ${result.quantity}`,
          typeof result.restockLevel === "number"
            ? `Restock level: ${result.restockLevel}`
            : undefined,
        ].filter(Boolean);
        return buildTwiml(pieces.join("\n"));
      }
      case "help":
        return buildTwiml(buildHelpMessage());
      case "unknown":
      default:
        return buildTwiml(
          "I didn't understand that. Reply 'help' to see example commands.",
        );
    }
  } catch (error) {
    console.error(error);
    return buildTwiml(
      "Something went wrong while checking the data. Please try again shortly.",
    );
  }
}

export async function GET() {
  return new Response("OK");
}
