using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using App.Api.Entities;
using App.Api.Entities.Config;

namespace App.Api.Controllers;

[ApiController]
[Route("api/product-orders")]
public class ProductOrderController(AppDbContext db) : ControllerBase
{
    // GET api/product-orders
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] long? userId)
    {
        var query = db.ProductOrders.AsQueryable();

        if (userId.HasValue)
            query = query.Where(x => x.UserId == userId.Value);

        var orders = await query
            .OrderByDescending(x => x.CreatedAt)
            .Select(x => new
            {
                x.Id,
                x.UserId,
                x.OrderNo,
                x.TotalAmount,
                x.Status,
                x.CreatedAt,
            })
            .ToListAsync();

        return Ok(orders);
    }

    // GET api/product-orders/{id}
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(long id)
    {
        var order = await db.ProductOrders
            .Where(x => x.Id == id)
            .Select(x => new
            {
                x.Id,
                x.UserId,
                x.OrderNo,
                x.TotalAmount,
                x.Status,
                x.CreatedAt,
                Items = x.ProductOrderItems.Select(i => new
                {
                    i.Id,
                    i.ProductCode,
                    i.Quantity,
                    i.UnitPrice,
                    i.TotalPrice,
                    ProductDetail = i.ProductDetail == null ? null : new
                    {
                        i.ProductDetail.Id,
                        i.ProductDetail.Name,
                        i.ProductDetail.Price,
                    },
                }),
            })
            .FirstOrDefaultAsync();

        if (order is null)
            return NotFound(new { message = $"Order {id} not found." });

        return Ok(order);
    }

    // POST api/product-orders
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateProductOrderRequest req)
    {
        var orderNoExists = await db.ProductOrders.AnyAsync(x => x.OrderNo == req.OrderNo);
        if (orderNoExists)
            return Conflict(new { message = $"OrderNo '{req.OrderNo}' already exists." });

        var order = new ProductOrder
        {
            UserId = req.UserId,
            OrderNo = req.OrderNo,
            TotalAmount = req.TotalAmount,
            Status = "Pending",
            CreatedAt = DateTime.UtcNow,
        };

        db.ProductOrders.Add(order);
        await db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = order.Id }, new
        {
            order.Id,
            order.UserId,
            order.OrderNo,
            order.TotalAmount,
            order.Status,
            order.CreatedAt,
        });
    }

    // PUT api/product-orders/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(long id, [FromBody] UpdateProductOrderRequest req)
    {
        var order = await db.ProductOrders.FindAsync(id);
        if (order is null)
            return NotFound(new { message = $"Order {id} not found." });

        order.Status = req.Status;
        order.TotalAmount = req.TotalAmount;

        await db.SaveChangesAsync();

        return Ok(new
        {
            order.Id,
            order.UserId,
            order.OrderNo,
            order.TotalAmount,
            order.Status,
            order.CreatedAt,
        });
    }

    // DELETE api/product-orders/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(long id)
    {
        var order = await db.ProductOrders.FindAsync(id);
        if (order is null)
            return NotFound(new { message = $"Order {id} not found." });

        db.ProductOrders.Remove(order);
        await db.SaveChangesAsync();

        return NoContent();
    }
}

public record CreateProductOrderRequest(long UserId, string OrderNo, decimal TotalAmount);
public record UpdateProductOrderRequest(string Status, decimal TotalAmount);
