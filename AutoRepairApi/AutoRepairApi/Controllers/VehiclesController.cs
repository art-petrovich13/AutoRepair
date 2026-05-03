using AutoRepairApi.Data;
using AutoRepairApi.DTOs;
using AutoRepairApi.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AutoRepairApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class VehiclesController : ControllerBase
{
    private readonly AppDbContext _db;
    public VehiclesController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var vehicles = await _db.Vehicles
            .Include(v => v.Client)
            .Select(v => new VehicleDto(v.Id, v.ClientId, v.Client!.Name, v.Brand, v.Model,
                v.Year, v.LicensePlate, v.Vin))
            .ToListAsync();
        return Ok(vehicles);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var v = await _db.Vehicles.Include(v => v.Client).FirstOrDefaultAsync(v => v.Id == id);
        if (v is null) return NotFound();
        return Ok(new VehicleDto(v.Id, v.ClientId, v.Client!.Name, v.Brand, v.Model,
            v.Year, v.LicensePlate, v.Vin));
    }

    [HttpGet("by-client/{clientId}")]
    public async Task<IActionResult> GetByClient(int clientId)
    {
        var vehicles = await _db.Vehicles
            .Include(v => v.Client)
            .Where(v => v.ClientId == clientId)
            .Select(v => new VehicleDto(v.Id, v.ClientId, v.Client!.Name, v.Brand, v.Model,
                v.Year, v.LicensePlate, v.Vin))
            .ToListAsync();
        return Ok(vehicles);
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateVehicleDto dto)
    {
        var vehicle = new Vehicle
        {
            ClientId = dto.ClientId,
            Brand = dto.Brand,
            Model = dto.Model,
            Year = dto.Year,
            LicensePlate = dto.LicensePlate,
            Vin = dto.Vin
        };
        _db.Vehicles.Add(vehicle);
        await _db.SaveChangesAsync();

        var client = await _db.Clients.FindAsync(dto.ClientId);
        return CreatedAtAction(nameof(GetById), new { id = vehicle.Id },
            new VehicleDto(vehicle.Id, vehicle.ClientId, client?.Name ?? "", vehicle.Brand,
                vehicle.Model, vehicle.Year, vehicle.LicensePlate, vehicle.Vin));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, UpdateVehicleDto dto)
    {
        var vehicle = await _db.Vehicles.FindAsync(id);
        if (vehicle is null) return NotFound();
        vehicle.ClientId = dto.ClientId;
        vehicle.Brand = dto.Brand;
        vehicle.Model = dto.Model;
        vehicle.Year = dto.Year;
        vehicle.LicensePlate = dto.LicensePlate;
        vehicle.Vin = dto.Vin;
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var vehicle = await _db.Vehicles.FindAsync(id);
        if (vehicle is null) return NotFound();
        _db.Vehicles.Remove(vehicle);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}