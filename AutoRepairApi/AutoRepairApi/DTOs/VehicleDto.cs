namespace AutoRepairApi.DTOs;

public record VehicleDto(int Id, int ClientId, string ClientName, string Brand, string Model,
    int? Year, string? LicensePlate, string? Vin);

public record CreateVehicleDto(int ClientId, string Brand, string Model, int? Year,
    string? LicensePlate, string? Vin);

public record UpdateVehicleDto(int ClientId, string Brand, string Model, int? Year,
    string? LicensePlate, string? Vin);