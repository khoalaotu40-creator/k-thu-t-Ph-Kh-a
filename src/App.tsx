import { useState, useEffect } from 'react';

export default function App() {
  const [showPassword, setShowPassword] = useState(false);
  const [timer, setTimer] = useState(30);
  const [totpCode, setTotpCode] = useState("------");
  const [userEmail, setUserEmail] = useState("Đang tải...");
  const [userPass, setUserPass] = useState("Đang tải...");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    const fetchCredentials = async () => {
      try {
        const response = await fetch(`/api/credentials?_t=${Date.now()}`, {
          headers: {
            'Accept': 'application/json'
          }
        });
        if (response.ok) {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            setUserEmail(data.email);
            setUserPass(data.pass);
            setTotpCode(data.code);
            setTimer(data.timer);
          } else {
            console.error('Received non-JSON response from /api/credentials');
          }
        }
      } catch (error) {
        console.error("Failed to fetch credentials:", error);
      }
    };

    fetchCredentials();
    const interval = setInterval(fetchCredentials, 1000);
    return () => clearInterval(interval);
  }, []);

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 1500);
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-sans">
      <div className="bg-white shadow-lg rounded-xl w-full max-w-md p-8 relative">
        <h4 className="text-2xl font-bold text-center text-gray-800 mb-6">Thông Tin Đăng Nhập</h4>

        {/* Email Field */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-500 mb-1">Email / Tài khoản</label>
          <div className="flex">
            <input
              type="text"
              className="flex-1 border border-gray-300 rounded-l-md px-3 py-2 font-bold bg-gray-50 text-gray-900 focus:outline-none"
              value={userEmail}
              readOnly
            />
            <button
              className="px-4 py-2 border border-l-0 border-gray-300 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium rounded-r-md transition-colors"
              onClick={() => copyToClipboard(userEmail, 'email')}
            >
              Sao chép
            </button>
          </div>
        </div>

        {/* Password Field */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-500 mb-1">Mật khẩu</label>
          <div className="flex">
            <input
              type={showPassword ? "text" : "password"}
              className="flex-1 border border-gray-300 rounded-l-md px-3 py-2 font-bold bg-gray-50 text-gray-900 focus:outline-none"
              value={userPass}
              readOnly
            />
            <button
              className="px-4 py-2 border-y border-gray-300 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium transition-colors"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "Ẩn" : "Hiển thị"}
            </button>
            <button
              className="px-4 py-2 border border-l-0 border-gray-300 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium rounded-r-md transition-colors"
              onClick={() => copyToClipboard(userPass, 'password')}
            >
              Sao chép
            </button>
          </div>
        </div>

        {/* 2FA Field */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-500 mb-1">
            Mã 2FA (Làm mới sau <span className="text-red-500 font-bold">{timer}</span>s)
          </label>
          <div className="flex">
            <input
              type="text"
              className="flex-1 border border-gray-300 rounded-l-md px-3 py-2 font-bold bg-gray-50 text-blue-600 text-2xl tracking-[0.2em] focus:outline-none"
              value={totpCode}
              readOnly
            />
            <button
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-r-md transition-colors"
              onClick={() => copyToClipboard(totpCode, '2fa')}
            >
              Sao chép
            </button>
          </div>
        </div>

        {/* Toast Alert */}
        {copiedField && (
          <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-2 rounded-full shadow-md text-sm font-medium animate-in fade-in slide-in-from-bottom-4 duration-300">
            Đã sao chép!
          </div>
        )}
      </div>
    </div>
  );
}
