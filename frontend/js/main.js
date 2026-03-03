const BASE_URL = "http://127.0.0.1:5000";

// LOGIN
const loginForm = document.getElementById("loginForm");
if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        const response = await fetch(`${BASE_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (data.access_token) {
            localStorage.setItem("token", data.access_token);
            window.location.href = "dashboard.html";
        } else {
            document.getElementById("message").innerText = data.message;
        }
    });
}

// UPLOAD + MATCH
const uploadForm = document.getElementById("uploadForm");
if (uploadForm) {
    uploadForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        document.getElementById("loading").classList.remove("d-none");

        const file = document.getElementById("resumeFile").files[0];
        const jobDescription = document.getElementById("jobDescription").value;

        const formData = new FormData();
        formData.append("resume", file);
        formData.append("job_description", jobDescription);

        const response = await fetch(`${BASE_URL}/match`, {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("token")
            },
            body: formData
        });

        const data = await response.json();

        document.getElementById("loading").classList.add("d-none");
        document.getElementById("resultCard").classList.remove("d-none");

        document.getElementById("matchScore").innerText = data.score + "%";

        const skillsList = document.getElementById("missingSkills");
        skillsList.innerHTML = "";
        data.missing_skills.forEach(skill => {
            const li = document.createElement("li");
            li.innerText = skill;
            skillsList.appendChild(li);
        });
    });
}

// LOGOUT
function logout() {
    localStorage.removeItem("token");
    window.location.href = "login.html";
}