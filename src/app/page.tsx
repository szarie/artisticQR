'use client'

import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import Image from 'next/image';

export default function Home() {
  const [link, setLink] = useState("");
  const [, setImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [croppedImage, setCroppedImage] = useState<Blob | null>(null);
  const [qrSrc, setQrSrc] = useState<string>("");
  const [darkColor, setDarkColor] = useState("#000000");
  const [lightColor, setLightColor] = useState("#FFFFFF");
  const [loading, setLoading] = useState(false);


  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);


  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImage(file);
    if (file) {
      setImageUrl(URL.createObjectURL(file));
    } else {
      setImageUrl(null);
    }
    setCroppedImage(null);
  };

  // Get cropped image as blob
  const getCroppedImage = useCallback(async () => {
    if (!imageUrl || !croppedAreaPixels) return null;
    const image = await createImage(imageUrl);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    canvas.width = croppedAreaPixels.width;
    canvas.height = croppedAreaPixels.height;
    ctx.drawImage(
      image,
      croppedAreaPixels.x,
      croppedAreaPixels.y,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
      0,
      0,
      croppedAreaPixels.width,
      croppedAreaPixels.height
    );
    return new Promise<Blob>((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
      }, 'image/png');
    });
  }, [imageUrl, croppedAreaPixels]);

  // Helper to create HTMLImageElement from url
  function createImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const Image = new window.Image();
      Image.addEventListener('load', () => resolve(Image));
      Image.addEventListener('error', error => reject(error));
      Image.setAttribute('crossOrigin', 'anonymous');
      Image.src = url;
    });
  }

  // When user clicks "Crop & Use"
  const handleCrop = async () => {
    const cropped = await getCroppedImage();
    if (cropped) setCroppedImage(cropped);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!link) return;

    const formData = new FormData();
    formData.append("data", link);
    if (croppedImage) {
      formData.append("image", croppedImage, "cropped.png");
    }
    formData.append("dark", darkColor);
    formData.append("light", lightColor);

    setLoading(true);
    try {
      const res = await fetch(
        // `${process.env.NEXT_PUBLIC_API_URL}/api/qrcode/upload`,
        'http://127.0.0.1:8000/api/qrcode/upload',



        {
          method: "POST",
          body: formData,
        }
      );
      setLoading(false);

      if (res.ok) {
        const blob = await res.blob();
        setQrSrc(URL.createObjectURL(blob));
      } else {
        alert("Failed to generate QR code");
      }
    } catch (error) {
      console.error('Fetcch error:', error);
      alert("An error occurred while generating the QR code.");
    } finally {
      setLoading(false);
    };
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-200">
      <div className="flex flex-row w-full max-w-4xl gap-8 justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
          <div className="mb-4 text-left">
            <h1 className="text-xl font-bold text-gray-800">Alphanumeric/URL</h1>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Enter link"

              value={link}
              onChange={e => setLink(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700"
            />
            {/*color picker */}
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <span className="text-sm">Dark</span>
                <input
                  type="color"
                  value={darkColor}
                  onChange={e => setDarkColor(e.target.value)}
                  className="w-8 h-8 p-0 border-0"
                />
              </label>
              <label className="flex items-center gap-2">
                <span className="text-sm">Light</span>
                <input
                  type="color"
                  value={lightColor}
                  onChange={e => setLightColor(e.target.value)}
                  className="w-8 h-8 p-0 border-0"
                />
              </label>

              <div className="flex-1">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      const popup = document.getElementById('colorInfoPopup');
                      if (popup) popup.classList.toggle('hidden');
                    }}
                    className="bg-blue-600 text-white  rounded-full flex items-center justify-center shadow hover:bg-blue-700 transition"
                    aria-label="Color information"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <div id="colorInfoPopup" className="hidden absolute z-10 mt-2 p-3 bg-white rounded shadow-lg text-sm w-48 right-0">
                    <p>QR code usually have dark and light patters, It can be change using the color picker. Dark  is used for the dark patterns, light for the light patters background.</p>
                  </div>
                </div>
              </div>




            </div>
            {/* Cropper UI */}
            {imageUrl && !croppedImage && (
              <div className="relative w-full h-64 bg-gray-100 rounded">
                <Cropper
                  image={imageUrl}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={(_, croppedAreaPixels) => setCroppedAreaPixels(croppedAreaPixels)}
                />
                <button
                  type="button"
                  onClick={handleCrop}
                  className="absolute bottom-1 right-1 bg-blue-600 text-white px-1 py-1 rounded shadow"
                >
                  Crop & Use
                </button>
              </div>
            )}
            {/* Show cropped preview */}
            {croppedImage && (
              <div className="flex flex-col items-center">
                <Image
                  src={URL.createObjectURL(croppedImage)}
                  alt="Cropped"
                  width={128}
                  height={128}
                  className="w-32 h-32 object-cover rounded border"
                  unoptimized
                />
                <span className="text-xs text-gray-500 mt-1">Cropped Preview</span>
              </div>
            )}
            <button
              type="submit"
              className="bg-blue-600 text-white rounded px-4 py-2 font-semibold hover:bg-blue-700 transition"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                  </svg>
                  Generating...
                </span>
              ) : (
                "Generate QR Code"
              )}
            </button>
            {loading && (
              <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                <div className="bg-white p-4 rounded shadow flex items-center gap-3">
                  <svg className="animate-spin h-6 w-6 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                  </svg>
                  <span className="text-sm text-gray-700">Generating QR code…</span>
                </div>
              </div>
            )}
          </form>
        </div>

        {qrSrc && (
          <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md flex flex-col items-center">
            <h2 className="text-lg text-center font-semibold text-gray-800">Generated QR Code</h2>
            <Image
              src={qrSrc}
              alt="QR Code"
              width={300}
              height={300}
              className="mt-4 rounded shadow shadow-gray-300"
              unoptimized />
            <button
              onClick={() => {
                const link = document.createElement('a');
                link.href = qrSrc;
                link.download = 'qrcode.png';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              className="mt-6 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition duration-200"
            >
              Download QR Code
            </button>
          </div>
        )}
        <div className="top-4 right-4 absolute">
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                const popup = document.getElementById('info');
                if (popup) popup.classList.toggle('hidden');
              }}
              className="bg-blue-600 text-white  rounded-full flex items-center justify-center shadow hover:bg-blue-700 transition"
              aria-label="Color information"
            >

              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm11.378-3.917c-.89-.777-2.366-.777-3.255 0a.75.75 0 0 1-.988-1.129c1.454-1.272 3.776-1.272 5.23 0 1.513 1.324 1.513 3.518 0 4.842a3.75 3.75 0 0 1-.837.552c-.676.328-1.028.774-1.028 1.152v.75a.75.75 0 0 1-1.5 0v-.75c0-1.279 1.06-2.107 1.875-2.502.182-.088.351-.199.503-.331.83-.727.83-1.857 0-2.584ZM12 18a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clipRule="evenodd" />
              </svg>
            </button>
            <div id="info" className="hidden absolute z-10 mt-2 p-3 bg-white rounded shadow-lg text-sm w-48 right-0">
              <p>The first time you generate a QR code, it will take some time because the process runs on render.com using a free instance that may spin down due to inactivity, potentially delaying requests by 50 seconds or more. (broke me can&apos;t afford a server )</p>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
