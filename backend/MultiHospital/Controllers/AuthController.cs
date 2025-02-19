using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using System.Threading.Tasks;
using MultiHospital.Interface;
using MultiHospital.Models;
using Microsoft.AspNetCore.Authorization;
using System.Net;

namespace MultiHospital.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly UserManager<IdentityUser> _userManager;
        private readonly SignInManager<IdentityUser> _signInManager;

        public AuthController(IAuthService authService, UserManager<IdentityUser> userManager, SignInManager<IdentityUser> signInManager)
        {
            _authService = authService;
            _userManager = userManager;
            _signInManager = signInManager;
        }

        // Login Endpoint
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginModel model)
        {
            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user == null)
            {
                return Unauthorized(new { message = "Invalid credentials" });
            }

            var result = await _signInManager.PasswordSignInAsync(user, model.Password, false, false);
            if (!result.Succeeded)
            {
                return Unauthorized(new { message = "Invalid credentials" });
            }

            // Generate JWT token
            var token = await _authService.GenerateJwtTokenAsync(model.Email);
            return Ok(new { Token = token });
        }

        // Get Roles (admin-only endpoint)
        //[Authorize(Roles = "admin")]
        [HttpGet("GetRoles")]
        public async Task<IActionResult> GetRoles()
        {
            var roles = await _authService.GetRolesAsync();
            return Ok(roles);
        }

        // Get Roles for a User by Email
        [HttpGet("GetUserRoles")]
        public async Task<IActionResult> GetUserRoles(string email)
        {
            var userRoles = await _authService.GetUserRolesAsync(email);
            if (userRoles == null || userRoles.Count == 0)
            {
                return NotFound(new { message = "User roles not found." });
            }
            return Ok(userRoles);
        }

        // Add Roles to System (admin-only endpoint)
        //[Authorize(Roles = "admin")]
        [HttpPost("AddRoles")]
        public async Task<IActionResult> AddRoles([FromBody] string[] roles)
        {
            if (roles == null || roles.Length == 0)
            {
                return BadRequest(new { message = "No roles provided." });
            }

            var roleList = await _authService.AddRoleAsync(roles);
            return Ok(roleList);
        }

        // Add Roles to User
        [HttpPost("AddUserRoles")]
        public async Task<IActionResult> AddUserRoles([FromBody] AddUserRolesModel userRoleModel)
        {
            if (userRoleModel == null || string.IsNullOrEmpty(userRoleModel.Email) || userRoleModel.Roles == null || userRoleModel.Roles.Length == 0)
            {
                return BadRequest(new { message = "Invalid input data." });
            }

            var user = await _userManager.FindByEmailAsync(userRoleModel.Email);
            if (user == null)
            {
                return NotFound(new { message = "User not found." });
            }

            var result = await _authService.AddUserRoleAsync(userRoleModel.Email, userRoleModel.Roles);
            if (!result)
            {
                return BadRequest(new { message = "Failed to add roles to the user." });
            }

            return StatusCode((int)HttpStatusCode.Created, new { message = "Roles added successfully." });
        }
    }
}
