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

   
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteAdmin(int id)
    {
        // Find the admin in the database
        var admin = await _context.Admins.FindAsync(id);
        if (admin == null)
        {
            return NotFound("Admin not found.");
        }

        
        var user = await _userManager.FindByEmailAsync(admin.Email);
        if (user != null)
        {
            
            var roles = await _userManager.GetRolesAsync(user);

            
            if (roles.Any())
            {
                var removeRolesResult = await _userManager.RemoveFromRolesAsync(user, roles);
                if (!removeRolesResult.Succeeded)
                {
                    return BadRequest(removeRolesResult.Errors);
                }
            }

           
            var result = await _userManager.DeleteAsync(user);
            if (!result.Succeeded)
            {
                return BadRequest(result.Errors);
            }
        }

        
        _context.Admins.Remove(admin);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Admin and associated user deleted successfully." });
    }

    private bool AdminExists(int id)
    {
        return _context.Admins.Any(e => e.AdminID == id);
    }
}
