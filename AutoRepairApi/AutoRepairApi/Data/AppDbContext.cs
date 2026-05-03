using AutoRepairApi.Models;
using Microsoft.EntityFrameworkCore;

namespace AutoRepairApi.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Client> Clients => Set<Client>();
    public DbSet<Vehicle> Vehicles => Set<Vehicle>();
    public DbSet<Employee> Employees => Set<Employee>();
    public DbSet<Service> Services => Set<Service>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderService> OrderServices => Set<OrderService>();
    public DbSet<SparePart> SpareParts => Set<SparePart>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Client>().ToTable("clients");
        modelBuilder.Entity<Vehicle>().ToTable("vehicles");
        modelBuilder.Entity<Employee>().ToTable("employees");
        modelBuilder.Entity<Service>().ToTable("services");
        modelBuilder.Entity<Order>().ToTable("orders");
        modelBuilder.Entity<OrderService>().ToTable("order_services");
        modelBuilder.Entity<SparePart>().ToTable("spare_parts");

        modelBuilder.Entity<Vehicle>()
            .HasOne(v => v.Client)
            .WithMany(c => c.Vehicles)
            .HasForeignKey(v => v.ClientId);

        modelBuilder.Entity<Order>()
            .HasOne(o => o.Vehicle)
            .WithMany(v => v.Orders)
            .HasForeignKey(o => o.VehicleId);

        modelBuilder.Entity<Order>()
            .HasOne(o => o.Employee)
            .WithMany(e => e.Orders)
            .HasForeignKey(o => o.EmployeeId);

        modelBuilder.Entity<OrderService>()
            .HasOne(os => os.Order)
            .WithMany(o => o.OrderServices)
            .HasForeignKey(os => os.OrderId);

        modelBuilder.Entity<OrderService>()
            .HasOne(os => os.Service)
            .WithMany(s => s.OrderServices)
            .HasForeignKey(os => os.ServiceId);

        modelBuilder.Entity<SparePart>()
            .HasOne(sp => sp.Order)
            .WithMany(o => o.SpareParts)
            .HasForeignKey(sp => sp.OrderId);
    }
}