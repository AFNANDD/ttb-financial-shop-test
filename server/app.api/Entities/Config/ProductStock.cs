namespace App.Api.Entities.Config;

public class ProductStock
{
    public long Id { get; set; }

    public required string ProductCode { get; set; }

    public int Quantity { get; set; }

    public DateTime UpdatedAt { get; set; }

    public ProductDetail? ProductDetail { get; set; }
}