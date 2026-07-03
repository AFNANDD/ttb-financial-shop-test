namespace App.Api.Entities.Config;

public class ProductOrder
{
    public long Id { get; set; }

    public long UserId { get; set; }

    public required string OrderNo { get; set; }

    public decimal TotalAmount { get; set; }

    public required string Status { get; set; }

    public DateTime CreatedAt { get; set; }

    public ICollection<ProductOrderItem> ProductOrderItems { get; set; } = new List<ProductOrderItem>();
}