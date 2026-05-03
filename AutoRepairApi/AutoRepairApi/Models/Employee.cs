namespace AutoRepairApi.Models;

public class Employee
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Position { get; set; }
    public string? Phone { get; set; }
    public DateOnly HireDate { get; set; } = DateOnly.FromDateTime(DateTime.UtcNow);

    public ICollection<Order> Orders { get; set; } = new List<Order>();
}