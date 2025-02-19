using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MultiHospital.Models
{
    public class Department
    {
        [Key] // Specifies that this property is the primary key
        public int DepartmentID { get; set; }

        [Required(ErrorMessage = "Hospital ID is required.")]
        public int HospitalID { get; set; } // Foreign key to the Hospitals table

        [Required(ErrorMessage = "Department name is required.")]
        [StringLength(100, ErrorMessage = "Department name cannot be longer than 100 characters.")]
        public string Name { get; set; } = null!; // Non-nullable string

        [StringLength(255, ErrorMessage = "Description cannot be longer than 255 characters.")]
        public string? Description { get; set; } // Nullable string

        [DataType(DataType.DateTime)]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow; // Default to current UTC time

        [DataType(DataType.DateTime)]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow; // Default to current UTC time

        // Navigation property to the Hospital
        [ForeignKey("HospitalID")]
        public virtual Hospital? Hospital { get; set; } = null!; // Non-nullable reference to Hospital
        public byte[]? Image { get; set; } // Store image as binary data

        public virtual ICollection<Doctor> Doctors { get; set; } = new List<Doctor>();
    }
}
