using System;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Identity;

namespace MultiHospital.Models
{
    public class Admin
    {
        [Key] // Specifies that this property is the primary key
        public int AdminID { get; set; }

        // Foreign Key to IdentityUser
        public string? UserId { get; set; }

        // Navigation property
        public IdentityUser? User { get; set; } // Linking to IdentityUser

        [Required(ErrorMessage = "Name is required.")]
        [StringLength(100, ErrorMessage = "Name cannot be longer than 100 characters.")]
        public string Name { get; set; } = null!; // Non-nullable string

        [Required(ErrorMessage = "Email is required.")]
        [EmailAddress(ErrorMessage = "Invalid email address format.")]
        [StringLength(256, ErrorMessage = "Email cannot be longer than 256 characters.")]
        public string Email { get; set; } = null!; // Non-nullable string

        [DataType(DataType.DateTime)]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow; // Default to current UTC time

        [DataType(DataType.DateTime)]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow; // Default to current UTC time
    }
}
