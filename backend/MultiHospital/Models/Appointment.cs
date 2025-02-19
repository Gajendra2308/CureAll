using System;
using System.ComponentModel.DataAnnotations;

namespace MultiHospital.Models
{
    public class Appointment
    {
        [Key] // Specifies that this property is the primary key
        public int AppointmentID { get; set; } // Unique identifier for the appointment

        [Required(ErrorMessage = "Patient ID is required.")]
        public int PatientID { get; set; } // Foreign key for the patient
        public virtual Patient Patient { get; set; } = null!; // Navigation property to the Patient

        [Required(ErrorMessage = "Doctor ID is required.")]
        public int DoctorID { get; set; } // Foreign key for the doctor
        public virtual Doctor Doctor { get; set; } = null!; // Navigation property to the Doctor

        [DataType(DataType.Date)]
        [Required(ErrorMessage = "Appointment date is required.")]
        public DateTime AppointmentDate { get; set; } // Date of the appointment

        [DataType(DataType.Time)]
        [Required(ErrorMessage = "Appointment time is required.")]
        public TimeSpan AppointmentTime { get; set; } // Time of the appointment

        [StringLength(255, ErrorMessage = "Reason cannot be longer than 255 characters.")]
        public string? Reason { get; set; } // Reason for the appointment

        [Required(ErrorMessage = "Status is required.")]
        public AppointmentStatus Status { get; set; } = AppointmentStatus.Scheduled; // Use enum for status

        [DataType(DataType.DateTime)]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow; // Default to current UTC time

        [DataType(DataType.DateTime)]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow; // Default to current UTC time

        // Treatment record reference
        [Required(ErrorMessage = "Treatment Record ID is required.")]
        public int TreatmentRecordID { get; set; } // Foreign key for the treatment record
        public virtual TreatmentRecord TreatmentRecord { get; set; } = null!;
    }
}