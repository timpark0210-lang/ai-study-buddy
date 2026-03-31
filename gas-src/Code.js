function doGet() {
    return HtmlService.createTemplateFromFile('Index')
        .evaluate()
        .setTitle('Kia Ora Tutor')
        .addMetaTag('viewport', 'width=device-width, initial-scale=1')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// ============================================
// AI Multi-Agent Logic
// ============================================
// ============================================
// Phase 7: Global Source Library
// Now handled entirely on the client-side via IndexedDB (localforage)
// Server-side Drive logic removed for privacy and isolation
// ============================================

/**
 * 프로젝트 설정(Script Properties)에서 Gemini 모델 버전을 관리합니다.
 * 하드코딩을 피하기 위해 Script Properties 수정을 권장하며, 없을 경우 기본값을 사용합니다.
 */
const CONFIG = {
    get FLASH_MODEL() { return (PropertiesService.getScriptProperties().getProperty("GEMINI_FLASH_MODEL") || "gemini-1.5-flash").trim(); },
    get PRO_MODEL() { return (PropertiesService.getScriptProperties().getProperty("GEMINI_PRO_MODEL") || "gemini-1.5-pro").trim(); },
    get PROJECT_ID() { return (PropertiesService.getScriptProperties().getProperty("GCP_PROJECT_ID") || "").trim(); },
    get LOCATION() { return (PropertiesService.getScriptProperties().getProperty("GCP_LOCATION") || "us-central1").trim(); }
};

// Fetch dashboard statistics (Mock User Data)
function getUserStats() {
    return {
        success: true,
        data: {
            username: "John & Josh",
            level: 5,
            title: "Explorer",
            xpEarned: 1250,
            activeQuest: "Biology",
            activeQuestTitle: "Exploring the Deep Sea",
            activeQuestDesc: "Dive down 2,000 meters to meet the giant squid and glowing jellyfish!",
            activeQuestProgress: 60,
            badges: [
                { icon: "auto_stories", color: "blue", name: "Star Reader" },
                { icon: "functions", color: "emerald", name: "Math Wizard" },
                { icon: "rocket_launch", color: "amber", name: "Space Cadet" }
            ]
        }
    };
}

function callGemini(modelName, systemInstruction, contents, expectJson = false) {
    const PROJECT_ID = CONFIG.PROJECT_ID;
    const LOCATION = CONFIG.LOCATION;
    modelName = (modelName || CONFIG.FLASH_MODEL).trim();

    if (!PROJECT_ID) {
        throw new Error("GCP_PROJECT_ID is not set in Script Properties.");
    }
    // LOCATION defaults to us-central1 if not set in CONFIG

    // Vertex AI v1 엔드포인트 URL
    var url = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/${modelName}:generateContent`;

    var payload = {
        contents: contents,
        systemInstruction: {
            parts: [{ text: systemInstruction }]
        },
        generationConfig: {
            temperature: 0.7
        }
    };

    if (expectJson) {
        payload.generationConfig.responseMimeType = "application/json";
    }

    var options = {
        method: 'post',
        contentType: 'application/json',
        headers: {
            "Authorization": "Bearer " + ScriptApp.getOAuthToken()
        },
        payload: JSON.stringify(payload),
        muteHttpExceptions: true
    };

    var response = UrlFetchApp.fetch(url, options);
    var responseText = response.getContentText();
    var jsonResponse;

    try {
        jsonResponse = JSON.parse(responseText);
    } catch (e) {
        throw new Error('API Response Parse Error. URL tried: ' + url + '\nHTTP Status: ' + response.getResponseCode() + '\nResponse: ' + responseText.substring(0, 500));
    }

    if (jsonResponse.error) {
        throw new Error('Vertex AI API Error (' + jsonResponse.error.code + '): ' + jsonResponse.error.message);
    }

    // Vertex AI 응답 구조 파싱
    var text = jsonResponse.candidates &&
        jsonResponse.candidates[0].content &&
        jsonResponse.candidates[0].content.parts &&
        jsonResponse.candidates[0].content.parts[0].text;

    return text || "";
}

// The main orchestration function called from the client
function processChatRequest(history, currentInput, files) {
    try {
        var flashModel = CONFIG.FLASH_MODEL;
        var proModel = CONFIG.PRO_MODEL || CONFIG.FLASH_MODEL;

        // --- Step 1 & 2: Integrated Vision & Strategy Analyst ---
        // We combine Vision and Strategist into one Flash call to save time/latency.
        var integratedInstruction = "You are a 'Master Learning Strategist & Vision Analyst' for an AI Study Buddy in New Zealand.\n" +
            "1. Analyze any attached files (text/math/images).\n" +
            "2. Decide how to guide the student towards the answer without giving it away (Socratic method).\n" +
            "3. Output ONLY a JSON object matching: {\"visionAnalysis\": \"...\", \"currentStage\": \"...\", \"nextQuestionPrompt\": \"...\", \"targetConcept\": \"...\"}";

        var integratedParts = [{ text: "Context: " + currentInput }];
        if (files && files.length > 0) {
            for (var i = 0; i < files.length; i++) {
                integratedParts.push({ inlineData: { mimeType: files[i].mimeType, data: files[i].data } });
            }
        }

        var integratedContent = [{ role: "user", parts: integratedParts }];
        var analystResponseText = callGemini(flashModel, integratedInstruction, integratedContent, true);
        var analysis = JSON.parse(analystResponseText);
        Logger.log("Integrated Analyst output: " + analystResponseText);

        // --- Step 3: Tutor Agent ---
        var tutorInstruction = "You are 'Kia Ora Tutor', a premium AI Study Buddy for NZ students.\n" +
            "1. NEVER give the direct answer.\n" +
            "2. Use Socratic method based on the provided instruction.\n" +
            "3. Use NZ English.\n" +
            "4. Always reply in English, even if the user asks in Korean.\n" +
            "5. Output clear Markdown with LaTeX.\n" +
            "6. Be encouraging.\n\n" +
            "[FILE ANALYSIS CONTEXT]\n" + (analysis.visionAnalysis || "No specific file context provided.");

        var tutorContents = [];
        if (history && history.length > 0) {
            tutorContents = history.map(function (msg) {
                return {
                    role: msg.role === 'assistant' ? 'model' : 'user',
                    parts: [{ text: msg.content }]
                };
            });
        }

        var finalPrompt = "[SYSTEM CONTEXT]\nThe Strategist Plan:\n- Concept: " + analysis.targetConcept + "\n- Stage: " + analysis.currentStage + "\n- Tutor Instruction: " + analysis.nextQuestionPrompt + "\n\n[USER INPUT]\n" + currentInput;

        tutorContents.push({
            role: "user",
            parts: [{ text: finalPrompt }]
        });

        var tutorText = callGemini(proModel, tutorInstruction, tutorContents);

        return {
            success: true,
            content: tutorText,
            metadata: { concept: analysis.targetConcept }
        };
    } catch (error) {
        Logger.log("processChatRequest Error: " + error.toString());
        return {
            success: false,
            error: error.toString()
        };
    }
}

// ============================================
// Phase 6: Study Mode (Master Teacher Agent)
// ============================================

function generateStudyGuide(currentInput, files, lang) {
    lang = lang || 'en'; // Default: English
    try {
        var visionAnalysis = "No image found.";

        // Step 1: Vision Analyst - Extract context
        if (files && files.length > 0) {
            var visionInstruction = "You are an expert Vision Analyst. Analyze the attached file(s) and extract all text, formulas, diagrams, and structural information. Do NOT try to solve it yet. Just transcribe and describe what you see.";
            var partsArray = [{ text: "Analyze these files and the user's optional note: " + currentInput }];

            for (var i = 0; i < files.length; i++) {
                partsArray.push({ inlineData: { mimeType: files[i].mimeType, data: files[i].data } });
            }

            var visionContent = [{
                role: "user",
                parts: partsArray
            }];
            var flashModel = CONFIG.FLASH_MODEL;
            visionAnalysis = callGemini(flashModel, visionInstruction, visionContent);
            Logger.log("StudyMode Vision Analyst output: " + visionAnalysis);
        }

        // Step 2: Master Teacher Agent - Generate Study Guide
        var langRule = lang === 'ko'
            ? "1. Output MUST be in Korean (한국어). Technical terms may stay in English.\n"
            : "1. Output MUST be in English. Use clear, academic yet student-friendly language.\n";

        var sectionLabels = lang === 'ko'
            ? "   - ## 📌 핵심 개념 정리\n   - ## 🛠️ 풀이 방법 및 접근법\n   - ## 🔍 상세 예시 및 해설\n   - ## 💡 실전 꿀팁\n"
            : "   - ## 📌 Core Concepts\n   - ## 🛠️ Step-by-step Methodology\n   - ## 🔍 Examples & Deep Dive\n   - ## 💡 Pro Tips & Gotchas\n";

        var teacherInstruction = "You are a 'Master Teacher' with 20 years of experience at a top-tier academy.\n" +
            "Your job is to provide the HIGHEST LEVEL self-study material (Study Guide).\n" +
            langRule +
            "2. Determine the core learning topic from the provided context.\n" +
            "3. Structure your response with clear visible sections using headers:\n" +
            sectionLabels +
            "4. Use horizontal rules (---) between sections for visual separation.\n" +
            "5. Use LaTeX for all math equations ($ for inline, $$ for block).\n" +
            "6. Use tables, bullet lists, and numbered steps liberally for clarity.\n" +
            "7. Be deeply encouraging and highly professional.";

        var teacherPrompt = "[Material Analysis]\n" + visionAnalysis + "\n\n[User Note]\n" + currentInput;
        var teacherContent = [{
            role: "user",
            parts: [{ text: teacherPrompt }]
        }];

        var proModel = CONFIG.PRO_MODEL || CONFIG.FLASH_MODEL;
        var studyGuideText = callGemini(proModel, teacherInstruction, teacherContent);

        return {
            success: true,
            content: studyGuideText
        };
    } catch (error) {
        Logger.log("generateStudyGuide Error: " + error.toString());
        return {
            success: false,
            error: error.toString()
        };
    }
}
// ============================================
// Phase 8: Adaptive Quiz Engine (Master Teacher Agent)
// ============================================

function generateQuiz(files, lang) {
    lang = lang || 'en';
    try {
        var visionAnalysis = "No image found.";

        if (files && files.length > 0) {
            var visionInstruction = "You are an expert Vision Analyst. Extract text, diagrams, formulas, and all concepts from the attached file(s).";
            var partsArray = [{ text: "Analyze these files:" }];

            for (var i = 0; i < files.length; i++) {
                partsArray.push({ inlineData: { mimeType: files[i].mimeType, data: files[i].data } });
            }

            var visionContent = [{
                role: "user",
                parts: partsArray
            }];
            var flashModel = CONFIG.FLASH_MODEL;
            visionAnalysis = callGemini(flashModel, visionInstruction, visionContent);
        }

        var langRule = lang === 'ko' ? "Output MUST be in Korean (한국어)." : "Output MUST be in English.";
        var quizInstruction = "You are an expert educational assessment creator. Generate exactly 5 multiple-choice questions based on the provided material.\n" +
            langRule + "\n" +
            "The output MUST be a strict JSON array of objects. Do not wrap in markdown blocks.\n" +
            "JSON Format per object: {\"question\": \"Question text\", \"options\": [\"Option A\", \"Option B\", \"Option C\", \"Option D\"], \"correctIndex\": 0-3, \"explanation\": \"Why it is correct\"}";

        var quizPrompt = "[Material Analysis]\n" + visionAnalysis;
        var quizContent = [{ role: "user", parts: [{ text: quizPrompt }] }];

        var flashModel = CONFIG.FLASH_MODEL;
        var quizJsonText = callGemini(flashModel, quizInstruction, quizContent, true);
        return { success: true, content: quizJsonText };

    } catch (error) {
        Logger.log("generateQuiz Error: " + error.toString());
        return { success: false, error: error.toString() };
    }
}
