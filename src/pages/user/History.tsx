import Footer from "@/components/user/Footer";
import Navbar from "@/components/user/Navbar";

export default function HistoryComponent() {
  return (
    <>
      <Navbar />
  <div className="min-h-screen bg-white py-16 mt-[30px] sm:mt-[20px]">
        <section className="max-w-4xl mx-auto px-6">
          <header className="mb-16">
            <div className="mb-8">
              <h2
                className="text-5xl font-light tracking-tight mb-4"
                style={{ color: "rgb(0, 59, 115)" }}
              >
                Project History
              </h2>
              <p className="text-lg text-gray-600">
                A short, fictional history of the project.
              </p>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="text-gray-500">Founder:</span>
              <span
                className="font-medium"
                style={{ color: "rgb(0, 59, 115)" }}
              >
                Nithin
              </span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-600">Software Engineer</span>
            </div>
          </header>

          <article className="space-y-8 text-gray-700 leading-relaxed mb-20">
            <p className="text-lg">
              In early 2020, a small idea sketched on the back of a notepad grew
              into a weekend obsession. Nithin, our founder and software
              engineer, spent rainy evenings experimenting with interfaces and
              tiny databases. What began as a single feature — a clever way to
              tag and retrieve project notes — slowly attracted interest from
              friends and colleagues.
            </p>

            <p className="text-lg">
              By mid-2021 the project had a name and a modest community of
              testers. The team (which started as Nithin and two friends)
              focused on reliability, shipping quality updates every two months.
              They held weekly design sessions where new ideas were sketched,
              debated, and refined into simple, elegant features.
            </p>

            <p className="text-lg">
              In 2023 the project migrated to a more scalable architecture and
              launched a public beta. The community helped prioritize what
              mattered most: speed, simplicity, and an exceptional onboarding
              flow. Today the project is still guided by those early values —
              small, thoughtful improvements delivered with care.
            </p>
          </article>

          <div className="h-px bg-gray-200 my-16"></div>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-16">
            <div>
              <h3
                className="text-xl font-medium mb-8"
                style={{ color: "rgb(0, 59, 115)" }}
              >
                Timeline
              </h3>
              <ol className="space-y-10">
                <li className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className="w-3 h-3 rounded-full mt-1"
                      style={{ backgroundColor: "rgb(0, 59, 115)" }}
                    ></div>
                    <div className="w-px h-full bg-gray-200 mt-2"></div>
                  </div>
                  <div className="pb-6">
                    <p className="font-medium mb-1">Idea & Prototype</p>
                    <p className="text-sm text-gray-500 mb-2">January 2020</p>
                    <p className="text-sm text-gray-600">
                      A weekend prototype and the first lines of code.
                    </p>
                  </div>
                </li>

                <li className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className="w-3 h-3 rounded-full mt-1"
                      style={{ backgroundColor: "rgb(0, 59, 115)" }}
                    ></div>
                    <div className="w-px h-full bg-gray-200 mt-2"></div>
                  </div>
                  <div className="pb-6">
                    <p className="font-medium mb-1">Private Alpha</p>
                    <p className="text-sm text-gray-500 mb-2">June 2021</p>
                    <p className="text-sm text-gray-600">
                      Invited friends, early feedback and feature pruning.
                    </p>
                  </div>
                </li>

                <li className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className="w-3 h-3 rounded-full mt-1"
                      style={{ backgroundColor: "rgb(0, 59, 115)" }}
                    ></div>
                  </div>
                  <div>
                    <p className="font-medium mb-1">Public Beta</p>
                    <p className="text-sm text-gray-500 mb-2">April 2023</p>
                    <p className="text-sm text-gray-600">
                      Wider launch with community-driven improvements.
                    </p>
                  </div>
                </li>
              </ol>
            </div>

            <div>
              <h3
                className="text-xl font-medium mb-8"
                style={{ color: "rgb(0, 59, 115)" }}
              >
                Location
              </h3>

              <div className="rounded-lg border border-gray-200 overflow-hidden">
                <svg
                  viewBox="0 0 400 250"
                  className="w-full h-64 bg-gray-50"
                  xmlns="http://www.w3.org/2000/svg"
                  role="img"
                  aria-label="Fictional map showing the project's origin"
                >
                  <defs>
                    <linearGradient id="g1" x1="0" x2="1">
                      <stop offset="0%" stopColor="#f0fdfa" />
                      <stop offset="100%" stopColor="#ecfeff" />
                    </linearGradient>
                  </defs>

                  <rect x="0" y="0" width="400" height="250" fill="url(#g1)" />

                  <path
                    d="M30 200 Q120 150 200 190 T370 160"
                    stroke="#c7f9ff"
                    strokeWidth="6"
                    fill="none"
                    strokeLinecap="round"
                  />
                  <path
                    d="M20 80 Q150 40 260 70 T380 60"
                    stroke="#dbeafe"
                    strokeWidth="4"
                    fill="none"
                    strokeLinecap="round"
                  />

                  <g transform="translate(70,120)">
                    <circle r="12" fill="#fde68a" />
                    <text x="22" y="6" fontSize="12" fill="#92400e">
                      Old Workshop
                    </text>
                  </g>

                  <g transform="translate(260,90)">
                    <rect
                      x="-10"
                      y="-12"
                      width="20"
                      height="16"
                      rx="3"
                      fill="#bfdbfe"
                    />
                    <text x="22" y="6" fontSize="12" fill="#1e3a8a">
                      City Lab
                    </text>
                  </g>

                  <g transform="translate(200,150)">
                    <path
                      d="M0 -18 C6 -18 10 -12 10 -6 A10 10 0 1 1 -10 -6 C-10 -12 -6 -18 0 -18 Z"
                      fill="#ef4444"
                    />
                    <circle r="4" fill="#fff" />
                    <text x="14" y="6" fontSize="12" fill="#111827">
                      Founder: Nithin
                    </text>
                  </g>

                  <g transform="translate(340,200)">
                    <circle r="25" fill="#ffffff" stroke="#e5e7eb" />
                    <text x="-4" y="6" fontSize="12" fill="#111827">
                      N
                    </text>
                  </g>
                </svg>
              </div>

              <p className="mt-4 text-xs text-gray-500">
                The map above is illustrative and fictional — created for
                storytelling purposes.
              </p>
            </div>
          </section>
        </section>
      </div>
      <Footer />
    </>
  );
}
