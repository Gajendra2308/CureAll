using MultiHospital.Models;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

public class Doctor
{
    [Key]
    public int DoctorID { get; set; }

    // Foreign key to IdentityUser (representing the login user)
    public string UserId { get; set; }  // This will link to IdentityUser

    [Required(ErrorMessage = "Hospital ID is required.")]
    [ForeignKey("Hospital")]
    public int HospitalID { get; set; }

    [Required(ErrorMessage = "Department ID is required.")]
    [ForeignKey("Department")]
    public int DepartmentID { get; set; }

    [Required(ErrorMessage = "Doctor name is required.")]
    [StringLength(100)]
    public string Name { get; set; } = null!;

    [StringLength(100)]
    public string? Specialization { get; set; }

    [StringLength(15)]
    public string? Phone { get; set; }

    [StringLength(100)]
    [EmailAddress]
    public string? Email { get; set; }

    [StringLength(200)]
    public string? Degree { get; set; } // New field for degree

    [StringLength(50)]
    public string? Experience { get; set; } // Experience changed to string

    [DataType(DataType.DateTime)]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [DataType(DataType.DateTime)]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    [MaxLength(5000000)]
    public byte[]? Image { get; set; }

    // New IsAvailable field (Boolean) to track doctor's availability
    public bool IsAvailable { get; set; }

    [Range(0, double.MaxValue, ErrorMessage = "Fees must be a positive number.")]
    [Column(TypeName = "decimal(18, 2)")]
    public decimal? Fees { get; set; }

    public virtual Hospital? Hospital { get; set; }
    public virtual Department? Department { get; set; }
    public virtual ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
}
