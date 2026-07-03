using Microsoft.EntityFrameworkCore;
using App.Api.Entities.Config;

namespace App.Api.Entities; 

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<ProductDetail> ProductDetails => Set<ProductDetail>();

    public DbSet<ProductStock> ProductStocks => Set<ProductStock>();

    public DbSet<ProductCart> ProductCarts => Set<ProductCart>();

    public DbSet<ProductCartItem> ProductCartItems => Set<ProductCartItem>();

    public DbSet<ProductOrder> ProductOrders => Set<ProductOrder>();

    public DbSet<ProductOrderItem> ProductOrderItems => Set<ProductOrderItem>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<ProductDetail>(entity =>
        {
            entity.ToTable("ProductDetail");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Code).HasMaxLength(50).IsRequired();
            entity.Property(x => x.Name).HasMaxLength(200).IsRequired();
            entity.Property(x => x.Price).HasPrecision(18, 2);
            entity.Property(x => x.CreatedAt).IsRequired();
            entity.HasIndex(x => x.Code).IsUnique();
        });

        modelBuilder.Entity<ProductStock>(entity =>
        {
            entity.ToTable("ProductStock");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.ProductCode).HasMaxLength(50).IsRequired();
            entity.Property(x => x.Quantity).IsRequired();
            entity.Property(x => x.UpdatedAt).IsRequired();
            entity.HasIndex(x => x.ProductCode).IsUnique();

            entity
                .HasOne(x => x.ProductDetail)
                .WithOne(x => x.ProductStock)
                .HasPrincipalKey<ProductDetail>(x => x.Code)
                .HasForeignKey<ProductStock>(x => x.ProductCode)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<ProductCart>(entity =>
        {
            entity.ToTable("ProductCart");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.UserId).IsRequired();
            entity.Property(x => x.Status).HasMaxLength(20).IsRequired();
            entity.Property(x => x.CreatedAt).IsRequired();
            entity.Property(x => x.UpdatedAt).IsRequired();
        });

        modelBuilder.Entity<ProductCartItem>(entity =>
        {
            entity.ToTable("ProductCartItem");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.ProductCode).HasMaxLength(50).IsRequired();
            entity.Property(x => x.Quantity).IsRequired();
            entity.Property(x => x.UnitPrice).HasPrecision(18, 2);

            entity
                .HasOne(x => x.ProductCart)
                .WithMany(x => x.ProductCartItems)
                .HasForeignKey(x => x.CartId)
                .OnDelete(DeleteBehavior.Cascade);

            entity
                .HasOne(x => x.ProductDetail)
                .WithMany(x => x.ProductCartItems)
                .HasPrincipalKey(x => x.Code)
                .HasForeignKey(x => x.ProductCode)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<ProductOrder>(entity =>
        {
            entity.ToTable("ProductOrder");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.UserId).IsRequired();
            entity.Property(x => x.OrderNo).HasMaxLength(50).IsRequired();
            entity.Property(x => x.TotalAmount).HasPrecision(18, 2);
            entity.Property(x => x.Status).HasMaxLength(20).IsRequired();
            entity.Property(x => x.CreatedAt).IsRequired();
            entity.HasIndex(x => x.OrderNo).IsUnique();
        });

        modelBuilder.Entity<ProductOrderItem>(entity =>
        {
            entity.ToTable("ProductOrderItem");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.ProductCode).HasMaxLength(50).IsRequired();
            entity.Property(x => x.Quantity).IsRequired();
            entity.Property(x => x.UnitPrice).HasPrecision(18, 2);
            entity.Property(x => x.TotalPrice).HasPrecision(18, 2);

            entity
                .HasOne(x => x.ProductOrder)
                .WithMany(x => x.ProductOrderItems)
                .HasForeignKey(x => x.OrderId)
                .OnDelete(DeleteBehavior.Cascade);

            entity
                .HasOne(x => x.ProductDetail)
                .WithMany(x => x.ProductOrderItems)
                .HasPrincipalKey(x => x.Code)
                .HasForeignKey(x => x.ProductCode)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }
}