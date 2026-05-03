namespace AutoRepairApi.Models;

public class SparePart
{
    public int Id { get; set; }
    public int OrderId { get; set; }
    public string Name { get; set; } = string.Empty;
    public int Quantity { get; set; } = 1;
    public decimal UnitPrice { get; set; }

    public Order? Order { get; set; }
}