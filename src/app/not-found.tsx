export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900">404</h1>
        <p className="mt-4 text-lg text-gray-600">Page non trouvée</p>
        <p className="mt-2 text-sm text-gray-500">
          La page que vous recherchez n&apos;existe pas.
        </p>
      </div>
    </div>
  );
}
