using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using App.Api.Entities;
using App.Api.Entities.Config;

namespace App.Api.Controllers;

[ApiController]
[Route("api/product-cart-items")]
public class ProductCartItemController(AppDbContext db) : ControllerBase
{
    // GET api/product-cart-items?cartId=1
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] long? cartId)
    {
        var query = db.ProductCartItems.AsQueryable();

        if (cartId.HasValue)
            query = query.Where(x => x.CartId == cartId.Value);

        var items = await query
            .OrderBy(x => x.CartId)
            .Select(x => new
            {
                x.Id,
                x.CartId,
                x.ProductCode,
                x.Quantity,
                x.UnitPrice,
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

    // GET api/product-cart-items/{id}
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(long id)
    {
        var item = await db.ProductCartItems
            .Where(x => x.Id == id)
            .Select(x => new
            {
                x.Id,
                x.CartId,
                x.ProductCode,
                x.Quantity,
                x.UnitPrice,
                ProductDetail = x.ProductDetail == null ? null : new
                {
                    x.ProductDetail.Id,
                    x.ProductDetail.Name,
                    x.ProductDetail.Price,
                },
            })
            .FirstOrDefaultAsync();

        if (item is null)
            return NotFound(new { message = $"CartItem {id} not found." });

        return Ok(item);
    }

    // POST api/product-cart-items
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateProductCartItemRequest req)
    {
        var cartExists = await db.ProductCarts.AnyAsync(x => x.Id == req.CartId);
        if (!cartExists)
            return BadRequest(new { message = $"Cart {req.CartId} does not exist." });

        var product = await db.ProductDetails
            .Where(x => x.Code == req.ProductCode)
            .Select(x => new { x.Code, x.Price })
            .FirstOrDefaultAsync();
        if (product is null)
            return BadRequest(new { message = $"Product code '{req.ProductCode}' does not exist." });

        // ตรวจ stock ก่อนเพิ่มลงตะกร้า
        var stock = await db.ProductStocks.FirstOrDefaultAsync(x => x.ProductCode == req.ProductCode);
        if (stock is null || stock.Quantity < req.Quantity)
            return BadRequest(new { message = $"Insufficient stock for '{req.ProductCode}'. Available: {stock?.Quantity ?? 0}" });

        var item = new ProductCartItem
        {
            CartId = req.CartId,
            ProductCode = req.ProductCode,
            Quantity = req.Quantity,
            UnitPrice = product.Price,
        };

        db.ProductCartItems.Add(item);
        await db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = item.Id }, new
        {
            item.Id,
            item.CartId,
            item.ProductCode,
            item.Quantity,
            item.UnitPrice,
        });
    }

    // PUT api/product-cart-items/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(long id, [FromBody] UpdateProductCartItemRequest req)
    {
        var item = await db.ProductCartItems.FindAsync(id);
        if (item is null)
            return NotFound(new { message = $"CartItem {id} not found." });

        // ตรวจ stock เฉพาะเมื่อเพิ่มจำนวน
        if (req.Quantity > item.Quantity)
        {
            var additionalQty = req.Quantity - item.Quantity;
            var stock = await db.ProductStocks.FirstOrDefaultAsync(x => x.ProductCode == item.ProductCode);
            if (stock is null || stock.Quantity < additionalQty)
                return BadRequest(new { message = $"Insufficient stock for '{item.ProductCode}'. Available: {stock?.Quantity ?? 0}" });
        }

        item.Quantity = req.Quantity;
        item.UnitPrice = req.UnitPrice;

        await db.SaveChangesAsync();

        return Ok(new
        {
            item.Id,
            item.CartId,
            item.ProductCode,
            item.Quantity,
            item.UnitPrice,
        });
    }

    // DELETE api/product-cart-items/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(long id)
    {
        var item = await db.ProductCartItems.FindAsync(id);
        if (item is null)
            return NotFound(new { message = $"CartItem {id} not found." });

        db.ProductCartItems.Remove(item);
        await db.SaveChangesAsync();

        return NoContent();
    }
}

public record CreateProductCartItemRequest(long CartId, string ProductCode, int Quantity);
public record UpdateProductCartItemRequest(int Quantity, decimal UnitPrice);
