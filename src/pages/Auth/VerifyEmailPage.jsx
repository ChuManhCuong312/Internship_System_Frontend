import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { authService } from "../../services/authService";

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState("Đang xác thực...");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      authService
        .verifyEmail(token)
        .then((res) => setMessage(res))
        .catch((err) =>
          setMessage(err.message || "Xác thực thất bại, vui lòng thử lại.")
        )
        .finally(() => setLoading(false));
    } else {
      setMessage("Không tìm thấy token xác thực.");
      setLoading(false);
    }
  }, [searchParams]);

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Xác thực Email</h2>
        <p>{loading ? "Đang xử lý..." : message}</p>
        {!loading && (
          <a href="/login" className="auth-btn" style={{ marginTop: "10px" }}>
            Quay lại đăng nhập
          </a>
        )}
      </div>
    </div>
  );
}