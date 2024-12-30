"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import Navbar from "~/components/navbar";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

const MapComponent = dynamic(() => import("~/components/map"), {
  ssr: false,
});

interface AggregatedData {
  MaxSpeed: number;
  AvgHeading: number;
  FirstLAT: number;
  FirstLON: number;
  LastLAT: number;
  LastLON: number;
  ProximityToPort: number;
  ProximityToReef: number;
  isTankerOrCargo: number;
  isSpecialManeuver: boolean;
  isAnomalous: number;
  ShipName: string;
  stallDuration: number;
  uturns: number;
}

interface MMSIReports {
  mmsi: string;
  aggregated_data: AggregatedData | null;
}

const CacheExpirationTime = 60000;

export default function Maps() {
  const [data, setData] = useState<MMSIReports[]>([]);
  const [showAnomalousShips, setShowAnomalousShips] = useState(false);
  const [showConfirmedOilSpills, setShowConfirmedOilSpills] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedShip, setSelectedShip] = useState<MMSIReports | null>(null);
  const searchParams = useSearchParams();
  const role = searchParams.get("role");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const cachedData = localStorage.getItem("aisDataAlAkhiran");
        const cacheTimestamp = localStorage.getItem(
          "aisDataTimestampAlAkhiran",
        );
        if (
          cachedData &&
          cacheTimestamp &&
          Date.now() - Number(cacheTimestamp) < CacheExpirationTime
        ) {
          const parsedData = JSON.parse(cachedData);
          setData(parsedData);
          setLoading(false);
          return;
        }
        const snapshot = await getDocs(collection(db, "AlKhiran"));
        const updatedData: MMSIReports[] = snapshot.docs
          .map((doc) => {
            const data = doc.data() as { aggregated_data?: AggregatedData };
            return {
              mmsi: doc.id,
              aggregated_data: data.aggregated_data ?? null,
            };
          })
          .filter(
            (item) =>
              item.aggregated_data &&
              item.aggregated_data.LastLAT !== undefined &&
              item.aggregated_data.LastLON !== undefined,
          );
        localStorage.setItem("aisDataAlAkhiran", JSON.stringify(updatedData));
        localStorage.setItem("aisDataTimestampAlAkhiran", String(Date.now()));
        setData(updatedData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    const interval = setInterval(fetchData, 25000);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = () => {
    if (searchQuery) {
      const foundShip = data.find((ship) =>
        ship.aggregated_data?.ShipName.toLowerCase().includes(
          searchQuery.toLowerCase(),
        ),
      );
      setSelectedShip(foundShip || null);
    }
  };

  const handleShipSelect = (mmsi: string) => {
    const ship = data.find((ship) => ship.mmsi === mmsi);
    setSelectedShip(ship || null);
    console.log(ship);
    if (ship?.aggregated_data?.ShipName) {
      setSearchQuery(ship.aggregated_data.ShipName);
    }
  };
  const handleSAR = async () => {
    if (role === "basic-user") {
      alert("You donot have permissions to execute this command.");
      return;
    }
    try {
      if (selectedShip?.aggregated_data?.ShipName === "DLB 1600") {
      }
      const imageResponse = await fetch("/alkhiran-dlb16003.jpeg");
      const imageBlob = await imageResponse.blob();

      const formData = new FormData();
      formData.append("file", imageBlob, "alkhiran-dlb1600.jpeg");
      let res;

      if (selectedShip?.aggregated_data?.ShipName === "DLB 1600") {
        res = await fetch("https://aea7-35-237-46-186.ngrok-free.app/upload", {
          method: "POST",
          body: formData,
        });
      } else {
        res = await fetch(
          "https://aea7-35-237-46-186.ngrok-free.app/upload_from_url",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              url: `http://ec2-65-2-37-206.ap-south-1.compute.amazonaws.com/sar/generate_sar_image?lat=${selectedShip?.aggregated_data?.LastLAT}&lon=${selectedShip?.aggregated_data?.LastLON}`,
            }),
          },
        );
      }

      if (!res.ok) {
        throw new Error(`Failed to upload: ${res.statusText}`);
      }

      const classification = await res.text();
      if (classification === "0") {
        alert("No Oil Spill Detected by SAR");
      } else if (classification == "1") {
        alert("Oil Spill Detected by SAR");
      }
    } catch (error) {
      alert("Failed to process the image. Try again later");
    }
  };

  const handleAISAnomalyDetection = async () => {
    if (role === "basic-user") {
      alert("You donot have permissions to execute this command.");
      return;
    }
    const url =
      "http://ec2-65-2-37-206.ap-south-1.compute.amazonaws.com/sosemail/iso-forest";
    const body = {
      contamination: 0.05,
      n_estimators: 500,
      features_for_if: [
        "isSpecialManeuver",
        "uturns",
        "MaxSpeed",
        "isTankerOrCargo",
        "ProximityToPort",
        "ProximityToReef",
        "stallDuration",
      ],
    };
    setLoading(true);
    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      method: "POST",
    });
    setLoading(false);
    console.log("Running AIS Anomaly Detection");
  };

  return (
    <div>
      <Navbar />
      <div className="flex h-full w-full flex-col items-center justify-center text-xl">
        <div className="flex flex-col items-center">
          <div className="text-3xl font-bold">
            Persian Gulf Region (Al Akhiran DLB 1600 Spill)
          </div>

          <div className="my-4 flex w-[324px] justify-between">
            <Button
              variant={"outline"}
              className="border border-[#CCC9DC] bg-[#6e688f] text-white"
              onClick={handleAISAnomalyDetection}
            >
              Run AIS Model
            </Button>

            <Button
              variant={"outline"}
              className="border border-[#CCC9DC] bg-[#6e688f] text-white"
              onClick={handleSAR}
            >
              Run SAR Model
            </Button>
          </div>

          <div className="flex w-[90%] gap-2">
            <div className="flex h-[70vh] w-2/5 flex-col gap-2 rounded-md bg-[#CCC9DC] text-xl">
              <span className="mt-4 flex items-center justify-center text-xl">
                Voyage Controller
              </span>
              <div className="flex items-center justify-center gap-2">
                <input
                  className="w-4/6 rounded-md placeholder:text-center"
                  placeholder="Search Vessels"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value.trim())}
                />
                <button
                  className="rounded-md border bg-white px-4"
                  onClick={handleSearch}
                >
                  🔍
                </button>
              </div>
              <div className="flex items-center justify-center gap-2">
                <label className="flex items-center justify-center font-medium text-gray-700">
                  Ship Type:
                </label>
                <select
                  id="options"
                  className="w-3/5 rounded border-gray-300 text-lg focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="option1">All Ships</option>
                  <option value="option1">Oil Tankers</option>
                  <option value="option2">Cargo</option>
                  <option value="option3">Passenger</option>
                </select>
              </div>
              <label className="flex items-center justify-center text-xl">
                <input
                  type="checkbox"
                  checked={showAnomalousShips}
                  onChange={() => setShowAnomalousShips(!showAnomalousShips)}
                  className="mr-2"
                />
                Show Anomalous Ships
              </label>
              <label className="flex justify-center text-xl">
                <input
                  type="checkbox"
                  checked={showConfirmedOilSpills}
                  onChange={() =>
                    setShowConfirmedOilSpills(!showConfirmedOilSpills)
                  }
                  className="mr-2"
                />
                Show Confirmed Oil Spills
              </label>
            </div>

            {loading ? (
              <div className="flex h-[70vh] w-[80vw] items-center justify-center bg-gray-200">
                <span className="animate-pulse text-xl text-gray-500">
                  Loading Map...
                </span>
              </div>
            ) : (
              <MapComponent
                data={data}
                showAnomalies={showAnomalousShips}
                searchQuery={searchQuery}
                onShipSelect={handleShipSelect}
                center={[28.70349167, 48.5]}
              />
            )}

            <div className="flex h-[70vh] w-2/5 flex-col gap-2 rounded-md bg-[#CCC9DC]">
              <span className="mt-4 flex items-center justify-center text-xl">
                Voyage Display
              </span>
              <div className="mx-4 flex items-center justify-center gap-4 rounded-md border-2 border-solid border-gray-500 bg-[#F9F3FF] py-2 text-xl">
                <span>Ship Name: </span>
                <span>{selectedShip?.aggregated_data?.ShipName || "N/A"}</span>
              </div>

              <div className="mx-4 flex items-center justify-center gap-4 rounded-md border-2 border-solid border-gray-500 bg-[#F9F3FF] py-2 text-xl">
                <span>Stall Duration(mins): </span>
                <span>
                  {selectedShip?.aggregated_data?.stallDuration?.toFixed(2) ??
                    "N/A"}
                </span>
              </div>

              <div className="mx-4 flex items-center justify-center gap-4 rounded-md border-2 border-solid border-gray-500 bg-[#F9F3FF] py-2 text-xl">
                <span>U-Turns: </span>
                <span>{selectedShip?.aggregated_data?.uturns ?? "N/A"}</span>
              </div>

              <div className="mx-4 flex items-center justify-center gap-4 rounded-md border-2 border-solid border-gray-500 bg-[#F9F3FF] py-2 text-xl">
                <span>Max Speed: </span>
                <span>
                  {selectedShip?.aggregated_data?.MaxSpeed?.toFixed(2) ?? "N/A"}
                </span>
              </div>

              <div className="mx-4 flex items-center justify-center gap-4 rounded-md border-2 border-solid border-gray-500 bg-[#F9F3FF] py-2 text-xl">
                <span>Anomalous AIS: </span>
                <span>
                  {selectedShip?.aggregated_data?.isAnomalous === 1
                    ? "Yes"
                    : "No"}
                </span>
              </div>
              <div className="flex h-full w-full flex-col items-center justify-center p-2">
                {selectedShip &&
                  selectedShip.aggregated_data?.ShipName === "DLB 1600" && (
                    <img
                      className="max-h-[20rem] max-w-[20rem] border-2 border-solid border-gray-500 bg-white"
                      src={`/alkhiran-dlb1600.jpeg`}
                    ></img>
                  )}
                {selectedShip &&
                  selectedShip.aggregated_data?.ShipName !== "DLB 1600" && (
                    <img
                      className="border-2 border-solid border-gray-500 bg-white"
                      src={`http://ec2-65-2-37-206.ap-south-1.compute.amazonaws.com/sar/generate_sar_image?lat=${selectedShip?.aggregated_data?.LastLAT}&lon=${selectedShip?.aggregated_data?.LastLON}`}
                    ></img>
                  )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
