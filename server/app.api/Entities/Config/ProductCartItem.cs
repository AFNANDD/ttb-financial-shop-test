namespace App.Api.Entities.Config;

public class ProductCartItem
{
    public long Id { get; set; }

    public long CartId { get; set; }

    public required string ProductCode { get; set; }

    public int Quantity { get; set; }

    public decimal UnitPrice { get; set; }

    public ProductCart? ProductCart { get; set; }

    public ProductDetail? ProductDetail { get; set; }
}