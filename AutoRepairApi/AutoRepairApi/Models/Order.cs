namespace AutoRepairApi.Models;

public class Order
{
    public int Id { get; set; }
    public int VehicleId { get; set; }
    public int EmployeeId { get; set; }
    public string Status { get; set; } = "Pending";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? CompletedAt { get; set; }
    public decimal TotalAmount { get; set; }
    public string? Notes { get; set; }

    public Vehicle? Vehicle { get; set; }
    public Employee? Employee { get; set; }
    public ICollection<OrderService> OrderServices { get; set; } = new List<OrderService>();
    public ICollection<SparePart> SpareParts { get; set; } = new List<SparePart>();
}