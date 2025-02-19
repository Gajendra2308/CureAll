using MultiHospital.Models;
using System;
using System.ComponentModel.DataAnnotations;

public class TreatmentRecord
{
    [Key]
    public int TreatmentRecordID { get; set; }

    [Required(ErrorMessage = "Patient ID is required.")]
    public int PatientID { get; set; }
    public virtual Patient Patient { get; set; } = null!;

    [Required(ErrorMessage = "Doctor ID is required.")]
    public int DoctorID { get; set; }
    public virtual Doctor Doctor { get; set; } = null!;

    [Required(ErrorMessage = "Appointment ID is required.")]
    public int AppointmentID { get; set; }
    public virtual Appointment Appointment { get; set; } = null!;

    [DataType(DataType.DateTime)]
    [Required(ErrorMessage = "Treatment date is required.")]
    [CustomDateValidation(ErrorMessage = "Treatment date cannot be in the future.")]
    public DateTime TreatmentDate { get; set; }

    [StringLength(500, ErrorMessage = "Description cannot be longer than 500 characters.")]
    public string Description { get; set; } = null!;

    [DataType(DataType.DateTime)]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [DataType(DataType.DateTime)]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;


    // Visibility flag for patient
    public bool IsVisibleToPatient { get; set; } = false; // Default to false
}

// Custom validation attribute for treatment date
public class CustomDateValidation : ValidationAttribute
{
    protected override ValidationResult IsValid(object value, ValidationContext validationContext)
    {
        if (value is DateTime dateTime)
        {
            if (dateTime > DateTime.UtcNow)
            {
                return new ValidationResult(ErrorMessage);
            }
        }
        return ValidationResult.Success;
    }
}
