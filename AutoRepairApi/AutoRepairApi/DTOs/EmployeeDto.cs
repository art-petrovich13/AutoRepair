namespace AutoRepairApi.DTOs;

public record EmployeeDto(int Id, string Name, string? Position, string? Phone, DateOnly HireDate);

public record CreateEmployeeDto(string Name, string? Position, string? Phone, DateOnly? HireDate);

public record UpdateEmployeeDto(string Name, string? Position, string? Phone, DateOnly? HireDate);