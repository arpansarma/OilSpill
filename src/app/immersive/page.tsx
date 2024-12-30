"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const Globe = dynamic(() => import("react-globe.gl"), { ssr: false });

interface IfaceData {
  name: string;
  country: string;
  type: string;
  lat: number;
  lon: number;
  prob: number;
}

export default function Page() {
  const [points, setPoints] = useState<IfaceData[]>([]);
  const globeRef = useRef<any>(null);

  //   const getTooltip = (d: IfaceData) => `
  //     <div style="text-align: center">
  //       <div><b>${d.name}</b>, ${d.country}</div>
  //       <div>(${d.type})</div>
  //     </div>
  //   `;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/data.json");
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const data: IfaceData[] = await res.json();
        setPoints(data);
      } catch (error) {
        console.log("Error", error);
      }
    };
    void fetchData();
  }, []);

  useEffect(() => {
    const globe = globeRef.current;
    if (!globe) return;
    globe.controls().autoRotate = true;
    globe.controls().autoRotateSpeed = 0.35;
  }, []);

  return (
    <Globe
      ref={globeRef}
      bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
      backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
      globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
      heatmapPoints={points.length ? points : []}
      heatmapsData={points}
      heatmapPointLat={(p: IfaceData) => +p.lat}
      heatmapPointLng={(p: IfaceData) => +p.lon}
      heatmapPointWeight={(p: IfaceData) => p.prob}
      heatmapBandwidth={2}
      heatmapTopAltitude={0.1}
      animateIn={false}
      //   labelLabel={getTooltip}
    />
  );
}
