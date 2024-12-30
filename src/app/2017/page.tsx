"use client";

import { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import Papa from "papaparse";

const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false },
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false },
);
const Polyline = dynamic(
  () => import("react-leaflet").then((mod) => mod.Polyline),
  { ssr: false },
);
const Circle = dynamic(
  () => import("react-leaflet").then((mod) => mod.Circle),
  { ssr: false },
);

interface Point {
  coords: [number, number];
  timestamp: string;
  COG: string;
  SOG: string;
  vesselName: string;
  vesselTypeName: string;
}

interface Trajectory {
  data: Point[];
  color: string;
  startTime: number;
  endTime: number;
}

const ShipTrajectory = () => {
  const [trajectories, setTrajectories] = useState<Trajectory[]>([]);
  const [currentTime, setCurrentTime] = useState<string | null>(null);
  const [animationProgress, setAnimationProgress] = useState<number>(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const animationRef = useRef<number | null>(null);

  const vesselTypeMapping: { [key: number]: string } = {};

  useEffect(() => {
    const fetchCsvData = async (csvFile: string, color: string) => {
      const response = await fetch(csvFile);
      const csvText = await response.text();
      Papa.parse(csvText, {
        header: true,
        complete: (results) => {
          const points: Point[] = results.data
            .map((row: any) => {
              const lat = parseFloat(row.LAT);
              const lon = parseFloat(row.LON);
              const vesselType = parseInt(row.VesselType);
              if (!isNaN(lat) && !isNaN(lon)) {
                return {
                  coords: [lat, lon],
                  timestamp: row.BaseDateTime,
                  COG: row.COG,
                  SOG: row.SOG,
                  vesselName: row.VesselName,
                  vesselTypeName: vesselTypeMapping[vesselType] || vesselType,
                };
              }
              return null;
            })
            .filter((point): point is Point => point !== null)
            .sort(
              (a, b) =>
                new Date(a.timestamp).getTime() -
                new Date(b.timestamp).getTime(),
            );

          if (points.length > 0) {
            const startTime = new Date(points[0]!.timestamp).getTime();
            const endTime = new Date(
              points[points.length - 1]!.timestamp,
            ).getTime();
            setTrajectories((prev) => [
              ...prev,
              {
                data: points,
                color,
                startTime,
                endTime,
              },
            ]);
          }
        },
      });
    };

    const loadAllCsvs = async () => {
      const csvFiles = ["/AlKhiran/DLB_1600.csv"];

      await Promise.all(
        csvFiles.map((file, index) => {
          const color = ["red", "green", "blue"][index % 3];
          // const color = index % 2 === 0 ? "blue" : "green";
          return fetchCsvData(file, color as string);
        }),
      );
    };

    loadAllCsvs();
  }, []);

  const startAnimation = () => {
    if (trajectories.length === 0 || isAnimating) return;

    const globalStartTime = Math.min(...trajectories.map((t) => t.startTime));
    const globalEndTime = Math.max(...trajectories.map((t) => t.endTime));

    const animate = () => {
      setAnimationProgress((prevProgress) => {
        if (prevProgress >= 100) {
          cancelAnimationFrame(animationRef.current!);
          setIsAnimating(false);
          return 100;
        }
        const progress = prevProgress + 0.02; // Adjust speed here
        const currentTimeStamp = new Date(
          globalStartTime +
            (progress / 100) * (globalEndTime - globalStartTime),
        );
        setCurrentTime(currentTimeStamp.toLocaleString());
        return progress;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    setIsAnimating(true);
    animationRef.current = requestAnimationFrame(animate);
  };

  const stopAnimation = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setIsAnimating(false);
  };

  const handleScrubberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const progress = Number(e.target.value);
    setAnimationProgress(progress);

    if (trajectories.length > 0) {
      const globalStartTime = Math.min(...trajectories.map((t) => t.startTime));
      const globalEndTime = Math.max(...trajectories.map((t) => t.endTime));
      const currentTimeStamp = new Date(
        globalStartTime + (progress / 100) * (globalEndTime - globalStartTime),
      );
      setCurrentTime(currentTimeStamp.toLocaleString());
    }
  };

  const accidentAreaCoords: [number, number] = [28.70349167, 48.5];

  return (
    <div className="flex h-screen flex-col">
      <div>
        <div className="mb-5 mt-10 items-center text-center text-4xl">
          DLB 1600 Oil Spill (10 Aug 2017 - 16 Aug 2017)
        </div>
        <div className="flex flex-1 items-center justify-center">
          <MapContainer
            center={[28, 49]}
            zoom={8}
            style={{ height: "calc(100vh - 30rem)", width: "70%" }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Circle
              center={accidentAreaCoords}
              radius={10000}
              color="red"
              fillColor="red"
              fillOpacity={0.3}
            />
            {trajectories.map((trajectory, index) => (
              <Polyline
                key={index}
                positions={trajectory.data
                  .filter((point) => {
                    const pointTime = new Date(point.timestamp).getTime();
                    const progress =
                      ((pointTime - trajectory.startTime) /
                        (trajectory.endTime - trajectory.startTime)) *
                      100;
                    return progress <= animationProgress;
                  })
                  .map((point) => point.coords)}
                color={trajectory.color}
              />
            ))}
          </MapContainer>
        </div>
        <div className="mt-10 flex flex-col items-center space-y-4 text-center text-2xl">
          {currentTime && (
            <div className="text-xl">Current Time: {currentTime}</div>
          )}
          <div style={{ width: "70%" }}>
            <input
              type="range"
              min="0"
              max="100"
              value={animationProgress}
              onChange={handleScrubberChange}
              className="w-full"
            />
          </div>
          <div className="space-x-4">
            <button
              onClick={startAnimation}
              disabled={isAnimating}
              className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:opacity-50"
            >
              {isAnimating ? "Animating..." : "Start Animation"}
            </button>
            <button
              onClick={stopAnimation}
              disabled={!isAnimating}
              className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600 disabled:opacity-50"
            >
              Stop
            </button>
          </div>
        </div>
      </div>
      <div className="my-16 flex w-full items-center justify-center">
        <img className="w-[70%]" src="/AlKhiran/image.png"></img>
      </div>
    </div>
  );
};

export default ShipTrajectory;
