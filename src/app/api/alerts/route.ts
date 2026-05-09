import {
  withErrorHandling,
  validateBody,
  errors,
} from "@/lib/api-utils";
import { createAlertSchema, CreateAlert, updateAlertSchema, AlertType } from "@/lib/validators";

// Mock data store (replace with database in production)
interface AlertData {
  id: string;
  userId: string;
  symbol: string;
  name: string;
  type: AlertType;
  threshold: number;
  currentPrice: number;
  enabled: boolean;
  triggered: boolean;
  triggeredAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const alerts = new Map<string, AlertData>();

// Initialize with sample data
const sampleAlerts: Omit<AlertData, "id" | "userId" | "createdAt" | "updatedAt">[] = [
  { symbol: "RELIANCE.NS", name: "Reliance Industries", type: "price_above", threshold: 3000, currentPrice: 2892.45, enabled: true, triggered: false, triggeredAt: null },
  { symbol: "HDFCBANK.NS", name: "HDFC Bank", type: "price_below", threshold: 1500, currentPrice: 1654.30, enabled: true, triggered: false, triggeredAt: null },
  { symbol: "TCS.NS", name: "TCS", type: "change_percent", threshold: 5, currentPrice: 3945.75, enabled: true, triggered: false, triggeredAt: null },
  { symbol: "TATAMOTORS.NS", name: "Tata Motors", type: "price_above", threshold: 1000, currentPrice: 952.30, enabled: false, triggered: true, triggeredAt: new Date(Date.now() - 86400000) },
];

sampleAlerts.forEach((a, i) => {
  const id = `alert-${i + 1}`;
  alerts.set(id, {
    id,
    userId: "user-1",
    ...a,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
});

function getAlertTypeLabel(type: AlertType): string {
  switch (type) {
    case "price_above":
      return "Price Above";
    case "price_below":
      return "Price Below";
    case "change_percent":
      return "Change %";
    case "volume_spike":
      return "Volume Spike";
    default:
      return type;
  }
}

/**
 * GET /api/alerts
 * Returns all alerts for the authenticated user
 */
export async function GET(request: Request) {
  return withErrorHandling(async () => {
    const userId = "user-1";
    
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get("symbol");
    const enabled = searchParams.get("enabled");
    
    let userAlerts = Array.from(alerts.values())
      .filter((a) => a.userId === userId);
    
    // Apply filters
    if (symbol) {
      userAlerts = userAlerts.filter((a) => a.symbol === symbol);
    }
    if (enabled !== null) {
      userAlerts = userAlerts.filter((a) => a.enabled === (enabled === "true"));
    }
    
    // Sort by creation date (newest first)
    userAlerts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    // Add labels and computed fields
    const alertsWithLabels = userAlerts.map((a) => ({
      ...a,
      typeLabel: getAlertTypeLabel(a.type),
      distanceToTrigger: a.type === "price_above" 
        ? ((a.threshold - a.currentPrice) / a.currentPrice) * 100
        : a.type === "price_below"
        ? ((a.currentPrice - a.threshold) / a.currentPrice) * 100
        : null,
    }));
    
    return {
      alerts: alertsWithLabels,
      summary: {
        total: userAlerts.length,
        enabled: userAlerts.filter((a) => a.enabled).length,
        triggered: userAlerts.filter((a) => a.triggered).length,
      },
    };
  });
}

/**
 * POST /api/alerts
 * Create a new alert
 */
export async function POST(request: Request) {
  return withErrorHandling(async () => {
    const data = await validateBody<CreateAlert>(request, createAlertSchema);
    const userId = "user-1";
    
    // Check for duplicate alert
    const existingAlert = Array.from(alerts.values()).find(
      (a) => a.userId === userId && a.symbol === data.symbol && a.type === data.type && a.threshold === data.threshold
    );
    
    if (existingAlert) {
      throw errors.conflict("An alert with these parameters already exists");
    }
    
    const id = `alert-${Date.now()}`;
    const now = new Date();
    
    // Mock current price
    const currentPrice = data.threshold * (0.8 + Math.random() * 0.4);
    
    const newAlert: AlertData = {
      id,
      userId,
      symbol: data.symbol,
      name: data.symbol.replace(".NS", "").replace(".BSE", ""),
      type: data.type,
      threshold: data.threshold,
      currentPrice,
      enabled: data.enabled ?? true,
      triggered: false,
      triggeredAt: null,
      createdAt: now,
      updatedAt: now,
    };
    
    alerts.set(id, newAlert);
    
    return {
      message: "Alert created successfully",
      alert: {
        ...newAlert,
        typeLabel: getAlertTypeLabel(newAlert.type),
      },
    };
  });
}

/**
 * PUT /api/alerts
 * Update an alert
 */
export async function PUT(request: Request) {
  return withErrorHandling(async () => {
    const body = await request.json();
    const { id, ...updateData } = body;
    const userId = "user-1";
    
    if (!id) {
      throw errors.badRequest("Alert ID is required");
    }
    
    const alert = alerts.get(id);
    if (!alert || alert.userId !== userId) {
      throw errors.notFound("Alert");
    }
    
    const validated = updateAlertSchema.parse(updateData);
    
    // If re-enabling and was triggered, reset triggered state
    if (validated.enabled === true && alert.triggered) {
      alert.triggered = false;
      alert.triggeredAt = null;
    }
    
    const updated: AlertData = {
      ...alert,
      ...validated,
      updatedAt: new Date(),
    };
    
    alerts.set(id, updated);
    
    return {
      message: "Alert updated successfully",
      alert: {
        ...updated,
        typeLabel: getAlertTypeLabel(updated.type),
      },
    };
  });
}

/**
 * DELETE /api/alerts
 * Delete an alert
 */
export async function DELETE(request: Request) {
  return withErrorHandling(async () => {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const userId = "user-1";
    
    if (!id) {
      throw errors.badRequest("Alert ID is required");
    }
    
    const alert = alerts.get(id);
    if (!alert || alert.userId !== userId) {
      throw errors.notFound("Alert");
    }
    
    alerts.delete(id);
    
    return {
      message: "Alert deleted successfully",
    };
  });
}
