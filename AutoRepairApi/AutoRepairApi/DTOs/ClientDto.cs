namespace AutoRepairApi.DTOs;

public record ClientDto(int Id, string Name, string? Phone, string? Email, DateTime CreatedAt, int VehicleCount);

public record CreateClientDto(string Name, string? Phone, string? Email);

public record UpdateClientDto(string Name, string? Phone, string? Email);