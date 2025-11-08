import { google, sheets_v4 } from "googleapis";

type SheetsClient = sheets_v4.Sheets;

let cachedClient: SheetsClient | null = null;

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function normalizePrivateKey(key: string): string {
  return key.replace(/\\n/g, "\n");
}

async function getSheetsClient(): Promise<SheetsClient> {
  if (cachedClient) return cachedClient;

  const email = getRequiredEnv("GOOGLE_SERVICE_ACCOUNT_EMAIL");
  const privateKey = normalizePrivateKey(
    getRequiredEnv("GOOGLE_PRIVATE_KEY"),
  );

  const auth = new google.auth.JWT({
    email,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });

  cachedClient = google.sheets({ version: "v4", auth });
  return cachedClient;
}

export interface OrderStatusResult {
  orderId: string;
  customer: string;
  status: string;
  updatedAt?: string;
}

export interface InventoryResult {
  sku: string;
  name: string;
  quantity: number;
  restockLevel?: number;
}

function guessHeaderIndex(headers: string[], key: string): number {
  return headers.findIndex((header) =>
    header.toLowerCase().trim() === key.toLowerCase()
  );
}

export async function lookupOrderStatus(orderId: string) {
  const sheets = await getSheetsClient();
  const spreadsheetId = getRequiredEnv("GOOGLE_SHEETS_ID");
  const tabName =
    process.env.GOOGLE_SHEETS_ORDER_TAB?.trim() || "Orders";

  const range = `'${tabName}'!A:Z`;
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range,
  });

  const rows = response.data.values || [];
  if (!rows.length) return null;

  const headers = rows[0];
  const idIndex = guessHeaderIndex(headers, "order id");
  const customerIndex = guessHeaderIndex(headers, "customer");
  const statusIndex = guessHeaderIndex(headers, "status");
  const updatedIndex = guessHeaderIndex(headers, "updated at");

  if (idIndex < 0) {
    throw new Error(
      `Orders sheet "${tabName}" must include an "Order ID" column header.`,
    );
  }

  for (const row of rows.slice(1)) {
    if (!row[idIndex]) continue;
    if (row[idIndex].toString().trim().toLowerCase() === orderId.toLowerCase()) {
      return {
        orderId: row[idIndex],
        customer: customerIndex >= 0 ? row[customerIndex] : "",
        status: statusIndex >= 0 ? row[statusIndex] : "",
        updatedAt: updatedIndex >= 0 ? row[updatedIndex] : undefined,
      } satisfies OrderStatusResult;
    }
  }

  return null;
}

export async function lookupInventory(query: string) {
  const sheets = await getSheetsClient();
  const spreadsheetId = getRequiredEnv("GOOGLE_SHEETS_ID");
  const tabName =
    process.env.GOOGLE_SHEETS_INVENTORY_TAB?.trim() || "Inventory";

  const range = `'${tabName}'!A:Z`;
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range,
  });

  const rows = response.data.values || [];
  if (!rows.length) return null;

  const headers = rows[0];
  const skuIndex = guessHeaderIndex(headers, "sku");
  const nameIndex = guessHeaderIndex(headers, "name");
  const quantityIndex = guessHeaderIndex(headers, "quantity");
  const restockIndex = guessHeaderIndex(headers, "restock level");

  if (skuIndex < 0 && nameIndex < 0) {
    throw new Error(
      `Inventory sheet "${tabName}" must include either an "SKU" or "Name" column header.`,
    );
  }

  const normalizedQuery = query.toLowerCase();
  for (const row of rows.slice(1)) {
    const skuValue =
      skuIndex >= 0 && row[skuIndex] != null
        ? row[skuIndex]!.toString()
        : "";
    const nameValue =
      nameIndex >= 0 && row[nameIndex] != null
        ? row[nameIndex]!.toString()
        : "";
    if (
      skuValue.toLowerCase() === normalizedQuery ||
      nameValue.toLowerCase().includes(normalizedQuery)
    ) {
      const quantityRaw =
        quantityIndex >= 0 && row[quantityIndex] != null
          ? row[quantityIndex]!.toString()
          : undefined;
      const quantityValue =
        quantityRaw && !Number.isNaN(Number(quantityRaw))
          ? Number(quantityRaw)
          : 0;
      const restockRaw =
        restockIndex >= 0 && row[restockIndex] != null
          ? row[restockIndex]!.toString()
          : undefined;
      const restockValue =
        restockRaw && !Number.isNaN(Number(restockRaw))
          ? Number(restockRaw)
          : undefined;

      return {
        sku: skuValue || nameValue || query,
        name: nameValue || skuValue || query,
        quantity: quantityValue,
        restockLevel: restockValue,
      } satisfies InventoryResult;
    }
  }

  return null;
}
