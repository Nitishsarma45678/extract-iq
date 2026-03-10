# ExtractIQ

A React-based OCR utility tool that extracts text from images while preserving original layout and spacing. It uses the OCR.space API for text recognition and features a fully responsive, dark-mode-enabled UI.

## Tech Stack

- **Frontend:** React, Vite
- **Styling:** Tailwind CSS v4
- **API:** OCR.space REST API
- **Deployment:** Vercel

## Local Setup

1. **Clone the repository**

```bash
git clone https://github.com/Nitishsarma45678/extract-iq.git
cd extract-iq
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure Environment Variables**

Create a `.env` file in the root directory.

You will need a free API key from OCR.space.

Add the following:

```env
VITE_OCR_API_KEY=your_api_key_here
```

4. **Run the development server**

```bash
npm run dev
```

The app will be available at:

```
http://localhost:5173/
```

## Deployment

This project is deployed on Vercel.

To deploy your own version:

1. Push your code to GitHub.
2. Import the repository into Vercel.
3. Add the `VITE_OCR_API_KEY` in Vercel Environment Variables.
4. Deploy.

## Features

- Extracts text from images using OCR
- Preserves original spacing and layout
- Fully responsive (mobile + desktop)
- Dark mode support
- Fast build with Vite

## License

This project is open-source and available under the MIT License.