import { useEffect, useRef, useState } from "react";
import axios from "axios";

function App() {
  const [products, setProducts] = useState([]);
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const observerRef = useRef();

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `https://dummyjson.com/products?limit=10&skip=${skip}`
      );
      const newProducts = res.data.products;

      // ❗ Dublikatlarni filtrlaymiz
      setProducts((prev) => {
        const existingIds = new Set(prev.map((p) => p.id));
        const filteredNew = newProducts.filter((p) => !existingIds.has(p.id));
        return [...prev, ...filteredNew];
      });

      // ❗ Mahsulotlar tugaganini tekshiramiz
      if (res.data.total <= skip + newProducts.length) {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Xatolik:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [skip]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !loading) {
          setSkip((prev) => prev + 10);
        }
      },
      { threshold: 1 }
    );
    if (observerRef.current) observer.observe(observerRef.current);
    return () => {
      if (observerRef.current) observer.unobserve(observerRef.current);
    };
  }, [hasMore, loading]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold text-center mb-8 text-blue-600">
        Infinite Scroll Products
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-xl shadow hover:shadow-lg transition-all duration-300"
          >
            <img
              src={product.thumbnail}
              alt={product.title}
              className="w-full h-48 object-cover rounded-t-xl"
            />
            <div className="p-4">
              <h2 className="font-semibold text-lg text-gray-800">
                {product.title}
              </h2>
              <p className="text-gray-500 text-sm line-clamp-2">
                {product.description}
              </p>
              <p className="text-blue-600 font-bold mt-2">${product.price}</p>
            </div>
          </div>
        ))}
      </div>

      {loading && (
        <div className="flex justify-center my-8">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      <div ref={observerRef} className="h-10" />
    </div>
  );
}

export default App;
