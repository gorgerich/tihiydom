import { useRef, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, ContactShadows, useTexture } from '@react-three/drei';
import * as THREE from 'three';

export interface WoodMaterial {
  id: string;
  name: string;
  price: number;
  color: string;
  texture: string;
  roughness: number;
}

export interface LiningMaterial {
  id: string;
  name: string;
  price: number;
  color: string;
  texture: string; // Для UI превью
  fabric: string;
}

export interface HardwareMaterial {
  id: string;
  name: string;
  price: number;
  color: string;
  metalness: number;
  roughness: number;
  metallic: string; // CSS градиент для UI
}

interface RealisticCoffinViewerProps {
  wood: WoodMaterial;
  lining: LiningMaterial;
  hardware: HardwareMaterial;
  showLid: boolean;
}

export const woodTypes: WoodMaterial[] = [
  { 
    id: 'pine', 
    name: 'Сосна (Натуральная)', 
    price: 0, 
    color: '#E5C4A0', 
    texture: 'https://images.unsplash.com/photo-1595814433015-e6f5ce69614e?w=400', 
    roughness: 0.6 
  },
  { 
    id: 'oak', 
    name: 'Дуб Мореный', 
    price: 25000, 
    color: '#6F4E37', 
    texture: 'https://images.unsplash.com/photo-1610312278520-bcc893a3ff1d?w=400', 
    roughness: 0.7 
  },
  { 
    id: 'mahogany', 
    name: 'Красное Дерево', 
    price: 55000, 
    color: '#4A0404', 
    texture: 'https://images.unsplash.com/photo-1543459176-442bfb743b8d?w=400', 
    roughness: 0.4 
  },
  { 
    id: 'white', 
    name: 'Элитный Белый', 
    price: 45000, 
    color: '#F5F5F5', 
    texture: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=400', 
    roughness: 0.2 
  },
  { 
    id: 'walnut', 
    name: 'Американский Орех', 
    price: 35000, 
    color: '#5D4037', 
    texture: 'https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?w=400', 
    roughness: 0.6 
  },
  { 
    id: 'black', 
    name: 'Черный Рояльный', 
    price: 60000, 
    color: '#1a1a1a', 
    texture: 'https://images.unsplash.com/photo-1618464530077-8c65f440df5c?w=400', 
    roughness: 0.1 
  },
];

export const liningTypes: LiningMaterial[] = [
  { 
    id: 'satin-white', 
    name: 'Атлас (Белый)', 
    price: 0, 
    color: '#FFFFFF', 
    texture: 'https://images.unsplash.com/photo-1564815662616-402585b0026d?w=400', 
    fabric: 'satin' 
  },
  { 
    id: 'silk-champagne', 
    name: 'Шелк (Шампань)', 
    price: 5000, 
    color: '#F7E7CE', 
    texture: 'https://images.unsplash.com/photo-1575220652470-50d7a6094747?w=400', 
    fabric: 'silk' 
  },
  { 
    id: 'velvet-red', 
    name: 'Бархат (Бордо)', 
    price: 8000, 
    color: '#580000', 
    texture: 'https://images.unsplash.com/photo-1616606889941-4c2821831e22?w=400', 
    fabric: 'velvet' 
  },
  { 
    id: 'satin-blue', 
    name: 'Атлас (Небесный)', 
    price: 3000, 
    color: '#F0F8FF', 
    texture: 'https://images.unsplash.com/photo-1564815662616-402585b0026d?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c2F0aW4lMjBmYWJyaWN8ZW58MHx8MHx8fDA%3D', 
    fabric: 'satin' 
  },
  { 
    id: 'silk-gold', 
    name: 'Шелк (Золотой)', 
    price: 6000, 
    color: '#FFD700', 
    texture: 'https://images.unsplash.com/photo-1575220652470-50d7a6094747?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c2lsayUyMGZhYnJpY3xlbnwwfHwwfHx8MA%3D%3D', 
    fabric: 'silk' 
  },
  { 
    id: 'velvet-black', 
    name: 'Бархат (Черный)', 
    price: 9000, 
    color: '#000000', 
    texture: 'https://images.unsplash.com/photo-1616606889941-4c2821831e22?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dmVsdmV0JTIwZmFicmljfGVufDB8fDB8fHww', 
    fabric: 'velvet' 
  },
];

export const hardwareTypes: HardwareMaterial[] = [
  { 
    id: 'gold', 
    name: 'Золото (Классика)', 
    price: 0, 
    color: '#FFD700', 
    metalness: 1.0, 
    roughness: 0.2, 
    metallic: 'linear-gradient(135deg, #FDB931 0%, #FFFFAC 50%, #D1B464 100%)' 
  },
  { 
    id: 'silver', 
    name: 'Серебро (Модерн)', 
    price: 3000, 
    color: '#C0C0C0', 
    metalness: 1.0, 
    roughness: 0.3, 
    metallic: 'linear-gradient(135deg, #E0E0E0 0%, #FFFFFF 50%, #A0A0A0 100%)' 
  },
  { 
    id: 'bronze', 
    name: 'Античная Бронза', 
    price: 4500, 
    color: '#CD7F32', 
    metalness: 0.9, 
    roughness: 0.5, 
    metallic: 'linear-gradient(135deg, #CD7F32 0%, #D2691E 50%, #8B4513 100%)' 
  },
  { 
    id: 'black-matte', 
    name: 'Черный Мат', 
    price: 5000, 
    color: '#2D2D2D', 
    metalness: 0.5, 
    roughness: 0.8, 
    metallic: 'linear-gradient(135deg, #434343 0%, #000000 100%)' 
  },
  { 
    id: 'rose-gold', 
    name: 'Розовое Золото', 
    price: 6000, 
    color: '#B76E79', 
    metalness: 1.0, 
    roughness: 0.2, 
    metallic: 'linear-gradient(135deg, #E0C3FC 0%, #8EC5FC 100%)' // Placeholder gradient, rose gold is tricky
  },
  { 
    id: 'chrome', 
    name: 'Хром', 
    price: 4000, 
    color: '#E0E0E0', 
    metalness: 1.0, 
    roughness: 0.1, 
    metallic: 'linear-gradient(135deg, #F5F7FA 0%, #C3CFE2 100%)' 
  },
];

function CoffinModel({ wood, lining, hardware, showLid }: RealisticCoffinViewerProps) {
  const groupRef = useRef<THREE.Group>(null);
  
  // В реальном проекте здесь была бы загрузка GLTF модели
  // Для демонстрации используем примитивы Three.js с материалами
  
  return (
    <group ref={groupRef} position={[0, -0.5, 0]}>
      {/* Основной корпус гроба */}
      <mesh castShadow receiveShadow position={[0, 0.4, 0]}>
        <boxGeometry args={[2.2, 0.6, 0.8]} />
        <meshStandardMaterial 
          color={wood.color}
          roughness={wood.roughness}
          metalness={0.1}
        />
      </mesh>

      {/* Внутренняя обивка (видна только если крышка открыта или отсутствует) */}
      <mesh position={[0, 0.45, 0]}>
        <boxGeometry args={[2.1, 0.5, 0.7]} />
        <meshStandardMaterial 
          color={lining.color}
          roughness={0.9}
          metalness={0.0}
        />
      </mesh>

      {/* Крышка гроба */}
      {showLid && (
        <mesh castShadow receiveShadow position={[0, 1.0, 0]}>
           {/* Упрощенная форма крышки */}
          <boxGeometry args={[2.25, 0.2, 0.85]} />
          <meshStandardMaterial 
            color={wood.color}
            roughness={wood.roughness}
            metalness={0.1}
          />
        </mesh>
      )}

      {/* Ручки (Фурнитура) */}
      {[-0.8, 0, 0.8].map((x, i) => (
        <group key={i} position={[x, 0.4, 0.42]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.05, 0.05, 0.4, 16]} rotation={[Math.PI / 2, 0, 0]} />
            <meshStandardMaterial 
              color={hardware.color}
              metalness={hardware.metalness}
              roughness={hardware.roughness}
            />
          </mesh>
        </group>
      ))}
      {[-0.8, 0, 0.8].map((x, i) => (
         <group key={`back-${i}`} position={[x, 0.4, -0.42]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.05, 0.05, 0.4, 16]} rotation={[Math.PI / 2, 0, 0]} />
            <meshStandardMaterial 
              color={hardware.color}
              metalness={hardware.metalness}
              roughness={hardware.roughness}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export function RealisticCoffinViewer({ wood, lining, hardware, showLid }: RealisticCoffinViewerProps) {
  return (
    <div className="relative w-full h-full bg-[#1a1c23] rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10">
      {/* Атмосферный градиент для глубины */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/60 pointer-events-none z-10" />
      
      <Canvas shadows dpr={[1, 2]} gl={{ antialias: true, preserveDrawingBuffer: true }}>
        <color attach="background" args={['#1a1c23']} />
        
        {/* Окружение для реалистичных отражений (Lobby создает атмосферу зала) */}
        <Environment preset="lobby" blur={0.6} background={false} />
        
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[3.5, 2.5, 3.5]} fov={40} />
          <OrbitControls
            enablePan={false}
            enableZoom={true}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={Math.PI / 2.1}
            minDistance={3.5}
            maxDistance={9}
            autoRotate
            autoRotateSpeed={0.3}
            target={[0, 0.15, 0]}
          />

          {/* Освещение: Мягкое, торжественное, с акцентами */}
          <ambientLight intensity={0.3} color="#ffffff" />
          
          {/* Теплый рисующий свет (имитация ламп зала) */}
          <spotLight
            position={[5, 8, 5]}
            intensity={1.2}
            angle={0.4}
            penumbra={1}
            castShadow
            shadow-mapSize={[2048, 2048]}
            shadow-bias={-0.0001}
            color="#fff5e6"
          />
          
          {/* Холодный контровой свет для объема */}
          <spotLight
            position={[-5, 4, -4]}
            intensity={0.6}
            angle={0.5}
            penumbra={1}
            color="#eef2ff"
          />
          
          {/* Нижняя подсветка для смягчения теней */}
          <pointLight position={[0, 1, 0]} intensity={0.2} color="#ffffff" />

          <CoffinModel wood={wood} lining={lining} hardware={hardware} showLid={showLid} />

          <ContactShadows
            position={[0, 0, 0]}
            opacity={0.5}
            scale={20}
            blur={2.5}
            far={4}
            color="#000000"
          />
        </Suspense>
      </Canvas>

      {/* Информация о конфигурации - Liquid Glass Style */}
      <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between gap-4 bg-white/5 backdrop-blur-xl px-6 py-4 rounded-2xl border border-white/10 shadow-2xl z-20">
        <div className="space-y-1.5 flex-1">
          <p className="text-white font-medium text-lg tracking-wide">{wood.name}</p>
          <div className="flex flex-wrap gap-y-1 gap-x-3 text-sm text-gray-300/80 font-light">
            <span className="flex items-center gap-1.5">
               <span className="w-1 h-1 rounded-full bg-white/50" />
               Обивка: {lining.name}
            </span>
            <span className="flex items-center gap-1.5">
               <span className="w-1 h-1 rounded-full bg-white/50" />
               Фурнитура: {hardware.name}
            </span>
          </div>
        </div>
        <div className="text-xs font-medium text-white/90 bg-white/10 px-4 py-2 rounded-lg border border-white/5 backdrop-blur-md uppercase tracking-wider">
          {showLid ? 'Закрытый' : 'Открытый'}
        </div>
      </div>
    </div>
  );
}
