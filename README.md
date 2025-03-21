# Text to Speech UI

A web application for text-to-speech synthesis using Google Cloud Text-to-Speech API. Features optional user authentication with Firebase and a modern, responsive interface built with Next.js and ShadcnUI.

## Features

- Text-to-speech synthesis with multiple languages and voices
- Support for various voice types (Standard, Neural2, Studio, Chirp HD, Chirp 3 HD)
- Real-time audio playback
- Download synthesized speech as WAV files
- Optional user authentication with Google Sign-In
- Persistent language and voice preferences
- Advanced audio settings (speed, pitch, volume)
- Modern, responsive UI with ShadcnUI components

## Prerequisites

- Node.js 20.x or later
- Google Cloud Platform account with Text-to-Speech API enabled
- (Optional) Firebase project for authentication
- Google Cloud CLI (for Cloud Run deployment)

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Required: Google Cloud Text-to-Speech API
GOOGLE_APPLICATION_CREDENTIALS="path/to/your/service-account-key.json"

# Application Configuration
NEXT_PUBLIC_APP_TITLE="Text to Speech Synthesis"  # Custom application title
NEXT_PUBLIC_AUTHENTICATION="false"                # Enable/disable authentication (default: false)

# Optional: Firebase Configuration (required only if NEXT_PUBLIC_AUTHENTICATION="true")
NEXT_PUBLIC_FIREBASE_API_KEY="your-api-key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-project.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
NEXT_PUBLIC_FIREBASE_APP_ID="your-app-id"

# Required for Cloud Run deployment
GOOGLE_CLOUD_PROJECT="your-project-id"

# Optional
PORT=3000  # Application port (default: 3000)
```

## Authentication Setup (Optional)

If you want to enable user authentication:

1. Set `NEXT_PUBLIC_AUTHENTICATION="true"` in your `.env.local`
2. Create a Firebase project at https://console.firebase.google.com
3. Enable Google authentication in the Firebase console:
   - Go to Authentication > Sign-in method
   - Enable Google provider
   - Add authorized domains
4. Get your Firebase configuration from Project Settings > Your apps > Web app
5. Add the Firebase configuration variables to your `.env.local`

When authentication is enabled:

- Users must sign in with Google to access the application
- User preferences are persisted across sessions
- A sign-out button appears in the header
- The login page is automatically handled

When authentication is disabled:

- No login required
- Direct access to the text-to-speech functionality
- Firebase configuration is not required

## Installation

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

## Usage

1. Access the application at `http://localhost:3000`
2. (If authentication is enabled) Sign in with your Google account
3. Enter text in the input field
4. Select language and voice
5. Adjust optional settings (speed, pitch, volume)
6. Click "SYNTHESIZE" to generate speech
7. Use the playback controls to:
   - Play the synthesized speech
   - Download the audio as a WAV file

## Deployment to Cloud Run

1. Enable required APIs:

```bash
gcloud services enable run.googleapis.com textToSpeech.googleapis.com
```

2. Create a service account for Cloud Run:

```bash
gcloud iam service-accounts create tts-service \
  --display-name="Text to Speech Service Account"
```

3. Grant necessary permissions:

```bash
gcloud projects add-iam-policy-binding $GOOGLE_CLOUD_PROJECT \
  --member="serviceAccount:tts-service@$GOOGLE_CLOUD_PROJECT.iam.gserviceaccount.com" \
  --role="roles/cloudtexttospeech.user"
```

4. Build and deploy:

```bash
# Build the container
docker build -t gcr.io/$GOOGLE_CLOUD_PROJECT/tts-ui .

# Push to Container Registry
docker push gcr.io/$GOOGLE_CLOUD_PROJECT/tts-ui

# Deploy to Cloud Run
gcloud run deploy tts-ui \
  --image gcr.io/$GOOGLE_CLOUD_PROJECT/tts-ui \
  --platform managed \
  --region us-central1 \
  --service-account tts-service@$GOOGLE_CLOUD_PROJECT.iam.gserviceaccount.com \
  --set-env-vars "GOOGLE_CLOUD_PROJECT=$GOOGLE_CLOUD_PROJECT"
```

## Security Considerations

1. Service Account Security:

   - Follow the principle of least privilege
   - Only grant necessary permissions
   - Regularly rotate service account keys

2. Environment Variables:

   - Never commit `.env.local` to version control
   - Keep Firebase configuration secure
   - Use different service accounts for development and production

3. Authentication:
   - Enable authentication in production environments
   - Configure authorized domains in Firebase
   - Use HTTPS in production

## Technologies Used

- Next.js 14
- React
- TypeScript
- ShadcnUI
- Google Cloud Text-to-Speech API
- Firebase Authentication (optional)
- Cloud Run (for deployment)

## License

MIT
