using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using MultiHospital.Context;
using MultiHospital.Interface;
using MultiHospital.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace MultiHospital.Services
{
    public class AuthService : IAuthService
    {
        private readonly UserManager<IdentityUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly IConfiguration _configuration;
        private readonly JwtSecurityTokenHandler _tokenHandler;
        private readonly IdentityDatabaseContext _context;

        public AuthService(
            UserManager<IdentityUser> userManager,
            RoleManager<IdentityRole> roleManager,
            IConfiguration configuration,
            JwtSecurityTokenHandler tokenHandler,
            IdentityDatabaseContext context)
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _configuration = configuration;
            _tokenHandler = tokenHandler;
            _context = context;
        }

        public async Task<List<string>> AddRoleAsync(string[] roles)
        {
            var rolesList = new List<string>();
            foreach (var role in roles)
            {
                if (!await _roleManager.RoleExistsAsync(role))
                {
                    await _roleManager.CreateAsync(new IdentityRole(role));
                    rolesList.Add(role);
                }
            }
            return rolesList;
        }

        public async Task<bool> AddUserRoleAsync(string email, string[] roles)
        {
            var user = await _userManager.FindByEmailAsync(email);
            var rolesList = new List<string>();

            foreach (var role in roles)
            {
                if (await _roleManager.RoleExistsAsync(role))
                {
                    rolesList.Add(role);
                }

                if (user != null && rolesList.Count == roles.Length)
                {
                    var result = await _userManager.AddToRolesAsync(user, rolesList);
                    return result.Succeeded;
                }
            }
            return false;
        }

        public async Task<List<RoleModel>> GetRolesAsync()
        {
            var roles = _roleManager.Roles.Select(s =>
                new RoleModel
                {
                    Id = Guid.Parse(s.Id),
                    Name = s.Name
                }).ToList();

            return roles;
        }

        public async Task<List<string>> GetUserRolesAsync(string email)
        {
            var user = await _userManager.FindByEmailAsync(email);
            var roles = await _userManager.GetRolesAsync(user);
            return roles.ToList();
        }


        public async Task<string> GenerateJwtTokenAsync(string email)
        {
            var user = await _userManager.FindByEmailAsync(email);
            if (user == null) return null;

            // Get the roles for the user
            var roles = await _userManager.GetRolesAsync(user);

            // Create role claims with "role" as the claim type
            var roleClaims = roles.Select(role => new Claim("role", role)).ToList();

            // Add standard claims to the JWT token
            var claims = new List<Claim>
    {
        new Claim(JwtRegisteredClaimNames.Sub, user.UserName),
        new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
        // Use Unix time (seconds since epoch) for the "iat" claim
        new Claim(JwtRegisteredClaimNames.Iat, ((DateTimeOffset)DateTime.UtcNow).ToUnixTimeSeconds().ToString(), ClaimValueTypes.Integer64),
        new Claim("id", user.Id) // User's unique ID
    };

            // Fetch the user-specific ID (patient, doctor, admin)
            var userSpecificId = await GetUserSpecificIdAsync(user, roles);
            if (userSpecificId != null)
            {
                claims.Add(new Claim("userSpecificId", userSpecificId)); // Add user-specific ID
            }

            // Combine user claims with role claims.
            claims.AddRange(roleClaims);

            var jwtSettings = _configuration.GetSection("JwtSettings");
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["SecretKey"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddMinutes(30),
                Issuer = jwtSettings["Issuer"],
                Audience = jwtSettings["Audience"],
                SigningCredentials = creds
            };

            var token = _tokenHandler.CreateToken(tokenDescriptor);
            return _tokenHandler.WriteToken(token);
        }


        private async Task<string> GetUserSpecificIdAsync(IdentityUser user, IList<string> roles)
        {
            // Check if the user is a Patient
            if (roles.Contains("patient"))
            {
                var patient = await _context.Patients.FirstOrDefaultAsync(p => p.UserId == user.Id);
                return patient?.PatientID.ToString();  // Patient ID
            }
            // Check if the user is a Doctor
            else if (roles.Contains("doctor"))
            {
                var doctor = await _context.Doctors.FirstOrDefaultAsync(d => d.UserId == user.Id);
                return doctor?.DoctorID.ToString();  // Doctor ID
            }
            // Check if the user is an Admin
            else if (roles.Contains("admin"))
            {
                var admin = await _context.Admins.FirstOrDefaultAsync(a => a.UserId == user.Id);
                return admin?.AdminID.ToString();  // Admin ID
            }
            // If the user doesn't match any of the known roles, return null
            return null;
        }


        public async Task<bool> EnsureRoleExistsAsync(string roleName)
        {
            var roleExist = await _roleManager.RoleExistsAsync(roleName);
            if (!roleExist)
            {
                var role = new IdentityRole(roleName);
                var createRoleResult = await _roleManager.CreateAsync(role);
                return createRoleResult.Succeeded;
            }
            return true;
        }
    }
}
