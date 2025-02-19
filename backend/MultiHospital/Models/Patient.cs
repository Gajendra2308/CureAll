using MultiHospital.Models;
using System.ComponentModel.DataAnnotations;

public class Patient
{
    [Key] // Specifies that this property is the primary key
    public int PatientID { get; set; }

    // Link to IdentityUser
    public string UserId { get; set; } // Foreign key to IdentityUser

    [Required(ErrorMessage = "First name is required.")]
    [StringLength(100, ErrorMessage = "First name cannot be longer than 100 characters.")]
    public string FirstName { get; set; } = null!;

    [Required(ErrorMessage = "Last name is required.")]
    [StringLength(100, ErrorMessage = "Last name cannot be longer than 100 characters.")]
    public string LastName { get; set; } = null!;

    [DataType(DataType.Date)]
    [Required(ErrorMessage = "Date of birth is required.")]
    public DateTime? DateOfBirth { get; set; }

    [Phone(ErrorMessage = "Invalid phone number format.")]
    [StringLength(15, ErrorMessage = "Phone number cannot be longer than 15 characters.")]
    public string? Phone { get; set; }

    [EmailAddress(ErrorMessage = "Invalid email address format.")]
    [StringLength(100, ErrorMessage = "Email cannot be longer than 100 characters.")]
    public string? Email { get; set; }

    [Required(ErrorMessage = "Gender is required.")]
    [StringLength(10, ErrorMessage = "Gender cannot be longer than 10 characters.")]
    public string Gender { get; set; } = null!;

    [StringLength(255, ErrorMessage = "Address cannot be longer than 255 characters.")]
    public string? Address { get; set; }

    [DataType(DataType.DateTime)]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [DataType(DataType.DateTime)]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    [MaxLength(5000000)]
    public byte[]? Image { get; set; }

    public virtual ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
}
