namespace AutoRepairApi.Models;

public class Vehicle
{
    public int Id { get; set; }
    public int ClientId { get; set; }
    public string Brand { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    public int? Year { get; set; }
    public string? LicensePlate { get; set; }
    public string? Vin { get; set; }

    public Client? Client { get; set; }
    public ICollection<Order> Orders { get; set; } = new List<Order>();
}