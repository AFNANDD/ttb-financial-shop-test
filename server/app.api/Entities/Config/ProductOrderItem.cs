namespace App.Api.Entities.Config;

public class ProductOrderItem
{
    public long Id { get; set; }

    public long OrderId { get; set; }

    public required string ProductCode { get; set; }

    public int Quantity { get; set; }

    public decimal UnitPrice { get; set; }

    public decimal TotalPrice { get; set; }

    public ProductOrder? ProductOrder { get; set; }

    public ProductDetail? ProductDetail { get; set; }
}