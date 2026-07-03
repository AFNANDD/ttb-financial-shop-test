namespace App.Api.Entities.Config;

public class ProductCart
{
    public long Id { get; set; }

    public long UserId { get; set; }

    public required string Status { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public ICollection<ProductCartItem> ProductCartItems { get; set; } = new List<ProductCartItem>();
}