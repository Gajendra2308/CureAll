using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MultiHospital.Context;
using MultiHospital.DTOs;
using MultiHospital.Models; 
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace MultiHospital.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class HospitalController : ControllerBase
    {
        private readonly IdentityDatabaseContext _context; 
        private readonly UserManager<IdentityUser> _userManager;
        private readonly IWebHostEnvironment _environment;

        public HospitalController(IdentityDatabaseContext context, UserManager<IdentityUser> userManager, IWebHostEnvironment environment)
        {
            _context = context;
            _userManager = userManager;
            _environment = environment;
        }

       
        [HttpPost]
        [Authorize(Roles ="admin")]
        public async Task<ActionResult<HospitalGetDto>> PostHospital([FromForm] HospitalPostDto hospitalDto)
        {
            // Validate the incoming hospital data
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Handle the image file
            byte[]? imageBytes = null;
            if (hospitalDto.ImageFile != null && hospitalDto.ImageFile.Length > 0)
            {
                using (var memoryStream = new MemoryStream())
                {
                    await hospitalDto.ImageFile.CopyToAsync(memoryStream);
                    imageBytes = memoryStream.ToArray();
                }
            }

            // Map the DTO to the Hospital entity
            var hospital = new Hospital
            {
                Name = hospitalDto.Name,
                Address = hospitalDto.Address,
                Phone = hospitalDto.Phone,
                Email = hospitalDto.Email,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow, // Set the updated time to now
                Image = imageBytes // Store the image as byte array in the database
            };

            // Add the hospital to the database
            _context.Hospitals.Add(hospital);
            await _context.SaveChangesAsync();

            // Map the created hospital entity to the DTO to return in the response
            var hospitalGetDto = new HospitalGetDto
            {
                HospitalID = hospital.HospitalID,
                Name = hospital.Name,
                Address = hospital.Address,
                Phone = hospital.Phone,
                Email = hospital.Email,
                CreatedAt = hospital.CreatedAt,
                UpdatedAt = hospital.UpdatedAt,
                ImageUrl = hospital.Image != null ? Path.Combine("uploads", $"{hospital.HospitalID}.jpg") : null // Generate image URL if available
            };

            return CreatedAtAction(nameof(GetHospital), new { id = hospital.HospitalID }, hospitalGetDto);
        }

       
        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<HospitalGetDto>>> GetHospitals()
        {
           
            var hospitals = await _context.Hospitals.ToListAsync();

            var hospitalsDto = hospitals.Select(hospital => new HospitalGetDto
            {
                HospitalID = hospital.HospitalID,
                Name = hospital.Name,
                Address = hospital.Address,
                Phone = hospital.Phone,
                Email = hospital.Email,
                CreatedAt = hospital.CreatedAt,
                UpdatedAt = hospital.UpdatedAt,
                ImageUrl = hospital.Image != null ? Convert.ToBase64String(hospital.Image) : null
            }).ToList();

            return Ok(hospitalsDto);
        }

       
        [HttpDelete("{id}")]
        [Authorize(Roles ="admin")]
        public async Task<IActionResult> DeleteHospital(int id)
        {
            
            var hospital = await _context.Hospitals.FindAsync(id);

            if (hospital == null)
            {
                return NotFound("Hospital not found.");
            }

            
            _context.Hospitals.Remove(hospital);

           
            await _context.SaveChangesAsync();

            return Ok(new { message = "Hospital deleted successfully." });
        }


        [HttpPut("{id}")]
        [Authorize(Roles ="admin")]
        public async Task<IActionResult> PutHospital(int id, [FromForm] HospitalPostDto hospitalDto)
        {
            
            var existingHospital = await _context.Hospitals.FindAsync(id);
            if (existingHospital == null)
            {
                return NotFound("Hospital not found.");
            }

          
            if (hospitalDto.ImageFile != null && hospitalDto.ImageFile.Length > 0)
            {
                using (var memoryStream = new MemoryStream())
                {
                    await hospitalDto.ImageFile.CopyToAsync(memoryStream);
                    existingHospital.Image = memoryStream.ToArray(); // Update image as byte array
                }
            }

           
            existingHospital.Name = hospitalDto.Name;
            existingHospital.Address = hospitalDto.Address;
            existingHospital.Phone = hospitalDto.Phone;
            existingHospital.Email = hospitalDto.Email;
            existingHospital.UpdatedAt = DateTime.UtcNow; // Update the UpdatedAt property

           
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!HospitalExists(id))
                {
                    return NotFound("Hospital not found.");
                }
                else
                {
                    throw; // Rethrow the exception if it's a different issue
                }
            }

            return Ok(new { message = "Hospital updated successfully.", hospital = existingHospital });
        }

        
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<HospitalGetDto>> GetHospital(int id)
        {
            var hospital = await _context.Hospitals
                .Where(h => h.HospitalID == id)
                .FirstOrDefaultAsync();

            if (hospital == null)
            {
                return NotFound("Hospital not found.");
            }

            
            var hospitalGetDto = new HospitalGetDto
            {
                HospitalID = hospital.HospitalID,
                Name = hospital.Name,
                Address = hospital.Address,
                Phone = hospital.Phone,
                Email = hospital.Email,
                CreatedAt = hospital.CreatedAt,
                UpdatedAt = hospital.UpdatedAt,
                ImageUrl = hospital.Image != null ? Path.Combine("uploads", $"{hospital.HospitalID}.jpg") : null // Generate image URL if available
            };

            return Ok(hospitalGetDto);
        }

        private bool HospitalExists(int id)
        {
            return _context.Hospitals.Any(e => e.HospitalID == id);
        }
    }
}
