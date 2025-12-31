$(document).ready(function() {

    const $form = $("#empForm");

    //Adding and Updating Employee

    if ($form.length) {
        $form.on("submit", function(e) {
            e.preventDefault();

            const name = $("#empName").val().trim();
            const gender = $('input[name="gender"]:checked').val() || "";
            const profileImg = $('input[name="profile"]:checked').val() || "";
            const departments = $('input[name="department"]:checked')
                .map(function() { return this.value; })
                .get();

            const salary = $("#salary").val();
            const day = $("#day").val();
            const month = $("#month").val();
            const year = $("#year").val();

            // ---------- Validation ----------
            if (name === "") { $("#name").show(); return; }
            if (gender === "") { $("#gender").show(); return; }
            if (profileImg === "") { $("#profile").show(); return; }
            if (departments.length === 0) { $("#department").show(); return; }
            if (salary === "") { $("#salary").show(); return; }
            if (day === "" || month === "" || year === "") { $("#join").show(); return; }

            const startDate = `${day} ${month} ${year}`;
            const formattedSalary = `₹ ${parseInt(salary).toLocaleString("en-IN")}`;

            let employees = JSON.parse(localStorage.getItem("employees")) || [];
            const editIndex = localStorage.getItem("editIndex");

            const employeeRecord = {
                id: editIndex !== null ? employees[editIndex].id : Date.now(),
                name,
                gender,
                profileImg,
                departments,
                salary,
                formattedSalary,
                startDate
            };

            // ---------- UPDATE ----------
            if (editIndex !== null) {

                employees[editIndex] = employeeRecord;

                fetch(`http://localhost:3000/employees/${employeeRecord.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(employeeRecord)
                }).catch(console.error);

                localStorage.removeItem("editIndex");
                localStorage.removeItem("editEmployee");

            }
            // ---------- ADD ----------
            else {
                const exists = employees.some(emp =>
                    emp.name === name && emp.profileImg === profileImg
                );

                if (exists) {
                    alert("Employee already exists");
                    return;
                }

                employees.push(employeeRecord);

                fetch("http://localhost:3000/employees", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(employeeRecord)
                }).catch(console.error);
            }

            localStorage.setItem("employees", JSON.stringify(employees));
            window.location.href = "index.html";
        });
    }

    /* ==========================
       RENDER EMPLOYEE TABLE
    ========================== */

    function renderEmployeesTable(filterText = "") {
        const $table = $("#employeeTableBody");
        if (!$table.length) return;

        let employees = JSON.parse(localStorage.getItem("employees")) || [];
        $table.empty();

        employees.reverse().forEach((emp, index) => {

            if (
                filterText &&
                !emp.name.toLowerCase().includes(filterText.toLowerCase()) &&
                !emp.departments.some(dep =>
                    dep.toLowerCase().includes(filterText.toLowerCase()))
            ) return;

            const deptHTML = emp.departments
                .map(dep => `<span class="badge">${dep}</span>`)
                .join("");

            const row = `
                <tr data-index="${index}">
                    <td class="name">
                        <img src="${emp.profileImg}">
                        ${emp.name}
                    </td>
                    <td>${emp.gender}</td>
                    <td>${deptHTML}</td>
                    <td>${emp.formattedSalary}</td>
                    <td>${emp.startDate}</td>
                    <td>
                        <button class="delete-btn">🗑</button>
                        <button class="update-btn">✏️</button>
                    </td>
                </tr>
            `;

            $table.append(row);
        });
    }

    /* ==========================
       DELETE EMPLOYEE
    ========================== */

    $(document).on("click", ".delete-btn", function() {
        const index = $(this).closest("tr").data("index");

        if (confirm("Delete this employee?")) {
            let employees = JSON.parse(localStorage.getItem("employees")) || [];
            const emp = employees[index];

            employees.splice(index, 1);
            localStorage.setItem("employees", JSON.stringify(employees));

            fetch(`http://localhost:3000/employees/${emp.id}`, {
                method: "DELETE"
            }).catch(console.error);

            renderEmployeesTable();
        }
    });

    /* ==========================
       UPDATE EMPLOYEE
    ========================== */

    $(document).on("click", ".update-btn", function() {
        const index = $(this).closest("tr").data("index");
        let employees = JSON.parse(localStorage.getItem("employees")) || [];

        localStorage.setItem("editEmployee", JSON.stringify(employees[index]));
        localStorage.setItem("editIndex", index);

        window.location.href = "add_user.html";
    });

    /* ==========================
       SEARCH
    ========================== */

    $("#searchInput").on("keyup", function() {
        renderEmployeesTable($(this).val().trim());
    });

    /* ==========================
       INITIAL RENDER
    ========================== */

    renderEmployeesTable();

    /* ==========================
       FILL FORM FOR UPDATE
    ========================== */

    const editData = JSON.parse(localStorage.getItem("editEmployee"));

    if (editData && $form.length) {
        $("#empName").val(editData.name);
        $(`input[name="gender"][value="${editData.gender}"]`).prop("checked", true);
        $(`input[name="profile"][value="${editData.profileImg}"]`).prop("checked", true);

        editData.departments.forEach(dep => {
            $(`input[name="department"][value="${dep}"]`).prop("checked", true);
        });

        $("#salary").val(editData.salary);
    }

});