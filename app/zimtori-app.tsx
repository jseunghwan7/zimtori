"use client";

import Script from "next/script";
import { SEOUL_SUBWAY_STATIONS, SUBWAY_LINE_COLORS } from "../data/seoul-subway-stations";
import {
  AlertCircle,
  ArrowLeft,
  BadgeCheck,
  Bell,
  Boxes,
  CalendarDays,
  Check,
  ChevronRight,
  CircleDollarSign,
  ClipboardList,
  Clock3,
  CreditCard,
  Gift,
  HandCoins,
  Heart,
  Home,
  Info,
  List,
  LocateFixed,
  LogOut,
  Map,
  MapPin,
  MessageCircleQuestion,
  Minus,
  Navigation,
  PackageOpen,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Send,
  Settings,
  ShieldCheck,
  Shirt,
  SlidersHorizontal,
  Sparkles,
  Star,
  TicketPercent,
  Trash2,
  Truck,
  UploadCloud,
  UserRound,
  WalletCards,
  Warehouse,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Dispatch, SetStateAction } from "react";

type KakaoLatLng = {
  getLat: () => number;
  getLng: () => number;
};

type KakaoMapInstance = {
  relayout: () => void;
  setCenter: (position: KakaoLatLng) => void;
  panTo: (position: KakaoLatLng) => void;
  setLevel: (level: number) => void;
};

type KakaoMarkerImage = object;

type KakaoMarkerInstance = {
  setMap: (map: KakaoMapInstance | null) => void;
  setPosition: (position: KakaoLatLng) => void;
};

type KakaoCircleInstance = {
  setMap: (map: KakaoMapInstance | null) => void;
};

type KakaoInfoWindowInstance = {
  close: () => void;
  open: (map: KakaoMapInstance, marker: KakaoMarkerInstance) => void;
};

type KakaoMarkerClustererInstance = {
  addMarkers: (markers: KakaoMarkerInstance[]) => void;
  clear: () => void;
};

type KakaoMapsApi = {
  load: (callback: () => void) => void;
  LatLng: new (latitude: number, longitude: number) => KakaoLatLng;
  Map: new (container: HTMLElement, options: { center: KakaoLatLng; level: number }) => KakaoMapInstance;
  Size: new (width: number, height: number) => object;
  Point: new (x: number, y: number) => object;
  MarkerImage: new (src: string, size: object, options?: { offset?: object }) => KakaoMarkerImage;
  Marker: new (options: { map?: KakaoMapInstance; position: KakaoLatLng; image?: KakaoMarkerImage; clickable?: boolean }) => KakaoMarkerInstance;
  Circle: new (options: { map: KakaoMapInstance; center: KakaoLatLng; radius: number; strokeWeight: number; strokeColor: string; strokeOpacity: number; fillColor: string; fillOpacity: number }) => KakaoCircleInstance;
  InfoWindow: new (options: { content: string; removable?: boolean }) => KakaoInfoWindowInstance;
  MarkerClusterer: new (options: { map: KakaoMapInstance; averageCenter: boolean; minLevel: number }) => KakaoMarkerClustererInstance;
  event: {
    addListener: (target: object, eventName: string, handler: () => void) => void;
  };
};

declare global {
  interface Window {
    kakao?: { maps: KakaoMapsApi };
  }
}

type CurrentPosition = {
  latitude: number;
  longitude: number;
  accuracy: number;
};

type StationPoint = {
  id: string;
  name: string;
  lines: string[];
  lat: number;
  lng: number;
  pickupAvailable: boolean;
};

type LocationFeedback = {
  tone: "success" | "warning" | "error";
  title: string;
  message: string;
};

type Rental = {
  id: number;
  name: string;
  category: string;
  price: number;
  deposit: number;
  location: string;
  rating: number;
  reviews: number;
  tone: string;
  image: string;
  owner: string;
  description: string;
};

type StorageDraft = {
  situation: string;
  station: string;
  boxes: number;
  suitcases: number;
  startDate: string;
  endDate: string;
  method: "pickup" | "dropoff";
  consignment: boolean;
  cabinet: "S" | "M" | "L" | "XL" | "";
  baseAddress: string;
  detailAddress: string;
  pickupRequest: string;
  pickupStart: string;
  pickupEnd: string;
};

type Order = {
  id: string;
  type: string;
  title: string;
  status: string;
  date: string;
  price: number;
  image?: string;
  imageKeys?: string[];
  details: Record<string, string | number | boolean>;
};

type LendSubmission = {
  name: string;
  category: string;
  condition: string;
  components: string;
  description: string;
  price: number;
  files: File[];
};

const rentals: Rental[] = [
  { id: 1, name: "20인치 여행용 캐리어", category: "여행용품", price: 3900, deposit: 20000, location: "신촌역", rating: 4.9, reviews: 38, tone: "#fff4df", image: "/assets/products/suitcase.webp", owner: "짐토리 검수 완료", description: "가볍고 바퀴가 부드러운 기내용 캐리어예요. 2박 3일 여행에 딱 맞아요." },
  { id: 2, name: "미니 빔프로젝터", category: "생활가전", price: 6900, deposit: 50000, location: "건대입구역", rating: 4.8, reviews: 24, tone: "#fff4df", image: "/assets/products/projector.webp", owner: "민지님의 보관함", description: "캠핑이나 홈파티에 좋은 휴대용 빔프로젝터예요. HDMI 케이블을 함께 드려요." },
  { id: 3, name: "2인 캠핑 의자 세트", category: "캠핑용품", price: 4900, deposit: 30000, location: "서울대입구역", rating: 4.7, reviews: 19, tone: "#fff4df", image: "/assets/products/chairs.webp", owner: "짐토리 검수 완료", description: "접고 펴기 쉬운 경량 캠핑 의자 2개 세트예요. 전용 가방이 포함돼요." },
  { id: 4, name: "무선 게임패드", category: "취미용품", price: 2900, deposit: 25000, location: "홍대입구역", rating: 4.9, reviews: 52, tone: "#fff4df", image: "/assets/products/controller.webp", owner: "도윤님의 보관함", description: "친구들과 함께 즐기기 좋은 무선 게임패드예요. 충전 케이블이 포함돼요." },
  { id: 5, name: "무선 전동 드릴 세트", category: "공구", price: 5900, deposit: 40000, location: "왕십리역", rating: 4.8, reviews: 31, tone: "#fff4df", image: "/assets/products/drill.webp", owner: "짐토리 검수 완료", description: "간단한 가구 조립과 집수리에 충분한 전동 드릴 세트예요." },
  { id: 6, name: "캠핑용 아이스박스", category: "캠핑용품", price: 4500, deposit: 30000, location: "잠실역", rating: 4.6, reviews: 16, tone: "#fff4df", image: "/assets/products/cooler.webp", owner: "서준님의 보관함", description: "하루 나들이에 알맞은 28L 아이스박스예요. 내부를 깨끗하게 세척했어요." },
];

const cabinetOptions = [
  { id: "S" as const, boxes: "1~2박스", price: 15000, image: "/assets/cabinets/s.webp" },
  { id: "M" as const, boxes: "3~5박스", price: 20000, image: "/assets/cabinets/m.webp" },
  { id: "L" as const, boxes: "6~10박스", price: 25000, image: "/assets/cabinets/l.webp" },
  { id: "XL" as const, boxes: "11박스 이상", price: 35000, image: "/assets/cabinets/xl.webp" },
];

const seedOrders: Order[] = [
  { id: "ST-260708", type: "보관", title: "M 캐비닛 보관", status: "보관 중", date: "2026-07-08", price: 26000, image: "/assets/cabinets/m.webp", details: { cabinet: "M 캐비닛 · 3~5박스", station: "신촌역", address: "서울 서대문구 연세로 12, 301호", pickupTime: "18:00 - 20:00", period: "2026-07-08 ~ 2026-08-20", consignment: false } },
  { id: "RT-260704", type: "대여", title: "20인치 여행용 캐리어", status: "반납 예정", date: "2026-07-04", price: 31700, image: "/assets/products/suitcase.webp", details: { period: "2026-07-22 ~ 2026-07-25", location: "신촌역", rentalFee: 11700, deposit: 20000, returnDate: "2026-07-25" } },
];

const stationGroups = Object.entries(SUBWAY_LINE_COLORS).map(([line, color]) => ({
  line,
  color,
  names: SEOUL_SUBWAY_STATIONS.filter((station) => station.line === line).map((station) => station.name),
}));

const allStationPoints = Array.from(SEOUL_SUBWAY_STATIONS.reduce((points, station) => {
  const existing = points.get(station.name);
  if (existing) {
    if (!existing.lines.includes(station.line)) existing.lines.push(station.line);
    existing.pickupAvailable = existing.pickupAvailable || station.pickupAvailable;
  } else {
    points.set(station.name, {
      id: station.id,
      name: station.name,
      lines: [station.line],
      lat: station.lat,
      lng: station.lng,
      pickupAvailable: station.pickupAvailable,
    });
  }
  return points;
}, new globalThis.Map<string, StationPoint>()).values()).sort((a, b) => a.name.localeCompare(b.name, "ko"));
const situations = [
  { title: "기숙사 방학 퇴소", desc: "방학 동안 둘 곳 없는 짐", icon: "🎓" },
  { title: "이사·입주 공백", desc: "새집 입주 전 잠깐 보관", icon: "🏠" },
  { title: "장기 출장", desc: "집을 비우는 동안 안전하게", icon: "✈️" },
  { title: "단기 근로", desc: "계절 근무와 숙소 이동", icon: "🧑‍💻" },
  { title: "기타", desc: "나에게 맞게 직접 입력", icon: "📦" },
];

const initialDraft: StorageDraft = {
  situation: "",
  station: "",
  boxes: 1,
  suitcases: 0,
  startDate: "2026-07-20",
  endDate: "2026-08-20",
  method: "pickup",
  consignment: false,
  cabinet: "",
  baseAddress: "",
  detailAddress: "",
  pickupRequest: "",
  pickupStart: "18:00",
  pickupEnd: "20:00",
};

const timeOptions = Array.from({ length: 25 }, (_, index) => `${String(index).padStart(2, "0")}:00`);

const outfitItems = [
  { id: "cap", label: "노랑 캡", image: "/assets/outfits/cap-3d.png", price: "보유" },
  { id: "glasses", label: "캐러멜 선글라스", image: "/assets/outfits/glasses-3d.png", price: "800P" },
  { id: "scarf", label: "피치 목도리", image: "/assets/outfits/scarf-3d.png", price: "1,200P" },
  { id: "ribbon", label: "코랄 리본", image: "/assets/outfits/ribbon-3d.png", price: "600P" },
  { id: "grad", label: "졸업 모자", image: "/assets/outfits/grad-3d.png", price: "시즌" },
  { id: "bag", label: "미니 가방", image: "/assets/outfits/bag-3d.png", price: "1,500P" },
];

function won(value: number) {
  return `${value.toLocaleString("ko-KR")}원`;
}

function haversineDistanceMeters(latitude: number, longitude: number, station: StationPoint) {
  const earthRadius = 6371000;
  const toRadians = (degree: number) => degree * Math.PI / 180;
  const latitudeDelta = toRadians(station.lat - latitude);
  const longitudeDelta = toRadians(station.lng - longitude);
  const startLatitude = toRadians(latitude);
  const endLatitude = toRadians(station.lat);
  const haversine = Math.sin(latitudeDelta / 2) ** 2
    + Math.cos(startLatitude) * Math.cos(endLatitude) * Math.sin(longitudeDelta / 2) ** 2;
  return earthRadius * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

function formatDistance(distance: number) {
  return distance < 1000 ? `약 ${Math.round(distance)}m` : `약 ${(distance / 1000).toFixed(1)}km`;
}

function openUploadDatabase() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open("zimtori-local-uploads", 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains("images")) request.result.createObjectStore("images");
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function saveUploadFiles(orderId: string, files: File[]) {
  const database = await openUploadDatabase();
  const transaction = database.transaction("images", "readwrite");
  const store = transaction.objectStore("images");
  const keys = files.map((file, index) => `${orderId}-image-${index}`);
  files.forEach((file, index) => store.put(file, keys[index]));
  await new Promise<void>((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
  database.close();
  return keys;
}

async function loadUploadBlob(key: string) {
  const database = await openUploadDatabase();
  const transaction = database.transaction("images", "readonly");
  const request = transaction.objectStore("images").get(key);
  const blob = await new Promise<Blob | undefined>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result as Blob | undefined);
    request.onerror = () => reject(request.error);
  });
  database.close();
  return blob;
}

function usePersistentState<T>(key: string, initial: T) {
  const initialRef = useRef(initial);
  const [value, setValue] = useState<T>(initial);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const stored = localStorage.getItem(key);
        if (stored) {
          const parsed = JSON.parse(stored) as T;
          const base = initialRef.current;
          const merged = typeof base === "object" && base !== null && !Array.isArray(base)
            ? { ...base, ...parsed }
            : parsed;
          setValue(merged as T);
        }
      } catch {}
      setReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [key]);
  useEffect(() => {
    if (ready) localStorage.setItem(key, JSON.stringify(value));
  }, [key, ready, value]);
  return [value, setValue] as const;
}

export default function ZimtoriApp() {
  const [path, setPath] = useState("/");
  const [signedIn, setSignedIn] = usePersistentState("zimtori-demo-user", false);
  const [favorites, setFavorites] = usePersistentState<number[]>("zimtori-favorites", [2, 4]);
  const [draft, setDraft] = usePersistentState<StorageDraft>("zimtori-storage-draft-v2", initialDraft);
  const [orders, setOrders] = usePersistentState<Order[]>("zimtori-orders-v2", []);
  const [equipped, setEquipped] = usePersistentState<string[]>("zimtori-outfit", ["cap"]);
  const [selectedRental, setSelectedRental] = useState<Rental>(rentals[0]);
  const [toast, setToast] = useState("");
  const [dialog, setDialog] = useState<{ title: string; body: string } | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setPath(window.location.pathname), 0);
    const onPop = () => setPath(window.location.pathname);
    window.addEventListener("popstate", onPop);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("popstate", onPop);
    };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2300);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const navigate = (next: string) => {
    window.history.pushState({}, "", next);
    setPath(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const requireLogin = (next: string) => {
    if (signedIn) navigate(next);
    else {
      sessionStorage.setItem("zimtori-next", next);
      navigate("/login");
    }
  };

  const demoLogin = () => {
    setSignedIn(true);
    setToast("체험 계정으로 로그인했어요");
    const next = sessionStorage.getItem("zimtori-next") || "/";
    sessionStorage.removeItem("zimtori-next");
    navigate(next);
  };

  const toggleFavorite = (id: number) => {
    if (!signedIn) return requireLogin(`/rentals/${id}`);
    setFavorites((prev) => prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]);
    setToast(favorites.includes(id) ? "찜 목록에서 뺐어요" : "찜 목록에 담았어요");
  };

  const openRental = (rental: Rental) => {
    setSelectedRental(rental);
    navigate(`/rentals/${rental.id}`);
  };

  const showInfo = (title: string, body: string) => setDialog({ title, body });

  const isMain = ["/", "/rentals", "/orders", "/my"].includes(path);
  let screen: React.ReactNode;

  if (path === "/login") {
    screen = <LoginScreen onBack={() => navigate("/")} onDemo={demoLogin} onProvider={(provider) => showInfo(`${provider} 로그인 연결 준비`, `다음 단계에서 ${provider} 개발자 설정과 Supabase를 함께 연결해요. 지금은 체험 계정으로 전체 기능을 확인할 수 있어요.`)} />;
  } else if (path === "/storage") {
    screen = <StorageFlow draft={draft} setDraft={setDraft} onBack={() => navigate("/")} onGoLend={() => { sessionStorage.setItem("zimtori-lend-origin", "storage"); navigate("/lend/new"); }} onComplete={() => {
      const cabinet = cabinetOptions.find((item) => item.id === draft.cabinet) || cabinetOptions[0];
      const newOrder: Order = { id: `ST-${Date.now().toString().slice(-6)}`, type: "보관", title: `${draft.cabinet} 캐비닛 보관`, status: "접수 완료", date: draft.startDate, price: cabinet.price + (draft.method === "pickup" ? 6000 : 0), image: cabinet.image, details: { cabinet: `${draft.cabinet} 캐비닛 · ${cabinet.boxes}`, station: draft.station, address: draft.method === "pickup" ? `${draft.baseAddress} ${draft.detailAddress}`.trim() : "직접 맡기기", pickupTime: draft.method === "pickup" ? `${draft.pickupStart} - ${draft.pickupEnd}` : "직접 방문", pickupRequest: draft.pickupRequest, period: `${draft.startDate} ~ ${draft.endDate}`, consignment: draft.consignment } };
      setOrders((prev) => [newOrder, ...prev]);
      setToast("보관 신청이 완료됐어요");
    }} />;
  } else if (path === "/rentals") {
    screen = <RentalList favorites={favorites} onBack={() => navigate("/")} onOpen={openRental} onFavorite={toggleFavorite} onLend={() => requireLogin("/lend/new")} />;
  } else if (path.startsWith("/rentals/")) {
    const rental = rentals.find((item) => item.id === Number(path.split("/").pop())) || selectedRental;
    screen = <RentalDetail rental={rental} favorite={favorites.includes(rental.id)} onBack={() => navigate("/rentals")} onFavorite={() => toggleFavorite(rental.id)} onCheckout={() => requireLogin("/checkout")} onQuestion={() => showInfo("물품 문의", "짐토리 안심 채팅으로 문의가 접수됐어요. 체험 버전에서는 답변 흐름을 미리 확인할 수 있어요.")} />;
  } else if (path === "/checkout") {
    screen = <Checkout rental={selectedRental} onBack={() => navigate(`/rentals/${selectedRental.id}`)} onComplete={(total) => {
      const newOrder: Order = { id: `RT-${Date.now().toString().slice(-6)}`, type: "대여", title: selectedRental.name, status: "대여 승인 대기", date: "2026-07-22", price: total, image: selectedRental.image, details: { period: "2026-07-22 ~ 2026-07-25", location: selectedRental.location, rentalFee: selectedRental.price * 3, deposit: selectedRental.deposit, returnDate: "2026-07-25" } };
      setOrders((prev) => [newOrder, ...prev]);
      setToast("대여 신청이 완료됐어요");
      navigate("/orders");
    }} />;
  } else if (path === "/lend/new") {
    screen = <LendForm onBack={() => navigate(sessionStorage.getItem("zimtori-lend-origin") === "storage" ? "/storage" : "/rentals")} onComplete={async (submission) => {
      const orderId = `LN-${Date.now().toString().slice(-6)}`;
      const imageKeys = await saveUploadFiles(orderId, submission.files);
      const newOrder: Order = { id: orderId, type: "위탁 대여", title: submission.name, status: "검수 대기", date: new Date().toISOString().slice(0, 10), price: submission.price, imageKeys, details: { category: submission.category, condition: submission.condition, components: submission.components, description: submission.description, askingPrice: submission.price, linkedStorage: draft.cabinet ? `${draft.cabinet} 캐비닛 · ${draft.station || "위치 선택 중"}` : "보관 신청 연결 전" } };
      setOrders((prev) => [newOrder, ...prev]);
      sessionStorage.removeItem("zimtori-lend-origin");
      setToast("물품 검수 신청을 완료했어요");
      navigate("/orders");
    }} />;
  } else if (path === "/orders") {
    screen = signedIn ? <Orders orders={orders} onHome={() => navigate("/")} onDetail={(orderId) => navigate(`/orders/${orderId}`)} /> : <LoginNeeded onLogin={() => navigate("/login")} />;
  } else if (path.startsWith("/orders/")) {
    const orderId = path.split("/").pop();
    const order = [...orders, ...seedOrders].find((item) => item.id === orderId);
    screen = signedIn && order ? <OrderDetail order={order} onBack={() => navigate("/orders")} onQuestion={() => showInfo("짐토리 문의", "선택한 이용 건으로 문의가 접수됐어요. 알림으로 답변드릴게요.")} /> : <LoginNeeded onLogin={() => navigate("/login")} />;
  } else if (path === "/favorites") {
    screen = <Favorites items={rentals.filter((item) => favorites.includes(item.id))} onBack={() => navigate("/my")} onOpen={openRental} onFavorite={toggleFavorite} />;
  } else if (path === "/notifications") {
    screen = <Notifications onBack={() => navigate("/")} onReadAll={() => setToast("모든 알림을 읽었어요")} />;
  } else if (path === "/my/avatar") {
    screen = <AvatarStudio equipped={equipped} setEquipped={setEquipped} onBack={() => navigate("/my")} onSave={() => setToast("짐토리 코디를 저장했어요")} />;
  } else if (path === "/support" || path === "/faq") {
    screen = <Support onBack={() => navigate("/my")} onSend={() => setToast("문의가 접수됐어요")} />;
  } else if (path === "/my") {
    screen = signedIn ? <MyPage favorites={favorites.length} orderCount={orders.length} equipped={equipped} onNavigate={navigate} onInfo={showInfo} onLogout={() => { setSignedIn(false); setToast("로그아웃했어요"); navigate("/"); }} /> : <LoginNeeded onLogin={() => navigate("/login")} />;
  } else {
    screen = <HomeScreen signedIn={signedIn} orders={orders} favorites={favorites} onNavigate={navigate} onProtected={requireLogin} onOpenRental={openRental} onFavorite={toggleFavorite} />;
  }

  return (
    <div className="site-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <div className="app-frame">
        {path !== "/" && <button className="global-home-button" onClick={() => navigate("/")} aria-label="홈으로 이동"><Home size={21} /></button>}
        {screen}
        {isMain && <BottomNav path={path} onNavigate={(next) => next === "/orders" || next === "/my" ? requireLogin(next) : navigate(next)} />}
      </div>
      {toast && <div className="toast"><Check size={17} />{toast}</div>}
      {dialog && <Dialog title={dialog.title} body={dialog.body} onClose={() => setDialog(null)} />}
    </div>
  );
}

function BrandHeader({ onNavigate, back }: { onNavigate?: (path: string) => void; back?: () => void }) {
  return (
    <header className="topbar">
      {back ? <button className="icon-button" onClick={back} aria-label="뒤로가기"><ArrowLeft size={22} /></button> : <button className="brand-button" onClick={() => onNavigate?.("/")}><img src="/assets/zimtori-wordmark.png" alt="짐토리" /></button>}
      {!back && <div className="top-actions"><button className="location-chip" onClick={() => onNavigate?.("/storage")}><MapPin size={15} />신촌·서대문<ChevronRight size={14} /></button><button className="icon-button" onClick={() => onNavigate?.("/notifications")} aria-label="알림"><Bell size={20} /><span className="notification-dot" /></button></div>}
      {back && <img className="mini-wordmark" src="/assets/zimtori-wordmark.png" alt="짐토리" />}
    </header>
  );
}

function HomeScreen({ signedIn, orders, favorites, onNavigate, onProtected, onOpenRental, onFavorite }: { signedIn: boolean; orders: Order[]; favorites: number[]; onNavigate: (path: string) => void; onProtected: (path: string) => void; onOpenRental: (rental: Rental) => void; onFavorite: (id: number) => void }) {
  return (
    <main className="page home-page">
      <BrandHeader onNavigate={onNavigate} />
      <section className="hero-card">
        <div className="hero-copy"><span className="eyebrow"><Sparkles size={14} />짐토리 베타</span><h1>짐 걱정은 맡기고,<br /><em>일상은 가볍게.</em></h1><p>문 앞에서 수거하고 안전하게 보관해요.<br />안 쓰는 물건은 대여 수익까지 만들어요.</p><div className="hero-actions"><button className="primary-button" onClick={() => onProtected("/storage")}>짐 보관 신청하기<ChevronRight size={18} /></button><button className="secondary-button" onClick={() => onNavigate("/rentals")}>대여 물품 보기</button></div></div>
        <div className="hero-art"><span className="hero-bubble bubble-one">문 앞 픽업</span><span className="hero-bubble bubble-two">보관료 절약</span><div className="hero-halo" /><img src="/assets/zimtori-character-3d.png" alt="두 손을 모으고 웃는 짐토리 햄스터" /></div>
      </section>

      {signedIn && <section className="status-strip"><div><span>안녕하세요, 승환님</span><strong>{orders.length ? "진행 중인 이용이 있어요" : "첫 보관을 시작해볼까요?"}</strong></div><div className="status-metrics"><span><b>{orders.length}</b>이용 중</span><span><b>{favorites.length}</b>찜</span><span><b>2,400P</b>포인트</span></div></section>}

      <section className="section-block"><div className="section-heading"><div><span className="section-kicker">빠른 시작</span><h2>무엇을 도와드릴까요?</h2></div></div><div className="quick-grid">
        <button onClick={() => onProtected("/storage")}><span className="quick-icon yellow"><Truck /></span><strong>문 앞 픽업</strong><small>무거운 짐도 편하게</small></button>
        <button onClick={() => onProtected("/storage")}><span className="quick-icon cream"><Warehouse /></span><strong>안심 보관</strong><small>기간만 골라 맡겨요</small></button>
        <button onClick={() => onNavigate("/rentals")}><span className="quick-icon mint"><PackageOpen /></span><strong>물품 빌리기</strong><small>필요한 만큼만</small></button>
        <button onClick={() => onProtected("/lend/new")}><span className="quick-icon peach"><HandCoins /></span><strong>물품 맡기기</strong><small>보관하며 수익화</small></button>
      </div></section>

      <section className="nearby-card"><div className="nearby-icon"><Navigation size={22} /></div><div><span>이번 주 인기 픽업 거점</span><strong>신촌역 · 홍대입구역 · 건대입구역</strong><small>내 위치는 보관 신청에서 직접 확인해요.</small></div><button onClick={() => onProtected("/storage")}>위치 찾기</button></section>

      <section className="section-block"><div className="section-heading"><div><span className="section-kicker">짐토리 대여</span><h2>이번 주 인기 물품</h2></div><button className="text-button" onClick={() => onNavigate("/rentals")}>전체 보기<ChevronRight size={16} /></button></div><div className="rental-row">{rentals.slice(0, 4).map((rental) => <RentalCard key={rental.id} rental={rental} favorite={favorites.includes(rental.id)} onOpen={() => onOpenRental(rental)} onFavorite={() => onFavorite(rental.id)} />)}</div></section>

      <section className="how-section"><div className="section-heading"><div><span className="section-kicker">HOW IT WORKS</span><h2>짐토리는 이렇게 이용해요</h2></div></div><div className="how-grid"><article><b>01</b><span><Truck /></span><h3>문 앞에서 수거</h3><p>원하는 날짜와 시간을 골라요.</p></article><article><b>02</b><span><ShieldCheck /></span><h3>꼼꼼하게 보관</h3><p>물품 상태를 확인하고 보관해요.</p></article><article><b>03</b><span><HandCoins /></span><h3>대여 수익 정산</h3><p>원하면 안 쓰는 물건을 빌려줘요.</p></article></div></section>

      <section className="trust-banner"><img src="/assets/zimtori-symbol.png" alt="짐토리 심볼" /><div><strong>맡기는 순간부터 다시 받는 날까지</strong><p>모든 신청 상태를 앱에서 한눈에 확인해요.</p></div><button onClick={() => onNavigate("/faq")}>이용안내</button></section>
    </main>
  );
}

function RentalCard({ rental, favorite, onOpen, onFavorite }: { rental: Rental; favorite: boolean; onOpen: () => void; onFavorite: () => void }) {
  return <article className="rental-card"><button className={`favorite-button ${favorite ? "active" : ""}`} onClick={(event) => { event.stopPropagation(); onFavorite(); }} aria-label="찜하기"><Heart size={18} fill={favorite ? "currentColor" : "none"} /></button><button className="rental-main" onClick={onOpen}><div className="rental-thumb" style={{ background: rental.tone }}><img src={rental.image} alt={`${rental.name} 제품 사진`} onError={(event) => { event.currentTarget.src = "/assets/zimtori-symbol.png"; }} /><small>검수 완료</small></div><div className="rental-copy"><span>{rental.category} · {rental.location}</span><h3>{rental.name}</h3><div className="rental-rating"><Star size={13} fill="currentColor" />{rental.rating} <small>({rental.reviews})</small></div><p><strong>{won(rental.price)}</strong> / 일</p></div></button></article>;
}

function LoginScreen({ onBack, onDemo, onProvider }: { onBack: () => void; onDemo: () => void; onProvider: (provider: string) => void }) {
  return <main className="auth-page"><button className="floating-back" onClick={onBack}><ArrowLeft size={22} /></button><div className="auth-art"><div className="auth-halo" /><img src="/assets/zimtori-character-3d.png" alt="짐토리 캐릭터" /></div><img className="auth-logo" src="/assets/zimtori-wordmark.png" alt="짐토리" /><h1>짐 걱정 없는 일상,<br />짐토리와 시작해요</h1><p>로그인하면 신청 현황과 대여 수익을<br />한곳에서 확인할 수 있어요.</p><div className="auth-buttons"><button className="social google" onClick={() => onProvider("Google")}><span>G</span>Google로 계속하기</button><button className="social kakao" onClick={() => onProvider("카카오")}><span>••</span>카카오로 계속하기</button><button className="demo-login" onClick={onDemo}><Sparkles size={17} />체험 계정으로 둘러보기</button></div><small className="auth-note">계속하면 짐토리의 <u>이용약관</u>과 <u>개인정보처리방침</u>에 동의하게 됩니다.</small></main>;
}

function LoginNeeded({ onLogin }: { onLogin: () => void }) {
  return <main className="empty-page"><img src="/assets/zimtori-character-3d.png" alt="짐토리 캐릭터" /><h1>로그인이 필요한 화면이에요</h1><p>체험 계정으로 로그인하면 모든 기능을 확인할 수 있어요.</p><button className="primary-button" onClick={onLogin}>로그인하기<ChevronRight size={18} /></button></main>;
}

function BottomNav({ path, onNavigate }: { path: string; onNavigate: (path: string) => void }) {
  const items = [{ path: "/", label: "홈", Icon: Home }, { path: "/storage", label: "보관", Icon: Boxes }, { path: "/rentals", label: "대여", Icon: Search }, { path: "/orders", label: "이용내역", Icon: ClipboardList }, { path: "/my", label: "마이", Icon: UserRound }];
  return <nav className="bottom-nav" aria-label="주요 메뉴">{items.map(({ path: itemPath, label, Icon }) => <button key={itemPath} className={path === itemPath ? "active" : ""} onClick={() => onNavigate(itemPath)}><Icon size={21} /><span>{label}</span></button>)}</nav>;
}

function Dialog({ title, body, onClose }: { title: string; body: string; onClose: () => void }) {
  return <div className="dialog-backdrop" onClick={onClose}><div className="dialog" onClick={(event) => event.stopPropagation()}><button className="dialog-close" onClick={onClose}><X size={20} /></button><div className="dialog-icon"><Info size={26} /></div><h2>{title}</h2><p>{body}</p><button className="primary-button" onClick={onClose}>확인했어요</button></div></div>;
}

function StorageFlow({ draft, setDraft, onBack, onGoLend, onComplete }: { draft: StorageDraft; setDraft: Dispatch<SetStateAction<StorageDraft>>; onBack: () => void; onGoLend: () => void; onComplete: () => void }) {
  const [step, setStep] = usePersistentState("zimtori-storage-step-v2", 0);
  const [search, setSearch] = useState("");
  const [line, setLine] = useState("전체");
  const [view, setView] = useState<"map" | "list">("map");
  const [locating, setLocating] = useState(false);
  const [currentPosition, setCurrentPosition] = useState<CurrentPosition | null>(null);
  const [locationFeedback, setLocationFeedback] = useState<LocationFeedback | null>(null);
  const [error, setError] = useState("");
  const locationWatchRef = useRef<number | null>(null);
  const locationTimerRef = useRef<number | null>(null);
  const bestPositionRef = useRef<CurrentPosition | null>(null);
  const steps = ["소개", "상황", "위치", "물품", "방식", "대여", "견적", "완료"];
  const filteredStations = useMemo(() => {
    const allowed = line === "전체" ? allStationPoints : allStationPoints.filter((station) => station.lines.includes(line));
    return allowed.filter((station) => station.name.includes(search.trim())).slice(0, 30);
  }, [line, search]);
  const selectedCabinet = cabinetOptions.find((item) => item.id === draft.cabinet);
  const estimate = (selectedCabinet?.price || 0) + (draft.method === "pickup" ? 6000 : 0);
  const located = Boolean(currentPosition);
  const nearestStation = useMemo(() => {
    if (!currentPosition || currentPosition.accuracy > 500) return null;
    return allStationPoints.reduce<{ station: StationPoint; distance: number } | null>((nearest, station) => {
      const distance = haversineDistanceMeters(currentPosition.latitude, currentPosition.longitude, station);
      return !nearest || distance < nearest.distance ? { station, distance } : nearest;
    }, null);
  }, [currentPosition]);
  const selectStation = useCallback((station: string) => {
    setDraft((prevDraft: StorageDraft) => ({ ...prevDraft, station }));
  }, [setDraft]);

  const stopLocationRequest = useCallback(() => {
    if (locationWatchRef.current !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(locationWatchRef.current);
      locationWatchRef.current = null;
    }
    if (locationTimerRef.current !== null) {
      window.clearTimeout(locationTimerRef.current);
      locationTimerRef.current = null;
    }
  }, []);

  useEffect(() => () => stopLocationRequest(), [stopLocationRequest]);

  const next = () => {
    setError("");
    if (step === 1 && !draft.situation) return setError("보관이 필요한 상황을 선택해주세요.");
    if (step === 2 && !draft.station) return setError("픽업 또는 방문할 역을 선택해주세요.");
    if (step === 3 && !draft.cabinet) return setError("짐 수량에 맞는 캐비닛을 선택해주세요.");
    if (step === 4 && draft.method === "pickup" && !draft.baseAddress.trim()) return setError("픽업 기본 주소를 입력해주세요.");
    if (step === 4 && draft.method === "pickup" && Number(draft.pickupEnd.slice(0, 2)) <= Number(draft.pickupStart.slice(0, 2))) return setError("종료 시간은 시작 시간보다 늦어야 해요.");
    if (step === 6) { onComplete(); setStep(7); window.scrollTo({ top: 0, behavior: "smooth" }); return; }
    setStep((current) => Math.min(7, current + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const prev = () => step === 0 ? onBack() : setStep((current) => Math.max(0, current - 1));

  const locate = () => {
    stopLocationRequest();
    bestPositionRef.current = null;
    setCurrentPosition(null);
    setLocationFeedback(null);
    setLocating(true);
    setError("");

    const localhost = ["localhost", "127.0.0.1", "[::1]"].includes(window.location.hostname);
    if (!window.isSecureContext && !localhost) {
      setLocating(false);
      setLocationFeedback({
        tone: "error",
        title: "안전한 연결에서 위치를 확인해주세요",
        message: "HTTPS 또는 localhost가 아닌 환경에서는 위치 기능이 제한돼요.",
      });
      return;
    }

    if (!navigator.geolocation) {
      setLocating(false);
      setLocationFeedback({ tone: "error", title: "위치 기능을 지원하지 않아요", message: "이 브라우저에서는 현재 위치를 확인할 수 없어요. 지하철역을 직접 선택해주세요." });
      return;
    }

    const options: PositionOptions = { enableHighAccuracy: true, maximumAge: 0, timeout: 20000 };
    let finished = false;
    const finish = (candidate: CurrentPosition | null, failure?: "permission" | "timeout" | "unavailable") => {
      if (finished) return;
      finished = true;
      stopLocationRequest();
      setLocating(false);

      if (!candidate) {
        if (failure === "permission") {
          setLocationFeedback({ tone: "error", title: "위치 권한이 거부됐어요", message: "브라우저 설정에서 위치 권한을 허용한 뒤 다시 시도해주세요." });
        } else if (failure === "timeout") {
          setLocationFeedback({ tone: "error", title: "위치 확인 시간이 초과됐어요", message: "신호가 잘 잡히는 곳에서 다시 시도하거나 지하철역을 직접 선택해주세요." });
        } else {
          setLocationFeedback({ tone: "error", title: "현재 위치를 확인할 수 없어요", message: "기기의 위치 서비스를 켠 뒤 다시 시도하거나 지하철역을 직접 선택해주세요." });
        }
        return;
      }

      if (candidate.accuracy <= 100) {
        setCurrentPosition(candidate);
        setLocationFeedback({ tone: "success", title: "현재 위치를 확인했어요", message: `GPS 정확도 약 ${Math.round(candidate.accuracy)}m예요. 가까운 역은 직접 선택해주세요.` });
        setView("map");
      } else if (candidate.accuracy <= 500) {
        setCurrentPosition(candidate);
        setLocationFeedback({ tone: "warning", title: "위치 정확도가 낮을 수 있어요", message: `GPS 정확도 약 ${Math.round(candidate.accuracy)}m예요. 지도와 가까운 역 정보를 확인한 뒤 직접 선택해주세요.` });
        setView("map");
      } else {
        setCurrentPosition(null);
        setLocationFeedback({
          tone: "error",
          title: "현재 위치를 확정하지 않았어요",
          message: "PC 또는 네트워크 환경에서는 위치가 부정확할 수 있어요. 모바일에서 다시 시도하거나 지하철역을 직접 선택해주세요.",
        });
      }
    };

    const receivePosition = ({ coords }: GeolocationPosition) => {
      const candidate = { latitude: coords.latitude, longitude: coords.longitude, accuracy: coords.accuracy };
      if (![candidate.latitude, candidate.longitude, candidate.accuracy].every(Number.isFinite) || candidate.accuracy < 0) return;
      if (!bestPositionRef.current || candidate.accuracy < bestPositionRef.current.accuracy) bestPositionRef.current = candidate;
      if (candidate.accuracy <= 100) finish(candidate);
    };

    const receiveError = (positionError: GeolocationPositionError) => {
      if (positionError.code === positionError.PERMISSION_DENIED) return finish(null, "permission");
      if (bestPositionRef.current) return finish(bestPositionRef.current);
      if (positionError.code === positionError.TIMEOUT) return finish(null, "timeout");
      finish(null, "unavailable");
    };

    if (typeof navigator.geolocation.watchPosition === "function") {
      locationWatchRef.current = navigator.geolocation.watchPosition(receivePosition, receiveError, options);
      locationTimerRef.current = window.setTimeout(() => finish(bestPositionRef.current, bestPositionRef.current ? undefined : "timeout"), 20000);
    } else {
      navigator.geolocation.getCurrentPosition((result) => {
        receivePosition(result);
        finish(bestPositionRef.current, bestPositionRef.current ? undefined : "unavailable");
      }, receiveError, options);
    }
  };

  return <main className="page wizard-page"><BrandHeader back={prev} /><div className="wizard-head"><div><span>짐 보관 신청</span><strong>{step + 1} / {steps.length}</strong></div><div className="progress-track"><i style={{ width: `${((step + 1) / steps.length) * 100}%` }} /></div><p>{steps[step]}</p></div>
    <section className="wizard-body">
      {step === 0 && <div className="intro-step"><span className="eyebrow"><Sparkles size={14} />3분이면 신청 완료</span><h1>무거운 짐,<br /><em>문 앞에서 맡겨요</em></h1><p>짐토리가 수거부터 보관, 다시 받는 날까지 함께할게요.</p><div className="intro-visual"><div className="route-dash" /><article><Truck /><b>문 앞 수거</b><small>원하는 시간에</small></article><article><Warehouse /><b>안심 보관</b><small>상태까지 확인</small></article><article><HandCoins /><b>대여 수익</b><small>원할 때 선택</small></article><img src="/assets/zimtori-character-3d.png" alt="짐토리 캐릭터" /></div><div className="notice-card"><ShieldCheck /><div><strong>신청 전 알아두세요</strong><p>보관이 어려운 물품은 등록 단계에서 바로 알려드려요.</p></div></div></div>}
      {step === 1 && <div><StepTitle kicker="STEP 1" title="어떤 상황에서 보관이 필요한가요?" desc="가장 가까운 상황을 하나 골라주세요." /><div className="option-list">{situations.map((item) => <button key={item.title} className={draft.situation === item.title ? "selected" : ""} onClick={() => setDraft((prevDraft: StorageDraft) => ({ ...prevDraft, situation: item.title }))}><span>{item.icon}</span><div><strong>{item.title}</strong><small>{item.desc}</small></div><i>{draft.situation === item.title && <Check size={16} />}</i></button>)}</div></div>}
      {step === 2 && <div>
        <StepTitle kicker="STEP 2" title="어디에서 짐을 맡길까요?" desc="서울 지하철역을 검색하거나 현재 위치를 확인해보세요." />
        <div className="map-tools">
          <div className="search-field"><Search size={18} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="역 이름 검색" /><button onClick={() => setSearch("")} aria-label="검색어 지우기">{search && <X size={16} />}</button></div>
          <button className={`locate-button ${located ? "located" : ""}`} onClick={locate} disabled={locating}><LocateFixed size={18} />{locating ? "정확도 확인 중" : located ? "위치 확인됨" : "내 위치"}</button>
        </div>
        {locationFeedback && <div className={`location-feedback ${locationFeedback.tone}`}>{locationFeedback.tone === "success" ? <Check size={18} /> : <AlertCircle size={18} />}<div><strong>{locationFeedback.title}</strong><p>{locationFeedback.message}</p></div></div>}
        {nearestStation && <div className="nearest-station-card"><Navigation size={19} /><div><small>현재 위치에서 가장 가까운 역</small><strong>{nearestStation.station.name} · {formatDistance(nearestStation.distance)}</strong><p>GPS 결과로 자동 선택하지 않았어요.</p></div><button onClick={() => { selectStation(nearestStation.station.name); setView("map"); }}>이 역 선택</button></div>}
        <div className="line-filter">{["전체", ...stationGroups.map((group) => group.line)].map((item) => <button key={item} className={line === item ? "active" : ""} onClick={() => setLine(item)}>{item}</button>)}</div>
        <div className="view-toggle"><button className={view === "map" ? "active" : ""} onClick={() => setView("map")}><Map size={16} />지도</button><button className={view === "list" ? "active" : ""} onClick={() => setView("list")}><List size={16} />목록</button></div>
        <div className={`map-view-panel ${view === "map" ? "" : "hidden"}`}><KakaoMap stations={allStationPoints} line={line} search={search} selectedStation={draft.station} position={currentPosition} locating={locating} visible={view === "map"} onSelectStation={selectStation} onLocate={locate} onShowList={() => setView("list")} /></div>
        {view === "list" && <StationList stations={filteredStations} selected={draft.station} onSelect={selectStation} />}
        {draft.station && <div className="selected-station"><span className="station-symbol"><MapPin size={19} /></span><div><small>선택한 픽업 위치</small><strong>{draft.station}</strong><p>픽업 가능 · 지도와 목록에서 같은 역이 강조돼요.</p></div><Check size={20} /></div>}
      </div>}
      {step === 3 && <div><StepTitle kicker="STEP 3" title="보관할 캐비닛을 선택해주세요" desc="짐 수량에 맞는 크기를 고르면 월 예상 금액을 바로 확인할 수 있어요." /><div className="branch-selector"><MapPin size={19} /><div><small>선택한 보관 위치</small><strong>{draft.station || "역을 먼저 선택해주세요"}</strong></div></div><div className="cabinet-grid">{cabinetOptions.map((cabinet) => <button key={cabinet.id} className={draft.cabinet === cabinet.id ? "selected" : ""} onClick={() => setDraft((prevDraft) => ({ ...prevDraft, cabinet: cabinet.id }))}><img src={cabinet.image} alt={`${cabinet.id} 캐비닛 제품 이미지`} /><div><strong>{cabinet.id} 캐비닛</strong><span>{cabinet.boxes}</span><b>월 {won(cabinet.price)}</b></div>{draft.cabinet === cabinet.id && <i><Check size={16} /></i>}</button>)}</div>{selectedCabinet && <div className="cabinet-summary"><Boxes size={20} /><div><small>선택한 캐비닛</small><strong>{selectedCabinet.id} 캐비닛 · {selectedCabinet.boxes}</strong></div><b>월 {won(selectedCabinet.price)}</b></div>}<div className="box-standard"><div className="box-visual"><span /><span /><span /></div><div><strong>짐토리 기준 박스</strong><p>박스 사이즈 55×40×36cm</p></div></div><div className="date-card"><h3><CalendarDays size={19} />보관 기간</h3><label><span>시작일</span><input type="date" value={draft.startDate} onChange={(event) => setDraft((prevDraft) => ({ ...prevDraft, startDate: event.target.value }))} /></label><label><span>종료 예정일</span><input type="date" value={draft.endDate} onChange={(event) => setDraft((prevDraft) => ({ ...prevDraft, endDate: event.target.value }))} /></label></div></div>}
      {step === 4 && <div><StepTitle kicker="STEP 4" title="어떻게 맡길까요?" desc="내 일정에 맞는 방법을 선택해주세요." /><div className="method-grid"><button className={draft.method === "pickup" ? "selected" : ""} onClick={() => setDraft((prevDraft) => ({ ...prevDraft, method: "pickup" }))}><span><Truck /></span><b>문 앞 픽업</b><p>기사님이 원하는 시간에 방문해요.</p><small>픽업비 6,000원</small>{draft.method === "pickup" && <i><Check size={16} /></i>}</button><button className={draft.method === "dropoff" ? "selected" : ""} onClick={() => setDraft((prevDraft) => ({ ...prevDraft, method: "dropoff" }))}><span><Warehouse /></span><b>직접 맡기기</b><p>선택한 거점에 예약하고 방문해요.</p><small>방문 비용 무료</small>{draft.method === "dropoff" && <i><Check size={16} /></i>}</button></div>{draft.method === "pickup" && <div className="form-card pickup-form"><label><span>기본 주소</span><input value={draft.baseAddress} onChange={(event) => setDraft((prevDraft) => ({ ...prevDraft, baseAddress: event.target.value }))} placeholder="예: 서울 서대문구 연세로 12" /></label><label><span>상세 주소</span><input value={draft.detailAddress} onChange={(event) => setDraft((prevDraft) => ({ ...prevDraft, detailAddress: event.target.value }))} placeholder="동·호수 또는 건물명을 입력해주세요" /></label><div className="time-field"><label><span>픽업 시작</span><select value={draft.pickupStart} onChange={(event) => setDraft((prevDraft) => ({ ...prevDraft, pickupStart: event.target.value }))}>{timeOptions.slice(0, 24).map((time) => <option key={time}>{time}</option>)}</select></label><i>부터</i><label><span>픽업 종료</span><select value={draft.pickupEnd} onChange={(event) => setDraft((prevDraft) => ({ ...prevDraft, pickupEnd: event.target.value }))}>{timeOptions.slice(1).map((time) => <option key={time}>{time}</option>)}</select></label></div><label><span>기사님께 전달할 내용</span><input value={draft.pickupRequest} onChange={(event) => setDraft((prevDraft) => ({ ...prevDraft, pickupRequest: event.target.value }))} placeholder="예: 도착 전 연락 부탁드려요" /></label><div className="time-help"><Clock3 size={17} />00:00부터 24:00까지 한 시간 단위로 선택할 수 있어요.</div></div>}</div>}
      {step === 5 && <div><StepTitle kicker="STEP 5" title="안 쓰는 물품, 대여 맡길까요?" desc="위탁 대여를 선택하면 물품 등록 페이지로 이동해요." /><div className="consignment-hero"><img src="/assets/zimtori-character-3d.png" alt="짐토리 캐릭터" /><div><span>예상 월 수익</span><strong>최대 28,000원</strong><p>캐리어·캠핑용품 기준 예시예요.</p></div></div><div className="choice-cards"><button className={draft.consignment ? "selected" : ""} onClick={() => { setDraft((prevDraft) => ({ ...prevDraft, consignment: true })); onGoLend(); }}><HandCoins /><div><b>보관하며 대여 맡길래요</b><p>사진과 물품 정보를 등록하러 이동해요.</p></div><ChevronRight size={19} /></button><button className={!draft.consignment ? "selected" : ""} onClick={() => setDraft((prevDraft) => ({ ...prevDraft, consignment: false }))}><ShieldCheck /><div><b>보관만 할래요</b><p>내가 찾을 때까지 안전하게 보관해요.</p></div>{!draft.consignment && <Check size={19} />}</button></div><div className="notice-card"><Info /><div><strong>입력한 보관 신청 내용은 유지돼요</strong><p>물품 등록 페이지에서 돌아와도 캐비닛과 주소 정보가 사라지지 않아요.</p></div></div></div>}
      {step === 6 && <div><StepTitle kicker="STEP 6" title="신청 내용을 확인해주세요" desc="아직 결제되지 않으며, 최종 확인 후 접수돼요." /><div className="summary-card"><SummaryRow label="보관 상황" value={draft.situation} /><SummaryRow label="보관 위치" value={draft.station} /><SummaryRow label="캐비닛" value={draft.cabinet ? `${draft.cabinet} 캐비닛 · ${selectedCabinet?.boxes}` : ""} /><SummaryRow label="보관 기간" value={`${draft.startDate} ~ ${draft.endDate}`} /><SummaryRow label="보관 방식" value={draft.method === "pickup" ? "문 앞 픽업" : "직접 맡기기"} />{draft.method === "pickup" && <SummaryRow label="픽업 주소" value={`${draft.baseAddress} ${draft.detailAddress}`.trim()} />}{draft.method === "pickup" && <SummaryRow label="픽업 시간" value={`${draft.pickupStart} - ${draft.pickupEnd}`} />}<SummaryRow label="위탁 대여" value={draft.consignment ? "검수 신청 완료" : "신청 안 함"} /></div><div className="price-card"><div><span>예상 보관료</span><strong>{won(estimate)}</strong></div>{draft.consignment && <div className="income-row"><span>예상 대여 수익</span><strong>- {won(18000)}</strong></div>}<hr /><div className="total-row"><span>예상 최종 부담</span><strong>{won(Math.max(0, estimate - (draft.consignment ? 18000 : 0)))}</strong></div><small>실제 금액은 물품 검수와 보관 기간에 따라 달라질 수 있어요.</small></div><label className="agree-check"><input type="checkbox" defaultChecked /><span><Check size={14} /></span>필수 약관과 보관 유의사항을 확인했어요.</label></div>}
      {step === 7 && <div className="complete-step"><div className="complete-mark"><Check size={38} /></div><img src="/assets/zimtori-character-3d.png" alt="짐토리 캐릭터" /><span>신청번호 ST-072026</span><h1>보관 신청을<br />완료했어요!</h1><p>담당자가 캐비닛과 일정을 확인한 뒤<br />알림으로 안내해드릴게요.</p><div className="complete-info"><div><Clock3 /><span>픽업 예정</span><strong>{draft.startDate}<br />{draft.method === "pickup" ? `${draft.pickupStart} - ${draft.pickupEnd}` : "직접 방문"}</strong></div><div><MapPin /><span>보관 위치</span><strong>{draft.station}<br />{draft.cabinet} 캐비닛</strong></div></div><button className="primary-button" onClick={() => { setStep(0); onBack(); }}>홈으로 돌아가기</button></div>}
      {error && <div className="error-message"><AlertCircle size={17} />{error}</div>}
    </section>
    {step < 7 && <div className="wizard-footer"><button className="ghost-button" onClick={prev}>{step === 0 ? "나중에" : "이전"}</button><button className="primary-button" onClick={next}>{step === 6 ? "신청 완료하기" : "다음"}<ChevronRight size={18} /></button></div>}
  </main>;
}

function StepTitle({ kicker, title, desc }: { kicker: string; title: string; desc: string }) {
  return <div className="step-title"><span>{kicker}</span><h1>{title}</h1><p>{desc}</p></div>;
}

function SummaryRow({ label, value }: { label: string; value: string }) { return <div className="summary-row"><span>{label}</span><strong>{value || "선택 안 함"}</strong><Pencil size={15} /></div>; }

function StationList({ stations, selected, onSelect }: { stations: StationPoint[]; selected: string; onSelect: (station: string) => void }) {
  return <div className="station-list">{stations.length ? stations.map((station) => <button key={station.id} className={selected === station.name ? "selected" : ""} onClick={() => onSelect(station.name)}><div>{station.lines.map((stationLine) => <i key={stationLine} style={{ background: SUBWAY_LINE_COLORS[stationLine] }}>{stationLine.replace("호선", "")}</i>)}</div><strong>{station.name}</strong><span>{station.pickupAvailable ? "픽업 가능" : "픽업 불가"}<ChevronRight size={16} /></span></button>) : <div className="no-result"><Search /><strong>검색 결과가 없어요</strong><p>다른 역 이름으로 찾아보세요.</p></div>}</div>;
}

function mapMarkerData(fill: string, stroke: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="34" height="42" viewBox="0 0 34 42"><path d="M17 1C8.16 1 1 8.16 1 17c0 11.1 16 24 16 24s16-12.9 16-24C33 8.16 25.84 1 17 1Z" fill="${fill}" stroke="${stroke}" stroke-width="2"/><circle cx="17" cy="17" r="6" fill="white"/></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function KakaoMap({ stations, line, search, selectedStation, position, locating, visible, onSelectStation, onLocate, onShowList }: {
  stations: StationPoint[];
  line: string;
  search: string;
  selectedStation: string;
  position: CurrentPosition | null;
  locating: boolean;
  visible: boolean;
  onSelectStation: (station: string) => void;
  onLocate: () => void;
  onShowList: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<KakaoMapInstance | null>(null);
  const stationMarkerRefs = useRef<KakaoMarkerInstance[]>([]);
  const positionMarkerRef = useRef<KakaoMarkerInstance | null>(null);
  const accuracyCircleRef = useRef<KakaoCircleInstance | null>(null);
  const infoWindowRef = useRef<KakaoInfoWindowInstance | null>(null);
  const clustererRef = useRef<KakaoMarkerClustererInstance | null>(null);
  const [sdkReady, setSdkReady] = useState(false);
  const [loadError, setLoadError] = useState("");
  const appKey = process.env.NEXT_PUBLIC_KAKAO_MAP_APP_KEY;
  const mapStations = useMemo(() => line === "전체" ? stations : stations.filter((station) => station.lines.includes(line)), [line, stations]);

  const prepareMap = () => {
    if (!window.kakao?.maps) return setLoadError("카카오맵 SDK를 불러오지 못했어요. 앱 키와 등록 도메인을 확인해주세요.");
    window.kakao.maps.load(() => {
      setLoadError("");
      setSdkReady(true);
    });
  };

  useEffect(() => {
    if (!sdkReady || !containerRef.current || mapRef.current || !window.kakao?.maps) return;
    const maps = window.kakao.maps;
    mapRef.current = new maps.Map(containerRef.current, {
      center: new maps.LatLng(37.5665, 126.9780),
      level: 8,
    });
  }, [sdkReady]);

  useEffect(() => {
    if (!visible || !mapRef.current) return;
    const frame = window.requestAnimationFrame(() => mapRef.current?.relayout());
    const timer = window.setTimeout(() => mapRef.current?.relayout(), 120);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, [visible]);

  useEffect(() => {
    if (!sdkReady || !mapRef.current || !window.kakao?.maps) return;
    const maps = window.kakao.maps;
    clustererRef.current?.clear();
    stationMarkerRefs.current.forEach((marker) => marker.setMap(null));
    stationMarkerRefs.current = [];
    infoWindowRef.current?.close();

    const defaultImage = new maps.MarkerImage(mapMarkerData("#78553a", "#ffffff"), new maps.Size(30, 38), { offset: new maps.Point(15, 38) });
    const searchImage = new maps.MarkerImage(mapMarkerData("#35a854", "#ffffff"), new maps.Size(32, 40), { offset: new maps.Point(16, 40) });
    const selectedImage = new maps.MarkerImage(mapMarkerData("#f4b62b", "#6b472c"), new maps.Size(36, 44), { offset: new maps.Point(18, 44) });
    const query = search.trim();
    let selectedInfo: { marker: KakaoMarkerInstance; infoWindow: KakaoInfoWindowInstance } | null = null;

    const markers = mapStations.map((station) => {
      const isSelected = station.name === selectedStation;
      const isSearchResult = Boolean(query) && station.name.includes(query);
      const marker = new maps.Marker({
        position: new maps.LatLng(station.lat, station.lng),
        image: isSelected ? selectedImage : isSearchResult ? searchImage : defaultImage,
        clickable: true,
      });
      const lineBadges = station.lines.map((stationLine) => `<span style="display:inline-block;margin-right:4px;padding:2px 6px;border-radius:8px;background:${SUBWAY_LINE_COLORS[stationLine]};color:#fff;font-size:10px;font-weight:800">${stationLine}</span>`).join("");
      const infoWindow = new maps.InfoWindow({
        removable: true,
        content: `<div style="min-width:170px;padding:13px 15px;color:#513a28;font-family:Arial,sans-serif"><strong style="display:block;margin-bottom:7px;font-size:14px">${station.name}</strong><div>${lineBadges}</div><p style="margin:8px 0 0;color:#6b756d;font-size:11px">${station.pickupAvailable ? "픽업 가능" : "픽업 불가"}</p></div>`,
      });
      maps.event.addListener(marker, "click", () => {
        infoWindowRef.current?.close();
        onSelectStation(station.name);
        infoWindow.open(mapRef.current!, marker);
        infoWindowRef.current = infoWindow;
      });
      if (isSelected) selectedInfo = { marker, infoWindow };
      return marker;
    });

    stationMarkerRefs.current = markers;
    const clusterer = typeof maps.MarkerClusterer === "function"
      ? new maps.MarkerClusterer({ map: mapRef.current, averageCenter: true, minLevel: 7 })
      : null;
    if (clusterer) {
      clusterer.addMarkers(markers);
      clustererRef.current = clusterer;
    } else {
      markers.forEach((marker) => marker.setMap(mapRef.current));
    }
    if (selectedInfo) {
      const selected = selectedInfo as { marker: KakaoMarkerInstance; infoWindow: KakaoInfoWindowInstance };
      selected.infoWindow.open(mapRef.current, selected.marker);
      infoWindowRef.current = selected.infoWindow;
    }

    return () => {
      clusterer?.clear();
      markers.forEach((marker) => marker.setMap(null));
      infoWindowRef.current?.close();
    };
  }, [mapStations, onSelectStation, sdkReady, search, selectedStation]);

  useEffect(() => {
    if (!sdkReady || !selectedStation || !mapRef.current || !window.kakao?.maps) return;
    const selected = stations.find((station) => station.name === selectedStation);
    if (!selected) return;
    const location = new window.kakao.maps.LatLng(selected.lat, selected.lng);
    mapRef.current.panTo(location);
    mapRef.current.setLevel(4);
  }, [sdkReady, selectedStation, stations]);

  useEffect(() => {
    if (!sdkReady || !search.trim() || !mapRef.current || !window.kakao?.maps) return;
    const result = mapStations.find((station) => station.name.includes(search.trim()));
    if (!result) return;
    mapRef.current.panTo(new window.kakao.maps.LatLng(result.lat, result.lng));
    mapRef.current.setLevel(5);
  }, [mapStations, sdkReady, search]);

  useEffect(() => {
    positionMarkerRef.current?.setMap(null);
    positionMarkerRef.current = null;
    accuracyCircleRef.current?.setMap(null);
    accuracyCircleRef.current = null;
    if (!sdkReady || !position || !mapRef.current || !window.kakao?.maps) return;
    const maps = window.kakao.maps;
    const location = new maps.LatLng(position.latitude, position.longitude);
    const currentImage = new maps.MarkerImage(mapMarkerData("#3b82f6", "#ffffff"), new maps.Size(34, 42), { offset: new maps.Point(17, 42) });
    positionMarkerRef.current = new maps.Marker({ map: mapRef.current, position: location, image: currentImage });
    accuracyCircleRef.current = new maps.Circle({
      map: mapRef.current,
      center: location,
      radius: position.accuracy,
      strokeWeight: 2,
      strokeColor: "#3b82f6",
      strokeOpacity: 0.72,
      fillColor: "#60a5fa",
      fillOpacity: 0.16,
    });
    mapRef.current.setCenter(location);
    mapRef.current.setLevel(4);
    mapRef.current.relayout();
  }, [position, sdkReady]);

  if (!appKey) {
    return <div className="map-placeholder"><div className="map-placeholder-symbol"><AlertCircle size={32} /></div><span>카카오맵 설정 필요</span><h3>지도 앱 키를 확인해주세요</h3><p>환경 변수에 카카오맵 JavaScript 앱 키가 설정되지 않았어요.</p><button onClick={onShowList}><List size={17} />목록에서 역 선택하기</button></div>;
  }

  return <><Script id="kakao-map-sdk" src={`https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&autoload=false&libraries=services,clusterer`} strategy="afterInteractive" onReady={prepareMap} onError={() => setLoadError("카카오맵을 불러오지 못했어요. 네트워크 연결과 등록 도메인을 확인해주세요.")} /><div className="kakao-map-shell"><div ref={containerRef} className="kakao-map-canvas" aria-label="서울 지하철역과 현재 위치를 확인하는 카카오 지도" />{(!sdkReady || loadError) && <div className={`kakao-map-state ${loadError ? "error" : ""}`}>{loadError ? <AlertCircle size={27} /> : <span className="map-loading-spinner" />}<strong>{loadError || "카카오맵과 지하철역을 불러오는 중이에요"}</strong>{loadError && <button onClick={onShowList}>역 목록으로 보기</button>}</div>}<button className="map-locate-control" onClick={onLocate} disabled={locating}><LocateFixed size={17} />{locating ? "정확도 확인 중" : position ? "현재 위치 다시 찾기" : "현재 위치 찾기"}</button></div><div className="kakao-map-caption"><span><MapPin size={14} />{position ? `현재 위치 · 정확도 약 ${Math.round(position.accuracy)}m` : `${line === "전체" ? "1~9호선" : line} 역 마커 표시 중`}</span><button onClick={onShowList}><List size={15} />역 선택</button></div></>;
}

function RentalList({ favorites, onBack, onOpen, onFavorite, onLend }: { favorites: number[]; onBack: () => void; onOpen: (rental: Rental) => void; onFavorite: (id: number) => void; onLend: () => void }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("전체");
  const [nearFirst, setNearFirst] = useState(false);
  const categories = ["전체", "여행용품", "생활가전", "캠핑용품", "취미용품", "공구"];
  const filtered = rentals.filter((item) => (category === "전체" || item.category === category) && item.name.includes(query)).sort((a, b) => nearFirst ? a.location.localeCompare(b.location, "ko") : a.id - b.id);
  return <main className="page rentals-page"><BrandHeader back={onBack} /><div className="listing-head"><span className="section-kicker">필요한 만큼만 빌려요</span><h1>대여 물품 둘러보기</h1><p>짐토리가 상태를 확인한 물품이에요.</p><div className="search-bar"><Search size={19} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="어떤 물품을 찾으세요?" /><button onClick={() => query ? setQuery("") : setNearFirst((current) => !current)} aria-label={query ? "검색어 지우기" : "정렬 전환"}>{query ? <X size={17} /> : <SlidersHorizontal size={17} />}</button></div></div><div className="category-scroll">{categories.map((item) => <button key={item} className={category === item ? "active" : ""} onClick={() => setCategory(item)}>{item}</button>)}</div><div className="listing-meta"><strong>{filtered.length}개의 물품</strong><button className={nearFirst ? "active" : ""} onClick={() => setNearFirst((current) => !current)}><MapPin size={15} />{nearFirst ? "기본 순" : "내 주변 순"}</button></div><div className="rental-grid">{filtered.map((rental) => <RentalCard key={rental.id} rental={rental} favorite={favorites.includes(rental.id)} onOpen={() => onOpen(rental)} onFavorite={() => onFavorite(rental.id)} />)}</div>{!filtered.length && <div className="no-result"><Search /><strong>찾는 물품이 아직 없어요</strong><p>다른 검색어를 입력하거나 직접 맡겨보세요.</p></div>}<button className="lend-fab" onClick={onLend}><Plus size={20} />내 물품 맡기기</button></main>;
}

function RentalDetail({ rental, favorite, onBack, onFavorite, onCheckout, onQuestion }: { rental: Rental; favorite: boolean; onBack: () => void; onFavorite: () => void; onCheckout: () => void; onQuestion: () => void }) {
  const [month, setMonth] = useState(7);
  const [selectedDay, setSelectedDay] = useState(22);
  return <main className="page detail-page"><div className="detail-visual" style={{ background: rental.tone }}><button className="floating-back" onClick={onBack} aria-label="대여 목록으로 돌아가기"><ArrowLeft size={22} /></button><button className={`detail-heart ${favorite ? "active" : ""}`} onClick={onFavorite} aria-label="찜하기"><Heart size={21} fill={favorite ? "currentColor" : "none"} /></button><img className="detail-product-image" src={rental.image} alt={`${rental.name} 제품 사진`} onError={(event) => { event.currentTarget.src = "/assets/zimtori-symbol.png"; }} /><div className="visual-badge"><BadgeCheck size={15} />짐토리 검수 완료</div></div><section className="detail-copy"><div className="detail-category">{rental.category}<span>대여 가능</span></div><h1>{rental.name}</h1><div className="rating-line"><Star size={16} fill="currentColor" />{rental.rating}<u>후기 {rental.reviews}개</u><MapPin size={15} />{rental.location}</div><div className="price-line"><strong>{won(rental.price)}</strong><span>/ 1일</span><small>보증금 {won(rental.deposit)}</small></div><hr /><h2>물품 소개</h2><p>{rental.description}</p><div className="owner-card"><div className="owner-avatar">짐</div><div><strong>{rental.owner}</strong><span><ShieldCheck size={14} />본인 인증 · 응답률 98%</span></div><ChevronRight size={18} /></div><h2>대여 가능 날짜</h2><div className="calendar-preview"><div><button onClick={() => setMonth((current) => current === 6 ? 8 : current - 1)} aria-label="이전 달">‹</button><strong>2026년 {month}월</strong><button onClick={() => setMonth((current) => current === 8 ? 6 : current + 1)} aria-label="다음 달">›</button></div><div className="weekdays">{["일", "월", "화", "수", "목", "금", "토"].map((day) => <span key={day}>{day}</span>)}</div><div className="days">{Array.from({ length: 28 }, (_, i) => <button key={i} className={`${i > 18 && i < 26 ? "available" : ""} ${selectedDay === i + 1 ? "selected" : ""}`} onClick={() => setSelectedDay(i + 1)}>{i + 1}</button>)}</div></div><div className="safety-card"><ShieldCheck /><div><strong>짐토리 안심 대여</strong><p>물품 상태 확인과 반납 과정을 기록해요.</p></div></div></section><div className="detail-footer"><button className="question-button" onClick={onQuestion}><MessageCircleQuestion size={20} /><span>문의</span></button><button className="primary-button" onClick={onCheckout}>대여 신청하기</button></div></main>;
}

function Checkout({ rental, onBack, onComplete }: { rental: Rental; onBack: () => void; onComplete: (total: number) => void }) {
  const [days, setDays] = useState(3);
  const rentalFee = rental.price * days;
  return <main className="page checkout-page"><BrandHeader back={onBack} /><section className="checkout-body"><StepTitle kicker="대여 신청" title="이용 정보를 확인해주세요" desc="결제는 아직 진행되지 않아요." /><div className="checkout-item"><div style={{ background: rental.tone }}><img src={rental.image} alt={`${rental.name} 제품 사진`} /></div><span><small>{rental.category}</small><strong>{rental.name}</strong><p><MapPin size={14} />{rental.location}</p></span></div><div className="form-card"><label><span>대여 시작일</span><input type="date" defaultValue="2026-07-22" /></label><label><span>대여 기간</span><div className="duration-control"><button onClick={() => setDays(Math.max(1, days - 1))}><Minus size={17} /></button><strong>{days}일</strong><button onClick={() => setDays(days + 1)}><Plus size={17} /></button></div></label><label><span>수령 방법</span><select><option>{rental.location} 직접 수령</option><option>짐토리 배송</option></select></label></div><div className="price-card"><SummaryRow label="대여료" value={won(rentalFee)} /><SummaryRow label="보증금" value={won(rental.deposit)} /><hr /><div className="total-row"><span>결제 예정 금액</span><strong>{won(rentalFee + rental.deposit)}</strong></div><small>현재는 베타 테스트 신청이며 실제 결제되지 않아요.</small></div><div className="notice-card"><CreditCard /><div><strong>결제 기능 연결 전 체험 화면이에요</strong><p>신청 흐름은 저장되며 실제 비용은 청구되지 않아요.</p></div></div><label className="agree-check"><input type="checkbox" defaultChecked /><span><Check size={14} /></span>대여 유의사항과 반납 규정을 확인했어요.</label></section><div className="wizard-footer"><button className="ghost-button" onClick={onBack}>이전</button><button className="primary-button" onClick={() => onComplete(rentalFee + rental.deposit)}>대여 신청 완료</button></div></main>;
}

function LendForm({ onBack, onComplete }: { onBack: () => void; onComplete: (submission: LendSubmission) => Promise<void> }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("여행용품");
  const [condition, setCondition] = useState("사용감 적음");
  const [components, setComponents] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("5000");
  const [uploads, setUploads] = useState<{ file: File; preview: string }[]>([]);
  const [coverIndex, setCoverIndex] = useState(0);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const chooseFiles = (files: FileList | null) => {
    if (!files) return;
    setError("");
    const selected = Array.from(files);
    if (uploads.length + selected.length > 5) return setError("사진은 최대 5장까지 등록할 수 있어요.");
    const invalid = selected.find((file) => !["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 8 * 1024 * 1024);
    if (invalid) return setError("JPG, PNG, WebP 형식의 8MB 이하 사진만 등록할 수 있어요.");
    setUploads((current) => [...current, ...selected.map((file) => ({ file, preview: URL.createObjectURL(file) }))]);
  };

  const removeUpload = (index: number) => {
    setUploads((current) => {
      URL.revokeObjectURL(current[index].preview);
      return current.filter((_, itemIndex) => itemIndex !== index);
    });
    setCoverIndex(0);
  };

  const submit = async () => {
    if (!uploads.length) return setError("물품 사진을 한 장 이상 등록해주세요.");
    if (!name.trim()) return setError("물품 이름을 입력해주세요.");
    if (!components.trim()) return setError("구성품을 입력해주세요.");
    if (!description.trim()) return setError("물품 설명을 입력해주세요.");
    setError("");
    setSaving(true);
    const ordered = uploads.map((item) => item.file);
    if (coverIndex > 0) [ordered[0], ordered[coverIndex]] = [ordered[coverIndex], ordered[0]];
    try {
      await onComplete({ name: name.trim(), category, condition, components: components.trim(), description: description.trim(), price: Number(price) || 0, files: ordered });
    } catch {
      setError("사진을 저장하지 못했어요. 다시 시도해주세요.");
      setSaving(false);
    }
  };

  return <main className="page lend-page"><BrandHeader back={onBack} /><section className="wizard-body"><StepTitle kicker="위탁 대여" title="안 쓰는 물품을 맡겨보세요" desc="사진과 상태를 등록하면 짐토리가 검수를 시작해요." /><input ref={inputRef} className="hidden-file-input" aria-label="물품 사진 선택" type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(event) => { chooseFiles(event.target.files); event.target.value = ""; }} /><button className={`upload-zone ${uploads.length ? "selected" : ""}`} onClick={() => inputRef.current?.click()}><UploadCloud size={30} /><strong>{uploads.length ? `${uploads.length}장의 사진이 등록됐어요` : "갤러리에서 물품 사진 등록"}</strong><span>JPG, PNG, WebP · 장당 8MB 이하 · 최대 5장</span><small>{uploads.length ? "사진 더 추가하기" : "갤러리 열기"}</small></button>{uploads.length > 0 && <div className="upload-preview-grid">{uploads.map((upload, index) => <article key={upload.preview} className={coverIndex === index ? "cover" : ""}><img src={upload.preview} alt={`등록한 물품 사진 ${index + 1}`} /><button className="set-cover" onClick={() => setCoverIndex(index)}>{coverIndex === index ? "대표 사진" : "대표로 선택"}</button><button className="remove-upload" onClick={() => removeUpload(index)} aria-label={`${index + 1}번째 사진 삭제`}><Trash2 size={15} /></button></article>)}</div>}<div className="form-card"><label><span>물품 이름</span><input value={name} onChange={(event) => setName(event.target.value)} placeholder="예: 20인치 여행용 캐리어" /></label><label><span>카테고리</span><select value={category} onChange={(event) => setCategory(event.target.value)}>{["여행용품", "생활가전", "캠핑용품", "취미용품", "공구", "기타"].map((item) => <option key={item}>{item}</option>)}</select></label><label><span>물품 상태</span><select value={condition} onChange={(event) => setCondition(event.target.value)}><option>거의 새것</option><option>사용감 적음</option><option>사용감 있음</option></select></label><label><span>구성품</span><input value={components} onChange={(event) => setComponents(event.target.value)} placeholder="예: 본체, 충전 케이블, 보관 가방" /></label><label><span>희망 일 대여료</span><div className="won-input"><input value={price} onChange={(event) => setPrice(event.target.value.replace(/[^0-9]/g, ""))} /><b>원</b></div></label><label><span>물품 설명</span><textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="사용 기간, 상태와 특징을 자세히 알려주세요." rows={4} /></label></div><div className="notice-card"><ShieldCheck /><div><strong>사진은 이 기기에 안전하게 임시 저장해요</strong><p>서버 연결 전에는 IndexedDB에 보관하며, 검수 신청 후 이용내역에서 다시 볼 수 있어요.</p></div></div>{error && <div className="error-message"><AlertCircle size={17} />{error}</div>}</section><div className="wizard-footer"><button className="ghost-button" onClick={onBack}>취소</button><button className="primary-button" onClick={submit} disabled={saving}>{saving ? "저장 중..." : "검수 신청하기"}</button></div></main>;
}

function IndexedImage({ imageKey, alt }: { imageKey: string; alt: string }) {
  const [source, setSource] = useState("");
  useEffect(() => {
    let active = true;
    let objectUrl = "";
    loadUploadBlob(imageKey).then((blob) => {
      if (blob && active) { objectUrl = URL.createObjectURL(blob); setSource(objectUrl); }
    }).catch(() => undefined);
    return () => { active = false; if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [imageKey]);
  return source ? <img src={source} alt={alt} /> : <div className="image-loading"><UploadCloud size={20} /></div>;
}

function OrderVisual({ order }: { order: Order }) {
  if (order.imageKeys?.[0]) return <IndexedImage imageKey={order.imageKeys[0]} alt={`${order.title} 대표 사진`} />;
  return <img src={order.image || "/assets/zimtori-symbol.png"} alt={`${order.title} 이미지`} />;
}

function Orders({ orders, onHome, onDetail }: { orders: Order[]; onHome: () => void; onDetail: (orderId: string) => void }) {
  const [tab, setTab] = useState("전체");
  const list = [...orders, ...seedOrders].filter((order) => tab === "전체" || order.type === tab);
  return <main className="page orders-page"><BrandHeader onNavigate={onHome} /><div className="page-title"><span className="section-kicker">MY ACTIVITY</span><h1>이용내역</h1><p>필요한 정보만 간단하게 확인하고 상세 내용을 열어보세요.</p></div><div className="tab-row">{["전체", "보관", "대여", "위탁 대여"].map((item) => <button key={item} className={tab === item ? "active" : ""} onClick={() => setTab(item)}>{item}</button>)}</div><div className="order-list simple">{list.map((order) => <article key={order.id} className="order-card simple"><div className="order-image"><OrderVisual order={order} /></div><div className="order-card-copy"><div className="order-top"><span>{order.type}</span><b>{order.status}</b></div><h3>{order.title}</h3><p>{order.date} · {order.id}</p><div className="order-bottom"><strong>{won(order.price)}</strong><button onClick={() => onDetail(order.id)}>상세보기<ChevronRight size={16} /></button></div></div></article>)}</div>{!list.length && <div className="no-result"><ClipboardList /><strong>해당 이용내역이 없어요</strong><p>짐토리에서 첫 이용을 시작해보세요.</p><button className="primary-button" onClick={onHome}>홈으로 가기</button></div>}</main>;
}

function OrderDetail({ order, onBack, onQuestion }: { order: Order; onBack: () => void; onQuestion: () => void }) {
  const detailRows = order.type === "보관"
    ? [["캐비닛", order.details.cabinet], ["보관 위치", order.details.station], ["픽업 주소", order.details.address], ["픽업 시간", order.details.pickupTime], ["보관 기간", order.details.period], ["위탁 대여", order.details.consignment ? "신청" : "신청 안 함"]]
    : order.type === "대여"
      ? [["대여 기간", order.details.period], ["수령 위치", order.details.location], ["대여료", won(Number(order.details.rentalFee))], ["보증금", won(Number(order.details.deposit))], ["반납 예정일", order.details.returnDate]]
      : [["카테고리", order.details.category], ["물품 상태", order.details.condition], ["구성품", order.details.components], ["희망 일 대여료", won(Number(order.details.askingPrice))], ["검수 상태", order.status], ["연결된 보관", order.details.linkedStorage]];
  return <main className="page order-detail-page"><BrandHeader back={onBack} /><section className="order-detail-body"><span className="section-kicker">{order.type} 상세</span><div className="detail-status"><div><small>{order.id}</small><h1>{order.title}</h1><p>{order.date} 신청</p></div><b>{order.status}</b></div><div className={`order-detail-gallery ${order.imageKeys && order.imageKeys.length > 1 ? "multiple" : ""}`}>{order.imageKeys?.length ? order.imageKeys.map((key, index) => <IndexedImage key={key} imageKey={key} alt={`${order.title} 등록 사진 ${index + 1}`} />) : <OrderVisual order={order} />}</div>{order.type === "위탁 대여" && <div className="item-description"><strong>물품 설명</strong><p>{String(order.details.description || "등록된 설명이 없어요.")}</p></div>}<div className="order-info-card">{detailRows.map(([label, value]) => <div key={String(label)}><span>{String(label)}</span><strong>{String(value || "-")}</strong></div>)}</div><div className="price-card"><div className="total-row"><span>{order.type === "위탁 대여" ? "희망 일 대여료" : "예상·결제 금액"}</span><strong>{won(order.price)}</strong></div><small>현재 체험 버전에서는 실제 결제나 정산이 진행되지 않아요.</small></div>{order.type === "대여" && <button className="primary-button wide" onClick={onQuestion}><MessageCircleQuestion size={18} />이 이용 건으로 문의하기</button>}</section></main>;
}

function Favorites({ items, onBack, onOpen, onFavorite }: { items: Rental[]; onBack: () => void; onOpen: (rental: Rental) => void; onFavorite: (id: number) => void }) {
  return <main className="page favorites-page"><BrandHeader back={onBack} /><div className="page-title"><span className="section-kicker">SAVED ITEMS</span><h1>찜한 물품</h1><p>필요할 때 다시 찾아보기 쉽게 모았어요.</p></div>{items.length ? <div className="rental-grid">{items.map((rental: Rental) => <RentalCard key={rental.id} rental={rental} favorite onOpen={() => onOpen(rental)} onFavorite={() => onFavorite(rental.id)} />)}</div> : <div className="no-result"><Heart /><strong>아직 찜한 물품이 없어요</strong><p>마음에 드는 물품에 하트를 눌러보세요.</p></div>}</main>;
}

function Notifications({ onBack, onReadAll }: { onBack: () => void; onReadAll: () => void }) {
  const [read, setRead] = useState(false);
  const list = [{ icon: Truck, title: "내일 픽업 예정이에요", body: "오후 6시~8시 사이에 방문할 예정이에요.", time: "10분 전" }, { icon: BadgeCheck, title: "보관 물품 검수가 완료됐어요", body: "등록한 박스 2개의 상태 확인을 마쳤어요.", time: "어제" }, { icon: Gift, title: "신규 가입 3,000P가 도착했어요", body: "짐토리 옷입히기에서 사용할 수 있어요.", time: "3일 전" }];
  return <main className="page notification-page"><BrandHeader back={onBack} /><div className="page-title inline"><div><span className="section-kicker">NOTICE</span><h1>알림</h1></div><button onClick={() => { setRead(true); onReadAll(); }}>모두 읽음</button></div><div className="notification-list">{list.map(({ icon: Icon, title, body, time }) => <article key={title} className={read ? "read" : ""}><span><Icon size={20} /></span><div><strong>{title}</strong><p>{body}</p><small>{time}</small></div>{!read && <i />}</article>)}</div></main>;
}

function AvatarCanvas({ equipped, compact = false }: { equipped: string[]; compact?: boolean }) {
  return <div className={`avatar-canvas ${compact ? "compact" : ""}`}><img className="avatar-base" src="/assets/zimtori-character-3d.png" alt={compact ? "저장한 코디를 입은 짐토리" : "꾸미는 중인 짐토리"} />{equipped.map((id) => { const item = outfitItems.find((entry) => entry.id === id); return item ? <img key={id} className={`outfit-layer outfit-${id}`} src={item.image} alt="" aria-hidden="true" /> : null; })}</div>;
}

function MyPage({ favorites, orderCount, equipped, onNavigate, onInfo, onLogout }: { favorites: number; orderCount: number; equipped: string[]; onNavigate: (path: string) => void; onInfo: (title: string, body: string) => void; onLogout: () => void }) {
  const menuGroups = [
    { title: "나의 이용", items: [{ icon: ClipboardList, label: "보관·대여 이용내역", action: () => onNavigate("/orders") }, { icon: Heart, label: "찜한 물품", badge: String(favorites), action: () => onNavigate("/favorites") }, { icon: CircleDollarSign, label: "정산 관리", action: () => onInfo("정산 관리", "대여 수익 18,000원이 다음 정산일에 반영될 예정이에요.") }, { icon: TicketPercent, label: "쿠폰·포인트", badge: "2,400P", action: () => onInfo("쿠폰·포인트", "신규 가입 포인트와 아바타 꾸미기 포인트를 확인했어요.") }] },
    { title: "내 정보", items: [{ icon: UserRound, label: "프로필 수정", action: () => onInfo("프로필 수정", "이름, 휴대전화번호와 프로필 이미지를 수정할 수 있어요.") }, { icon: MapPin, label: "배송지 관리", action: () => onInfo("배송지 관리", "기본 배송지는 서울 서대문구 연세로 12예요.") }, { icon: WalletCards, label: "결제수단 관리", action: () => onInfo("결제수단 관리", "실제 결제 연동 단계에서 안전하게 연결할 예정이에요.") }, { icon: Settings, label: "알림 설정", action: () => onInfo("알림 설정", "픽업, 반납, 정산, 이벤트 알림을 각각 설정할 수 있어요.") }] },
    { title: "고객지원", items: [{ icon: MessageCircleQuestion, label: "고객센터·FAQ", action: () => onNavigate("/support") }, { icon: Info, label: "약관 및 정책", action: () => onInfo("약관 및 정책", "베타 서비스 이용약관과 개인정보처리방침을 준비하고 있어요.") }] },
  ];
  return <main className="page my-page"><BrandHeader onNavigate={onNavigate} /><section className="profile-hero"><div className="profile-avatar"><AvatarCanvas equipped={equipped} compact /></div><div><span>짐토리 새싹회원</span><h1>정승환님</h1><p>seunghwan@example.com</p></div><button onClick={() => onInfo("로그인 정보", "체험 계정으로 로그인 중이에요. 다음 단계에서 Google 또는 카카오 계정 정보를 연결할게요.")}><ChevronRight size={19} /></button></section><section className="point-card"><div><span>보유 포인트</span><strong>2,400P</strong><small>나만의 3D 짐토리 코디를 저장해보세요</small></div><button onClick={() => onNavigate("/my/avatar")}><Shirt size={19} />짐토리 옷입히기</button></section><section className="my-stats"><button onClick={() => onNavigate("/orders")}><b>{Math.max(2, orderCount)}</b><span>이용내역</span></button><button onClick={() => onInfo("보관 중", "현재 M 캐비닛 1건이 보관 중이에요.")}><b>1</b><span>보관 중</span></button><button onClick={() => onInfo("대여 수익", "누적 대여 수익은 18,000원이에요.")}><b>18,000</b><span>대여 수익</span></button></section>{menuGroups.map((group) => <section className="menu-group" key={group.title}><h2>{group.title}</h2>{group.items.map(({ icon: Icon, label, badge, action }) => <button key={label} onClick={action}><span><Icon size={19} /></span><strong>{label}</strong>{badge && <small>{badge}</small>}<ChevronRight size={17} /></button>)}</section>)}<button className="logout-button" onClick={onLogout}><LogOut size={18} />로그아웃</button><p className="version">짐토리 베타 v1.1.0</p></main>;
}

function AvatarStudio({ equipped, setEquipped, onBack, onSave }: { equipped: string[]; setEquipped: Dispatch<SetStateAction<string[]>>; onBack: () => void; onSave: () => void }) {
  const toggle = (id: string) => setEquipped((previous) => {
    if (previous.includes(id)) return previous.filter((item) => item !== id);
    const withoutOtherHat = ["cap", "grad"].includes(id) ? previous.filter((item) => !["cap", "grad"].includes(item)) : previous;
    return [...withoutOtherHat, id];
  });
  const randomize = () => {
    const shuffled = [...outfitItems].sort(() => 0.5 - Math.random());
    const selected: string[] = [];
    for (const item of shuffled) {
      if (["cap", "grad"].includes(item.id) && selected.some((id) => ["cap", "grad"].includes(id))) continue;
      selected.push(item.id);
      if (selected.length === 3) break;
    }
    setEquipped(selected);
  };
  return <main className="page avatar-page"><BrandHeader back={onBack} /><div className="avatar-title"><span className="eyebrow"><Sparkles size={14} />나만의 3D 짐토리</span><h1>오늘은 어떻게<br />꾸며볼까요?</h1><p>아이템이 눈·목·머리·몸에 맞게 정확히 배치돼요.</p></div><div className="avatar-stage"><div className="stage-blob" /><AvatarCanvas equipped={equipped} /><button className="random-button" onClick={randomize}><Sparkles size={17} />랜덤 코디</button></div><div className="avatar-wallet"><span><CircleDollarSign size={19} />보유 포인트</span><strong>2,400P</strong></div><div className="item-grid">{outfitItems.map((item) => <button key={item.id} className={equipped.includes(item.id) ? "selected" : ""} onClick={() => toggle(item.id)}><span className="item-image"><img src={item.image} alt={`${item.label} 3D 아이템`} /></span><strong>{item.label}</strong><small>{item.price}</small>{equipped.includes(item.id) && <i><Check size={14} /></i>}</button>)}</div><div className="avatar-actions"><button className="ghost-button" onClick={() => setEquipped([])}><RotateCcw size={17} />초기화</button><button className="primary-button" onClick={onSave}>코디 저장하기</button></div></main>;
}

function Support({ onBack, onSend }: { onBack: () => void; onSend: () => void }) {
  const [open, setOpen] = useState(0);
  const [message, setMessage] = useState("");
  const faqs = [{ q: "보관이 어려운 물품도 있나요?", a: "현금, 귀금속, 위험물, 음식물처럼 안전하게 보관하기 어려운 물품은 신청할 수 없어요." }, { q: "픽업 시간은 변경할 수 있나요?", a: "픽업 확정 전에는 이용내역에서 직접 변경할 수 있어요. 확정 후에는 고객센터로 문의해주세요." }, { q: "위탁 대여 수익은 언제 정산되나요?", a: "반납과 상태 확인이 끝난 뒤 정산 예정 금액을 알려드려요." }];
  return <main className="page support-page"><BrandHeader back={onBack} /><div className="support-hero"><img src="/assets/zimtori-symbol.png" alt="짐토리 고객센터" /><span>짐토리 고객센터</span><h1>무엇을 도와드릴까요?</h1><p>평일 10:00 - 18:00 · 주말/공휴일 휴무</p></div><div className="support-actions"><button onClick={() => document.getElementById("inquiry")?.scrollIntoView({ behavior: "smooth" })}><MessageCircleQuestion /><span><strong>1:1 문의</strong><small>평균 1시간 이내 답변</small></span><ChevronRight /></button><button onClick={() => window.open("tel:070-0000-0000")}><Clock3 /><span><strong>전화 상담</strong><small>070-0000-0000</small></span><ChevronRight /></button></div><section className="faq-section"><div className="section-heading"><div><span className="section-kicker">FAQ</span><h2>자주 묻는 질문</h2></div></div>{faqs.map((faq, index) => <button key={faq.q} className={`faq-item ${open === index ? "open" : ""}`} onClick={() => setOpen(open === index ? -1 : index)}><div><strong>{faq.q}</strong><Plus size={18} /></div>{open === index && <p>{faq.a}</p>}</button>)}</section><section className="inquiry-card" id="inquiry"><h2>1:1 문의 남기기</h2><p>확인 후 알림으로 답변해드릴게요.</p><select><option>보관·픽업 문의</option><option>대여·반납 문의</option><option>결제·정산 문의</option><option>기타</option></select><textarea value={message} onChange={(event) => setMessage(event.target.value)} placeholder="문의 내용을 자세히 적어주세요." rows={5} /><button className="primary-button" onClick={() => { if (message.trim()) { onSend(); setMessage(""); } }}><Send size={17} />문의 접수하기</button></section></main>;
}
