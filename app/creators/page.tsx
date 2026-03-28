import { Users, Twitter, Linkedin } from "lucide-react";

export default function CreatorsPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-lg bg-sky-500/15 flex items-center justify-center">
          <Users className="w-5 h-5 text-sky-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Creators</h1>
          <p className="text-xs text-gray-500">Chamath Palihapitiya · AI thought leaders</p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface p-6 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-surface-2 border border-border flex items-center justify-center mx-auto">
          <Users className="w-6 h-6 text-gray-500" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-white mb-1">
            X / Twitter Integration
          </h2>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            To pull Chamath&apos;s X posts, add your X API key to{" "}
            <code className="text-accent text-xs">.env.local</code>:
          </p>
        </div>
        <div className="bg-surface-2 rounded-lg p-4 text-left text-xs font-mono text-gray-400 max-w-sm mx-auto">
          <p>X_API_BEARER_TOKEN=your_bearer_token</p>
          <p>CHAMATH_X_USER_ID=14921947</p>
        </div>
        <div className="flex items-center justify-center gap-4 text-xs text-gray-600">
          <div className="flex items-center gap-1.5">
            <Twitter className="w-3.5 h-3.5 text-sky-400" />
            <span>X / Twitter</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Linkedin className="w-3.5 h-3.5 text-blue-400" />
            <span>LinkedIn (via RSS)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
