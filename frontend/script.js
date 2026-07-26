window.onload = function () {

    loadHistory();

    const savedTheme = localStorage.getItem("theme");

    if (savedTheme === "dark") {

        document.body.classList.add("dark");

        document.getElementById("themeBtn").innerHTML = "☀ Light Mode";

    }

};

async function checkScam() {

    const messageInput = document.getElementById("message").value.trim();

    const resultDiv = document.getElementById("result");

    if (messageInput === "") {

        resultDiv.innerHTML = `
            <h3 style="color:red;">
                ⚠ Please enter a message first.
            </h3>
        `;

        return;

    }

    resultDiv.innerHTML = "⏳ Checking...";

    try {

        const response = await fetch("http://127.0.0.1:8000/detect", {

            method: "POST",

            headers: {

                "Content-Type": "application/json"

            },

            body: JSON.stringify({

                text: messageInput

            })

        });

        const data = await response.json();

        updateRiskMeter(data["Risk Score"]);

        resultDiv.innerHTML = `

<h2>${data.Result}</h2>

<p>🤖 <b>AI Prediction:</b> ${data["AI Prediction"]}</p>

<p>🎯 <b>Confidence:</b> ${data.Confidence}%</p>

<p>⚠ <b>Risk Score:</b> ${data["Risk Score"]}/100</p>

<hr>

<p><b>Matched Keywords</b></p>

<p>${data["Matched Keywords"].join(", ") || "None"}</p>

<hr>

<p><b>Suspicious URLs</b></p>

<p>${data["Suspicious URLs"].join("<br>") || "None"}</p>

<hr>

<h3>🧠 Why did AI flag this?</h3>

<ul id="reasons"></ul>

<hr>

<h3>🛡 Safety Tips</h3>

<div id="tips"></div>

`;


        const reasons = [];

        if (data["Matched Keywords"].length > 0)
            reasons.push("✔ Scam-related keywords detected");

        if (data["Suspicious URLs"].length > 0)
            reasons.push("✔ Suspicious URL detected");

        if (data["Risk Score"] >= 50)
            reasons.push("✔ High risk score");

        if (data["AI Prediction"] === "SCAM")
            reasons.push("✔ AI classified this message as scam");

        document.getElementById("reasons").innerHTML =
            reasons.map(item => `<li>${item}</li>`).join("");


        const tipsDiv = document.getElementById("tips");

        if (data["AI Prediction"] === "SCAM") {

            tipsDiv.innerHTML = `

<ul>

<li>🚫 Never share OTP or Banking PIN.</li>

<li>🔗 Don't click suspicious links.</li>

<li>🏦 Verify using official bank website.</li>

<li>📞 Contact your bank immediately if unsure.</li>

</ul>

`;

        }

        else {

            tipsDiv.innerHTML = `

<p style="color:green;">

✅ No major scam indicators detected.

<br>

Stay alert while sharing personal information.

</p>

`;

        }

        saveHistory(data);

    }

    catch (error) {

        resultDiv.innerHTML = `

<h3 style="color:red;">

❌ Backend Connection Failed

</h3>

`;

        console.log(error);

    }

}

function updateRiskMeter(risk) {

    const riskBar = document.getElementById("riskBar");
    const riskText = document.getElementById("riskText");

    riskBar.style.width = risk + "%";
    riskText.innerHTML = risk + "%";

    if (risk >= 80) {

        riskBar.style.background = "#d50000";

    }

    else if (risk >= 50) {

        riskBar.style.background = "#ff9800";

    }

    else {

        riskBar.style.background = "#43a047";

    }

}

function saveHistory(data) {

    let history = JSON.parse(localStorage.getItem("scanHistory")) || [];

    history.unshift({

        result: data.Result,
        confidence: data.Confidence,
        risk: data["Risk Score"],
        time: new Date().toLocaleTimeString()

    });

    history = history.slice(0, 5);

    localStorage.setItem("scanHistory", JSON.stringify(history));

    loadHistory();

}

function loadHistory() {

    let history = JSON.parse(localStorage.getItem("scanHistory")) || [];

    let historyHTML = "";

    history.forEach(item => {

        historyHTML += `

<div class="history-item">

<h3>${item.result}</h3>

<p>🎯 Confidence: ${item.confidence}%</p>

<p>⚠ Risk: ${item.risk}%</p>

<p>🕒 ${item.time}</p>

</div>

`;

    });

    document.getElementById("history").innerHTML = historyHTML;

}

function clearHistory() {

    localStorage.removeItem("scanHistory");

    document.getElementById("history").innerHTML = "";

}

function clearForm() {

    document.getElementById("message").value = "";

    document.getElementById("result").innerHTML = "";

    document.getElementById("riskBar").style.width = "0%";

    document.getElementById("riskBar").style.background = "#43a047";

    document.getElementById("riskText").innerHTML = "0%";

}

function toggleTheme() {

    document.body.classList.toggle("dark");

    const btn = document.getElementById("themeBtn");

    if (document.body.classList.contains("dark")) {

        btn.innerHTML = "☀ Light Mode";

        localStorage.setItem("theme", "dark");

    }

    else {

        btn.innerHTML = "🌙 Dark Mode";

        localStorage.setItem("theme", "light");

    }

}