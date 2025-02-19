using System;
using System.ComponentModel.DataAnnotations;

namespace MultiHospital.DTO
{
    public class AppointmentPostDto
    {
        [Required(ErrorMessage = "Patient ID is required.")]
        public int PatientID { get; set; } // Foreign key for the patient

        [Required(ErrorMessage = "Doctor ID is required.")]
        public int DoctorID { get; set; } // Foreign key for the doctor

        [Required(ErrorMessage = "Appointment date is required.")]
        public DateTime AppointmentDate { get; set; } // Appointment Date

        [Required(ErrorMessage = "Appointment time is required.")]
        public TimeSpan AppointmentTime { get; set; } // Appointment Time

        [StringLength(255, ErrorMessage = "Reason cannot be longer than 255 characters.")]
        public string? Reason { get; set; } // Reason for the appointment

        [Required(ErrorMessage = "Treatment Record ID is required.")]
        public int TreatmentRecordID { get; set; } // Foreign key for treatment record

        public AppointmentStatus Status { get; set; } = AppointmentStatus.Scheduled; // Default status
    }
}
