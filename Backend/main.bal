import ballerina/http;
import ballerina/log;

// ----------------------------
// Configuration
// ----------------------------
configurable string API_key = ?;
configurable int serverPort = 8082;
configurable decimal clientTimeout = 30;

// ----------------------------
// Constants
// ----------------------------
const string GEMINI_BASE_URL = "https://generativelanguage.googleapis.com";
const string CORS_ALLOW_ORIGIN = "*";
const string CORS_ALLOW_METHODS = "POST, GET, OPTIONS";
const string CORS_ALLOW_HEADERS = "Content-Type";
const string CONTENT_TYPE_JSON = "application/json";

// Models
const string GEMINI_FLASH_MODEL = "gemini-2.0-flash";
const string GEMINI_VISION_MODEL = "gemini-1.5-flash";

// ----------------------------
// HTTP Client
// ----------------------------
final http:Client geminiClient = check new (GEMINI_BASE_URL, {
    timeout: clientTimeout
});

// ----------------------------
// Types
// ----------------------------
type TranslateRequest record {|
    string text;
    string sourceLang;
    string target;
|};

type ImageRequest record {|
    string base64Image;
|};

type VoiceRequest record {|
    string base64Audio;
    string sourceLang;
    string target;
|};

type TranslateResponse record {|
    string output;
|};

type ErrorResponse record {|
    string message;
    string details?;
|};

type GeminiCandidate record {|
    json content;
|};

type GeminiResponse record {|
    GeminiCandidate[] candidates?;
|};

// ----------------------------
// Utility Functions
// ----------------------------

# Sets CORS headers on HTTP response
#
# + response - HTTP response object
isolated function setCorsHeaders(http:Response response) {
    response.setHeader("Access-Control-Allow-Origin", CORS_ALLOW_ORIGIN);
    response.setHeader("Access-Control-Allow-Methods", CORS_ALLOW_METHODS);
    response.setHeader("Access-Control-Allow-Headers", CORS_ALLOW_HEADERS);
}

# Creates CORS preflight response
#
# + return - HTTP response with CORS headers
isolated function createCorsResponse() returns http:Response {
    http:Response response = new;
    setCorsHeaders(response);
    return response;
}

# Extracts text from Gemini API response
#
# + rawResponse - Raw JSON response from Gemini API
# + return - Extracted text or error message
isolated function extractTextFromGeminiResponse(json rawResponse) returns string {
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
    return "[error: unexpected response format] " + rawResponse.toJsonString();
}

# Detects MIME type from base64 data
#
# + base64Data - Base64 encoded image data
# + return - Detected MIME type
isolated function detectMimeType(string base64Data) returns string {
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

# Creates success response
#
# + result - Translation result
# + return - HTTP response
isolated function createSuccessResponse(string result) returns http:Response {
    TranslateResponse responsePayload = {output: result.trim()};
    http:Response response = new;
    response.setJsonPayload(responsePayload.toJson());
    setCorsHeaders(response);
    return response;
}

# Creates error response
#
# + message - Error message
# + details - Optional error details
# + statusCode - HTTP status code
# + return - HTTP response
isolated function createErrorResponse(string message, string? details = (), int statusCode = 500) returns http:Response {
    ErrorResponse errorPayload = {message: message};
    if details is string {
        errorPayload.details = details;
    }
    
    http:Response response = new;
    response.statusCode = statusCode;
    response.setJsonPayload(errorPayload.toJson());
    setCorsHeaders(response);
    return response;
}

// ----------------------------
// Service
// ----------------------------
service / on new http:Listener(serverPort) {

    // ----------------------------
    // CORS Preflight Handlers
    // ----------------------------
    resource function options translate() returns http:Response {
        return createCorsResponse();
    }

    resource function options imageTranslate() returns http:Response {
        return createCorsResponse();
    }

    resource function options voiceTranslate() returns http:Response {
        return createCorsResponse();
    }

    // ----------------------------
    // Text Translation Service
    // ----------------------------
    isolated resource function post translate(TranslateRequest request) returns http:Response|error {
        log:printInfo("Processing text translation request");
        
        // Input validation
        if request.text.trim().length() == 0 {
            return createErrorResponse("Text cannot be empty", statusCode = 400);
        }
        
        string prompt = string `Translate the following text from ${request.sourceLang} to ${request.target}. Return only the translation without any explanation: "${request.text}"`;

        json payload = {
            "contents": [{
                "parts": [{"text": prompt}]
            }]
        };

        map<string> headers = {
            "Content-Type": CONTENT_TYPE_JSON,
            "X-goog-api-key": API_key
        };

        do {
            json rawResponse = check geminiClient->post(
                string `/v1beta/models/${GEMINI_FLASH_MODEL}:generateContent`,
                payload,
                headers
            );

            log:printInfo("Gemini text API response received");
            string result = extractTextFromGeminiResponse(rawResponse);
            
            if result.startsWith("[error:") {
                log:printError("Gemini API returned unexpected response: " + rawResponse.toJsonString());
                return createErrorResponse("Translation service error", result);
            }
            
            return createSuccessResponse(result);
            
        } on fail error e {
            log:printError("Error calling Gemini API: " + e.message());
            return createErrorResponse("External API error", e.message());
        }
    }

    // ----------------------------
    // Image OCR Service
    // ----------------------------
    isolated resource function post imageTranslate(ImageRequest request) returns http:Response|error {
        log:printInfo("Processing image OCR request");
        
        // Input validation
        if request.base64Image.trim().length() == 0 {
            return createErrorResponse("Image data cannot be empty", statusCode = 400);
        }

        string mimeType = detectMimeType(request.base64Image);
        
        json payload = {
            "contents": [{
                "parts": [
                    {
                        "text": "Extract all text from this image. Return only the extracted text without any explanation."
                    },
                    {
                        "inline_data": {
                            "mime_type": mimeType,
                            "data": request.base64Image
                        }
                    }
                ]
            }]
        };

        map<string> headers = {
            "Content-Type": CONTENT_TYPE_JSON,
            "X-goog-api-key": API_key
        };

        do {
            json rawResponse = check geminiClient->post(
                string `/v1beta/models/${GEMINI_VISION_MODEL}:generateContent`,
                payload,
                headers
            );

            log:printInfo("Gemini OCR API response received");
            string result = extractTextFromGeminiResponse(rawResponse);
            
            if result.startsWith("[error:") {
                log:printError("Gemini API returned unexpected response: " + rawResponse.toJsonString());
                return createErrorResponse("OCR service error", result);
            }
            
            return createSuccessResponse(result);
            
        } on fail error e {
            log:printError("Error calling Gemini OCR API: " + e.message());
            return createErrorResponse("External API error", e.message());
        }
    }

    // ----------------------------
    // Voice Transcription Service
    // ----------------------------
    isolated resource function post voiceTranslate(VoiceRequest request) returns http:Response|error {
        log:printInfo("Processing voice transcription request");
        
        // Input validation
        if request.base64Audio.trim().length() == 0 {
            return createErrorResponse("Audio data cannot be empty", statusCode = 400);
        }

        json payload = {
            "audio": {
                "audioBytes": request.base64Audio
            },
            "instructions": string `Transcribe this audio from ${request.sourceLang} to text in ${request.target}`
        };

        map<string> headers = {
            "Content-Type": CONTENT_TYPE_JSON,
            "X-goog-api-key": API_key
        };

        do {
            json rawResponse = check geminiClient->post(
                "/v1beta/models/gemini-speech:recognize",
                payload,
                headers
            );

            log:printInfo("Gemini Speech API response received");
            string result = extractTextFromGeminiResponse(rawResponse);
            
            if result.startsWith("[error:") {
                log:printError("Gemini API returned unexpected response: " + rawResponse.toJsonString());
                return createErrorResponse("Speech recognition service error", result);
            }
            
            return createSuccessResponse(result);
            
        } on fail error e {
            log:printError("Error calling Gemini Speech API: " + e.message());
            return createErrorResponse("External API error", e.message());
        }
    }

    // ----------------------------
    // Health Check Service
    // ----------------------------
    resource function get health() returns http:Response {
        log:printInfo("Health check requested");
        http:Response response = new;
        response.setTextPayload("Service is healthy");
        setCorsHeaders(response);
        return response;
    }
}
