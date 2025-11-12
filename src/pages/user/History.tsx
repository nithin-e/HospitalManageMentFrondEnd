import Footer from "@/components/user/Footer";
import React from "react";


export default function HistoryComponent() {
  return (
    <section className="max-w-4xl mx-auto p-6 bg-white rounded-2xl shadow-md">
      <header className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-semibold">Project History</h2>
          <p className="mt-1 text-sm text-gray-600">A short, fictional history of the project.</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">Founder</p>
          <p className="font-medium">Nithin — Software Engineer</p>
        </div>
      </header>

      <article className="space-y-5 text-gray-700">
        <p>
          In early 2020, a small idea sketched on the back of a notepad grew into a weekend
          obsession. Nithin, our founder and software engineer, spent rainy evenings
          experimenting with interfaces and tiny databases. What began as a single feature
          — a clever way to tag and retrieve project notes — slowly attracted interest from
          friends and colleagues.
        </p>

        <p>
          By mid-2021 the project had a name and a modest community of testers. The team
          (which started as Nithin and two friends) focused on reliability, shipping
          quality updates every two months. They held weekly design sessions where new
          ideas were sketched, debated, and refined into simple, elegant features.
        </p>

        <p>
          In 2023 the project migrated to a more scalable architecture and launched a
          public beta. The community helped prioritize what mattered most: speed,
          simplicity, and an exceptional onboarding flow. Today the project is still
          guided by those early values — small, thoughtful improvements delivered with care.
        </p>
      </article>

      <hr className="my-6" />

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-3">Timeline</h3>
          <ol className="relative border-l border-gray-200 ml-4 pl-4 space-y-6">
            <li className="relative">
              <span className="absolute -left-7 top-0 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-xs">✓</span>
              <div>
                <p className="text-sm font-medium">Idea & Prototype — Jan 2020</p>
                <p className="text-xs text-gray-500">A weekend prototype and the first lines of code.</p>
              </div>
            </li>

            <li className="relative">
              <span className="absolute -left-7 top-0 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">★</span>
              <div>
                <p className="text-sm font-medium">Private Alpha — Jun 2021</p>
                <p className="text-xs text-gray-500">Invited friends, early feedback and feature pruning.</p>
              </div>
            </li>

            <li className="relative">
              <span className="absolute -left-7 top-0 w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs">⚑</span>
              <div>
                <p className="text-sm font-medium">Public Beta — Apr 2023</p>
                <p className="text-xs text-gray-500">Wider launch with community-driven improvements.</p>
              </div>
            </li>
          </ol>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3">Location (fake map)</h3>

          {/* Simple, decorative SVG map — intentionally fictional */}
          <div className="rounded-lg border border-gray-200 overflow-hidden">
            <svg viewBox="0 0 400 250" className="w-full h-60 bg-gray-50" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Fictional map showing the project's origin">
              <defs>
                <linearGradient id="g1" x1="0" x2="1">
                  <stop offset="0%" stopColor="#f0fdfa" />
                  <stop offset="100%" stopColor="#ecfeff" />
                </linearGradient>
              </defs>

              {/* background */}
              <rect x="0" y="0" width="400" height="250" fill="url(#g1)" />

              {/* stylized roads */}
              <path d="M30 200 Q120 150 200 190 T370 160" stroke="#c7f9ff" strokeWidth="6" fill="none" strokeLinecap="round" />
              <path d="M20 80 Q150 40 260 70 T380 60" stroke="#dbeafe" strokeWidth="4" fill="none" strokeLinecap="round" />

              {/* landmarks */}
              <g transform="translate(70,120)">
                <circle r="12" fill="#fde68a" />
                <text x="22" y="6" fontSize="12" fill="#92400e">Old Workshop</text>
              </g>

              <g transform="translate(260,90)">
                <rect x="-10" y="-12" width="20" height="16" rx="3" fill="#bfdbfe" />
                <text x="22" y="6" fontSize="12" fill="#1e3a8a">City Lab</text>
              </g>

              {/* founder pin */}
              <g transform="translate(200,150)">
                <path d="M0 -18 C6 -18 10 -12 10 -6 A10 10 0 1 1 -10 -6 C-10 -12 -6 -18 0 -18 Z" fill="#ef4444"/>
                <circle r="4" fill="#fff" />
                <text x="14" y="6" fontSize="12" fill="#111827">Founder: Nithin</text>
              </g>

              {/* compass */}
              <g transform="translate(340,200)">
                <circle r="25" fill="#ffffff" stroke="#e5e7eb" />
                <text x="-4" y="6" fontSize="12" fill="#111827">N</text>
              </g>
            </svg>
          </div>

          <p className="mt-3 text-xs text-gray-500">The map above is illustrative and fictional — created for storytelling and UI purposes.</p>
        </div>
      </section>

      <hr className="my-6" />

  <Footer />
    </section>
  );
}
