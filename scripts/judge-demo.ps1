param(
  [switch]$NoPause
)

$ErrorActionPreference = "Stop"
$base = "http://localhost:4000/api"

function Wait-Demo($message) {
  Write-Host ""
  Write-Host "SHOW: $message" -ForegroundColor Cyan
  if (-not $NoPause) {
    Read-Host "Press Enter to run next live step"
  }
}

function Api($method, $path, $body = $null) {
  $params = @{
    Uri = "$base$path"
    Method = $method
    Headers = $script:headers
  }
  if ($null -ne $body) {
    $params.ContentType = "application/json"
    $params.Body = ($body | ConvertTo-Json -Depth 20)
  }
  $response = Invoke-RestMethod @params
  return $response.data
}

Write-Host "SyncOps live demo" -ForegroundColor Green
Write-Host "Backend: http://localhost:4000"
Write-Host "Frontend: http://localhost:3000"

$health = Invoke-RestMethod "http://localhost:4000/health"
Write-Host "Backend health: $($health.status) / $($health.service)" -ForegroundColor Green

$login = Invoke-RestMethod "$base/auth/login" -Method Post -ContentType "application/json" -Body (@{
  email = "admin@syncops.dev"
  password = "Admin@1234"
} | ConvertTo-Json)

$token = $login.data.accessToken
$userId = $login.data.user.id
$script:headers = @{ Authorization = "Bearer $token" }
$now = (Get-Date).ToUniversalTime().ToString("o")
$suffix = Get-Date -Format "HHmmss"

Wait-Demo "Open /overview. This is the owner dashboard before the live flow."
$dashboardBefore = Api "GET" "/dashboard"
Write-Host "Dashboard before: sales=$($dashboardBefore.salesOrders.total), purchases=$($dashboardBefore.purchaseOrders.total), manufacturing=$($dashboardBefore.manufacturingOrders.total)"

Wait-Demo "Open /products. Now we create customer, vendor, components, and finished product."
$customer = Api "POST" "/customers" @{
  name = "Live Customer $suffix"
  email = "customer.$suffix@syncops.dev"
  phone = "90000$suffix"
}

$vendor = Api "POST" "/vendors" @{
  name = "Live Timber Vendor $suffix"
  email = "vendor.$suffix@syncops.dev"
  phone = "80000$suffix"
}

$wood = Api "POST" "/products" @{
  sku = "WOOD-$suffix"
  name = "Wood Plank $suffix"
  unitOfMeasure = "pcs"
  standardCost = 120
  sellingPrice = 180
  reorderPoint = 10
  procureOnDemand = $true
  procurementMode = "MTS"
  supplyStrategy = "BUY"
  preferredVendorId = $vendor.id
}

$screw = Api "POST" "/products" @{
  sku = "SCREW-$suffix"
  name = "Screw Pack $suffix"
  unitOfMeasure = "pack"
  standardCost = 30
  sellingPrice = 45
  reorderPoint = 20
  procureOnDemand = $true
  procurementMode = "MTS"
  supplyStrategy = "BUY"
  preferredVendorId = $vendor.id
}

$table = Api "POST" "/products" @{
  sku = "TABLE-$suffix"
  name = "Dining Table $suffix"
  unitOfMeasure = "pcs"
  standardCost = 900
  sellingPrice = 1600
  reorderPoint = 2
  procureOnDemand = $false
  procurementMode = "MTO"
  supplyStrategy = "MAKE"
}

Write-Host "Created products: $($wood.sku), $($screw.sku), $($table.sku)" -ForegroundColor Green

Wait-Demo "Open /purchases. Now we buy raw materials and receive them into stock."
$purchase = Api "POST" "/purchases" @{
  vendorId = $vendor.id
  orderDate = $now
  expectedDate = $now
  notes = "Live demo raw material purchase"
  items = @(
    @{ productId = $wood.id; quantity = 30; unitCost = 120 },
    @{ productId = $screw.id; quantity = 30; unitCost = 30 }
  )
}

$purchase = Api "POST" "/purchases/$($purchase.id)/confirm" @{ confirmedBy = $userId }
$purchase = Api "POST" "/purchases/$($purchase.id)/receive" @{
  receivedBy = $userId
  receivedItems = @(
    @{ purchaseOrderItemId = $purchase.items[0].id; quantity = 30 },
    @{ purchaseOrderItemId = $purchase.items[1].id; quantity = 30 }
  )
}
Write-Host "Purchase order $($purchase.orderNumber) status: $($purchase.status)" -ForegroundColor Green

Wait-Demo "Open /bill-of-materials. Now we define how the table is manufactured."
$bom = Api "POST" "/bom" @{
  productId = $table.id
  name = "Dining Table BoM $suffix"
  version = "1.0"
  isActive = $true
  items = @(
    @{ componentProductId = $wood.id; quantity = 4; scrapPercentage = 0 },
    @{ componentProductId = $screw.id; quantity = 1; scrapPercentage = 0 }
  )
  operations = @(
    @{ operationName = "Assembly"; sequence = 1; plannedDurationMins = 45 },
    @{ operationName = "Finishing"; sequence = 2; plannedDurationMins = 30 }
  )
}

$table = Api "PATCH" "/products/$($table.id)" @{
  activeBomId = $bom.id
  procureOnDemand = $true
  procurementMode = "MTO"
  supplyStrategy = "MAKE"
}
Write-Host "BoM created and linked to $($table.sku)" -ForegroundColor Green

Wait-Demo "Open /sales. Now we create customer demand for a make-to-order finished good."
$sales = Api "POST" "/sales" @{
  customerId = $customer.id
  orderDate = $now
  requestedDate = $now
  notes = "Live demo customer demand"
  items = @(
    @{ productId = $table.id; quantity = 3; unitPrice = 1600 }
  )
}
Write-Host "Sales order created: $($sales.orderNumber), status: $($sales.status)" -ForegroundColor Green

Wait-Demo "Stay on /sales, then open /procurement after this. Confirming sales checks stock and auto-creates supply."
$sales = Api "POST" "/sales/$($sales.id)/confirm" @{ confirmedBy = $userId }
Write-Host "Sales order $($sales.orderNumber) status: $($sales.status)" -ForegroundColor Green

$procurement = Api "GET" "/procurement"
$autoAction = $procurement.actions | Where-Object { $_.salesOrderId -eq $sales.id } | Select-Object -First 1
if (-not $autoAction) {
  throw "No procurement action found for sales order $($sales.orderNumber)"
}
Write-Host "Procurement created $($autoAction.createdEntityType): $($autoAction.createdEntityId)" -ForegroundColor Green

Wait-Demo "Open /manufacturing. The sales demand has created a Manufacturing Order."
$manufacturingOrders = Api "GET" "/manufacturing"
$mo = $manufacturingOrders.manufacturingOrders | Where-Object { $_.id -eq $autoAction.createdEntityId } | Select-Object -First 1
if (-not $mo) {
  $mo = $manufacturingOrders | Where-Object { $_.id -eq $autoAction.createdEntityId } | Select-Object -First 1
}
if (-not $mo) {
  throw "Manufacturing order not found: $($autoAction.createdEntityId)"
}
Write-Host "Manufacturing order $($mo.orderNumber) status: $($mo.status), qty: $($mo.quantity)" -ForegroundColor Green

Wait-Demo "On /manufacturing, run production: confirm, start, complete. This consumes components and produces tables."
$mo = Api "POST" "/manufacturing/$($mo.id)/confirm" @{ confirmedBy = $userId }
$mo = Api "POST" "/manufacturing/$($mo.id)/start" @{
  startedBy = $userId
  startedAt = $now
}
$mo = Api "POST" "/manufacturing/$($mo.id)/complete" @{
  completedBy = $userId
  completedAt = $now
  producedQuantity = $mo.quantity
}
Write-Host "Manufacturing order $($mo.orderNumber) status: $($mo.status)" -ForegroundColor Green

Wait-Demo "Open /inventory. You should see PURCHASE, CONSUMPTION, and PRODUCTION movements."
$movements = Api "GET" "/inventory/movements?pageSize=10"
Write-Host "Latest inventory movements:"
$movements.entries | Select-Object -First 6 movementType,quantity,referenceType | Format-Table

Wait-Demo "Return to /sales. Now deliver the customer order; this writes SALE inventory movement."
$sales = Api "POST" "/sales/$($sales.id)/deliver" @{
  deliveredBy = $userId
  deliveredItems = @(
    @{ salesOrderItemId = $sales.items[0].id; quantity = 3 }
  )
}
Write-Host "Sales order $($sales.orderNumber) final status: $($sales.status)" -ForegroundColor Green

Wait-Demo "Open /audit and /overview. The full trace is now visible."
$audit = Api "GET" "/audit?limit=8"
$dashboardAfter = Api "GET" "/dashboard"

Write-Host ""
Write-Host "Final dashboard:" -ForegroundColor Green
$dashboardAfter | ConvertTo-Json -Depth 8

Write-Host ""
Write-Host "Latest audit logs:" -ForegroundColor Green
$audit.auditLogs | Select-Object -First 8 eventType,entityType,summary | Format-Table

Write-Host ""
Write-Host "Live demo complete. Refresh these pages: /overview, /products, /purchases, /bom, /sales, /procurement, /manufacturing, /inventory, /audit" -ForegroundColor Green
