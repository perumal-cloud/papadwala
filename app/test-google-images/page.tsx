'use client';

import { useState } from 'react';
import ProfilePicture from '@/components/utils/ProfilePicture';
import SafeGoogleImage from '@/components/utils/SafeGoogleImage';

export default function GoogleImageTestPage() {
  const [testUrls] = useState([
    'https://lh3.googleusercontent.com/a/ACg8ocJBkk5FIMpU9SNhZfgVWocS7oOqlK4hxTpv5AKkO3AM2Ky3EYE=s400-c',
    'https://lh4.googleusercontent.com/a-/AOh14GhQ7V8y9e8d_Xs2F3c=s96-c',
    'https://lh5.googleusercontent.com/a/ACg8ocKOXwZ9Y2p3QlVnD-8e=s400-c',
    'https://res.cloudinary.com/demo/image/upload/sample.jpg',
  ]);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Google Profile Picture Test - Fixed Version</h1>
      
      <div className="grid gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Safe Google Images (Using Proxy)</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {testUrls.map((url, index) => (
              <div key={index} className="text-center">
                <SafeGoogleImage 
                  src={url} 
                  alt={`Safe test image ${index + 1}`}
                  width={80}
                  height={80}
                  className="mx-auto mb-2 rounded-full"
                  priority={index === 0}
                />
                <p className="text-sm text-gray-600 break-all">
                  Safe: {url.substring(0, 30)}...
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Original Profile Picture Component</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {testUrls.map((url, index) => (
              <div key={index} className="text-center">
                <ProfilePicture 
                  src={url} 
                  alt={`Original test image ${index + 1}`}
                  size={80}
                  className="mx-auto mb-2"
                />
                <p className="text-sm text-gray-600 break-all">
                  Original: {url.substring(0, 30)}...
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Proxy URL Examples</h2>
          <div className="space-y-2">
            {testUrls.filter(url => url.includes('googleusercontent')).map((url, index) => {
              const proxyUrl = `/api/images/proxy?url=${encodeURIComponent(url)}`;
              return (
                <div key={index} className="p-3 bg-gray-100 rounded text-sm">
                  <div className="font-medium">Original:</div>
                  <div className="text-gray-600 break-all mb-2">{url}</div>
                  <div className="font-medium">Proxy URL:</div>
                  <div className="text-blue-600 break-all">{proxyUrl}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Solution Summary</h2>
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded">
              <h3 className="font-semibold text-green-800 mb-2">✅ What's Fixed:</h3>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Next.js config updated with Google image domains</li>
                <li>• Image proxy API created to bypass Google rate limiting</li>
                <li>• SafeGoogleImage component automatically uses proxy for Google URLs</li>
                <li>• Proper fallback handling for failed image loads</li>
              </ul>
            </div>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded">
              <h3 className="font-semibold text-blue-800 mb-2">📝 How to Use:</h3>
              <pre className="text-sm text-blue-700 bg-blue-100 p-2 rounded overflow-x-auto">
{`import SafeGoogleImage from '@/components/utils/SafeGoogleImage';

<SafeGoogleImage 
  src={user.profilePicture} 
  alt={user.name}
  width={40}
  height={40}
  className="rounded-full"
/>`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}