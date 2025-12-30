const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 4000;
const DATA_FILE = path.join(__dirname, "file.json");

function sendResponse(res, status, data) {
    res.writeHead(status, {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    });
    res.end(JSON.stringify(data));
}

const server = http.createServer((req, res) => {

    if (req.method === "OPTIONS") {
        sendResponse(res, 200, {});
        return;
    }

    if (req.method === "POST" && req.url === "/employees") {

        let body = "";

        req.on("data", chunk => {
            body += chunk.toString();
        });

        req.on("end", () => {
            try {
                const newEmployee = JSON.parse(body);

                // Read existing file.json with proper structure { "employee": [] }
                let jsonData = { employee: [] };
                if (fs.existsSync(DATA_FILE)) {
                    const fileContent = fs.readFileSync(DATA_FILE, "utf-8");
                    if (fileContent.trim()) {
                        jsonData = JSON.parse(fileContent);
                    }
                }

                // Ensure employee is an array
                if (!Array.isArray(jsonData.employee)) {
                    jsonData.employee = [];
                }

                // Add new employee
                jsonData.employee.push(newEmployee);

                // Write back to file.json
                fs.writeFileSync(DATA_FILE, JSON.stringify(jsonData, null, 2));

                sendResponse(res, 200, { message: "Employee saved successfully" });

            } catch (err) {
                console.error("Error saving employee:", err);
                sendResponse(res, 500, { error: "Failed to save employee: " + err.message });
            }
        });

        return;
    }

    sendResponse(res, 404, { message: "Route not found" });
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Ready to accept employee data...`);
});

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`\nError: Port ${PORT} is already in use.`);
        console.error(`Please stop the process using port ${PORT} or change the PORT in server.js\n`);
        process.exit(1);
    } else {
        console.error('Server error:', err);
        process.exit(1);
    }
});