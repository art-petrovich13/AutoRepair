using AutoRepairApi.Data;
using AutoRepairApi.DTOs;
using AutoRepairApi.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AutoRepairApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrdersController : ControllerBase
{
    private readonly AppDbContext _db;
    public OrdersController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var orders = await _db.Orders
            .Include(o => o.Vehicle).ThenInclude(v => v!.Client)
            .Include(o => o.Employee)
            .Include(o => o.OrderServices).ThenInclude(os => os.Service)
            .Include(o => o.SpareParts)
            .OrderByDescending(o => o.CreatedAt)
            .Select(o => MapToDto(o))
            .ToListAsync();
        return Ok(orders);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var order = await _db.Orders
            .Include(o => o.Vehicle).ThenInclude(v => v!.Client)
            .Include(o => o.Employee)
            .Include(o => o.OrderServices).ThenInclude(os => os.Service)
            .Include(o => o.SpareParts)
            .FirstOrDefaultAsync(o => o.Id == id);
        if (order is null) return NotFound();
        return Ok(MapToDto(order));
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateOrderDto dto)
    {
        var serviceItems = dto.Services.Select(s => new OrderService
        {
            ServiceId = s.ServiceId,
            Quantity = s.Quantity,
            Price = s.Price
        }).ToList();

        var parts = dto.Parts.Select(p => new SparePart
        {
            Name = p.Name,
            Quantity = p.Quantity,
            UnitPrice = p.UnitPrice
        }).ToList();

        var total = serviceItems.Sum(s => s.Price * s.Quantity)
                  + parts.Sum(p => p.UnitPrice * p.Quantity);

        var order = new Order
        {
            VehicleId = dto.VehicleId,
            EmployeeId = dto.EmployeeId,
            Notes = dto.Notes,
            TotalAmount = total,
            OrderServices = serviceItems,
            SpareParts = parts
        };

        _db.Orders.Add(order);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = order.Id }, new { id = order.Id });
    }

    [HttpPatch("{id}/status")]
    public async Task<IActionResult> UpdateStatus(int id, UpdateOrderStatusDto dto)
    {
        var order = await _db.Orders.FindAsync(id);
        if (order is null) return NotFound();

        order.Status = dto.Status;
        if (dto.Status == "Completed") order.CompletedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var order = await _db.Orders.FindAsync(id);
        if (order is null) return NotFound();
        _db.Orders.Remove(order);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    private static OrderDto MapToDto(Order o) => new(
        o.Id,
        o.VehicleId,
        $"{o.Vehicle?.Brand} {o.Vehicle?.Model} ({o.Vehicle?.LicensePlate})",
        o.Vehicle?.Client?.Name ?? "",
        o.EmployeeId,
        o.Employee?.Name ?? "",
        o.Status,
        o.CreatedAt,
        o.CompletedAt,
        o.TotalAmount,
        o.Notes,
        o.OrderServices.Select(os => new OrderServiceItemDto(
            os.Id, os.ServiceId, os.Service?.Name ?? "", os.Quantity, os.Price)).ToList(),
        o.SpareParts.Select(sp => new SparePartDto(
            sp.Id, sp.Name, sp.Quantity, sp.UnitPrice)).ToList()
    );
}