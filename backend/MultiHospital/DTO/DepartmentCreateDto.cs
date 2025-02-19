using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace MultiHospital.DTOs
{
    public class DepartmentCreateDto
    {
        [Required(ErrorMessage = "Hospital ID is required.")]
        public int HospitalID { get; set; }

        [Required(ErrorMessage = "Department name is required.")]
        [StringLength(100, ErrorMessage = "Department name cannot be longer than 100 characters.")]
        public string Name { get; set; } = null!;

        [StringLength(255, ErrorMessage = "Description cannot be longer than 255 characters.")]
        public string? Description { get; set; }

        public IFormFile? ImageFile { get; set; } // Image upload from the client
    }
}
