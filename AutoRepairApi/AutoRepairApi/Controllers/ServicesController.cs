using AutoRepairApi.Data;
using AutoRepairApi.DTOs;
using AutoRepairApi.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AutoRepairApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ServicesController : ControllerBase
{
    private readonly AppDbContext _db;
    public ServicesController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var list = await _db.Services
            .Select(s => new ServiceDto(s.Id, s.Name, s.Description, s.Price, s.DurationHours))
            .ToListAsync();
        return Ok(list);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var s = await _db.Services.FindAsync(id);
        if (s is null) return NotFound();
        return Ok(new ServiceDto(s.Id, s.Name, s.Description, s.Price, s.DurationHours));
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateServiceDto dto)
    {
        var service = new Service
        {
            Name = dto.Name,
            Description = dto.Description,
            Price = dto.Price,
            DurationHours = dto.DurationHours
        };
        _db.Services.Add(service);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = service.Id },
            new ServiceDto(service.Id, service.Name, service.Description, service.Price, service.DurationHours));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, UpdateServiceDto dto)
    {
        var service = await _db.Services.FindAsync(id);
        if (service is null) return NotFound();
        service.Name = dto.Name;
        service.Description = dto.Description;
        service.Price = dto.Price;
        service.DurationHours = dto.DurationHours;
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var service = await _db.Services.FindAsync(id);
        if (service is null) return NotFound();
        _db.Services.Remove(service);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}