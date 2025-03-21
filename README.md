# Text-to-Speech UI

A modern web application for text-to-speech synthesis using Google Cloud Text-to-Speech API, built with Next.js and ShadcN UI components.

## Features

- Convert text to natural-sounding speech
- Support for multiple languages and voices
- Advanced settings for speech customization:
  - Speed control
  - Pitch adjustment
  - Volume gain
- Modern and responsive UI
- Real-time audio playback
- Download synthesized speech as WAV files

## Prerequisites

- Node.js 18.x or later
- npm or yarn
- Google Cloud Platform account with Text-to-Speech API enabled
- Google Cloud CLI installed and configured
- Docker (for local container testing)

## Local Development Setup

1. Clone the repository:

```bash
git clone <repository-url>
cd text-to-speech-ui
```

2. Install dependencies:

```bash
npm install
```

3. Set up Google Cloud credentials:
   - Create a service account in your Google Cloud Console
   - Download the service account key JSON file
   - Set the environment variable:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="path/to/your/service-account-key.json"
```

4. Create a `.env.local` file in the root directory:

```
GOOGLE_APPLICATION_CREDENTIALS="path/to/your/service-account-key.json"
```

5. Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## Deployment to Cloud Run

1. Enable required Google Cloud APIs:

```bash
gcloud services enable \
  run.googleapis.com \
  texttospeech.googleapis.com \
  cloudbuild.googleapis.com
```

2. Set up environment variables:

```bash
export PROJECT_ID=$(gcloud config get-value project)
export REGION="us-central1"  # or your preferred region
export SERVICE_NAME="text-to-speech-ui"
```

3. Build and push the container:

```bash
gcloud builds submit --tag gcr.io/$PROJECT_ID/$SERVICE_NAME
```

4. Deploy to Cloud Run:

```bash
gcloud run deploy $SERVICE_NAME \
  --image gcr.io/$PROJECT_ID/$SERVICE_NAME \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --service-account="text-to-speech-sa@$PROJECT_ID.iam.gserviceaccount.com"
```

Note: Replace `text-to-speech-sa` with your service account name.

### Setting up the Service Account

1. Create a service account:

```bash
gcloud iam service-accounts create text-to-speech-sa \
  --display-name="Text to Speech Service Account"
```

2. Grant necessary permissions:

```bash
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:text-to-speech-sa@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/cloudtexttospeech.user"
```

## Usage

1. Enter the text you want to convert to speech in the text area
2. Select the desired language and voice
3. (Optional) Adjust advanced settings:
   - Speed: Control how fast the text is spoken (0.25x to 4.0x)
   - Pitch: Adjust the voice pitch (-20 to +20)
   - Volume gain: Control the audio volume (-96dB to +16dB)
4. Click "SYNTHESIZE" to convert the text to speech
5. Use the playback controls to:
   - Play the synthesized speech
   - Download the audio as a WAV file

## Technologies Used

- [Next.js](https://nextjs.org/) - React framework
- [ShadcN UI](https://ui.shadcn.com/) - UI components
- [Google Cloud Text-to-Speech](https://cloud.google.com/text-to-speech) - Speech synthesis API
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Cloud Run](https://cloud.google.com/run) - Serverless container platform

## Environment Variables

For Cloud Run deployment, you need to set the following environment variables:

- `GOOGLE_CLOUD_PROJECT`: Your Google Cloud Project ID
- `GOOGLE_APPLICATION_CREDENTIALS`: Path to service account key (handled automatically in Cloud Run)

## Security Considerations

- The service account used by Cloud Run should have minimal permissions (principle of least privilege)
- API keys and credentials should never be committed to the repository
- Consider implementing rate limiting for production use
- Monitor usage to prevent abuse

## License

MIT
