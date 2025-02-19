using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MultiHospital.Migrations
{
    /// <inheritdoc />
    public partial class ImageAddedInDoctorTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<byte[]>(
                name: "Image",
                table: "Doctors",
                type: "varbinary(max)",
                maxLength: 5000000,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Image",
                table: "Doctors");
        }
    }
}
