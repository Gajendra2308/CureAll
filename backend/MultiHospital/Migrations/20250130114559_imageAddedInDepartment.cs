using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MultiHospital.Migrations
{
    /// <inheritdoc />
    public partial class imageAddedInDepartment : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<byte[]>(
                name: "Image",
                table: "Departments",
                type: "varbinary(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Image",
                table: "Departments");
        }
    }
}
