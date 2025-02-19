using System;

namespace MultiHospital.DTO
{
    public class AppointmentGetDto
    {
        public int AppointmentID { get; set; } // Unique identifier for the appointment
        public int PatientID { get; set; } // Foreign key for the patient
        public string PatientName { get; set; } = null!; // Name of the patient
        public int DoctorID { get; set; } // Foreign key for the doctor
        public string DoctorName { get; set; } = null!; // Name of the doctor
        public DateTime AppointmentDate { get; set; } // Appointment Date
        public TimeSpan AppointmentTime { get; set; } // Appointment Time
        public string? Reason { get; set; } // Reason for the appointment
        public AppointmentStatus Status { get; set; } // Enum for status
        public DateTime CreatedAt { get; set; } // Date when the appointment was created
        public DateTime UpdatedAt { get; set; } // Date when the appointment was last updated
        public int TreatmentRecordID { get; set; } // Foreign key for treatment record
    }
}
