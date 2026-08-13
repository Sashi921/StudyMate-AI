// =========================================================
// STUDYMATE AI - SCRIPT
// =========================================================

const featureCards = document.querySelectorAll(".feature-card");

const content = document.getElementById("content");
const generateBtn = document.getElementById("generateBtn");
const buttonText = document.getElementById("buttonText");

const inputTitle = document.getElementById("inputTitle");
const inputDescription = document.getElementById("inputDescription");
const charCount = document.getElementById("charCount");

const loading = document.getElementById("loading");

const errorBox = document.getElementById("error");
const errorText = document.getElementById("errorText");

const resultArea = document.getElementById("result");
const emptyResult = document.getElementById("emptyResult");

const copyBtn = document.getElementById("copyBtn");


// =========================================================
// CURRENT FEATURE
// =========================================================

let selectedFeature = "summary";


// =========================================================
// FEATURE CONFIGURATION
// =========================================================

const featureConfig = {
    summary: {
        title: '<span>▤</span> Enter Your Notes',
        description:
            "Paste your study notes below and AI will create a concise summary.",
        placeholder:
            "Paste your notes here...",
        button:
            "Generate Summary"
    },

    quiz: {
        title: '<span>?</span> Enter Study Material',
        description:
            "Paste your study material below and AI will create a short quiz.",
        placeholder:
            "Paste your study material here...",
        button:
            "Generate Quiz"
    },

    improve: {
        title: '<span>✎</span> Enter Your Answer',
        description:
            "Paste your answer below and AI will improve grammar and clarity.",
        placeholder:
            "Paste your answer here...",
        button:
            "Improve Answer"
    },

    explain: {
        title: '<span>▤</span> Enter a Concept',
        description:
            "Enter a topic below and AI will explain it in simple language.",
        placeholder:
            "Example: Database Normalization",
        button:
            "Explain Concept"
    }
};


// =========================================================
// FEATURE CARD CLICK
// =========================================================

featureCards.forEach(function (card) {

    card.addEventListener("click", function () {

        featureCards.forEach(function (item) {
            item.classList.remove("active");
        });

        card.classList.add("active");

        selectedFeature = card.dataset.feature;

        updateFeatureUI();

        hideError();

        resetResult();
    });

});


// =========================================================
// UPDATE FEATURE UI
// =========================================================

function updateFeatureUI() {

    const config = featureConfig[selectedFeature];

    if (!config) {
        return;
    }

    inputTitle.innerHTML = config.title;

    inputDescription.textContent =
        config.description;

    content.placeholder =
        config.placeholder;

    buttonText.textContent =
        config.button;

    content.value = "";

    updateCharacterCount();
}


// =========================================================
// CHARACTER COUNT
// =========================================================

content.addEventListener(
    "input",
    updateCharacterCount
);


function updateCharacterCount() {

    charCount.textContent =
        content.value.length + " / 12000";
}


// =========================================================
// GENERATE BUTTON
// =========================================================

generateBtn.addEventListener(
    "click",
    generateAI
);


// =========================================================
// GENERATE AI
// =========================================================

async function generateAI() {

    const text =
        content.value.trim();

    // Empty input
    if (!text) {

        showError(
            "Please enter some content first."
        );

        content.focus();

        return;
    }


    // Maximum input
    if (text.length > 12000) {

        showError(
            "Content cannot exceed 12,000 characters."
        );

        return;
    }


    hideError();

    showLoading();

    generateBtn.disabled = true;


    try {

        const response = await fetch(
            "/generate",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    feature: selectedFeature,
                    content: text
                })
            }
        );


        const data =
            await response.json();


        if (!response.ok || !data.success) {

            throw new Error(
                data.error ||
                "Unable to generate AI response."
            );
        }


        displayResult(data.result);

    }

    catch (error) {

        console.error(
            "StudyMate AI Error:",
            error
        );

        showError(
            error.message ||
            "Something went wrong. Please try again."
        );

    }

    finally {

        hideLoading();

        generateBtn.disabled = false;
    }
}


// =========================================================
// DISPLAY RESULT
// =========================================================

function displayResult(text) {

    emptyResult.classList.add("hidden");


    let resultText =
        document.querySelector(".result-text");


    if (!resultText) {

        resultText =
            document.createElement("div");

        resultText.className =
            "result-text";

        resultArea.appendChild(
            resultText
        );
    }


    resultText.textContent = text;


    resultArea.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


// =========================================================
// RESET RESULT
// =========================================================

function resetResult() {

    const resultText =
        document.querySelector(".result-text");


    if (resultText) {
        resultText.remove();
    }


    emptyResult.classList.remove(
        "hidden"
    );
}


// =========================================================
// LOADING
// =========================================================

function showLoading() {

    loading.classList.remove(
        "hidden"
    );
}


function hideLoading() {

    loading.classList.add(
        "hidden"
    );
}


// =========================================================
// ERROR
// =========================================================

function showError(message) {

    errorText.textContent =
        message;

    errorBox.classList.remove(
        "hidden"
    );
}


function hideError() {

    errorBox.classList.add(
        "hidden"
    );
}


// =========================================================
// COPY RESULT
// =========================================================

copyBtn.addEventListener(
    "click",
    async function () {

        const resultText =
            document.querySelector(
                ".result-text"
            );


        if (
            !resultText ||
            !resultText.textContent.trim()
        ) {

            showError(
                "There is no AI result to copy yet."
            );

            return;
        }


        try {

            await navigator.clipboard.writeText(
                resultText.textContent
            );


            copyBtn.innerHTML =
                "<span>✓</span> Copied";


            setTimeout(function () {

                copyBtn.innerHTML =
                    "<span>▣</span> Copy Result";

            }, 1500);

        }

        catch (error) {

            console.error(
                "Copy error:",
                error
            );

            showError(
                "Unable to copy the result."
            );
        }

    }
);


// =========================================================
// INITIALIZE
// =========================================================

updateFeatureUI();

updateCharacterCount();