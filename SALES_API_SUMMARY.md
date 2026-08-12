# Sales API - Quick Reference

## Endpoints Overview

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/admin/sales` | Get all sales | ✅ Admin |
| GET | `/api/admin/sales/:id` | Get single sale | ✅ Admin |
| GET | `/api/admin/sales/next-invoice-number` | Get next invoice# | ✅ Admin |
| POST | `/api/admin/sales` | Create new sale | ✅ Admin |
| PUT | `/api/admin/sales/:id` | Update sale | ✅ Admin |
| DELETE | `/api/admin/sales/:id` | Delete sale | ✅ Admin |
| POST | `/api/admin/sales/upload` | Upload bilty image | ✅ Admin |

---

## Quick Start

### 1. Get Next Invoice Number
```bash
GET /api/admin/sales/next-invoice-number
```

### 2. Create Sale
```bash
POST /api/admin/sales
Content-Type: application/json

{
  "salesDate": "2026-06-11",
  "customer": "CUSTOMER_ID",
  "items": [{
    "product": "PRODUCT_ID",
    "description": "Item Name",
    "pcs": 1,
    "rate": 1000,
    "total": 1000,
    "taxableAmount": 1000,
    "cgstPercent": 2.5,
    "cgstAmount": 25,
    "sgstPercent": 2.5,
    "sgstAmount": 25,
    "netAmount": 1050
  }],
  "taxableAmountTotal": 1000,
  "cgstTotal": 25,
  "sgstTotal": 25,
  "igstTotal": 0,
  "invoiceTotal": 1050
}
```

---

## Key Features

✅ **Auto-generated invoice numbers**  
✅ **Multiple items per sale**  
✅ **CGST/SGST for intrastate**  
✅ **IGST for interstate**  
✅ **Item-level discounts**  
✅ **Extra invoice-level discount**  
✅ **Shipping cost support**  
✅ **Payment tracking (Cash/Bank)**  
✅ **Partial & full payment**  
✅ **Transport & LR details**  
✅ **Bilty image upload**  
✅ **Agent assignment**  
✅ **Due date tracking**  
✅ **Default terms & conditions**  
✅ **Populated references (customer, product, etc.)**

---

## Required Fields

**Sale Level:**
- `customer` - Party/Customer ID
- `items` - Array (at least 1 item)
- `taxableAmountTotal` - Sum of taxable amounts
- `cgstTotal` - Total CGST
- `sgstTotal` - Total SGST  
- `igstTotal` - Total IGST
- `invoiceTotal` - Final total

**Item Level:**
- `product` - Product ID
- `description` - Item description
- `pcs` - Quantity
- `rate` - Price per unit
- `total` - Subtotal
- `taxableAmount` - After discount
- `netAmount` - Final amount with tax

---

## Tax Calculation Formula

### Intrastate (CGST + SGST)
```
Total = Rate × Quantity
Discount = Total × Discount%
Taxable = Total - Discount
CGST = Taxable × CGST%
SGST = Taxable × SGST%
Net Amount = Taxable + CGST + SGST
```

### Interstate (IGST)
```
Total = Rate × Quantity
Discount = Total × Discount%
Taxable = Total - Discount
IGST = Taxable × IGST%
Net Amount = Taxable + IGST
```

---

## Common Scenarios

### Cash Sale (Full Payment)
```json
{
  "customer": "ID",
  "items": [...],
  "invoiceTotal": 1050,
  "amountReceived": 1050,
  "paymentType": "Cash",
  "markAsFullyPaid": true
}
```

### Credit Sale (Pay Later)
```json
{
  "customer": "ID",
  "items": [...],
  "dueDate": "2026-07-11",
  "invoiceTotal": 1050,
  "amountReceived": 0,
  "markAsFullyPaid": false
}
```

### Partial Payment
```json
{
  "customer": "ID",
  "items": [...],
  "invoiceTotal": 10000,
  "amountReceived": 5000,
  "paymentType": "Bank",
  "bank": "BANK_ID",
  "markAsFullyPaid": false
}
```

### With Transport
```json
{
  "customer": "ID",
  "items": [...],
  "transport": "TRANSPORT_ID",
  "transportBilty": true,
  "lrNo": "LR123456",
  "biltyImage": "http://...jpg",
  "biltyDescription": "Handle with care"
}
```

---

## Response Examples

### Create Sale Success (201)
```json
{
  "success": true,
  "message": "Sale created successfully",
  "sale": {
    "_id": "60d5f484f8d2e123456789ad",
    "invoiceNumber": "1",
    "salesDate": "2026-06-11T00:00:00.000Z",
    "customer": "CUSTOMER_ID",
    "items": [...],
    "invoiceTotal": 1050,
    "createdAt": "2026-06-11T10:30:00.000Z"
  }
}
```

### Get All Sales (200)
```json
{
  "success": true,
  "message": "Sales fetched successfully",
  "sales": [
    {
      "_id": "...",
      "invoiceNumber": "5",
      "customer": {
        "_id": "...",
        "generalDetails": {
          "partyName": "ABC Traders"
        }
      },
      "items": [
        {
          "product": {
            "_id": "...",
            "productDetail": {
              "name": "Silk Saree"
            }
          },
          "pcs": 2,
          "netAmount": 6000
        }
      ],
      "invoiceTotal": 6000
    }
  ]
}
```

### Get Single Sale (200)
```json
{
  "success": true,
  "message": "Sale fetched successfully",
  "sale": {
    "_id": "SALE_ID",
    "invoiceNumber": "1",
    "customer": {...populated...},
    "transport": {...populated...},
    "agent": {...populated...},
    "bank": {...populated...},
    "items": [{...populated products...}],
    "invoiceTotal": 1050,
    "amountReceived": 500,
    "markAsFullyPaid": false
  }
}
```

---

## Error Responses

### Validation Error (400)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": ["items is required"]
}
```

### Not Found (404)
```json
{
  "success": false,
  "message": "Sale not found"
}
```

### Server Error (500)
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## Best Practices

1. ✅ Always get next invoice number before creating
2. ✅ Use CGST+SGST for same state, IGST for different state
3. ✅ Calculate discounts before applying tax
4. ✅ Upload bilty image before creating sale with transport
5. ✅ Set markAsFullyPaid when amountReceived = invoiceTotal
6. ✅ Validate customer and product IDs exist
7. ✅ Keep sequential invoice numbers
8. ✅ Round amounts to 2 decimal places

---

## Testing Checklist

- [ ] Get next invoice number
- [ ] Create simple sale (1 item)
- [ ] Create sale with multiple items
- [ ] Create sale with discount
- [ ] Create sale with CGST+SGST
- [ ] Create sale with IGST
- [ ] Create sale with extra discount
- [ ] Create sale with shipping cost
- [ ] Upload bilty image
- [ ] Create sale with transport
- [ ] Create sale with agent
- [ ] Create cash payment sale
- [ ] Create bank payment sale
- [ ] Create partial payment sale
- [ ] Create fully paid sale
- [ ] Get all sales
- [ ] Get single sale
- [ ] Update sale payment
- [ ] Update sale items
- [ ] Delete sale
- [ ] Verify auto-increment invoice number
- [ ] Verify population (customer, product, etc.)

---

## Related Documentation

- **SALES_API_TESTING.md** - Complete testing guide with examples
- **API_STRUCTURE.md** - Overall API structure
- **PRODUCT_API_TESTING.md** - Product API testing
- **CART_WISHLIST_API_TESTING.md** - Cart & wishlist testing

---

## Support

For detailed examples, calculations, and troubleshooting, see **SALES_API_TESTING.md**

**Common Issues:**
- Invoice number duplicate → Use auto-generated or get next number
- Tax calculation error → Verify CGST+SGST OR IGST (not both)
- Population not working → Use GET endpoints (auto-populated)
- Bilty image not uploading → Check file size and format

---

**Server:** `http://localhost:7410`  
**Base Path:** `/api/admin/sales`  
**Auth:** Admin token required  
**Version:** 1.0  
**Status:** ✅ Production Ready
