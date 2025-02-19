using Microsoft.AspNetCore.Identity;
using MultiHospital.Context;
using MultiHospital.Models;
using System;
using System.Threading.Tasks;

namespace MultiHospital
{
    public class DataSeeder
    {
        private readonly UserManager<IdentityUser> _userManager;
        private readonly IdentityDatabaseContext _context;

        public DataSeeder(UserManager<IdentityUser> userManager, IdentityDatabaseContext context)
        {
            _userManager = userManager;
            _context = context;
        }

        public async Task SeedAdminUserAsync(IServiceProvider serviceProvider)
        {
            // Ensure the "admin" role exists
            var roleManager = serviceProvider.GetRequiredService<RoleManager<IdentityRole>>();
            if (!await roleManager.RoleExistsAsync("admin"))
            {
                var roleResult = await roleManager.CreateAsync(new IdentityRole("admin"));
                if (!roleResult.Succeeded)
                {
                    throw new Exception("Failed to create admin role.");
                }
            }

            // Define admin details
            var adminEmail = "admin@example.com";
            var adminPassword = "Admin@123"; // Use a strong password!

            // Check if the admin user already exists
            var adminUser = await _userManager.FindByEmailAsync(adminEmail);
            if (adminUser == null)
            {
                adminUser = new IdentityUser
                {
                    UserName = adminEmail,
                    Email = adminEmail
                };

                var createResult = await _userManager.CreateAsync(adminUser, adminPassword);
                if (createResult.Succeeded)
                {
                    // Assign the "admin" role to the user
                    await _userManager.AddToRoleAsync(adminUser, "admin");

                    // Create an Admin entity and save it to the database
                    _context.Admins.Add(new Admin
                    {
                        Email = adminEmail,
                        Name = "Static Admin",
                        UserId = adminUser.Id,
                        CreatedAt = DateTime.UtcNow
                    });
                    await _context.SaveChangesAsync(); // Save the admin to the database
                }
                else
                {
                    throw new Exception("Failed to create admin user: " + string.Join(", ", createResult.Errors));
                }
            }
        }
    }
}
