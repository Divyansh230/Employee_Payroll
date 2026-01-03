//form Subission
const form = document.querySelector('#empForm');

if (form) {
    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const name = document.getElementById('empName').value.trim();
        const genderInput = document.querySelector('input[name="gender"]:checked');
        const profileInput = document.querySelector('input[name="profile"]:checked');
        const departmentInputs = document.querySelectorAll('input[name="department"]:checked');

        const gender = genderInput ? genderInput.value : "";
        const profileImg = profileInput ? profileInput.value : "";
        const departments = Array.from(departmentInputs).map(d => d.value);

        const salary = document.getElementById('salary').value;
        const day = document.getElementById('day').value;
        const month = document.getElementById('month').value;
        const year = document.getElementById('year').value;

        let isValid = true;

        // NAME
        if (name === '') {
            document.getElementById('name').style.display = 'block';
            document.getElementById('empName').classList.add('input-error');
            isValid = false;
        } else {
            document.getElementById('name').style.display = 'none';
            document.getElementById('empName').classList.remove('input-error');
        }

        // GENDER
        if (gender === '') {
            document.getElementById('gender').style.display = 'block';
            isValid = false;
        } else {
            document.getElementById('gender').style.display = 'none';
        }

        // PROFILE IMAGE
        if (profileImg === '') {
            document.getElementById('profile').style.display = 'block';
            isValid = false;
        } else {
            document.getElementById('profile').style.display = 'none';
        }

        // DEPARTMENT
        if (departments.length === 0) {
            document.getElementById('department').style.display = 'block';
            isValid = false;
        } else {
            document.getElementById('department').style.display = 'none';
        }

        // SALARY
        if (salary === '') {
            document.getElementById('salaryError').style.display = 'block';
            document.getElementById('salary').classList.add('input-error');
            isValid = false;
        } else {
            document.getElementById('salaryError').style.display = 'none';
            document.getElementById('salary').classList.remove('input-error');
        }

        // DATE
        if (day === '' || month === '' || year === '') {
            document.getElementById('join').style.display = 'block';
            document.getElementById('day').classList.add('input-error');
            document.getElementById('month').classList.add('input-error');
            document.getElementById('year').classList.add('input-error');
            isValid = false;
        } else {
            document.getElementById('join').style.display = 'none';
            document.getElementById('day').classList.remove('input-error');
            document.getElementById('month').classList.remove('input-error');
            document.getElementById('year').classList.remove('input-error');
        }

        // FINAL DECISION
        if (!isValid) {
            return; // ❗ ab sirf ek hi return
        }

        // ✅ All validations passed
        console.log("Form submitted successfully");


        // ✅ form valid hai
        console.log("Form submitted successfully");



        const startDate = `${day} ${month} ${year}`;
        const formattedSalary = `₹ ${parseInt(salary).toLocaleString('en-IN')}`;

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

        if (editIndex !== null) {
            employees[editIndex] = employeeRecord;

            fetch(`http://localhost:3000/employees/${employeeRecord.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(employeeRecord)
            }).catch(err => console.error(err));

            localStorage.removeItem("editIndex");
            localStorage.removeItem("editEmployee");

        } else {
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
            }).catch(err => console.error(err));
        }

        localStorage.setItem("employees", JSON.stringify(employees));
        window.location.href = "index.html";
    });
}




function renderEmployeesTable(filterText = "") {
    const table = document.getElementById("employeeTableBody");
    if (!table) return;

    let employees = JSON.parse(localStorage.getItem("employees")) || [];
    table.innerHTML = "";
    employees.reverse();
    employees.forEach((emp, index) => {

        if (
            filterText &&
            !emp.name.toLowerCase().includes(filterText.toLowerCase()) &&
            !emp.departments.some(dep => dep.toLowerCase().includes(filterText.toLowerCase()))
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
                <button class="delete-btn ">🗑</button>
                <button class="update-btn">✏️</button>
            </td>
        </tr>
        `;

        table.insertAdjacentHTML("beforeend", row);
    });
}


//Delete and Update functionality

document.addEventListener("click", function(e) {

    // DELETE
    if (e.target.closest(".delete-btn")) {
        const row = e.target.closest("tr");
        const index = row.dataset.index;

        if (confirm("Delete this employee?")) {
            let employees = JSON.parse(localStorage.getItem("employees")) || [];
            const emp = employees[index];

            employees.splice(index, 1);
            localStorage.setItem("employees", JSON.stringify(employees));

            fetch(`http://localhost:3000/employees/${emp.id}`, {
                method: "DELETE"
            }).catch(err => console.error(err));

            renderEmployeesTable();
        }
    }

    // UPDATE
    if (e.target.closest(".update-btn")) {
        const row = e.target.closest("tr");
        const index = row.dataset.index;

        let employees = JSON.parse(localStorage.getItem("employees")) || [];
        const emp = employees[index];

        localStorage.setItem("editEmployee", JSON.stringify(emp));
        localStorage.setItem("editIndex", index);

        window.location.href = "add_user.html";
    }
});


// Emplementing Search Functionality

const searchInput = document.getElementById("searchInput");
const icon = document.getElementById('icon');

if (icon) {
    icon.addEventListener('mouseover', function() {
        searchInput.style.display = 'inline';
    });

    icon.addEventListener('click', function() {
        searchInput.style.display = 'none';
    });
}

if (searchInput) {
    searchInput.addEventListener("keyup", function() {
        renderEmployeesTable(searchInput.value.trim());
    });
}


// Initial Render

document.addEventListener("DOMContentLoaded", function() {
    renderEmployeesTable();
});


// Fill form for update

const editData = JSON.parse(localStorage.getItem("editEmployee"));

if (editData && form) {
    document.getElementById("empName").value = editData.name;
    document.querySelector(`input[name="gender"][value="${editData.gender}"]`).checked = true;
    document.querySelector(`input[name="profile"][value="${editData.profileImg}"]`).checked = true;

    editData.departments.forEach(dep => {
        const cb = document.querySelector(`input[name="department"][value="${dep}"]`);
        if (cb) cb.checked = true;
    });

    document.getElementById("salary").value = editData.salary;
}