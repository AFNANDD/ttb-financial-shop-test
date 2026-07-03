using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using App.Api.Entities;
using App.Api.Entities.Config;

namespace App.Api.Controllers;

[ApiController]
[Route("api/product-carts")]
public class ProductCartController(AppDbContext db) : ControllerBase
{
    // GET api/product-carts?userId=1
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] long? userId)
    {
        var query = db.ProductCarts.AsQueryable();

        if (userId.HasValue)
            query = query.Where(x => x.UserId == userId.Value);

        var carts = await query
            .OrderByDescending(x => x.CreatedAt)
            .Select(x => new
            {
                x.Id,
                x.UserId,
                x.Status,
                x.CreatedAt,
                x.UpdatedAt,
            })
            .ToListAsync();

        return Ok(carts);
    }

    // GET api/product-carts/{id}
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(long id)
    {
        var cart = await db.ProductCarts
            .Where(x => x.Id == id)
            .Select(x => new
            {
                x.Id,
                x.UserId,
                x.Status,
                x.CreatedAt,
                x.UpdatedAt,
                Items = x.ProductCartItems.Select(i => new
                {
                    i.Id,
                    i.ProductCode,
                    i.Quantity,
                    i.UnitPrice,
                    ProductDetail = i.ProductDetail == null ? null : new
                    {
                        i.ProductDetail.Id,
                        i.ProductDetail.Name,
                        i.ProductDetail.Price,
                    },
                }),
            })
            .FirstOrDefaultAsync();

        if (cart is null)
            return NotFound(new { message = $"Cart {id} not found." });

        return Ok(cart);
    }

    // POST api/product-carts
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateProductCartRequest req)
    {
        var cart = new ProductCart
        {
            UserId = req.UserId,
            Status = "Active",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        db.ProductCarts.Add(cart);
        await db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = cart.Id }, new
        {
            cart.Id,
            cart.UserId,
            cart.Status,
            cart.CreatedAt,
            cart.UpdatedAt,
        });
    }

    // PUT api/product-carts/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(long id, [FromBody] UpdateProductCartRequest req)
    {
        var cart = await db.ProductCarts.FindAsync(id);
        if (cart is null)
            return NotFound(new { message = $"Cart {id} not found." });

        cart.Status = req.Status;
        cart.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync();

        return Ok(new
        {
            cart.Id,
            cart.UserId,
            cart.Status,
            cart.CreatedAt,
            cart.UpdatedAt,
        });
    }

    // DELETE api/product-carts/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(long id)
    {
        var cart = await db.ProductCarts.FindAsync(id);
        if (cart is null)
            return NotFound(new { message = $"Cart {id} not found." });

        db.ProductCarts.Remove(cart);
        await db.SaveChangesAsync();

        return NoContent();
    }
}

public record CreateProductCartRequest(long UserId);
public record UpdateProductCartRequest(string Status);
