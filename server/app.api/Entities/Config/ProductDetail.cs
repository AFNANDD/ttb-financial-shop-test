namespace App.Api.Entities.Config;

public class ProductDetail
{
    public long Id { get; set; }

    public required string Code { get; set; }

    public required string Name { get; set; }

    public decimal Price { get; set; }

    public DateTime CreatedAt { get; set; }

    public ProductStock? ProductStock { get; set; }

    public ICollection<ProductCartItem> ProductCartItems { get; set; } = new List<ProductCartItem>();

    public ICollection<ProductOrderItem> ProductOrderItems { get; set; } = new List<ProductOrderItem>();
}