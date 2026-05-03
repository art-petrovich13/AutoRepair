namespace AutoRepairApi.Models;

public class Service
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public decimal? DurationHours { get; set; }

    public ICollection<OrderService> OrderServices { get; set; } = new List<OrderService>();
}