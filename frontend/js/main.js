// API Base URL
const BASE_URL = "http://127.0.0.1:5000";

// --- LOGIN ---
const loginForm = document.getElementById("loginForm");
if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const btn = loginForm.querySelector('button[type="submit"]');
        const originalText = btn.innerText;
        btn.innerText = "Logging in...";
        btn.disabled = true;

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const msgEl = document.getElementById("message");

        try {
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
                msgEl.innerText = data.message || "Login failed. Please check your credentials.";
            }
        } catch (error) {
            msgEl.innerText = "Error connecting to server. Is the backend running?";
            console.error(error);
        } finally {
            btn.innerText = originalText;
            btn.disabled = false;
        }
    });
}

// --- REGISTER ---
const registerForm = document.getElementById("registerForm");
if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const btn = registerForm.querySelector('button[type="submit"]');
        const originalText = btn.innerText;
        btn.innerText = "Creating Account...";
        btn.disabled = true;

        const name = document.getElementById("name").value;
        const email = document.getElementById("regEmail").value;
        const password = document.getElementById("regPassword").value;
        const msgEl = document.getElementById("regMessage");

        try {
            const response = await fetch(`${BASE_URL}/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password })
            });

            const data = await response.json();

            // Typically 201 Created or success message
            if (response.ok) {
                msgEl.classList.remove("text-danger");
                msgEl.classList.add("text-success");
                msgEl.innerText = "Registration successful! Redirecting to login...";
                setTimeout(() => {
                    window.location.href = "login.html";
                }, 2000);
            } else {
                msgEl.classList.remove("text-success");
                msgEl.classList.add("text-danger");
                msgEl.innerText = data.message || "Registration failed. Email might be in use.";
            }
        } catch (error) {
            msgEl.classList.remove("text-success");
            msgEl.classList.add("text-danger");
            msgEl.innerText = "Error connecting to server. Is the backend running?";
            console.error(error);
        } finally {
            if (btn) {
                btn.innerText = originalText;
                btn.disabled = false;
            }
        }
    });
}


// --- UPLOAD + MATCH ---
const uploadForm = document.getElementById("uploadForm");
if (uploadForm) {
    uploadForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        // UI Reset
        document.getElementById("loading").classList.remove("d-none");
        document.getElementById("resultCard").classList.add("d-none");
        const btn = uploadForm.querySelector('button[type="submit"]');
        btn.disabled = true;

        const file = document.getElementById("resumeFile").files[0];
        const jobDescription = document.getElementById("jobDescription").value;

        const formData = new FormData();
        formData.append("resume", file);
        formData.append("job_description", jobDescription);

        try {
            const response = await fetch(`${BASE_URL}/match`, {
                method: "POST",
                headers: {
                    "Authorization": "Bearer " + localStorage.getItem("token")
                },
                body: formData
            });

            if (response.status === 401) {
                alert("Session expired. Please log in again.");
                logout();
                return;
            }

            const data = await response.json();

            // Show results
            document.getElementById("resultCard").classList.remove("d-none");
            document.getElementById("matchScore").innerText = (data.score || 0) + "%";

            const skillsList = document.getElementById("missingSkills");
            skillsList.innerHTML = "";
            
            if (data.missing_skills && data.missing_skills.length > 0) {
                data.missing_skills.forEach(skill => {
                    const li = document.createElement("li");
                    li.innerText = skill;
                    skillsList.appendChild(li);
                });
            } else {
                const li = document.createElement("li");
                li.innerText = "None! Looks like a great match.";
                li.style.background = "rgba(16, 185, 129, 0.1)"; // Emerald
                li.style.color = "#34d399";
                li.style.borderColor = "rgba(16, 185, 129, 0.2)";
                skillsList.appendChild(li);
            }

        } catch (error) {
            alert("Failed to analyze resume. Make sure the server is running.");
            console.error(error);
        } finally {
            document.getElementById("loading").classList.add("d-none");
            btn.disabled = false;
        }
    });
}

// --- LOGOUT ---
function logout() {
    localStorage.removeItem("token");
    window.location.href = "login.html";
}