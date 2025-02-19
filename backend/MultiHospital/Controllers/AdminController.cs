using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MultiHospital.Context;
using MultiHospital.Interface;
using MultiHospital.Models;

[Authorize(Roles ="admin")]
[Route("api/[controller]")]
[ApiController]
public class AdminController : ControllerBase
{
    private readonly IdentityDatabaseContext _context;
    private readonly UserManager<IdentityUser> _userManager;
    private readonly IAuthService _authService;

    public AdminController(IdentityDatabaseContext context, UserManager<IdentityUser> userManager, IAuthService authService)
    {
        _context = context;
        _userManager = userManager;
        _authService = authService;
    }

    // GET: api/admin
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Admin>>> GetAllAdmins()
    {
        var admins = await _context.Admins.ToListAsync();

        if (admins == null || !admins.Any())
        {
            return NotFound("No admins found.");
        }

        return Ok(admins);
    }

    //[HttpPost("register")]
    //public async Task<ActionResult<Admin>> RegisterAdmin([FromBody] Admin admin)
    //{
    //    if (!ModelState.IsValid)
    //    {
    //        return BadRequest(ModelState);
    //    }

    //    var user = new IdentityUser
    //    {
    //        UserName = admin.Email,
    //        Email = admin.Email
    //    };

    //    var result = await _userManager.CreateAsync(user, admin.Password);

    //    if (result.Succeeded)
    //    {
    //        // Ensure the "admin" role exists (only add it if it doesn't already exist)
    //        var roleCreated = await _authService.EnsureRoleExistsAsync("admin");
    //        if (!roleCreated)
    //        {
    //            return BadRequest("Failed to create the admin role.");
    //        }

    //        // Check if the user already has the "admin" role
    //        var roles = await _userManager.GetRolesAsync(user);
    //        if (!roles.Contains("admin"))
    //        {
    //            // Add the "admin" role if it's not already present
    //            await _authService.AddUserRoleAsync(admin.Email, new[] { "admin" });
    //        }

    //        admin.UserId = user.Id; // Assign UserId before saving
    //        admin.CreatedAt = DateTime.UtcNow;

    //        _context.Admins.Add(admin);
    //        await _context.SaveChangesAsync();

    //        return CreatedAtAction(nameof(GetAdmin), new { id = admin.AdminID }, admin);
    //    }

    //    return BadRequest(result.Errors);
    //}

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginModel model)
    {
        var token = await _authService.GenerateJwtTokenAsync(model.Email);
        if (token == null)
        {
            return Unauthorized("Invalid email or password.");
        }
        return Ok(new { token });
    }



    // GET: api/admin/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<Admin>> GetAdmin(int id)
    {
        var admin = await _context.Admins.FindAsync(id);

        if (admin == null)
        {
            return NotFound();
        }

        return admin;
    }

    // PUT: api/admin/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> PutAdmin(int id, [FromBody] AdminUpdateDto adminDto)
    {
        // Validate the incoming admin data
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var admin = await _context.Admins.FindAsync(id);
        if (admin == null)
        {
            return BadRequest(ModelState);
        }

        admin.Name = adminDto.Name;

        // Update the admin properties
        admin.UpdatedAt = DateTime.UtcNow; // Set the updated date

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!AdminExists(id))
            {
                return NotFound();
            }
            else
            {
                throw;
            }
        }

        return Ok(new { message = "Admin updated successfully.", admin });
    }

    // DELETE: api/admin/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteAdmin(int id)
    {
        // Find the admin in the database
        var admin = await _context.Admins.FindAsync(id);
        if (admin == null)
        {
            return NotFound("Admin not found.");
        }

        // Find the associated user in UserManager
        var user = await _userManager.FindByEmailAsync(admin.Email);
        if (user != null)
        {
            // Get the roles associated with the user
            var roles = await _userManager.GetRolesAsync(user);

            // Remove the user from all roles
            if (roles.Any())
            {
                var removeRolesResult = await _userManager.RemoveFromRolesAsync(user, roles);
                if (!removeRolesResult.Succeeded)
                {
                    return BadRequest(removeRolesResult.Errors);
                }
            }

            // Delete the user from UserManager
            var result = await _userManager.DeleteAsync(user);
            if (!result.Succeeded)
            {
                return BadRequest(result.Errors);
            }
        }

        // Remove the admin from the database
        _context.Admins.Remove(admin);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Admin and associated user deleted successfully." });
    }

    private bool AdminExists(int id)
    {
        return _context.Admins.Any(e => e.AdminID == id);
    }
}
