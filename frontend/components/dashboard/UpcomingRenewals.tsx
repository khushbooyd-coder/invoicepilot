"use client";

interface Props {
  renewals?: any[];
}

export default function UpcomingRenewals({
  renewals = [],
}: Props) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">

      <h2 className="text-xl font-semibold mb-5">
        Upcoming Renewals
      </h2>

      {renewals.length === 0 ? (

        <p className="text-zinc-500">
          No upcoming renewals
        </p>

      ) : (

        <div className="space-y-4">

          {renewals.map((renewal) => (

            <div
              key={renewal.id}
              className="flex justify-between border-b border-zinc-800 pb-3"
            >

              <div>

                <p className="font-medium">
                  {renewal.customer}
                </p>

                <p className="text-sm text-zinc-500">
                  {renewal.renewalDate}
                </p>

              </div>

              <span className="text-yellow-400">
                {Math.ceil(
                  (new Date(renewal.renewalDate).getTime() -
                    Date.now()) /
                    (1000 * 60 * 60 * 24)
                )}{" "}
                days
              </span>

            </div>

          ))}

        </div>

      )}

    </div>
  );
}