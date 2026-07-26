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

        window.latestScan = data;

        // ===== AI Confidence Gauge =====

let confidence = data["Confidence"];

document.getElementById("confidenceValue").innerHTML = confidence + "%";

const circle = document.getElementById("progressCircle");

const radius = 65;

const circumference = 2 * Math.PI * radius;

const offset = circumference - (confidence / 100) * circumference;

circle.style.strokeDashoffset = offset;

if(confidence >= 80){

    circle.style.stroke = "#4caf50";

}
else if(confidence >= 50){

    circle.style.stroke = "#ff9800";

}
else{

    circle.style.stroke = "#d50000";

}

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

    // ===== Statistics Dashboard =====

document.getElementById("totalScans").innerHTML = history.length;

let scamCount = history.filter(item =>
    item.result.toLowerCase().includes("scam")
).length;

let safeCount = history.length - scamCount;

document.getElementById("scamCount").innerHTML = scamCount;

document.getElementById("safeCount").innerHTML = safeCount;

}

function clearHistory() {

    localStorage.removeItem("scanHistory");

    document.getElementById("history").innerHTML = "";

    document.getElementById("totalScans").innerHTML = "0";
    document.getElementById("scamCount").innerHTML = "0";
    document.getElementById("safeCount").innerHTML = "0";

}

function clearForm() {

    document.getElementById("message").value = "";

    document.getElementById("result").innerHTML = "";

    document.getElementById("riskBar").style.width = "0%";

    document.getElementById("riskBar").style.background = "#43a047";

    document.getElementById("riskText").innerHTML = "0%";

    document.getElementById("confidenceValue").innerHTML = "0%";

const circle = document.getElementById("progressCircle");

circle.style.strokeDashoffset = 408;

circle.style.stroke = "#4caf50";

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

async function downloadPDF(){

    if(!window.latestScan){
        alert("Please scan a message first.");
        return;
    }

    const { jsPDF } = window.jspdf;

    const doc = new jsPDF();

    const data = window.latestScan;

    let y = 20;

    doc.setFont("helvetica","bold");
    doc.setFontSize(20);
    doc.text("SurakshaAI Report",20,y);

    y += 10;

    doc.setLineWidth(0.5);
    doc.line(20,y,190,y);

    y += 10;

    doc.setFontSize(11);
    doc.setFont("helvetica","normal");

    doc.text("Generated: " + new Date().toLocaleString(),20,y);

    y += 12;

    // Message

    doc.setFont("helvetica","bold");
    doc.text("Scanned Message:",20,y);

    y += 8;

    doc.setFont("helvetica","normal");

    let message = document.getElementById("message").value;

    message = message.replace(/[^\x20-\x7E\n]/g, "");

    let msgLines = doc.splitTextToSize(message,160);

    doc.text(msgLines,20,y);

    y += msgLines.length*7+10;

    // Prediction

    doc.setFont("helvetica","bold");
    doc.text("AI Prediction:",20,y);

    doc.setFont("helvetica","normal");
    doc.text(data["AI Prediction"],70,y);

    y += 10;

    // Confidence

    doc.setFont("helvetica","bold");
    doc.text("Confidence:",20,y);

    doc.setFont("helvetica","normal");
    doc.text(data["Confidence"]+"%",70,y);

    y += 10;

    // Risk

    doc.setFont("helvetica","bold");
    doc.text("Risk Score:",20,y);

    doc.setFont("helvetica","normal");
    doc.text(data["Risk Score"]+"/100",70,y);

    y += 12;

    // Keywords

    doc.setFont("helvetica","bold");
    doc.text("Matched Keywords:",20,y);

    y += 8;

    doc.setFont("helvetica","normal");

    if(data["Matched Keywords"].length===0){

        doc.text("None",20,y);

        y+=10;

    }

    else{

        data["Matched Keywords"].forEach(word=>{

            doc.text("- "+word,25,y);

            y+=7;

        });

    }

    y+=5;

    // URLs

    doc.setFont("helvetica","bold");
    doc.text("Suspicious URLs:",20,y);

    y+=8;

    doc.setFont("helvetica","normal");

    if(data["Suspicious URLs"].length===0){

        doc.text("None",20,y);

        y+=10;

    }

    else{

        data["Suspicious URLs"].forEach(url=>{

            let lines = doc.splitTextToSize(url,160);

            doc.text(lines,25,y);

            y += lines.length*7;

        });

    }

    y+=8;

    // Safety Tips

    doc.setFont("helvetica","bold");
    doc.text("Safety Tips:",20,y);

    y+=8;

    doc.setFont("helvetica","normal");

    if(data["AI Prediction"]==="SCAM"){

        const tips=[

            "Never share your OTP or Bank PIN.",

            "Avoid clicking suspicious links.",

            "Verify using official bank website.",

            "Contact your bank immediately if unsure."

        ];

        tips.forEach(t=>{

            doc.text("- "+t,25,y);

            y+=7;

        });

    }

    else{

        doc.text("No major scam indicators detected.",25,y);

        y+=7;

        doc.text("Stay alert while sharing personal information.",25,y);

    }

    y+=15;

    doc.setLineWidth(0.5);

    doc.line(20,y,190,y);

    y+=8;

    doc.setFont("helvetica","italic");

    doc.text("Generated by SurakshaAI",20,y);

    doc.save("SurakshaAI_Report.pdf");

}