using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MultiHospital.Context;
using MultiHospital.Interface;
using MultiHospital.Models;

[Route("api/[controller]")]
[ApiController]

public class DoctorController : ControllerBase
{
    private readonly IdentityDatabaseContext _context;
    private readonly IAuthService _authService;
    private readonly UserManager<IdentityUser> _userManager;

    public DoctorController(IdentityDatabaseContext context, IAuthService authService, UserManager<IdentityUser> userManager)
    {
        _context = context;
        _authService = authService;
        _userManager = userManager;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<IEnumerable<Doctor>>> GetDoctors()
    {
        var doctors = await _context.Doctors
            .Include(d => d.Hospital)
            .Include(d => d.Department)
            .ToListAsync();

        var doctorDtos = doctors.Select(d => new DoctorGetDto
        {
            DoctorID = d.DoctorID,
            Name = d.Name,
            Specialization = d.Specialization,
            Phone = d.Phone,
            Email = d.Email,
            HospitalName = d.Hospital?.Name, // Hospital Name if exists
            HospitalID = d.Hospital?.HospitalID ?? 0, // Using the Hospital's ID (or 0 if null)
            DepartmentName = d.Department?.Name,
            ImageUrl = d.Image != null ? Convert.ToBase64String(d.Image) : null,
            Degree = d.Degree,
            Experience = d.Experience,
            IsAvailable = d.IsAvailable, // Ensure this is part of the Doctor model if necessary
            Fees = d.Fees // Ensure this is part of the Doctor model if necessary
        }).ToList();

        return Ok(doctorDtos);
    }


    
    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<ActionResult<DoctorGetDto>> GetDoctor(int id)
    {
        var doctor = await _context.Doctors
            .Include(d => d.Hospital)
            .Include(d => d.Department)
            .FirstOrDefaultAsync(d => d.DoctorID == id);

        if (doctor == null)
        {
            return NotFound();
        }

        var doctorDto = new DoctorGetDto
        {
            DoctorID = doctor.DoctorID,
            Name = doctor.Name,
            Specialization = doctor.Specialization,
            Phone = doctor.Phone,
            Email = doctor.Email,
            HospitalName = doctor.Hospital?.Name,
            HospitalID = doctor.Hospital?.HospitalID ?? 0,
            DepartmentName = doctor.Department?.Name,
            ImageUrl = doctor.Image != null ? Convert.ToBase64String(doctor.Image) : null,
            Degree = doctor.Degree,
            Experience = doctor.Experience,
            Fees = doctor.Fees
        };

        return Ok(doctorDto);
    }

   
    [Authorize(Roles ="admin")]
    [HttpPost("register")]
    
    public async Task<ActionResult<Doctor>> PostDoctor([FromForm] DoctorCreationDto doctorDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var user = new IdentityUser
        {
            UserName = doctorDto.Email,
            Email = doctorDto.Email,
        };

        var result = await _userManager.CreateAsync(user, doctorDto.Password);
        if (result.Succeeded)
        {
            var doctor = new Doctor
            {
                UserId = user.Id,  
                HospitalID = doctorDto.HospitalID,
                DepartmentID = doctorDto.DepartmentID,
                Name = doctorDto.Name,
                Specialization = doctorDto.Specialization,
                Phone = doctorDto.Phone,
                Email = doctorDto.Email,
                Degree = doctorDto.Degree,
                Experience = doctorDto.Experience,
                Fees = doctorDto.Fees,
                IsAvailable = doctorDto.IsAvailable
            };

           
            if (doctorDto.ImageFile != null && doctorDto.ImageFile.Length > 0)
            {
                using (var memoryStream = new MemoryStream())
                {
                    await doctorDto.ImageFile.CopyToAsync(memoryStream);
                    doctor.Image = memoryStream.ToArray();
                }
            }

          
            var roleCreated = await _authService.EnsureRoleExistsAsync("doctor");
            if (!roleCreated)
            {
                return BadRequest("Failed to create the doctor role.");
            }

           
            var userRoles = await _userManager.GetRolesAsync(user);
            if (!userRoles.Contains("doctor"))
            {
                var addRoleResult = await _userManager.AddToRoleAsync(user, "doctor");
                if (!addRoleResult.Succeeded)
                {
                    return BadRequest("Failed to add role to user.");
                }
            }

            doctor.CreatedAt = DateTime.UtcNow;
            _context.Doctors.Add(doctor);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetDoctor), new { id = doctor.DoctorID }, doctor);
        }

        return BadRequest(result.Errors);
    }




   
        [HttpPut("{id}")]
    [Authorize(Roles ="doctor")]
        public async Task<IActionResult> UpdateDoctor(int id, [FromForm] DoctorUpdateDto doctorDto)
        {
            var existingDoctor = await _context.Doctors
                                                .Include(d => d.Hospital)
                                                .Include(d => d.Department)
                                                .FirstOrDefaultAsync(d => d.DoctorID == id);

            if (existingDoctor == null)
            {
                return NotFound();
            }
            if (doctorDto.HospitalID == 0)
            {
                doctorDto.HospitalID = existingDoctor.HospitalID;
            }

            if (doctorDto.DepartmentID == 0)
            {
                doctorDto.DepartmentID = existingDoctor.DepartmentID;
            }

           
            existingDoctor.HospitalID = doctorDto.HospitalID;
            existingDoctor.DepartmentID = doctorDto.DepartmentID;
            existingDoctor.Name = doctorDto.Name;
            existingDoctor.Specialization = doctorDto.Specialization;
            existingDoctor.Phone = doctorDto.Phone;
            existingDoctor.Degree = doctorDto.Degree;
            existingDoctor.Experience = doctorDto.Experience;
            existingDoctor.Fees = doctorDto.Fees;
            existingDoctor.UpdatedAt = DateTime.UtcNow;

            if (doctorDto.ImageFile != null && doctorDto.ImageFile.Length > 0)
            {
                using (var memoryStream = new MemoryStream())
                {
                    await doctorDto.ImageFile.CopyToAsync(memoryStream);
                    existingDoctor.Image = memoryStream.ToArray();
                }
            }

            
            await _context.SaveChangesAsync();

            return Ok(new { message = "Doctor updated successfully.", existingDoctor });
        }




    [HttpDelete("{id}")]
    [Authorize(Roles ="admin")]
    public async Task<IActionResult> DeleteDoctor(int id)
    {
        var doctor = await _context.Doctors
            .Include(d => d.Appointments) // Include appointments
            .FirstOrDefaultAsync(d => d.DoctorID == id);

        if (doctor == null)
        {
            return NotFound();
        }

       
        var appointments = await _context.Appointments
            .Where(a => a.DoctorID == id)
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

       
        if (!string.IsNullOrEmpty(doctor.Email))
        {
            var user = await _userManager.FindByEmailAsync(doctor.Email);
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

        _context.Doctors.Remove(doctor);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Doctor and all associated data deleted successfully." });
    }


    private bool DoctorExists(int id)
    {
        return _context.Doctors.Any(e => e.DoctorID == id);
    }
}
