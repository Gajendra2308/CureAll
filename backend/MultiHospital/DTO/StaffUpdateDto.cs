using System.ComponentModel.DataAnnotations;

namespace MultiHospital.DTOs
{
    public class StaffUpdateDto
    {
        [Required(ErrorMessage = "First name is required.")]
        [StringLength(100, ErrorMessage = "First name cannot be longer than 100 characters.")]
        public string FirstName { get; set; } = null!; // Non-nullable string

        [Required(ErrorMessage = "Last name is required.")]
        [StringLength(100, ErrorMessage = "Last name cannot be longer than 100 characters.")]
        public string LastName { get; set; } = null!; // Non-nullable string

        [StringLength(15, ErrorMessage = "Phone number cannot be longer than 15 characters.")]
        public string? Phone { get; set; } // Nullable string

        // Note: Email is excluded from this DTO
    }
}
