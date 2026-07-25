async function checkScam() {

    const messageInput = document.getElementById("message").value;

    const resultDiv = document.getElementById("result");

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
        let risk = data["Risk Score"];

        document.getElementById("riskBar").style.width = risk + "%";

        document.getElementById("riskText").innerHTML = risk + "%";

        if(risk>=80){

        document.getElementById("riskBar").style.background="#d50000";

        }

        else if(risk>=50){

        document.getElementById("riskBar").style.background="#ff9800";

        }

        else{

        document.getElementById("riskBar").style.background="#4caf50";

        }

        resultDiv.innerHTML = `

<h2>${data.Result}</h2>

<p>🤖 <b>AI Prediction:</b> ${data["AI Prediction"]}</p>

<p>🎯 <b>Confidence:</b> ${data.Confidence}%</p>

<p>⚠ <b>Risk Score:</b> ${data["Risk Score"]}/100</p>

<hr>

<p><b>Matched Keywords</b></p>

<p>${data["Matched Keywords"].join(", ")}</p>

<hr>

<p><b>Suspicious URLs</b></p>

<p>${data["Suspicious URLs"].join("<br>")}</p>

<hr>

<h3>🧠 Why did AI flag this?</h3>

<ul id="reasons"></ul>

<hr>

<h3>🛡 Safety Tips</h3>

<div id="tips"></div>

`;

        const reasons = [];

        if (data["Matched Keywords"].length > 0) {
            reasons.push("✔ Scam-related keywords detected");
        }

        if (data["Suspicious URLs"].length > 0) {
            reasons.push("✔ Suspicious URL detected");
        }

        if (data["Risk Score"] >= 50) {
            reasons.push("✔ High risk score");
        }

        if (data["AI Prediction"] === "SCAM") {
            reasons.push("✔ AI classified this message as scam");
        }

        document.getElementById("reasons").innerHTML =
            reasons.map(r => `<li>${r}</li>`).join("");

            const tipsDiv = document.getElementById("tips");

if (data["AI Prediction"] === "SCAM") {

    tipsDiv.innerHTML = `
    <ul>
        <li>🚫 Never share your OTP or banking PIN.</li>
        <li>🔗 Avoid clicking suspicious links.</li>
        <li>🏦 Verify messages using the official bank website.</li>
        <li>📞 Contact your bank if you are unsure.</li>
    </ul>
    `;

} else {

    tipsDiv.innerHTML = `
    <p style="color:green;">
    ✅ No major scam indicators detected.<br>
    Stay alert while sharing personal information online.
    </p>
    `;

}

    }

    catch(error){

        resultDiv.innerHTML="❌ Backend Connection Failed";

        console.log(error);

    }

}

function clearForm(){

    document.getElementById("message").value = "";

    document.getElementById("result").innerHTML = "";

    document.getElementById("riskBar").style.width = "0%";

    document.getElementById("riskText").innerHTML = "0%";

    document.getElementById("riskBar").style.background = "#43a047";

}