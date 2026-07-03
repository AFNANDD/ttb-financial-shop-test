using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using App.Api.Entities;
using App.Api.Entities.Config;

namespace App.Api.Controllers;

[ApiController]
[Route("api/product-stocks")]
public class ProductStockController(AppDbContext db) : ControllerBase
{
    // GET api/product-stocks
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var stocks = await db.ProductStocks
            .Include(x => x.ProductDetail)
            .OrderBy(x => x.ProductCode)
            .Select(x => new
            {
                x.Id,
                x.ProductCode,
                x.Quantity,
                x.UpdatedAt,
                ProductDetail = x.ProductDetail == null ? null : new
                {
                    x.ProductDetail.Id,
                    x.ProductDetail.Name,
                    x.ProductDetail.Price,
                },
            })
            .ToListAsync();

        return Ok(stocks);
    }

    // GET api/product-stocks/{id}
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(long id)
    {
        var stock = await db.ProductStocks
            .Include(x => x.ProductDetail)
            .Where(x => x.Id == id)
            .Select(x => new
            {
                x.Id,
                x.ProductCode,
                x.Quantity,
                x.UpdatedAt,
                ProductDetail = x.ProductDetail == null ? null : new
                {
                    x.ProductDetail.Id,
                    x.ProductDetail.Name,
                    x.ProductDetail.Price,
                },
            })
            .FirstOrDefaultAsync();

        if (stock is null)
            return NotFound(new { message = $"ProductStock {id} not found." });

        return Ok(stock);
    }

    // POST api/product-stocks
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateProductStockRequest req)
    {
        var productExists = await db.ProductDetails.AnyAsync(x => x.Code == req.ProductCode);
        if (!productExists)
            return BadRequest(new { message = $"Product code '{req.ProductCode}' does not exist." });

        var alreadyExists = await db.ProductStocks.AnyAsync(x => x.ProductCode == req.ProductCode);
        if (alreadyExists)
            return Conflict(new { message = $"Stock for product code '{req.ProductCode}' already exists." });

        var stock = new ProductStock
        {
            ProductCode = req.ProductCode,
            Quantity = req.Quantity,
            UpdatedAt = DateTime.UtcNow,
        };

        db.ProductStocks.Add(stock);
        await db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = stock.Id }, new
        {
            stock.Id,
            stock.ProductCode,
            stock.Quantity,
            stock.UpdatedAt,
        });
    }

    // PUT api/product-stocks/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(long id, [FromBody] UpdateProductStockRequest req)
    {
        var stock = await db.ProductStocks.FindAsync(id);
        if (stock is null)
            return NotFound(new { message = $"ProductStock {id} not found." });

        stock.Quantity = req.Quantity;
        stock.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync();

        return Ok(new
        {
            stock.Id,
            stock.ProductCode,
            stock.Quantity,
            stock.UpdatedAt,
        });
    }

    // DELETE api/product-stocks/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(long id)
    {
        var stock = await db.ProductStocks.FindAsync(id);
        if (stock is null)
            return NotFound(new { message = $"ProductStock {id} not found." });

        db.ProductStocks.Remove(stock);
        await db.SaveChangesAsync();

        return NoContent();
    }
}

public record CreateProductStockRequest(string ProductCode, int Quantity);
public record UpdateProductStockRequest(int Quantity);
