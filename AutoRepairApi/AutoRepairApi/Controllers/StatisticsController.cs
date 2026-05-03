using AutoRepairApi.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AutoRepairApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StatisticsController : ControllerBase
{
    private readonly AppDbContext _db;
    public StatisticsController(AppDbContext db) => _db = db;

    [HttpGet("overview")]
    public async Task<IActionResult> GetOverview()
    {
        var totalOrders = await _db.Orders.CountAsync();
        var activeOrders = await _db.Orders.CountAsync(o => o.Status == "InProgress" || o.Status == "Pending");
        var totalRevenue = await _db.Orders.Where(o => o.Status == "Completed").SumAsync(o => o.TotalAmount);
        var totalClients = await _db.Clients.CountAsync();

        return Ok(new { totalOrders, activeOrders, totalRevenue, totalClients });
    }

    [HttpGet("orders-by-status")]
    public async Task<IActionResult> GetOrdersByStatus()
    {
        var data = await _db.Orders
            .GroupBy(o => o.Status)
            .Select(g => new { status = g.Key, count = g.Count() })
            .ToListAsync();
        return Ok(data);
    }

    [HttpGet("revenue-by-month")]
    public async Task<IActionResult> GetRevenueByMonth()
    {
        var sixMonthsAgo = DateTime.UtcNow.AddMonths(-6);
        var data = await _db.Orders
            .Where(o => o.CreatedAt >= sixMonthsAgo)
            .GroupBy(o => new { o.CreatedAt.Year, o.CreatedAt.Month })
            .Select(g => new
            {
                year = g.Key.Year,
                month = g.Key.Month,
                revenue = g.Sum(o => o.TotalAmount),
                count = g.Count()
            })
            .OrderBy(x => x.year).ThenBy(x => x.month)
            .ToListAsync();
        return Ok(data);
    }

    [HttpGet("top-services")]
    public async Task<IActionResult> GetTopServices()
    {
        var data = await _db.OrderServices
            .Include(os => os.Service)
            .GroupBy(os => os.Service!.Name)
            .Select(g => new { serviceName = g.Key, count = g.Count() })
            .OrderByDescending(x => x.count)
            .Take(5)
            .ToListAsync();
        return Ok(data);
    }

    [HttpGet("orders-by-employee")]
    public async Task<IActionResult> GetOrdersByEmployee()
    {
        var data = await _db.Orders
            .Include(o => o.Employee)
            .GroupBy(o => o.Employee!.Name)
            .Select(g => new { employeeName = g.Key, count = g.Count() })
            .OrderByDescending(x => x.count)
            .ToListAsync();
        return Ok(data);
    }

    [HttpGet("export-orders")]
    public async Task<IActionResult> GetOrdersForExport()
    {
        var orders = await _db.Orders
            .Include(o => o.Vehicle).ThenInclude(v => v!.Client)
            .Include(o => o.Employee)
            .OrderByDescending(o => o.CreatedAt)
            .Select(o => new
            {
                id = o.Id,
                client = o.Vehicle!.Client!.Name,
                vehicle = $"{o.Vehicle.Brand} {o.Vehicle.Model}",
                licensePlate = o.Vehicle.LicensePlate,
                employee = o.Employee!.Name,
                status = o.Status,
                createdAt = o.CreatedAt,
                totalAmount = o.TotalAmount
            })
            .ToListAsync();
        return Ok(orders);
    }
}