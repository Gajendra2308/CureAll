using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MultiHospital.Context;
using MultiHospital.DTOs;
using MultiHospital.Interface;


[Route("api/[controller]")]
[ApiController]
//[Authorize(
public class PatientController : ControllerBase
{
    private readonly IdentityDatabaseContext _context;
    private readonly UserManager<IdentityUser> _userManager;
    private readonly IAuthService _authService;

    public PatientController(IdentityDatabaseContext context, UserManager<IdentityUser> userManager, IAuthService authService)
    {
        _context = context;
        _userManager = userManager;
        _authService = authService;
    }

  
    [HttpGet]
   
    [Authorize]

    public async Task<ActionResult<IEnumerable<PatientGetDto>>> GetAllPatients()
    {
        var patients = await _context.Patients.ToListAsync();
        if (!patients.Any()) return NotFound();

        var patientDtos = patients.Select(patient => new PatientGetDto
        {
            PatientID = patient.PatientID,
            FirstName = patient.FirstName,
            LastName = patient.LastName,
            DateOfBirth = (DateTime)patient.DateOfBirth,
            Phone = patient.Phone,
            Email = patient.Email,
            Gender = patient.Gender,
            Address = patient.Address,
            CreatedAt = patient.CreatedAt,
            UpdatedAt = patient.UpdatedAt,
            Image = patient.Image != null ? Convert.ToBase64String(patient.Image) : null
        }).ToList();

        return Ok(patientDtos);
    }

    // GET: api/patient/{id}
    [HttpGet("{id}")]
    [Authorize]
    public async Task<ActionResult<PatientGetDto>> GetPatient(int id)
    {
        var patient = await _context.Patients.FindAsync(id);
        if (patient == null) return NotFound();

        var patientDto = new PatientGetDto
        {
            PatientID = patient.PatientID,
            FirstName = patient.FirstName,
            LastName = patient.LastName,
            DateOfBirth = (DateTime)patient.DateOfBirth,
            Phone = patient.Phone,
            Email = patient.Email,
            Gender = patient.Gender,
            Address = patient.Address,
            CreatedAt = patient.CreatedAt,
            UpdatedAt = patient.UpdatedAt,
            Image = patient.Image != null ? Convert.ToBase64String(patient.Image) : null
        };

        return Ok(patientDto);
    }

    [HttpPost]
    [AllowAnonymous]
    public async Task<IActionResult> CreatePatient([FromBody] PatientPostDto patientDto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

      
        var user = new IdentityUser
        {
            UserName = patientDto.Email,
            Email = patientDto.Email,
        };

        var result = await _userManager.CreateAsync(user, patientDto.Password);
        if (!result.Succeeded) return BadRequest(result.Errors);

      
        var roleCreated = await _authService.EnsureRoleExistsAsync("patient");
        if (!roleCreated)
        {
            return BadRequest("Failed to create the Patient role.");
        }

       
        var userRoles = await _userManager.GetRolesAsync(user);
        if (!userRoles.Contains("patient"))
        {
            
            await _authService.AddUserRoleAsync(patientDto.Email, new[] { "patient" });
        }

       
        var patient = new Patient
        {
            UserId = user.Id, 
            FirstName = patientDto.FirstName,
            LastName = patientDto.LastName,
            DateOfBirth = patientDto.DateOfBirth,
            Phone = patientDto.Phone,
            Email = patientDto.Email,
            Gender = patientDto.Gender,
            Address = patientDto.Address,
        };

        _context.Patients.Add(patient);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetPatient), new { id = patient.PatientID }, patient);
    }



    // POST: api/patient/{id}/upload-image
    [HttpPost("{id}/upload-image")]
    [Authorize(Roles ="patient")]
    public async Task<IActionResult> UploadPatientImage(int id, IFormFile file)
    {
        var patient = await _context.Patients.FindAsync(id);
        if (patient == null) return NotFound();

        if (file == null || file.Length == 0) return BadRequest("No file uploaded.");

        using (var memoryStream = new MemoryStream())
        {
            await file.CopyToAsync(memoryStream);
            patient.Image = memoryStream.ToArray();
        }

        await _context.SaveChangesAsync();
        return Ok(new { message = "Image uploaded successfully." });
    }

    // GET: api/patient/{id}/image
    [HttpGet("{id}/image")]
    [Authorize(Roles = "patient")]
    public async Task<IActionResult> GetPatientImage(int id)
    {
        var patient = await _context.Patients.FindAsync(id);
        if (patient == null || patient.Image == null) return NotFound(new { message = "No image found for this patient." });

        return File(patient.Image, "image/jpeg");
    }
    // PATCH: api/patient/{id}
    [HttpPatch("{id}")]
    [Authorize(Roles ="patient")]
    public async Task<IActionResult> UpdatePatient(int id, [FromBody] PatientUpdateDto updateDto)
    {
        var patient = await _context.Patients.FindAsync(id);
        if (patient == null)
            return NotFound(new { message = "Patient not found." });

      
        if (!string.IsNullOrEmpty(updateDto.FirstName))
            patient.FirstName = updateDto.FirstName;

        if (!string.IsNullOrEmpty(updateDto.LastName))
            patient.LastName = updateDto.LastName;

        if (updateDto.DateOfBirth != null)
            patient.DateOfBirth = updateDto.DateOfBirth;

        if (!string.IsNullOrEmpty(updateDto.Phone))
            patient.Phone = updateDto.Phone;

        if (!string.IsNullOrEmpty(updateDto.Email))
            patient.Email = updateDto.Email;

        if (!string.IsNullOrEmpty(updateDto.Gender))
            patient.Gender = updateDto.Gender;

        if (!string.IsNullOrEmpty(updateDto.Address))
            patient.Address = updateDto.Address;

        patient.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return Ok(new { message = "Profile updated successfully." });
    }

    [HttpDelete("{id}")]
    [Authorize(Roles ="patient")]
    public async Task<IActionResult> DeletePatient(int id)
    {
        var patient = await _context.Patients
            .Include(p => p.Appointments) 
            .FirstOrDefaultAsync(p => p.PatientID == id);

        if (patient == null)
        {
            return NotFound();
        }

       
        var appointments = await _context.Appointments
            .Where(a => a.PatientID == id)
            .Include(a => a.TreatmentRecord)
            .ToListAsync();

        foreach (var appointment in appointments)
        {
            if (appointment.TreatmentRecord != null)
            {
                _context.TreatmentRecords.Remove(appointment.TreatmentRecord);
            }
            _context.Appointments.Remove(appointment);
        }

      
        if (!string.IsNullOrEmpty(patient.Email))
        {
            var user = await _userManager.FindByEmailAsync(patient.Email);
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
        }

        _context.Patients.Remove(patient);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Patient and all associated data deleted successfully." });
    }


}
