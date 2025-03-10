using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MultiHospital.Context;
using MultiHospital.Models;
using MultiHospital.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;

namespace MultiHospital.Controllers
{
    //[Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class TreatmentRecordsController : ControllerBase
    {
        private readonly IdentityDatabaseContext _context;

        public TreatmentRecordsController(IdentityDatabaseContext context)
        {
            _context = context;
        }

        // POST: api/treatmentrecords
        [HttpPost]
        [Authorize (Roles ="doctor")]
        public async Task<IActionResult> CreateTreatmentRecord([FromBody] TreatmentRecordPostDto treatmentRecordDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            
            var treatmentRecord = new TreatmentRecord
            {
                PatientID = treatmentRecordDto.PatientID,
                DoctorID = treatmentRecordDto.DoctorID,
                AppointmentID = treatmentRecordDto.AppointmentID, 
                TreatmentDate = treatmentRecordDto.TreatmentDate,
                Description = treatmentRecordDto.Description,
                IsVisibleToPatient = treatmentRecordDto.IsVisibleToPatient, .
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.TreatmentRecords.Add(treatmentRecord);
            await _context.SaveChangesAsync();

          
            var appointment = await _context.Appointments.FindAsync(treatmentRecord.AppointmentID);
            if (appointment != null)
            {
                appointment.TreatmentRecordID = treatmentRecord.TreatmentRecordID;
                _context.Entry(appointment).State = EntityState.Modified;
                await _context.SaveChangesAsync();
            }

            return CreatedAtAction(nameof(GetTreatmentRecord), new { id = treatmentRecord.TreatmentRecordID }, treatmentRecord);
        }

        

        // GET: api/treatmentrecords/{id}
        [HttpGet("{id}")]
        //[Authorize(Roles = "patient")]
        [Authorize]
        public async Task<ActionResult<TreatmentRecordGetDto>> GetTreatmentRecord(int id)
        {
            var treatmentRecord = await _context.TreatmentRecords
                .Include(tr => tr.Patient)
                .Include(tr => tr.Doctor)
                .FirstOrDefaultAsync(tr => tr.TreatmentRecordID == id);

            if (treatmentRecord == null)
            {
                return NotFound();
            }

            var treatmentRecordGetDto = new TreatmentRecordGetDto
            {
                TreatmentRecordID = treatmentRecord.TreatmentRecordID,
                PatientName = treatmentRecord.Patient.FirstName + " " + treatmentRecord.Patient.LastName,
                DoctorName = treatmentRecord.Doctor.Name,
                TreatmentDate = treatmentRecord.TreatmentDate,
                Description = treatmentRecord.Description,
                IsVisibleToPatient = treatmentRecord.IsVisibleToPatient,
                CreatedAt = treatmentRecord.CreatedAt,
                UpdatedAt = treatmentRecord.UpdatedAt
            };

            return Ok(treatmentRecordGetDto);
        }

        // GET: api/treatmentrecords/patient/{patientId}/paid
        

        // GET: api/treatmentrecords/appointment/{appointmentId}
        [HttpGet("appointment/{appointmentId}")]
        [Authorize]
        public async Task<ActionResult<TreatmentRecordGetDto>> GetTreatmentRecordByAppointmentId(int appointmentId)
        {
            var treatmentRecord = await _context.TreatmentRecords
                .Include(tr => tr.Patient)
                .Include(tr => tr.Doctor)
                .FirstOrDefaultAsync(tr => tr.AppointmentID == appointmentId);

            if (treatmentRecord == null)
            {
                return NotFound(new { message = "No treatment record found for this appointment." });
            }

            var treatmentRecordDto = new TreatmentRecordGetDto
            {
                TreatmentRecordID = treatmentRecord.TreatmentRecordID,
                PatientName = treatmentRecord.Patient.FirstName + " " + treatmentRecord.Patient.LastName,
                DoctorName = treatmentRecord.Doctor.Name,
                TreatmentDate = treatmentRecord.TreatmentDate,
                Description = treatmentRecord.Description,
                IsVisibleToPatient = treatmentRecord.IsVisibleToPatient,
                CreatedAt = treatmentRecord.CreatedAt,
                UpdatedAt = treatmentRecord.UpdatedAt
            };

            return Ok(treatmentRecordDto);
        }

        [HttpPut("{id}/visibility")]
        [Authorize]
        public async Task<IActionResult> UpdateVisibility(int id, [FromBody] VisibilityUpdateDto model)
        {
            var record = await _context.TreatmentRecords.FindAsync(id);
            if (record == null)
            {
                return NotFound("Treatment record not found.");
            }

            record.IsVisibleToPatient = model.IsVisibleToPatient;
            record.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Visibility updated successfully." });
        }

        
        [HttpGet("patient/{patientId}/visible")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<TreatmentRecordGetDto>>> GetVisibleTreatmentRecordsForPatient(int patientId)
        {
            var visibleTreatments = await _context.TreatmentRecords
                .Include(tr => tr.Patient)
                .Include(tr => tr.Doctor)
                .Where(tr => tr.PatientID == patientId && tr.IsVisibleToPatient)
                .ToListAsync();

            if (!visibleTreatments.Any())
            {
                return NotFound(new { message = "No visible treatment records found for this patient." });
            }

            var treatmentRecordDtos = visibleTreatments.Select(tr => new TreatmentRecordGetDto
            {
                TreatmentRecordID = tr.TreatmentRecordID,
                PatientName = tr.Patient.FirstName + " " + tr.Patient.LastName,
                DoctorName = tr.Doctor.Name,
                TreatmentDate = tr.TreatmentDate,
                Description = tr.Description,
                AppointmentID = tr.AppointmentID,
                IsVisibleToPatient = tr.IsVisibleToPatient,
                CreatedAt = tr.CreatedAt,
                UpdatedAt = tr.UpdatedAt
            }).ToList();

            return Ok(treatmentRecordDtos);
        }


        public class VisibilityUpdateDto
        {
            public bool IsVisibleToPatient { get; set; }
        }
    }
}
