import type { AuditReport, RiskColor } from "@/lib/types";

const colorStyles: Record<RiskColor, string> = {
  RED: "bg-red-100 text-red-700 border-red-300",
  YELLOW: "bg-yellow-100 text-yellow-700 border-yellow-300",
  GREEN: "bg-green-100 text-green-700 border-green-300",
};

const scoreBadge = (score: number) => {
  if (score >= 70) return "bg-green-100 text-green-800";
  if (score >= 40) return "bg-yellow-100 text-yellow-800";
  return "bg-red-100 text-red-800";
};

interface ReportCardProps {
  report: AuditReport;
}

export default function ReportCard({ report }: ReportCardProps) {
  const redSuppliers = report.ratings.filter((r) => r.color === "RED");

  return (
    <div className="mt-8 space-y-6">
      {/* Overall score */}
      <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div>
          <p className="text-sm text-gray-500">Overall Risk Score</p>
          <p className="text-4xl font-bold">{report.overall_score}</p>
          <p className="mt-1 text-xs text-gray-400">
            Generated {new Date(report.generated_at).toLocaleString()}
          </p>
        </div>
        <span
          className={`rounded-full px-4 py-2 text-sm font-semibold ${scoreBadge(report.overall_score)}`}
        >
          {report.overall_score >= 70
            ? "Low Risk"
            : report.overall_score >= 40
            ? "Medium Risk"
            : "High Risk"}
        </span>
      </div>

      {/* Supplier table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3 text-left">Supplier</th>
              <th className="px-4 py-3 text-left">Risk</th>
              <th className="px-4 py-3 text-left">Reason</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {report.ratings.map((r) => (
              <tr key={r.name}>
                <td className="px-4 py-3 font-medium">{r.name}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded border px-2 py-0.5 text-xs font-semibold ${colorStyles[r.color]}`}
                  >
                    {r.color}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">{r.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Backup cards for RED suppliers */}
      {redSuppliers.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-700">
            Suggested Backup Vendors
          </h2>
          {redSuppliers.map((s) => (
            <div
              key={s.name}
              className="rounded-xl border border-red-200 bg-red-50 p-4"
            >
              <p className="mb-2 text-sm font-medium text-red-700">
                Alternatives for {s.name}
              </p>
              {s.backups.length > 0 ? (
                <ul className="list-inside list-disc space-y-1 text-sm text-gray-700">
                  {s.backups.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500 italic">No backups suggested.</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
