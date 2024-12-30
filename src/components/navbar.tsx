import React from "react";
import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="mb-10 flex items-center justify-between border bg-[#6e688f] px-4">
      <div className="flex space-x-4 text-white">
        <Link href={"/immersive"}>3D View</Link>
      </div>

      <div className="flex items-center">
        <Image src={"/logo.png"} alt="The Logo" width={80} height={80} />
        <label htmlFor="agu-intel" className="text-2xl text-white">
          Aquintel
        </label>
      </div>

      <div className="flex space-x-4">
        <a href="#" className="text-white">
          About
        </a>
        <a href="#" className="text-white">
          Team
        </a>
      </div>
    </nav>
  );
}
