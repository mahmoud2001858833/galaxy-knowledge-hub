import { Grid, Line } from '@react-three/drei';
import { useSimQuality } from './SimQualityGate';
import { SimLabel3D } from './SimLabel3D';

interface SimStageProps {
  size?: number;
  showGrid?: boolean;
  showAxes?: boolean;
  /** Draw a measuring ruler along +X with ticks every `rulerStep` units. */
  ruler?: boolean;
  rulerLength?: number;
  rulerStep?: number;
  rulerUnit?: string;
  /** World units per displayed unit (e.g. 1 unit = 5 m). */
  unitScale?: number;
}

/** Ground plane, measurement grid, axes and an optional 3D ruler. */
export const SimStage = ({
  size = 60,
  showGrid = true,
  showAxes = true,
  ruler = false,
  rulerLength = 20,
  rulerStep = 5,
  rulerUnit = 'م',
  unitScale = 1,
}: SimStageProps) => {
  const { settings } = useSimQuality();

  const axisLen = Math.min(size / 6, 8);

  const ticks: number[] = [];
  for (let i = rulerStep; i <= rulerLength; i += rulerStep) ticks.push(i);

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow={settings.shadows}>
        <planeGeometry args={[size, size]} />
        <meshStandardMaterial color="#0f172a" roughness={0.95} metalness={0.05} />
      </mesh>

      {showGrid && (
        <Grid
          position={[0, 0, 0]}
          args={[size, size]}
          cellSize={1}
          cellThickness={0.5}
          cellColor="#334155"
          sectionSize={5}
          sectionThickness={1}
          sectionColor="#64748b"
          fadeDistance={size * 0.9}
          fadeStrength={1.2}
          infiniteGrid={false}
          followCamera={false}
        />
      )}

      {showAxes && (
        <>
          <Line points={[[0, 0.01, 0], [axisLen, 0.01, 0]]} color="#ef4444" lineWidth={2} />
          <Line points={[[0, 0.01, 0], [0, axisLen, 0]]} color="#22c55e" lineWidth={2} />
          <Line points={[[0, 0.01, 0], [0, 0.01, axisLen]]} color="#3b82f6" lineWidth={2} />
        </>
      )}

      {ruler &&
        ticks.map((t) => (
          <group key={t}>
            <Line
              points={[[t, 0.02, -0.4], [t, 0.02, 0.4]]}
              color="#94a3b8"
              lineWidth={1.5}
            />
            <SimLabel3D position={[t, 0.6, 0]} variant="muted" distanceFactor={16}>
              {Math.round(t * unitScale)} {rulerUnit}
            </SimLabel3D>
          </group>
        ))}
    </group>
  );
};
