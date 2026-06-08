import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">404 - Not Found</h2>
        <p className="text-slate-600 mb-6">Could not find requested resource</p>
        <Link href="/" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
          Return Home
        </Link>
      </div>
    </div>
  );
}
