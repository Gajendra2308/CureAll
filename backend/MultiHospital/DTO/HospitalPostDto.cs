using System.ComponentModel.DataAnnotations;

namespace MultiHospital.Models
{
    public class HospitalPostDto
    {
        [Required(ErrorMessage = "Hospital name is required.")]
        [StringLength(255, ErrorMessage = "Hospital name cannot be longer than 255 characters.")]
        public string Name { get; set; } = null!;

        [Required(ErrorMessage = "Address is required.")]
        [StringLength(255, ErrorMessage = "Address cannot be longer than 255 characters.")]
        public string Address { get; set; } = null!;

        [Phone(ErrorMessage = "Invalid phone number format.")]
        [StringLength(15, ErrorMessage = "Phone number cannot be longer than 15 characters.")]
        public string? Phone { get; set; }

        [EmailAddress(ErrorMessage = "Invalid email address format.")]
        [StringLength(100, ErrorMessage = "Email cannot be longer than 100 characters.")]
        public string? Email { get; set; }

        public IFormFile? ImageFile { get; set; }
    }
}

