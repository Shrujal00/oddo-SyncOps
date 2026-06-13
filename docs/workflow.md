# Workflow

SyncOps connects demand, procurement, production, and delivery through typed contracts.

```mermaid
flowchart TD
  Demand[Sales Order Draft] --> Confirm[Confirm Sales Order]
  Confirm --> StockCheck{Stock Available?}
  StockCheck -->|Yes| Reserve[Reserve Stock]
  StockCheck -->|No| Procure[Procurement Rule]
  Procure --> Purchase[Create Purchase Order Contract]
  Procure --> Manufacture[Create Manufacturing Order Contract]
  Purchase --> Receive[Receive Inventory]
  Manufacture --> Produce[Complete Manufacturing]
  Receive --> Deliver[Deliver Sales Order]
  Produce --> Deliver
  Reserve --> Deliver
  Deliver --> Audit[Audit Log Event]
```

## Status Flows

### Sales

`Draft -> Confirmed -> PartiallyDelivered -> Delivered`

Cancellation is allowed by contract through `Cancelled`.

### Purchases

`Draft -> Confirmed -> PartiallyReceived -> Received`

Cancellation is allowed by contract through `Cancelled`.

### Manufacturing

`Draft -> Confirmed -> InProgress -> Completed`

## Procurement Modes

- MTS: Make to Stock, replenishes predefined stock levels.
- MTO: Make to Order, reacts to explicit order demand.

The scaffold defines interfaces only. It does not implement procurement decisions.
