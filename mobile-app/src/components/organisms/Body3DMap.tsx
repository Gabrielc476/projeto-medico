import React, { useState, useRef, useEffect, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber/native";
import { useGLTF } from "@react-three/drei/native";
import { View, Text, Pressable, ScrollView } from "../../tw";
import { SymptomDto } from "../../types";
import { triageService } from "../../services/triageService";
import { ActivityIndicator } from "react-native";
import * as THREE from "three";

// -----------------------------------------------------------------------------
// CONFIGURAÇÃO DO MODELO REAL
// Mude para `true` assim que baixar o arquivo "human_model.glb" e colocá-lo na pasta assets/
// -----------------------------------------------------------------------------
const USE_REAL_MODEL = true;

const REGION_LABELS: Record<string, string> = {
  head: "Cabeça e Pescoço",
  chest: "Tórax e Cardiorrespiratório",
  abdomen: "Abdomen e Gastrointestinal",
  limbs: "Membros e Articulações",
};

interface Body3DMapProps {
  selectedSymptoms: SymptomDto[];
  onAddSymptom: (symptom: SymptomDto) => void;
  onRemoveSymptom: (cui: string) => void;
}

// 1. COMPONENTE A: CARREGADOR DE MODELO REAL (GLTF / GLB)
function RealHumanModel({
  selectedPart,
  onSelectPart,
}: {
  selectedPart: string | null;
  onSelectPart: (part: string) => void;
}) {
  // Metro resolve este asset estaticamente de forma segura se ativado
  // @ts-ignore
  const { scene } = useGLTF(require("../../../assets/human-model.glb"));
  const groupRef = useRef<THREE.Group>(null);

  // Rotação suave sci-fi
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.6) * 0.25;
    }
  });

  return (
    <group ref={groupRef}>
      <primitive
        object={scene}
        scale={1.4}
        position={[0, -0.9, 0]}
        onPointerDown={(e: any) => {
          e.stopPropagation();
          // Mapeamento inteligente de toque com base no nome do Mesh no arquivo 3D
          const meshName = e.object.name ? e.object.name.toLowerCase() : "";
          if (
            meshName.includes("head") ||
            meshName.includes("face") ||
            meshName.includes("neck") ||
            meshName.includes("skull")
          ) {
            onSelectPart("head");
          } else if (
            meshName.includes("chest") ||
            meshName.includes("heart") ||
            meshName.includes("lung") ||
            meshName.includes("rib")
          ) {
            onSelectPart("chest");
          } else if (
            meshName.includes("abdomen") ||
            meshName.includes("stomach") ||
            meshName.includes("belly") ||
            meshName.includes("gut")
          ) {
            onSelectPart("abdomen");
          } else {
            onSelectPart("limbs");
          }
        }}
      />
    </group>
  );
}

// 2. COMPONENTE B: RENDERIZADOR ESQUEMÁTICO SCI-FI (FALLBACK AUTOMÁTICO)
function SchematicHumanModel({
  selectedPart,
  onSelectPart,
}: {
  selectedPart: string | null;
  onSelectPart: (part: string) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.6) * 0.25;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Cabeça */}
      <mesh position={[0, 1.45, 0]} onPointerDown={() => onSelectPart("head")}>
        <sphereGeometry args={[0.22, 32, 32]} />
        <meshStandardMaterial
          color={selectedPart === "head" ? "#7170ff" : "#1e1f22"}
          roughness={0.15}
          metalness={0.8}
          emissive={selectedPart === "head" ? "#5e6ad2" : "#000000"}
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Tórax (Peito) */}
      <mesh position={[0, 0.85, 0]} onPointerDown={() => onSelectPart("chest")}>
        <boxGeometry args={[0.48, 0.55, 0.24]} />
        <meshStandardMaterial
          color={selectedPart === "chest" ? "#7170ff" : "#1e1f22"}
          roughness={0.15}
          metalness={0.8}
          emissive={selectedPart === "chest" ? "#5e6ad2" : "#000000"}
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Abdomen */}
      <mesh position={[0, 0.35, 0]} onPointerDown={() => onSelectPart("abdomen")}>
        <boxGeometry args={[0.42, 0.38, 0.22]} />
        <meshStandardMaterial
          color={selectedPart === "abdomen" ? "#7170ff" : "#1e1f22"}
          roughness={0.15}
          metalness={0.8}
          emissive={selectedPart === "abdomen" ? "#5e6ad2" : "#000000"}
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Membros / Braços */}
      <mesh position={[-0.34, 0.8, 0]} onPointerDown={() => onSelectPart("limbs")}>
        <cylinderGeometry args={[0.07, 0.05, 0.6, 16]} />
        <meshStandardMaterial
          color={selectedPart === "limbs" ? "#7170ff" : "#1e1f22"}
          roughness={0.2}
          metalness={0.7}
        />
      </mesh>
      <mesh position={[0.34, 0.8, 0]} onPointerDown={() => onSelectPart("limbs")}>
        <cylinderGeometry args={[0.07, 0.05, 0.6, 16]} />
        <meshStandardMaterial
          color={selectedPart === "limbs" ? "#7170ff" : "#1e1f22"}
          roughness={0.2}
          metalness={0.7}
        />
      </mesh>

      {/* Pernas */}
      <mesh position={[-0.15, -0.25, 0]} onPointerDown={() => onSelectPart("limbs")}>
        <cylinderGeometry args={[0.09, 0.07, 0.8, 16]} />
        <meshStandardMaterial
          color={selectedPart === "limbs" ? "#7170ff" : "#1e1f22"}
          roughness={0.2}
          metalness={0.7}
        />
      </mesh>
      <mesh position={[0.15, -0.25, 0]} onPointerDown={() => onSelectPart("limbs")}>
        <cylinderGeometry args={[0.09, 0.07, 0.8, 16]} />
        <meshStandardMaterial
          color={selectedPart === "limbs" ? "#7170ff" : "#1e1f22"}
          roughness={0.2}
          metalness={0.7}
        />
      </mesh>
    </group>
  );
}

// 3. EXPORT DO COMPONENTE CENTRAL DE MAPA 3D
export function Body3DMap({ selectedSymptoms, onAddSymptom, onRemoveSymptom }: Body3DMapProps) {
  const [selectedPart, setSelectedPart] = useState<string | null>("head");

  const [regionSymptoms, setRegionSymptoms] = useState<Record<string, SymptomDto[]>>({});
  const [loadingRegions, setLoadingRegions] = useState<Record<string, boolean>>({});
  const [errorRegions, setErrorRegions] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (selectedPart) {
      setLoadingRegions((prev) => ({ ...prev, [selectedPart]: true }));
      setErrorRegions((prev) => ({ ...prev, [selectedPart]: false }));
      triageService
        .getSymptomsByRegion(selectedPart)
        .then((fetched) => {
          setRegionSymptoms((prev) => ({
            ...prev,
            [selectedPart]: fetched || [],
          }));
        })
        .catch((err) => {
          console.error(`[Body3DMap] Erro de conexão ao buscar sintomas para ${selectedPart}:`, err);
          setErrorRegions((prev) => ({ ...prev, [selectedPart]: true }));
        })
        .finally(() => {
          setLoadingRegions((prev) => ({ ...prev, [selectedPart]: false }));
        });
    }
  }, [selectedPart]);

  const activeRegionLabel = selectedPart ? REGION_LABELS[selectedPart] : null;
  const activeRegionSymptoms = selectedPart ? regionSymptoms[selectedPart] || [] : [];
  const isRegionLoading = selectedPart ? !!loadingRegions[selectedPart] : false;
  const isRegionError = selectedPart ? !!errorRegions[selectedPart] : false;

  const handleRetry = () => {
    if (selectedPart) {
      setLoadingRegions((prev) => ({ ...prev, [selectedPart]: true }));
      setErrorRegions((prev) => ({ ...prev, [selectedPart]: false }));
      triageService
        .getSymptomsByRegion(selectedPart)
        .then((fetched) => {
          setRegionSymptoms((prev) => ({
            ...prev,
            [selectedPart]: fetched || [],
          }));
        })
        .catch(() => {
          setErrorRegions((prev) => ({ ...prev, [selectedPart]: true }));
        })
        .finally(() => {
          setLoadingRegions((prev) => ({ ...prev, [selectedPart]: false }));
        });
    }
  };

  return (
    <View className="flex-1 flex-row bg-bg-marketing h-[450px] border border-border-subtle rounded-2xl overflow-hidden my-4">
      {/* Lado Esquerdo: Canvas R3F */}
      <View className="w-[50%] bg-bg-panel relative">
        <Canvas camera={{ position: [0, 0.5, 3], fov: 45 }}>
          <ambientLight intensity={1.5} />
          <directionalLight position={[2, 4, 3]} intensity={2.2} />
          <pointLight position={[-2, -1, -2]} intensity={0.8} />

          {USE_REAL_MODEL ? (
            <Suspense fallback={null}>
              <RealHumanModel selectedPart={selectedPart} onSelectPart={setSelectedPart} />
            </Suspense>
          ) : (
            <SchematicHumanModel selectedPart={selectedPart} onSelectPart={setSelectedPart} />
          )}
        </Canvas>
        <View className="absolute bottom-3 left-3 bg-bg-marketing/80 px-2.5 py-1.5 rounded-md border border-border-subtle">
          <Text className="text-text-tertiary text-xs font-sans">Arraste para interagir</Text>
        </View>
      </View>

      {/* Lado Direito: Seleção de Sintomas */}
      <View className="w-[50%] bg-bg-marketing p-4 border-l border-border-subtle">
        {selectedPart ? (
          <View className="flex-1">
            <View className="flex-row items-center mb-1 h-6">
              <Text className="text-text-primary font-bold text-sm uppercase tracking-wider flex-1">
                {activeRegionLabel}
              </Text>
              {isRegionLoading && <ActivityIndicator size="small" color="#5e6ad2" />}
            </View>
            <Text className="text-text-tertiary text-xs mb-3 font-sans">
              Selecione os sintomas abaixo:
            </Text>

            {isRegionLoading && activeRegionSymptoms.length === 0 ? (
              <View className="flex-1 justify-center items-center py-12">
                <ActivityIndicator size="large" color="#5e6ad2" />
                <Text className="text-text-tertiary text-xs mt-3 font-sans">
                  Carregando sintomas...
                </Text>
              </View>
            ) : isRegionError && activeRegionSymptoms.length === 0 ? (
              <View className="flex-1 justify-center items-center py-12 px-4">
                <Text className="text-[#ff4e4e] text-xs font-bold text-center mb-1">
                  Falha de Conexão
                </Text>
                <Text className="text-text-tertiary text-[10px] text-center mb-3 font-sans">
                  Não foi possível obter a lista do servidor.
                </Text>
                <Pressable
                  onPress={handleRetry}
                  className="px-3 py-1.5 bg-brand-indigo rounded-md border border-border-subtle"
                >
                  <Text className="text-text-primary text-[10px] font-bold">Recarregar</Text>
                </Pressable>
              </View>
            ) : (
              <ScrollView className="flex-1" contentContainerClassName="pb-4">
                {activeRegionSymptoms.map((sym) => {
                  const isSelected = selectedSymptoms.some((s) => s.cui === sym.cui);
                  return (
                    <Pressable
                      key={sym.cui}
                      onPress={() => (isSelected ? onRemoveSymptom(sym.cui) : onAddSymptom(sym))}
                      className={`p-2.5 rounded-lg mb-2 border transition-all ${isSelected
                          ? "bg-brand-indigo/20 border-brand-indigo"
                          : "bg-bg-panel border-border-subtle"
                        }`}
                    >
                      <Text
                        className={`text-xs font-medium ${isSelected ? "text-accent-violet" : "text-text-secondary"
                          }`}
                      >
                        {sym.name}
                      </Text>
                    </Pressable>
                  );
                })}
                {activeRegionSymptoms.length === 0 && !isRegionLoading && (
                  <Text className="text-text-tertiary text-xs text-center py-8 font-sans">
                    Nenhum sintoma cadastrado para esta região.
                  </Text>
                )}
              </ScrollView>
            )}
          </View>
        ) : (
          <View className="flex-1 justify-center items-center">
            <Text className="text-text-tertiary text-xs text-center font-sans">
              Toque em uma parte do corpo 3D para mapear sintomas
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}
