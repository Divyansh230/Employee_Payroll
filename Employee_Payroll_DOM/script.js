// Form submission handler (only for add_user.html)
const form = document.querySelector('#empForm form') || document.querySelector('#empForm');

if (form) {
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.querySelector('#empName').value.trim();
        const genderIn = document.querySelector('input[name="gender"]:checked');
        const gender = genderIn ? genderIn.value : '';
        const profileIn = document.querySelector('input[name="profile"]:checked');
        const profileImg = profileIn ? profileIn.value : '';
        const departmentNodes = document.querySelectorAll('input[name="department"]:checked');
        const departments = [...departmentNodes].map((dep) => dep.value);
        const salary = document.querySelector('#salary').value;
        const day = document.querySelector('#day').value;
        const month = document.querySelector('#month').value;
        const year = document.querySelector('#year').value;


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


        const startDate = `${day} ${month} ${year}`;

        let deptHTML = "";
        departments.forEach(function(dep) {
            deptHTML += `<span class="badge">${dep}</span>`;
        });

        // Format salary with currency symbol
        const formattedSalary = `₹ ${parseInt(salary).toLocaleString('en-IN')}`;

        let newRow = `
      <tr>
        <td class="name">
          <img src="${profileImg}">
          ${name}
        </td>
        <td>${gender}</td>
        <td>${deptHTML}</td>
        <td>${formattedSalary}</td>
        <td>${startDate}</td>
        <td>🗑 ✏️</td>
      </tr>
    `;

        let employees = JSON.parse(localStorage.getItem("employees")) || [];
        
        // Check if employee already exists by name
        const employeeExists = employees.some(emp => emp.includes(`<td class="name">\n          <img src="${profileImg}">\n          ${name}`));
        
        if (!employeeExists) {
            employees.push(newRow);
            localStorage.setItem("employees", JSON.stringify(employees));
        } else {
            alert("Employee already exists");
        }


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
}


// Function to render employees table
function renderEmployeesTable() {
    const table = document.querySelector('#employeeTableBody');

    if (table) {
        let employees = JSON.parse(localStorage.getItem("employees")) || [];

        // Clear existing rows and replace with localStorage data
        table.innerHTML = '';

        // Add all rows from localStorage
        employees.forEach(function(row) {
            table.innerHTML += row;
        });
    }
}


function renderEmployeesTable2(filterText = "") {
    const table = document.querySelector('#employeeTableBody');

    if (!table) return;

    let employees = JSON.parse(localStorage.getItem("employees")) || [];

    table.innerHTML = "";

    employees.forEach(function(row) {
        if (row.toLowerCase().includes(filterText.toLowerCase())) {
            table.insertAdjacentHTML("beforeend", row);
        }
    });
}


const searchInput = document.getElementById("searchInput");

if (searchInput) {
    searchInput.addEventListener("keyup", function() {
        const searchText = searchInput.value.trim();
        renderEmployeesTable2(searchText);
    });
}


// Run when DOM is loaded (for index.html)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderEmployeesTable);
} else {
    // DOM is already loaded
    renderEmployeesTable();
}