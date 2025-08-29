import ballerina/http;
import ballerina/log;

configurable string GEMINI_API_KEY = ?;
final http:Client geminiClient = check new ("https://generativelanguage.googleapis.com", {
    timeout: 30
});

type TranslateRequest record {|
    string text;
    string sourceLang;
    string target;
|};

type TranslateResponse record {|
    string output;
|};

service / on new http:Listener(8080) {

    // Handle CORS preflight
    resource function options translate(http:Caller caller, http:Request req) returns error? {
        http:Response res = new;
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type");
        check caller->respond(res);
    }

    // POST translate
    isolated resource function post translate(TranslateRequest req, http:Caller caller) returns error? {
        string prompt = string `Translate the following text from ${req.sourceLang} to ${req.target}. Return only the translation without any explanation: "${req.text}"`;


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

        map<string> headers = {
            "Content-Type": "application/json",
            "X-goog-api-key": GEMINI_API_KEY
        };

        json rawResp = check geminiClient->post(
            "/v1beta/models/gemini-2.0-flash:generateContent",
            payload,
            headers
        );

        log:printInfo("Gemini API response: " + rawResp.toJsonString());

        string result = "";

        // Extract the translation text safely
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

        // Respond as JSON with `output` field
        TranslateResponse respPayload = { output: result.trim() };
        http:Response res = new;
        res.setJsonPayload(respPayload);
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type");
        check caller->respond(res);
    }

    // Health check
    resource function get health(http:Caller caller) returns error? {
        http:Response res = new;
        res.setTextPayload("ok");
        res.setHeader("Access-Control-Allow-Origin", "*");
        check caller->respond(res);
    }
}