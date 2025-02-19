using System.ComponentModel.DataAnnotations;

namespace MultiHospital.Models
{
    public class Hospital
    {
            [Key] // Specifies that this property is the primary key
            public int HospitalID { get; set; }

            [Required(ErrorMessage = "Hospital name is required.")]
            [StringLength(255, ErrorMessage = "Hospital name cannot be longer than 255 characters.")]
            public string Name { get; set; } = null!; // Non-nullable string

            [Required(ErrorMessage = "Address is required.")]
            [StringLength(255, ErrorMessage = "Address cannot be longer than 255 characters.")]
            public string Address { get; set; } = null!; // Non-nullable string

            [Phone(ErrorMessage = "Invalid phone number format.")]
            [StringLength(15, ErrorMessage = "Phone number cannot be longer than 15 characters.")]
            public string? Phone { get; set; } // Nullable string

            [EmailAddress(ErrorMessage = "Invalid email address format.")]
            [StringLength(100, ErrorMessage = "Email cannot be longer than 100 characters.")]
            public string? Email { get; set; } // Nullable string

            [MaxLength(5000000)]
            public byte[]? Image { get; set; }

        [DataType(DataType.DateTime)]
            public DateTime CreatedAt { get; set; } = DateTime.UtcNow; // Default to current UTC time

            [DataType(DataType.DateTime)]
            public DateTime UpdatedAt { get; set; } = DateTime.UtcNow; // Default to current UTC time

            public virtual ICollection<Doctor> Doctors { get; set; } = new List<Doctor>();
            public virtual ICollection<Department> Departments { get; set; } = new List<Department>();

    }
    
}
