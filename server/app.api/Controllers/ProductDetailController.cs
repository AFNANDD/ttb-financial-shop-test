using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using App.Api.Entities;
using App.Api.Entities.Config;

namespace App.Api.Controllers;

[ApiController]
[Route("api/products")]
public class ProductDetailController(AppDbContext db) : ControllerBase
{
    // GET api/products
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var products = await db.ProductDetails
            .Include(x => x.ProductStock)
            .OrderBy(x => x.Code)
            .Select(x => new
            {
                x.Id,
                x.Code,
                x.Name,
                x.Price,
                x.CreatedAt,
                Stock = x.ProductStock == null ? null : new
                {
                    x.ProductStock.Id,
                    x.ProductStock.Quantity,
                    x.ProductStock.UpdatedAt,
                },
            })
            .ToListAsync();

        return Ok(products);
    }

    // GET api/products/{id}
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(long id)
    {
        var product = await db.ProductDetails
            .Include(x => x.ProductStock)
            .Where(x => x.Id == id)
            .Select(x => new
            {
                x.Id,
                x.Code,
                x.Name,
                x.Price,
                x.CreatedAt,
                Stock = x.ProductStock == null ? null : new
                {
                    x.ProductStock.Id,
                    x.ProductStock.Quantity,
                    x.ProductStock.UpdatedAt,
                },
            })
            .FirstOrDefaultAsync();

        if (product is null)
            return NotFound(new { message = $"Product {id} not found." });

        return Ok(product);
    }

    // POST api/products
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateProductRequest req)
    {
        var exists = await db.ProductDetails.AnyAsync(x => x.Code == req.Code);
        if (exists)
            return Conflict(new { message = $"Code '{req.Code}' already exists." });

        var product = new ProductDetail
        {
            Code = req.Code,
            Name = req.Name,
            Price = req.Price,
            CreatedAt = DateTime.UtcNow,
        };

        db.ProductDetails.Add(product);
        await db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = product.Id }, new
        {
            product.Id,
            product.Code,
            product.Name,
            product.Price,
            product.CreatedAt,
        });
    }

    // PUT api/products/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(long id, [FromBody] UpdateProductRequest req)
    {
        var product = await db.ProductDetails.FindAsync(id);
        if (product is null)
            return NotFound(new { message = $"Product {id} not found." });

        var codeConflict = await db.ProductDetails
            .AnyAsync(x => x.Code == req.Code && x.Id != id);
        if (codeConflict)
            return Conflict(new { message = $"Code '{req.Code}' already used by another product." });

        product.Code = req.Code;
        product.Name = req.Name;
        product.Price = req.Price;

        await db.SaveChangesAsync();

        return Ok(new
        {
            product.Id,
            product.Code,
            product.Name,
            product.Price,
            product.CreatedAt,
        });
    }

    // DELETE api/products/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(long id)
    {
        var product = await db.ProductDetails.FindAsync(id);
        if (product is null)
            return NotFound(new { message = $"Product {id} not found." });

        db.ProductDetails.Remove(product);
        await db.SaveChangesAsync();

        return NoContent();
    }
}

public record CreateProductRequest(string Code, string Name, decimal Price);
public record UpdateProductRequest(string Code, string Name, decimal Price);
