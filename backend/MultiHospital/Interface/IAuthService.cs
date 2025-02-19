using MultiHospital.Models;

namespace MultiHospital.Interface
{
    public interface IAuthService
    {
        // Get all roles from the system
        Task<List<RoleModel>> GetRolesAsync();

        // Get the roles assigned to a specific user by their email
        Task<List<string>> GetUserRolesAsync(string email);

        // Assign roles to a user based on their email
        Task<bool> AddUserRoleAsync(string email, string[] roles);

        // Add new roles to the system
        Task<List<string>> AddRoleAsync(string[] roles);

        // Generate a JWT token for a user based on their email
        Task<string> GenerateJwtTokenAsync(string email);

        Task<bool> EnsureRoleExistsAsync(string roleName);
    }
}
