$(document).ready(function() {

    $("#empForm").on("submit", function(e) {
        e.preventDefault();

        let name = $("#empName").val().trim();
        let gender = $("input[name='gender']:checked").val();
        let profileImg = $("input[name='profile']:checked").val();

        let departments = [];
        $("input[name='department']:checked").each(function() {
            departments.push($(this).val());
        });

        let salary = $("#salary").val();
        let day = $("#day").val();
        let month = $("#month").val();
        let year = $("#year").val();

        if (
            name === "" ||
            !gender ||
            !profileImg ||
            departments.length === 0 ||
            salary === "" ||
            day === "" ||
            month === "" ||
            year === ""
        ) {
            alert("Please fill all the fields");
            return;
        }

        let startDate = `${day} ${month} ${year}`;

        let deptHTML = "";
        departments.forEach(function(dep) {
            deptHTML += `<span class="badge">${dep}</span>`;
        });

        let newRow = `
      <tr>
        <td class="name">
          <img src="${profileImg}">
          ${name}
        </td>
        <td>${gender}</td>
        <td>${deptHTML}</td>
        <td>${salary}</td>
        <td>${startDate}</td>
        <td>🗑 ✏️</td>
      </tr>
    `;

        let employees = JSON.parse(localStorage.getItem("employees")) || [];
        employees.push(newRow);
        localStorage.setItem("employees", JSON.stringify(employees));

        // Also send structured data to backend to store in file.json (server.js)
        const employeeData = {
            name: name,
            gender: gender,
            profileImg: profileImg,
            departments: departments,
            salary: salary,
            startDate: startDate,
        };

        fetch("http://localhost:3000/employees", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(employeeData),
            })
            .catch(function(error) {
                console.error("Failed to save to file.json:", error);
            })
            .finally(function() {
                window.location.href = "index.html";
            });
    });

    if ($("#employeeTableBody").length) {
        let employees = JSON.parse(localStorage.getItem("employees")) || [];
        employees.forEach(function(row) {
            $("#employeeTableBody").append(row);
        });
    }

});