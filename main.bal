import ballerina/http;
import ballerina/log;


// Gemini API configuration
final http:Client geminiClient = check new ("https://generativelanguage.googleapis.com", {
    timeout: 30
});

// Request type
type TranslateRequest record {|
    string text;
    string sourceLang;
    string target;
|};

// Response type
type TranslateResponse record {|
    string input;
    string output;
    string sourceLang;
    string target;
|};

// Ballerina service
service / on new http:Listener(8080) {

    isolated resource function post translate(TranslateRequest req) returns TranslateResponse|error {

        // Create prompt for Gemini API
        string prompt = string `Translate the following text from ${req.sourceLang} to ${req.target}: "${req.text}"`;

        // Gemini API payload
        json payload = {
            "contents": [
                {
                    "parts": [
                        {
                            "text": prompt
                        }
                    ]
                }
            ]
        };

        // Headers for Gemini API
        map<string> headers = {
            "Content-Type": "application/json",
            "X-goog-api-key": "AIzaSyC9Lf08b8OH1DTWLKrtlY8VtUrpmGUP9Ng"
        };

        // Call Gemini API
        json rawResp = check geminiClient->post("/v1beta/models/gemini-2.0-flash:generateContent", payload, headers);

        log:printInfo("Gemini API response: " + rawResp.toJsonString());

        // Extract translated text from Gemini response
        string result = "";
        if rawResp is map<json> && rawResp.hasKey("candidates") {
            json candidates = rawResp["candidates"];
            if candidates is json[] && candidates.length() > 0 {
                json firstCandidate = candidates[0];
                if firstCandidate is map<json> && firstCandidate.hasKey("content") {
                    json content = firstCandidate["content"];
                    if content is map<json> && content.hasKey("parts") {
                        json parts = content["parts"];
                        if parts is json[] && parts.length() > 0 {
                            json firstPart = parts[0];
                            if firstPart is map<json> && firstPart.hasKey("text") && firstPart["text"] is string {
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

        return {
            input: req.text,
            output: result,
            sourceLang: req.sourceLang,
            target: req.target
        };
    }

    resource function get health() returns string {
        return "ok";
    }
}
