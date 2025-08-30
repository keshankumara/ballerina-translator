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
    resource function post translate(TranslateRequest request) returns http:Response|error {
        log:printInfo("Processing text translation request");
        
        // Input validation
        if request.text.trim().length() == 0 {
            return createErrorResponse("Text cannot be empty", statusCode = 400);
        }
        
        do {
            string result = check translateText(request.text, request.sourceLang, request.target, API_key);
            return createSuccessResponse(result);
        } on fail error e {
            log:printError("Error in translation service: " + e.message());
            return createErrorResponse("Translation service error", e.message());
        }
    }

    // ----------------------------
    // Image OCR Service
    // ----------------------------
    resource function post imageTranslate(ImageRequest request) returns http:Response|error {
        log:printInfo("Processing image OCR request");
        
        // Input validation
        if request.base64Image.trim().length() == 0 {
            return createErrorResponse("Image data cannot be empty", statusCode = 400);
        }

        do {
            string result = check extractTextFromImage(request.base64Image, API_key);
            return createSuccessResponse(result);
        } on fail error e {
            log:printError("Error in OCR service: " + e.message());
            return createErrorResponse("OCR service error", e.message());
        }
    }

    // ----------------------------
    // Voice Transcription Service
    // ----------------------------
    resource function post voiceTranslate(VoiceRequest request) returns http:Response|error {
        log:printInfo("Processing voice transcription request");
        
        // Input validation
        if request.base64Audio.trim().length() == 0 {
            return createErrorResponse("Audio data cannot be empty", statusCode = 400);
        }

        do {
            string result = check transcribeAndTranslateAudio(request.base64Audio, request.sourceLang, request.target, API_key);
            return createSuccessResponse(result);
        } on fail error e {
            log:printError("Error in speech recognition service: " + e.message());
            return createErrorResponse("Speech recognition service error", e.message());
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
