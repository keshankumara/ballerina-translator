import ballerina/http;
import ballerina/log;

// ----------------------------
// Gemini API Service Module
// ----------------------------

# Translate text using Gemini API
#
# + text - Text to translate
# + sourceLang - Source language code
# + targetLang - Target language code
# + apiKey - Gemini API key
# + return - Translation result or error
public function translateText(string text, string sourceLang, string targetLang, string apiKey) returns string|error {
    http:Client httpClient = check new ("https://generativelanguage.googleapis.com", {timeout: 30});
    
    string prompt = string `Translate the following text from ${sourceLang} to ${targetLang}. Return only the translation without any explanation: "${text}"`;

    json payload = {
        "contents": [{
            "parts": [{"text": prompt}]
        }]
    };

    map<string> headers = {
        "Content-Type": "application/json",
        "X-goog-api-key": apiKey
    };

    json rawResponse = check httpClient->post(
        "/v1beta/models/gemini-2.0-flash:generateContent",
        payload,
        headers
    );

    log:printInfo("Gemini text API response received");
    return extractTextFromResponse(rawResponse);
}

# Extract text from images using Gemini Vision API
#
# + base64Image - Base64 encoded image data
# + apiKey - Gemini API key
# + return - Extracted text or error
public function extractTextFromImage(string base64Image, string apiKey) returns string|error {
    http:Client httpClient = check new ("https://generativelanguage.googleapis.com", {timeout: 30});
    
    string mimeType = detectMimeType(base64Image);
    
    json payload = {
        "contents": [{
            "parts": [
                {
                    "text": "Extract all text from this image. Return only the extracted text without any explanation."
                },
                {
                    "inline_data": {
                        "mime_type": mimeType,
                        "data": base64Image
                    }
                }
            ]
        }]
    };

    map<string> headers = {
        "Content-Type": "application/json",
        "X-goog-api-key": apiKey
    };

    json rawResponse = check httpClient->post(
        "/v1beta/models/gemini-1.5-flash:generateContent",
        payload,
        headers
    );

    log:printInfo("Gemini OCR API response received");
    return extractTextFromResponse(rawResponse);
}

# Transcribe and translate speech using Gemini Speech API
#
# + base64Audio - Base64 encoded audio data
# + sourceLang - Source language code
# + targetLang - Target language code
# + apiKey - Gemini API key
# + return - Transcribed and translated text or error
public function transcribeAndTranslateAudio(string base64Audio, string sourceLang, string targetLang, string apiKey) returns string|error {
    http:Client httpClient = check new ("https://generativelanguage.googleapis.com", {timeout: 30});
    
    json payload = {
        "audio": {
            "audioBytes": base64Audio
        },
        "instructions": string `Transcribe this audio from ${sourceLang} to text in ${targetLang}`
    };

    map<string> headers = {
        "Content-Type": "application/json",
        "X-goog-api-key": apiKey
    };

    json rawResponse = check httpClient->post(
        "/v1beta/models/gemini-speech:recognize",
        payload,
        headers
    );

    log:printInfo("Gemini Speech API response received");
    return extractTextFromResponse(rawResponse);
}

# Extract text from Gemini API response
#
# + rawResponse - Raw JSON response from Gemini API
# + return - Extracted text or error
function extractTextFromResponse(json rawResponse) returns string|error {
    if rawResponse is map<json> && rawResponse.hasKey("candidates") {
        json[] candidates = <json[]>rawResponse["candidates"];
        if candidates.length() > 0 {
            json firstCandidate = candidates[0];
            if firstCandidate is map<json> && firstCandidate.hasKey("content") {
                json content = firstCandidate["content"];
                if content is map<json> && content.hasKey("parts") {
                    json[] parts = <json[]>content["parts"];
                    if parts.length() > 0 {
                        json firstPart = parts[0];
                        if firstPart is map<json> && firstPart["text"] is string {
                            return <string>firstPart["text"];
                        }
                    }
                }
            }
        }
    }
    
    string errorMsg = "Unexpected response format from Gemini API";
    log:printError(errorMsg + ": " + rawResponse.toJsonString());
    return error(errorMsg);
}

# Detect MIME type from base64 data
#
# + base64Data - Base64 encoded image data
# + return - Detected MIME type
function detectMimeType(string base64Data) returns string {
    if base64Data.startsWith("/9j/") {
        return "image/jpeg";
    } else if base64Data.startsWith("iVBORw0KGgo") {
        return "image/png";
    } else if base64Data.startsWith("R0lGOD") {
        return "image/gif";
    } else if base64Data.startsWith("UklGR") {
        return "image/webp";
    }
    return "image/jpeg"; // Default fallback
}
