# Translator Service Backend

A high-performance translation service built with Ballerina that integrates with Google's Gemini API to provide text translation, image OCR, and voice transcription capabilities.

## Features

- **Text Translation**: Translate text between multiple languages
- **Image OCR**: Extract text from images and optionally translate
- **Voice Transcription**: Convert speech to text with translation
- **Health Monitoring**: Built-in health check endpoint
- **CORS Support**: Full cross-origin resource sharing support
- **Error Handling**: Comprehensive error handling and logging

## API Endpoints

### Text Translation
```
POST /translate
Content-Type: application/json

{
  "text": "Hello world",
  "sourceLang": "en",
  "target": "es"
}
```

### Image OCR
```
POST /imageTranslate
Content-Type: application/json

{
  "base64Image": "base64_encoded_image_data"
}
```

### Voice Transcription
```
POST /voiceTranslate
Content-Type: application/json

{
  "base64Audio": "base64_encoded_audio_data",
  "sourceLang": "en",
  "target": "es"
}
```

### Health Check
```
GET /health
```

## Configuration

Configure the service using `config.toml`:

```toml
# Google Gemini API Configuration
API_key = "your_gemini_api_key_here"

# Server Configuration
serverPort = 8082
clientTimeout = 30.0
```

## Running the Service

1. Ensure you have Ballerina installed
2. Set up your configuration in `config.toml`
3. Run the service:

```bash
bal run
```

The service will start on the configured port (default: 8082).

## Development

### Code Quality Features

- **Isolated Functions**: All resource functions are isolated for better concurrency
- **Comprehensive Error Handling**: Proper error responses with status codes
- **Input Validation**: Request validation for all endpoints
- **Structured Logging**: Detailed logging for debugging and monitoring
- **Type Safety**: Strong typing with closed records
- **Documentation**: Comprehensive function documentation
- **Constants**: Centralized configuration and magic numbers

### Error Responses

All endpoints return structured error responses:

```json
{
  "message": "Error description",
  "details": "Additional error details (optional)"
}
```

Common HTTP status codes:
- `200`: Success
- `400`: Bad Request (validation errors)
- `500`: Internal Server Error (API errors)

## Dependencies

- Ballerina HTTP module
- Ballerina Log module
- Google Gemini API access

## License

This project is licensed under the MIT License.
