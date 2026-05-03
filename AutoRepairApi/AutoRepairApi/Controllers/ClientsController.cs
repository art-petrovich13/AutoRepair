using AutoRepairApi.Data;
using AutoRepairApi.DTOs;
using AutoRepairApi.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AutoRepairApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ClientsController : ControllerBase
{
    private readonly AppDbContext _db;
    public ClientsController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var clients = await _db.Clients
            .Include(c => c.Vehicles)
            .Select(c => new ClientDto(c.Id, c.Name, c.Phone, c.Email, c.CreatedAt, c.Vehicles.Count))
            .ToListAsync();
        return Ok(clients);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var client = await _db.Clients
            .Include(c => c.Vehicles)
            .FirstOrDefaultAsync(c => c.Id == id);
        if (client is null) return NotFound();
        return Ok(new ClientDto(client.Id, client.Name, client.Phone, client.Email,
            client.CreatedAt, client.Vehicles.Count));
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateClientDto dto)
    {
        var client = new Client { Name = dto.Name, Phone = dto.Phone, Email = dto.Email };
        _db.Clients.Add(client);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = client.Id },
            new ClientDto(client.Id, client.Name, client.Phone, client.Email, client.CreatedAt, 0));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, UpdateClientDto dto)
    {
        var client = await _db.Clients.FindAsync(id);
        if (client is null) return NotFound();
        client.Name = dto.Name;
        client.Phone = dto.Phone;
        client.Email = dto.Email;
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var client = await _db.Clients.FindAsync(id);
        if (client is null) return NotFound();
        _db.Clients.Remove(client);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}