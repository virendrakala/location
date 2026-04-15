import prisma from "@/lib/prisma";
import { formatDistanceToNow } from "date-fns";
import { MapPin, Link as LinkIcon, Crosshair, MonitorSmartphone } from "lucide-react";
import { createLink } from "./actions";
import Link from "next/link";

export default async function AdminPage() {
  const links = await prisma.link.findMany({
    include: {
      visits: {
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
              <Crosshair className="text-blue-500" /> LocTracker
            </h1>
            <p className="text-gray-400 mt-1">Generate stealth links and trace visitors.</p>
          </div>
        </header>

        <section className="glass rounded-2xl p-6 border border-gray-800 shadow-2xl">
          <h2 className="text-xl font-semibold mb-4">Create New Link</h2>
          <form action={createLink} className="flex gap-4">
            <input
              name="name"
              type="text"
              placeholder="e.g. My Facebook Group post"
              required
              className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
            />
            <input
              name="destination"
              type="url"
              placeholder="Target URL (e.g. https://youtube.com)"
              required
              className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-medium transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(37,99,235,0.5)]"
            >
              Generate Link
            </button>
          </form>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-bold">Active Links</h2>
          {links.length === 0 ? (
            <div className="text-center py-12 text-gray-400 glass rounded-2xl border border-gray-800">
              No active links. Create one above to get started.
            </div>
          ) : (
            <div className="grid gap-6">
              {links.map((link) => (
                <div key={link.id} className="glass rounded-2xl border border-gray-800 overflow-hidden">
                  <div className="p-6 bg-gray-900/50 border-b border-gray-800 flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold">{link.name}</h3>
                      <div className="flex flex-col gap-1 mt-2">
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <LinkIcon size={16} />
                          <Link href={`/t/${link.path}`} target="_blank" className="hover:text-blue-400 transition-colors">
                            /t/{link.path}
                          </Link>
                        </div>
                        {link.destination && (
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span className="font-semibold">Target:</span>
                            <a href={link.destination} target="_blank" rel="noreferrer" className="truncate hover:underline">
                              {link.destination}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full text-sm font-medium border border-blue-500/20">
                      {link.visits.length} Visits
                    </div>
                  </div>

                  <div className="p-0">
                    {link.visits.length === 0 ? (
                      <div className="p-6 text-sm text-gray-500 text-center">No visitors yet.</div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                          <thead className="bg-gray-900/30 text-gray-400 uppercase text-xs">
                            <tr>
                              <th className="px-6 py-4">Time</th>
                              <th className="px-6 py-4">IP Address</th>
                              <th className="px-6 py-4">Location (Approx)</th>
                              <th className="px-6 py-4 border-l border-blue-500/20 bg-blue-500/5 text-blue-400">Precise Location (GPS)</th>
                              <th className="px-6 py-4">Device</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-800">
                            {link.visits.map((visit) => (
                              <tr key={visit.id} className="hover:bg-gray-800/30 transition-colors">
                                <td className="px-6 py-4 text-gray-300">
                                  {formatDistanceToNow(new Date(visit.createdAt), { addSuffix: true })}
                                </td>
                                <td className="px-6 py-4 font-mono text-xs">{visit.ip}</td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-1.5 text-gray-300">
                                    <MapPin size={14} className="text-gray-500" />
                                    {visit.city ? `${visit.city}, ${visit.region}` : 'Unknown'}
                                  </div>
                                </td>
                                <td className="px-6 py-4 border-l border-blue-500/20 bg-blue-500/5">
                                  {visit.latitude && visit.longitude ? (
                                    <div className="text-blue-400 flex flex-col gap-1">
                                      <span className="font-mono text-xs break-all">
                                        {visit.latitude}, {visit.longitude}
                                      </span>
                                      <a
                                        href={`https://www.google.com/maps?q=${visit.latitude},${visit.longitude}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-xs underline hover:text-blue-300"
                                      >
                                        View on Maps
                                      </a>
                                    </div>
                                  ) : (
                                    <span className="text-gray-500 text-xs italic">Not granted</span>
                                  )}
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-2 text-gray-400 max-w-[200px] truncate" title={visit.userAgent || "Unknown"}>
                                    <MonitorSmartphone size={14} />
                                    <span className="truncate">{visit.userAgent || "Unknown"}</span>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
