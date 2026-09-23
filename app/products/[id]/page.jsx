export default function ProductDetailPage({ params }) {
  return (
    <main className="p-6">
      <h1 className="text-xl font-bold text-gray-800">
        Product {params.id} (protected)
      </h1>
    </main>
  );
}