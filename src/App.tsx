import { BrowserRouter, Navigate, Route, Routes, useParams } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import Entry from './pages/Entry';
import KakaoCallback from './pages/KakaoCallback';
import QrAdmin from './pages/QrAdmin';
import { InstallSheet } from './components/InstallSheet';
import { Notice } from './components/Layout';

function ToEntry() { const { id } = useParams(); return <Navigate to={`/s/${id}`} replace />; }

// 개발 모드 전용 미리보기 (운영 빌드에는 들어가지 않는다)
function InstallPreview() {
  const bonus = new URLSearchParams(location.search).get('bonus') === '1';
  const info = {
    restaurant_id: 317, name: '라라더', stamp: { enabled: true }, install_bonus_coupon: bonus,
    install_bonus_items: [{ title: '5% 할인', subtitle: '2인 기준 26,000원 이상 결제시, 최대 5,000원' }, { title: '에이드 1잔 제공', subtitle: '메인 메뉴 주문 시' }],
  };
  return <InstallSheet info={info} stampCount={1} onClose={() => {}} />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/s/:id" element={<Entry />} />
          <Route path="/s/:id/earn" element={<ToEntry />} />
          <Route path="/auth/kakao" element={<KakaoCallback />} />
          {import.meta.env.DEV && <Route path="/__preview/install" element={<InstallPreview />} />}
          <Route path="/qr" element={<QrAdmin />} />
          <Route path="*" element={<Notice title="매장 QR을 찍어 주세요" desc="매장 계산대의 QR로 접속해 주세요." />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
