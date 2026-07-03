using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using App.Api.Entities;
using App.Api.Entities.Config;

namespace App.Api.Controllers;

[ApiController]
[Route("api/product-order-items")]
public class ProductOrderItemController(AppDbContext db) : ControllerBase
{
    // GET api/product-order-items?orderId=1
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] long? orderId)
    {
        var query = db.ProductOrderItems.AsQueryable();

        if (orderId.HasValue)
            query = query.Where(x => x.OrderId == orderId.Value);

        var items = await query
            .OrderBy(x => x.OrderId)
            .Select(x => new
            {
                x.Id,
                x.OrderId,
                x.ProductCode,
                x.Quantity,
                x.UnitPrice,
                x.TotalPrice,
                ProductDetail = x.ProductDetail == null ? null : new
                {
                    x.ProductDetail.Id,
                    x.ProductDetail.Name,
                    x.ProductDetail.Price,
                },
            })
            .ToListAsync();

        return Ok(items);
    }

    // GET api/product-order-items/{id}
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(long id)
    {
        var item = await db.ProductOrderItems
            .Where(x => x.Id == id)
            .Select(x => new
            {
                x.Id,
                x.OrderId,
                x.ProductCode,
                x.Quantity,
                x.UnitPrice,
                x.TotalPrice,
                ProductDetail = x.ProductDetail == null ? null : new
                {
                    x.ProductDetail.Id,
                    x.ProductDetail.Name,
                    x.ProductDetail.Price,
                },
            })
            .FirstOrDefaultAsync();

        if (item is null)
            return NotFound(new { message = $"OrderItem {id} not found." });

        return Ok(item);
    }

    // POST api/product-order-items
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateProductOrderItemRequest req)
    {
        var orderExists = await db.ProductOrders.AnyAsync(x => x.Id == req.OrderId);
        if (!orderExists)
            return BadRequest(new { message = $"Order {req.OrderId} does not exist." });

        var product = await db.ProductDetails
            .Where(x => x.Code == req.ProductCode)
            .Select(x => new { x.Code, x.Price })
            .FirstOrDefaultAsync();
        if (product is null)
            return BadRequest(new { message = $"Product code '{req.ProductCode}' does not exist." });

        var unitPrice = product.Price;
        var totalPrice = unitPrice * req.Quantity;

        // ตรวจและหัก stock ใน transaction เดียวกัน
        var stock = await db.ProductStocks.FirstOrDefaultAsync(x => x.ProductCode == req.ProductCode);
        if (stock is null)
            return BadRequest(new { message = $"No stock record for '{req.ProductCode}'." });
        if (stock.Quantity < req.Quantity)
            return BadRequest(new { message = $"Insufficient stock for '{req.ProductCode}'. Available: {stock.Quantity}" });

        stock.Quantity -= req.Quantity;
        stock.UpdatedAt = DateTime.UtcNow;

        var item = new ProductOrderItem
        {
            OrderId = req.OrderId,
            ProductCode = req.ProductCode,
            Quantity = req.Quantity,
            UnitPrice = unitPrice,
            TotalPrice = totalPrice,
        };

        db.ProductOrderItems.Add(item);
        await db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = item.Id }, new
        {
            item.Id,
            item.OrderId,
            item.ProductCode,
            item.Quantity,
            item.UnitPrice,
            item.TotalPrice,
        });
    }

    // PUT api/product-order-items/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(long id, [FromBody] UpdateProductOrderItemRequest req)
    {
        var item = await db.ProductOrderItems.FindAsync(id);
        if (item is null)
            return NotFound(new { message = $"OrderItem {id} not found." });

        item.Quantity = req.Quantity;
        item.UnitPrice = req.UnitPrice;
        item.TotalPrice = req.UnitPrice * req.Quantity;

        await db.SaveChangesAsync();

        return Ok(new
        {
            item.Id,
            item.OrderId,
            item.ProductCode,
            item.Quantity,
            item.UnitPrice,
            item.TotalPrice,
        });
    }

    // DELETE api/product-order-items/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(long id)
    {
        var item = await db.ProductOrderItems.FindAsync(id);
        if (item is null)
            return NotFound(new { message = $"OrderItem {id} not found." });

        db.ProductOrderItems.Remove(item);
        await db.SaveChangesAsync();

        return NoContent();
    }
}

public record CreateProductOrderItemRequest(long OrderId, string ProductCode, int Quantity);
public record UpdateProductOrderItemRequest(int Quantity, decimal UnitPrice);
