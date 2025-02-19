using System.ComponentModel.DataAnnotations;

namespace MultiHospital.Models
{
    public class DoctorUpdateDto
    {
        [Required(ErrorMessage = "Hospital ID is required.")]
        public int HospitalID { get; set; }

        [Required(ErrorMessage = "Department ID is required.")]
        public int DepartmentID { get; set; }

        [Required(ErrorMessage = "Doctor name is required.")]
        [StringLength(100, ErrorMessage = "Doctor name cannot be longer than 100 characters.")]
        public string Name { get; set; } = null!;

        [StringLength(100, ErrorMessage = "Specialization cannot be longer than 100 characters.")]
        public string? Specialization { get; set; }

        [StringLength(15, ErrorMessage = "Phone number cannot be longer than 15 characters.")]
        public string? Phone { get; set; }

        [StringLength(100, ErrorMessage = "Email cannot be longer than 100 characters.")]
        [EmailAddress(ErrorMessage = "Invalid email format.")]
        public string? Email { get; set; }

        [StringLength(200, ErrorMessage = "Degree cannot be longer than 200 characters.")]
        public string? Degree { get; set; } // New field for degree

        [StringLength(50, ErrorMessage = "Experience cannot be longer than 50 characters.")]
        public string? Experience { get; set; } // New field for experience

        [Required(ErrorMessage = "Availability status is required.")]
        public bool IsAvailable { get; set; } // New field for availability

        // Nullable byte array for image data
        public IFormFile? ImageFile { get; set; }

        [Range(0, double.MaxValue, ErrorMessage = "Fees must be a positive number.")]
        public decimal? Fees { get; set; }
    }
}
