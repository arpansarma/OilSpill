"use client";
import Link from "next/link";
import { ChangeEvent, useState } from "react";

export default function HomePage() {
  const [selectedRole, setSelectedRole] = useState<string>("site-admin");

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedRole(event.target.value);
  };

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-purple-100 text-center">
      <div className="flex flex-col">
        <div className="flex items-center p-10">
          <span className="pr-8 text-3xl">Select User:</span>
          <select
            value={selectedRole}
            onChange={handleChange}
            className="rounded border border-gray-300 p-2 text-3xl"
          >
            <option value="site-admin">Site Admin</option>
            <option value="basic-user">Basic User</option>
            <option value="govt-authorities">Govt Authorities</option>
          </select>
        </div>
        <Link href={`/maps?role=${encodeURIComponent(selectedRole)}`}>
          <button className="border-2 border-gray-300 bg-gray-300 px-8 py-2 text-3xl">
            Enter Site
          </button>
        </Link>
      </div>
    </div>
  );
}
