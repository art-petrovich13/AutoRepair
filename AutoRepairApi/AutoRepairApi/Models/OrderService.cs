namespace AutoRepairApi.Models;

public class OrderService
{
    public int Id { get; set; }
    public int OrderId { get; set; }
    public int ServiceId { get; set; }
    public int Quantity { get; set; } = 1;
    public decimal Price { get; set; }

    public Order? Order { get; set; }
    public Service? Service { get; set; }
}