namespace AutoRepairApi.DTOs;

public record OrderServiceItemDto(int Id, int ServiceId, string ServiceName, int Quantity, decimal Price);

public record SparePartDto(int Id, string Name, int Quantity, decimal UnitPrice);

public record OrderDto(
    int Id,
    int VehicleId,
    string VehicleInfo,
    string ClientName,
    int EmployeeId,
    string EmployeeName,
    string Status,
    DateTime CreatedAt,
    DateTime? CompletedAt,
    decimal TotalAmount,
    string? Notes,
    List<OrderServiceItemDto> OrderServices,
    List<SparePartDto> SpareParts
);

public record CreateOrderServiceDto(int ServiceId, int Quantity, decimal Price);

public record CreateSparePartDto(string Name, int Quantity, decimal UnitPrice);

public record CreateOrderDto(
    int VehicleId,
    int EmployeeId,
    string? Notes,
    List<CreateOrderServiceDto> Services,
    List<CreateSparePartDto> Parts
);

public record UpdateOrderStatusDto(string Status);