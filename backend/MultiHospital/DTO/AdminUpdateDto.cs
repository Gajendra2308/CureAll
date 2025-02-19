using System;
using System.ComponentModel.DataAnnotations;

namespace MultiHospital.Models
{
    public class AdminUpdateDto
    {
        [Required(ErrorMessage = "Admin ID is required.")]
        public int AdminID { get; set; }

        [Required(ErrorMessage = "Name is required.")]
        [StringLength(100, ErrorMessage = "Name cannot be longer than 100 characters.")]
        public string Name { get; set; } = null!; // Non-nullable string

        // Other properties can be added as needed
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow; // Optional: to track when the update occurred
    }
}