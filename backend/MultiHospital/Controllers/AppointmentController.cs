using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MultiHospital.Context;
using MultiHospital.DTO;
using MultiHospital.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MultiHospital.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    
    public class AppointmentController : ControllerBase
    {
        private readonly IdentityDatabaseContext _context;

        public AppointmentController(IdentityDatabaseContext context)
        {
            _context = context;
        }

        
        [HttpGet]
        [Authorize]
        public async Task<ActionResult<IEnumerable<AppointmentGetDto>>> GetAppointments()
        {
            var appointments = await _context.Appointments
                .Include(a => a.Patient)
                .Include(a => a.Doctor)
                .ToListAsync();

            var appointmentDtos = appointments.Select(appointment => new AppointmentGetDto
            {
                AppointmentID = appointment.AppointmentID,
                PatientID = appointment.PatientID,
                PatientName = $"{appointment.Patient.FirstName} {appointment.Patient.LastName}",
                DoctorID = appointment.DoctorID,
                DoctorName = appointment.Doctor.Name,
                AppointmentDate = appointment.AppointmentDate,
                AppointmentTime = appointment.AppointmentTime,
                Reason = appointment.Reason,
                Status = appointment.Status,
                TreatmentRecordID = appointment.TreatmentRecordID,
                CreatedAt = appointment.CreatedAt,
                UpdatedAt = appointment.UpdatedAt
            }).ToList();

            return Ok(appointmentDtos);
        }

        
        [HttpGet("{id}")]
        [Authorize]
        public async Task<ActionResult<AppointmentGetDto>> GetAppointmentById(int id)
        {
            var appointment = await _context.Appointments
                .Include(a => a.Patient)
                .Include(a => a.Doctor)
                .FirstOrDefaultAsync(a => a.AppointmentID == id);

            if (appointment == null)
            {
                return NotFound();
            }

            var appointmentDto = new AppointmentGetDto
            {
                AppointmentID = appointment.AppointmentID,
                PatientID = appointment.PatientID,
                PatientName = $"{appointment.Patient.FirstName} {appointment.Patient.LastName}",
                DoctorID = appointment.DoctorID,
                DoctorName = appointment.Doctor.Name,
                AppointmentDate = appointment.AppointmentDate,
                AppointmentTime = appointment.AppointmentTime,
                Reason = appointment.Reason,
                Status = appointment.Status,
                TreatmentRecordID = appointment.TreatmentRecordID,
                CreatedAt = appointment.CreatedAt,
                UpdatedAt = appointment.UpdatedAt
            };

            return Ok(appointmentDto);
        }

        
        [HttpPost]
        [Authorize(Roles = "patient")]
        public async Task<ActionResult<Appointment>> CreateAppointment([FromBody] AppointmentPostDto appointmentPostDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

           
            var appointment = new Appointment
            {
                PatientID = appointmentPostDto.PatientID,
                DoctorID = appointmentPostDto.DoctorID,
                AppointmentDate = appointmentPostDto.AppointmentDate,
                AppointmentTime = appointmentPostDto.AppointmentTime,
                Reason = appointmentPostDto.Reason,
                TreatmentRecordID = 0, // will be updated later when the doctor submits the treatment form.
                Status = appointmentPostDto.Status,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Appointments.Add(appointment);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetAppointmentById), new { id = appointment.AppointmentID }, appointment);
        }

       
        [HttpPut("{id}")]
        [Authorize(Roles ="patient")]
        public async Task<IActionResult> UpdateAppointment(int id, [FromBody] AppointmentPostDto appointmentPostDto)
        {
            var appointment = await _context.Appointments.FindAsync(id);
            if (appointment == null)
            {
                return NotFound();
            }

            appointment.PatientID = appointmentPostDto.PatientID;
            appointment.DoctorID = appointmentPostDto.DoctorID;
            appointment.AppointmentDate = appointmentPostDto.AppointmentDate;
            appointment.AppointmentTime = appointmentPostDto.AppointmentTime;
            appointment.Reason = appointmentPostDto.Reason;
            // In an update, we typically do not change the TreatmentRecordID.
            appointment.Status = appointmentPostDto.Status;
            appointment.UpdatedAt = DateTime.UtcNow;

            _context.Entry(appointment).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Appointment updated successfully." });
        }

        
        [HttpDelete("{id}")]
        [Authorize(Roles ="patient")]
        public async Task<IActionResult> DeleteAppointment(int id)
        {
            // Find the appointment by ID.
            var appointment = await _context.Appointments.FindAsync(id);
            if (appointment == null)
            {
                return NotFound();
            }

           
            var treatmentRecord = await _context.TreatmentRecords
                .FirstOrDefaultAsync(tr => tr.AppointmentID == id);

           
            if (treatmentRecord != null)
            {
                _context.TreatmentRecords.Remove(treatmentRecord);
            }

        
            _context.Appointments.Remove(appointment);

            
            await _context.SaveChangesAsync();

            return Ok(new { message = "Appointment deleted successfully." });
        }


       
        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateAppointmentStatus(int id, [FromBody] AppointmentStatusUpdateDto statusUpdateDto)
        {
            if (!Enum.IsDefined(typeof(AppointmentStatus), statusUpdateDto.NewStatus))
            {
                return BadRequest("Invalid appointment status.");
            }

            var appointment = await _context.Appointments.FindAsync(id);
            if (appointment == null)
            {
                return NotFound();
            }

            appointment.Status = statusUpdateDto.NewStatus;
            appointment.UpdatedAt = DateTime.UtcNow;

            _context.Entry(appointment).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Appointment status updated successfully." });
        }

        [HttpGet("doctor/{doctorId}")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<AppointmentGetDto>>> GetAppointmentsByDoctorId(int doctorId)
        {
            var appointments = await _context.Appointments
                .Where(a => a.DoctorID == doctorId)
                .Include(a => a.Patient)
                .Include(a => a.Doctor)
                .ToListAsync();

            if (!appointments.Any())
            {
                return NotFound(new { message = "No appointments found for this doctor." });
            }

            var appointmentDtos = appointments.Select(appointment => new AppointmentGetDto
            {
                AppointmentID = appointment.AppointmentID,
                PatientID = appointment.PatientID,
                PatientName = $"{appointment.Patient.FirstName} {appointment.Patient.LastName}",
                DoctorID = appointment.DoctorID,
                DoctorName = appointment.Doctor.Name,
                AppointmentDate = appointment.AppointmentDate,
                AppointmentTime = appointment.AppointmentTime,
                Reason = appointment.Reason,
                Status = appointment.Status,
                TreatmentRecordID = appointment.TreatmentRecordID,
                CreatedAt = appointment.CreatedAt,
                UpdatedAt = appointment.UpdatedAt
            }).ToList();

            return Ok(appointmentDtos);
        }

        [HttpGet("patient/{patientId}")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<AppointmentGetDto>>> GetAppointmentsByPatientId(int patientId)
        {
            var appointments = await _context.Appointments
                .Where(a => a.PatientID == patientId)
                .Include(a => a.Patient)
                .Include(a => a.Doctor)
                .ToListAsync();

            if (!appointments.Any())
            {
                return NotFound(new { message = "No appointments found for this patient." });
            }

            var appointmentDtos = appointments.Select(appointment => new AppointmentGetDto
            {
                AppointmentID = appointment.AppointmentID,
                PatientID = appointment.PatientID,
                PatientName = $"{appointment.Patient.FirstName} {appointment.Patient.LastName}",
                DoctorID = appointment.DoctorID,
                DoctorName = appointment.Doctor.Name,
                AppointmentDate = appointment.AppointmentDate,
                AppointmentTime = appointment.AppointmentTime,
                Reason = appointment.Reason,
                Status = appointment.Status,
                TreatmentRecordID = appointment.TreatmentRecordID,
                CreatedAt = appointment.CreatedAt,
                UpdatedAt = appointment.UpdatedAt
            }).ToList();

            return Ok(appointmentDtos);
        }
    }
}
