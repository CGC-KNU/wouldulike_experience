import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import Entry from './pages/Entry';
import Earn from './pages/Earn';
import KakaoCallback from './pages/KakaoCallback';
import QrAdmin from './pages/QrAdmin';
import { Notice } from './components/Layout';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/s/:id" element={<Entry />} />
          <Route path="/s/:id/earn" element={<Earn />} />
          <Route path="/auth/kakao" element={<KakaoCallback />} />
          <Route path="/qr" element={<QrAdmin />} />
          <Route path="*" element={<Notice title="매장 QR을 찍어 주세요" desc="매장 계산대의 QR로 접속해 주세요." />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
