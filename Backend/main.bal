import ballerina/http;
import ballerina/log;

configurable string API_key = ?;
final http:Client geminiClient = check new ("https://generativelanguage.googleapis.com", {
    timeout: 30
});

// ----------------------------
// Types
// ----------------------------
type TranslateRequest record {
    string text;
    string sourceLang;
    string target;
};

type ImageRequest record {
    string base64Image; // image as base64 string
};

type VoiceRequest record {
    string base64Audio; // audio as base64 string
    string sourceLang;
    string target;
};

type TranslateResponse record {
    string output;
};

// ----------------------------
// Service
// ----------------------------
service / on new http:Listener(8082) {

    // ----------------------------
    // CORS Preflight
    // ----------------------------
    resource function options translate(http:Caller caller, http:Request req) returns error? {
        http:Response res = new;
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type");
        check caller->respond(res);
    }

    resource function options imageTranslate(http:Caller caller, http:Request req) returns error? {
        http:Response res = new;
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type");
        check caller->respond(res);
    }

    resource function options voiceTranslate(http:Caller caller, http:Request req) returns error? {
        http:Response res = new;
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type");
        check caller->respond(res);
    }

    // ----------------------------
    // Text-to-Text Translation
    // ----------------------------
    isolated resource function post translate(TranslateRequest req, http:Caller caller) returns error? {
        string prompt = string `Translate the following text from ${req.sourceLang} to ${req.target}. Return only the translation without any explanation: "${req.text}"`;

        json payload = {
            "contents": [
                {
                    "parts": [
                        {"text": prompt}
                    ]
                }
            ]
        };

        map<string> headers = {
            "Content-Type": "application/json",
            "X-goog-api-key": GEMINI_API_KEY
        };

        json rawResp = check geminiClient->post(
            "/v1beta/models/gemini-2.0-flash:generateContent",
            payload,
            headers
        );

        log:printInfo("Gemini text API response: " + rawResp.toJsonString());

        string result = "";
        if rawResp is map<json> && rawResp.hasKey("candidates") {
            json[] candidates = <json[]>rawResp["candidates"];
            if candidates.length() > 0 {
                json firstCandidate = candidates[0];
                if firstCandidate is map<json> && firstCandidate.hasKey("content") {
                    json content = firstCandidate["content"];
                    if content is map<json> && content.hasKey("parts") {
                        json[] parts = <json[]>content["parts"];
                        if parts.length() > 0 {
                            json firstPart = parts[0];
                            if firstPart is map<json> && firstPart["text"] is string {
                                result = <string>firstPart["text"];
                            }
                        }
                    }
                }
            }
        }

        if result == "" {
            result = "[error: unexpected response] " + rawResp.toJsonString();
        }

        TranslateResponse respPayload = { output: result.trim() };
        http:Response res = new;
        res.setJsonPayload(respPayload.toJson());
        res.setHeader("Access-Control-Allow-Origin", "*");
        check caller->respond(res);
    }

    // ----------------------------
    // Image-to-Text OCR
    // ----------------------------
    isolated resource function post imageTranslate(ImageRequest req, http:Caller caller) returns error? {
        json payload = {
            "contents": [
                {
                    "image": {
                        "imageBytes": req.base64Image
                    },
                    "instructions": "Extract all text from this image."
                }
            ]
        };

        map<string> headers = {
            "Content-Type": "application/json",
            "X-goog-api-key": API_key
        };

        json rawResp = check geminiClient->post(
            "/v1beta/models/gemini-2.5-image:generateContent",
            payload,
            headers
        );

        log:printInfo("Gemini OCR API response: " + rawResp.toJsonString());

        string result = "";
        if rawResp is map<json> && rawResp.hasKey("candidates") {
            json[] candidates = <json[]>rawResp["candidates"];
            if candidates.length() > 0 {
                json firstCandidate = candidates[0];
                if firstCandidate is map<json> && firstCandidate.hasKey("content") {
                    json content = firstCandidate["content"];
                    if content is map<json> && content.hasKey("parts") {
                        json[] parts = <json[]>content["parts"];
                        if parts.length() > 0 {
                            json firstPart = parts[0];
                            if firstPart is map<json> && firstPart["text"] is string {
                                result = <string>firstPart["text"];
                            }
                        }
                    }
                }
            }
        }

        if result == "" {
            result = "[error: unexpected response] " + rawResp.toJsonString();
        }

        TranslateResponse respPayload = { output: result.trim() };
        http:Response res = new;
        res.setJsonPayload(respPayload.toJson());
        res.setHeader("Access-Control-Allow-Origin", "*");
        check caller->respond(res);
    }

    // ----------------------------
    // Voice-to-Text Transcription
    // ----------------------------
    isolated resource function post voiceTranslate(VoiceRequest req, http:Caller caller) returns error? {
        json payload = {
            "audio": {
                "audioBytes": req.base64Audio
            },
            "instructions": string `Transcribe this audio from ${req.sourceLang} to text in ${req.target}`
        };

        map<string> headers = {
            "Content-Type": "application/json",
            "X-goog-api-key": API_key
        };

        json rawResp = check geminiClient->post(
            "/v1beta/models/gemini-speech:recognize",
            payload,
            headers
        );

        log:printInfo("Gemini Speech API response: " + rawResp.toJsonString());

        string result = "";
        if rawResp is map<json> && rawResp.hasKey("candidates") {
            json[] candidates = <json[]>rawResp["candidates"];
            if candidates.length() > 0 {
                json firstCandidate = candidates[0];
                if firstCandidate is map<json> && firstCandidate.hasKey("content") {
                    json content = firstCandidate["content"];
                    if content is map<json> && content.hasKey("parts") {
                        json[] parts = <json[]>content["parts"];
                        if parts.length() > 0 {
                            json firstPart = parts[0];
                            if firstPart is map<json> && firstPart["text"] is string {
                                result = <string>firstPart["text"];
                            }
                        }
                    }
                }
            }
        }

        if result == "" {
            result = "[error: unexpected response] " + rawResp.toJsonString();
        }

        TranslateResponse respPayload = { output: result.trim() };
        http:Response res = new;
        res.setJsonPayload(respPayload.toJson());
        res.setHeader("Access-Control-Allow-Origin", "*");
        check caller->respond(res);
    }

    // ----------------------------
    // Health Check
    // ----------------------------
    resource function get health(http:Caller caller) returns error? {
        http:Response res = new;
        res.setTextPayload("ok");
        res.setHeader("Access-Control-Allow-Origin", "*");
        check caller->respond(res);
    }
}
