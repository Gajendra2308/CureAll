using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MultiHospital.Context;
using MultiHospital.DTOs;
using MultiHospital.Models; 
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MultiHospital.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles ="admin")]

    public class DepartmentController : ControllerBase
    {
        private readonly IdentityDatabaseContext _context; 
        private readonly UserManager<IdentityUser> _userManager;

        public DepartmentController(IdentityDatabaseContext context, UserManager<IdentityUser> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        
        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<DepartmentGetDto>>> GetDepartments()
        {
            var departments = await _context.Departments
                .Include(d => d.Hospital) // Eager load the Hospital entity
                .Select(d => new DepartmentGetDto
                {
                    DepartmentID = d.DepartmentID,
                    HospitalName = d.Hospital.Name, 
                    Name = d.Name,
                    Description = d.Description,
                    CreatedAt = d.CreatedAt,
                    UpdatedAt = d.UpdatedAt,
                    ImageBase64 = d.Image != null ? Convert.ToBase64String(d.Image) : null // Convert byte[] to Base64
                })
                .ToListAsync();

            return Ok(departments);
        }


        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<DepartmentGetDto>> GetDepartment(int id)
        {
            var department = await _context.Departments
                .Include(d => d.Hospital)
                .Select(d => new DepartmentGetDto
                {
                    DepartmentID = d.DepartmentID,
                    HospitalName = d.Hospital.Name,
                    Name = d.Name,
                    Description = d.Description,
                    CreatedAt = d.CreatedAt,
                    UpdatedAt = d.UpdatedAt,
                    ImageBase64 = d.Image != null ? Convert.ToBase64String(d.Image) : null
                })
                .FirstOrDefaultAsync(d => d.DepartmentID == id);

            if (department == null)
            {
                return NotFound(new { message = "Department not found." });
            }

            return Ok(department);
        }



      
        [HttpGet("hospital/{hospitalId}")]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<DepartmentGetDto>>> GetDepartmentsByHospital(int hospitalId)
        {
            var departments = await _context.Departments
                .Where(d => d.HospitalID == hospitalId)
                .Select(d => new DepartmentGetDto
                {
                    DepartmentID = d.DepartmentID,
                    HospitalName = d.Hospital.Name,
                    Name = d.Name,
                    Description = d.Description,
                    CreatedAt = d.CreatedAt,
                    UpdatedAt = d.UpdatedAt
                })
                .ToListAsync();

            if (departments == null || !departments.Any())
            {
                return NotFound("No departments found for this hospital.");
            }

            return Ok(departments);
        }

       
        [HttpGet("{departmentId}/doctors")]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<DoctorGetDto>>> GetDoctorsByDepartment(int departmentId)
        {
            // Check if the department exists
            var departmentExists = await _context.Departments.AnyAsync(d => d.DepartmentID == departmentId);
            if (!departmentExists)
            {
                return NotFound(new { message = "Department not found." });
            }

            // Retrieve all doctors associated with the specified department
            var doctors = await _context.Doctors
                .Where(d => d.DepartmentID == departmentId) 
                .Select(d => new DoctorGetDto
                {
                    DoctorID = d.DoctorID,
                    Name = d.Name,
                    Specialization = d.Specialization,
                    Phone = d.Phone,
                    Email = d.Email,
                    HospitalName = d.Hospital.Name, 
                    DepartmentName = d.Department.Name 
                })
                .ToListAsync();

            return Ok(doctors);
        }

        [HttpPost]
        public async Task<ActionResult<Department>> PostDepartment([FromForm] DepartmentCreateDto departmentDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Retrieve the hospital from the database using the provided HospitalID
            var hospital = await _context.Hospitals.FindAsync(departmentDto.HospitalID);
            if (hospital == null)
            {
                return NotFound("Hospital not found.");
            }

            var department = new Department
            {
                HospitalID = hospital.HospitalID,
                Name = departmentDto.Name,
                Description = departmentDto.Description,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

           
            if (departmentDto.ImageFile != null && departmentDto.ImageFile.Length > 0)
            {
                using (var memoryStream = new MemoryStream())
                {
                    await departmentDto.ImageFile.CopyToAsync(memoryStream);
                    department.Image = memoryStream.ToArray();
                }
            }

            
            _context.Departments.Add(department);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetDepartment), new { id = department.DepartmentID }, department);
        }


        
        [HttpPut("{id}")]
        
        public async Task<IActionResult> PutDepartment(int id, [FromBody] Department department)
        {
            var existingDepartment = await _context.Departments.FindAsync(id);
            if(existingDepartment == null)
            {
                return BadRequest(ModelState);
            }

            existingDepartment.HospitalID = department.HospitalID;
            existingDepartment.Name = department.Name;
            existingDepartment.Description = department.Description;

            
            department.UpdatedAt = DateTime.UtcNow;


            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!DepartmentExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Ok(new { message = "Department updated successfully.", department });
        }

        
        [HttpDelete("{id}")]
        
        public async Task<IActionResult> DeleteDepartment(int id)
        {
           
            var department = await _context.Departments
                .Include(d => d.Doctors) 
                .FirstOrDefaultAsync(d => d.DepartmentID == id);

            if (department == null)
            {
                return NotFound(new { message = "Department not found." });
            }

            
            foreach (var doctor in department.Doctors)
            {
                
                if (string.IsNullOrEmpty(doctor.Email))
                {
                    return BadRequest(new { message = $"Doctor with ID {doctor.DoctorID} has no email associated." });
                }

               
                var user = await _userManager.FindByEmailAsync(doctor.Email);
                if (user != null)
                {
                   
                    var roles = await _userManager.GetRolesAsync(user);
                    if (roles.Any())
                    {
                        var removeRolesResult = await _userManager.RemoveFromRolesAsync(user, roles);
                        if (!removeRolesResult.Succeeded)
                        {
                            return BadRequest(new { message = $"Failed to remove roles for user {user.Email}." });
                        }
                    }

                   
                    var deleteUserResult = await _userManager.DeleteAsync(user);
                    if (!deleteUserResult.Succeeded)
            {
                        return BadRequest(new { message = $"Failed to delete user {user.Email}." });
                    }
                }
            }

            
            _context.Departments.Remove(department);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Department and all associated doctors have been successfully deleted." });
        }

        private bool DepartmentExists(int id)
        {
            return _context.Departments.Any(e => e.DepartmentID == id);
        }
    }
}
