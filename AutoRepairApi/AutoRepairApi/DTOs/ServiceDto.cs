namespace AutoRepairApi.DTOs;

public record ServiceDto(int Id, string Name, string? Description, decimal Price, decimal? DurationHours);

public record CreateServiceDto(string Name, string? Description, decimal Price, decimal? DurationHours);

public record UpdateServiceDto(string Name, string? Description, decimal Price, decimal? DurationHours);