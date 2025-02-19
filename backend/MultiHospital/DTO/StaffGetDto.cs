using System.ComponentModel.DataAnnotations;

namespace MultiHospital.DTOs
{
    public class StaffGetDto
    {
        public int StaffID { get; set; } // Unique identifier for the staff member

        [Required(ErrorMessage = "First name is required.")]
        [StringLength(100, ErrorMessage = "First name cannot be longer than 100 characters.")]
        public string FirstName { get; set; } = null!; // Non-nullable string

        [Required(ErrorMessage = "Last name is required.")]
        [StringLength(100, ErrorMessage = "Last name cannot be longer than 100 characters.")]
        public string LastName { get; set; } = null!; // Non-nullable string

        [StringLength(15, ErrorMessage = "Phone number cannot be longer than 15 characters.")]
        public string? Phone { get; set; } // Nullable string

        [StringLength(100, ErrorMessage = "Email cannot be longer than 100 characters.")]
        [EmailAddress(ErrorMessage = "Invalid email format.")]
        public string Email { get; set; } = null!; // Non-nullable string

        // Optionally, you can include CreatedAt and UpdatedAt if needed
        // [DataType(DataType.DateTime)]
        // public DateTime CreatedAt { get; set; }

        // [DataType(DataType.DateTime)]
        // public DateTime UpdatedAt { get; set; }
    }
}