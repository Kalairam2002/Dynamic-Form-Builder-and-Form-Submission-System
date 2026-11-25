export default function Card({ className = '', children }) {
  return (
    <div className={`p-6 bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
      {children}
    </div>
  );
}
