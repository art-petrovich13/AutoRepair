using AutoRepairApi.Data;
using AutoRepairApi.DTOs;
using AutoRepairApi.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AutoRepairApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EmployeesController : ControllerBase
{
    private readonly AppDbContext _db;
    public EmployeesController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var list = await _db.Employees
            .Select(e => new EmployeeDto(e.Id, e.Name, e.Position, e.Phone, e.HireDate))
            .ToListAsync();
        return Ok(list);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var e = await _db.Employees.FindAsync(id);
        if (e is null) return NotFound();
        return Ok(new EmployeeDto(e.Id, e.Name, e.Position, e.Phone, e.HireDate));
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateEmployeeDto dto)
    {
        var employee = new Employee
        {
            Name = dto.Name,
            Position = dto.Position,
            Phone = dto.Phone,
            HireDate = dto.HireDate ?? DateOnly.FromDateTime(DateTime.UtcNow)
        };
        _db.Employees.Add(employee);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = employee.Id },
            new EmployeeDto(employee.Id, employee.Name, employee.Position, employee.Phone, employee.HireDate));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, UpdateEmployeeDto dto)
    {
        var employee = await _db.Employees.FindAsync(id);
        if (employee is null) return NotFound();
        employee.Name = dto.Name;
        employee.Position = dto.Position;
        employee.Phone = dto.Phone;
        if (dto.HireDate.HasValue) employee.HireDate = dto.HireDate.Value;
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var employee = await _db.Employees.FindAsync(id);
        if (employee is null) return NotFound();
        _db.Employees.Remove(employee);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}