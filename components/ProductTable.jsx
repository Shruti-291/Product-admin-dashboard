export default function ProductTable({ products }) {
  if (!products || products.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        No products found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto shadow rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200 bg-white">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Image
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Title
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Category
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Price
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Rating
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Stock
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {products.map((product) => (
            <tr key={product.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <img
                  src={product.thumbnail || product.images?.[0]}
                  alt={product.title}
                  className="h-12 w-12 object-cover rounded-md border border-gray-200"
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                {product.title}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 capitalize">
                {product.category}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                ${product.price?.toFixed(2)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                ⭐ {product.rating}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {product.stock}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}